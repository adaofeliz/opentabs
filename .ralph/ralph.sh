#!/bin/bash
# Ralph - Long-running AI agent loop for Claude Code
# Usage: ./ralph.sh [--tool amp|claude] [max_iterations]
#
# If max_iterations is omitted, auto-calculates from prd.json:
#   remaining stories + 33% retry buffer

set -e

# Parse arguments
TOOL="claude"  # Default to claude for this project
MAX_ITERATIONS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      TOOL="$2"
      shift 2
      ;;
    --tool=*)
      TOOL="${1#*=}"
      shift
      ;;
    *)
      # Assume it's max_iterations if it's a number
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

# Validate tool choice
if [[ "$TOOL" != "amp" && "$TOOL" != "claude" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp' or 'claude'."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Claude uses cwd as project context — ensure we're at project root
cd "$PROJECT_DIR"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"

# Verify prd.json exists
if [ ! -f "$PRD_FILE" ]; then
  echo "Error: No prd.json found at $PRD_FILE"
  echo "Create one using the opentabs-ralph skill or manually."
  exit 1
fi

# Auto-calculate iterations from prd.json if not provided
if [ -z "$MAX_ITERATIONS" ]; then
  REMAINING=$(jq '[.userStories[] | select(.passes != true)] | length' "$PRD_FILE" 2>/dev/null || echo "0")
  if [ "$REMAINING" -eq 0 ]; then
    echo "All stories in prd.json already pass. Nothing to do."
    exit 0
  fi
  # Add 33% retry buffer, minimum 1 extra
  BUFFER=$(( (REMAINING + 2) / 3 ))
  [ "$BUFFER" -lt 1 ] && BUFFER=1
  MAX_ITERATIONS=$(( REMAINING + BUFFER ))
  TOTAL=$(jq '.userStories | length' "$PRD_FILE" 2>/dev/null || echo "?")
  echo "Auto-calculated iterations: $REMAINING remaining stories (of $TOTAL total) + $BUFFER buffer = $MAX_ITERATIONS iterations"
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

# Archive prd.json and progress.txt to the archive folder, then remove them.
archive_run() {
  local timestamp=$(date +%Y-%m-%d-%H%M%S)
  local project_name=$(jq -r '.project // "ralph"' "$PRD_FILE" 2>/dev/null | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
  local archive_folder="$ARCHIVE_DIR/$timestamp-$project_name"

  mkdir -p "$archive_folder"
  [ -f "$PRD_FILE" ] && mv "$PRD_FILE" "$archive_folder/"
  [ -f "$PROGRESS_FILE" ] && mv "$PROGRESS_FILE" "$archive_folder/"

  echo "Archived to: $archive_folder"
}

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"
echo "Project dir: $PROJECT_DIR"
echo "PRD file: $PRD_FILE"

# Stream filter: extracts concise progress lines from claude's stream-json output.
# Shows tool calls (Read, Edit, Write, Bash, Glob, Grep, etc.) and assistant text snippets.
# Writes the final result text to a temp file for the COMPLETE check.
stream_filter() {
  local result_file="$1"
  local line_count=0
  local DIM='\033[2m'
  local CYAN='\033[36m'
  local GREEN='\033[32m'
  local YELLOW='\033[33m'
  local RESET='\033[0m'

  while IFS= read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue

    local msg_type
    msg_type=$(echo "$line" | jq -r '.type // empty' 2>/dev/null) || continue

    case "$msg_type" in
      assistant)
        # Extract tool calls — show tool name + key input (file path, command, pattern, etc.)
        local tool_uses
        tool_uses=$(echo "$line" | jq -r '
          .message.content[]? |
          select(.type == "tool_use") |
          .name + "\t" + (
            if .name == "Read" then (.input.file_path // "")
            elif .name == "Write" then (.input.file_path // "")
            elif .name == "Edit" then (.input.file_path // "")
            elif .name == "Bash" then ((.input.description // .input.command // "") | .[0:80])
            elif .name == "Glob" then (.input.pattern // "")
            elif .name == "Grep" then (.input.pattern // "") + " " + (.input.path // "")
            elif .name == "Task" then (.input.description // "")
            elif .name == "Skill" then (.input.skill // "")
            else (.input | tostring | .[0:60])
            end
          )
        ' 2>/dev/null)

        if [ -n "$tool_uses" ]; then
          while IFS=$'\t' read -r tool_name tool_detail; do
            [ -z "$tool_name" ] && continue
            printf "${CYAN}  ▸ %-8s${RESET} ${DIM}%s${RESET}\n" "$tool_name" "$tool_detail"
          done <<< "$tool_uses"
        fi

        # Extract text content — show first 120 chars of assistant text
        local text_content
        text_content=$(echo "$line" | jq -r '
          [.message.content[]? | select(.type == "text") | .text] | join("")
        ' 2>/dev/null)

        if [ -n "$text_content" ] && [ "$text_content" != "null" ]; then
          printf "${GREEN}  ✦ %.120s${RESET}\n" "$text_content"
          # Capture completion signal from assistant text (the result event
          # may not include it if claude formats the final message differently)
          if echo "$text_content" | grep -q "<promise>COMPLETE</promise>" 2>/dev/null; then
            echo "$text_content" >> "$result_file"
          fi
        fi
        ;;

      result)
        # Final result — save for COMPLETE check and show summary
        local result_text duration_s cost num_turns
        result_text=$(echo "$line" | jq -r '.result // ""' 2>/dev/null)
        duration_s=$(echo "$line" | jq -r '((.duration_ms // 0) / 1000 | floor)' 2>/dev/null)
        cost=$(echo "$line" | jq -r '.total_cost_usd // 0' 2>/dev/null)
        num_turns=$(echo "$line" | jq -r '.num_turns // 0' 2>/dev/null)

        echo "$result_text" >> "$result_file"

        printf "\n${YELLOW}  ⏱  %ss  │  %s turns  │  \$%s${RESET}\n" "$duration_s" "$num_turns" "$cost"
        ;;
    esac
  done
}

for i in $(seq 1 $MAX_ITERATIONS); do
  # Check prd.json before each iteration — if all stories pass, exit early.
  # This is the authoritative completion check: prd.json is updated by the
  # agent after each story, so it reflects ground truth regardless of whether
  # the agent emitted the <promise>COMPLETE</promise> signal.
  REMAINING=$(jq '[.userStories[] | select(.passes != true)] | length' "$PRD_FILE" 2>/dev/null || echo "0")
  if [ "$REMAINING" -eq 0 ]; then
    echo ""
    echo "All stories in prd.json pass. Ralph is done!"
    echo "Completed before iteration $i of $MAX_ITERATIONS"
    archive_run
    exit 0
  fi

  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS — $REMAINING stories remaining ($TOOL)"
  echo "==============================================================="

  RESULT_FILE=$(mktemp)

  # Run the selected tool
  if [[ "$TOOL" == "amp" ]]; then
    OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all 2>&1 | tee /dev/stderr) || true
    echo "$OUTPUT" > "$RESULT_FILE"
  else
    # Claude Code: stream-json mode for real-time progress, piped through stream_filter
    claude --dangerously-skip-permissions \
      --print \
      --output-format stream-json \
      --verbose \
      < "$SCRIPT_DIR/RALPH.md" 2>/dev/null \
      | stream_filter "$RESULT_FILE" || true
  fi

  # Check for completion signal in the final result
  if [ -f "$RESULT_FILE" ] && grep -q "<promise>COMPLETE</promise>" "$RESULT_FILE" 2>/dev/null; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    rm -f "$RESULT_FILE"
    archive_run
    exit 0
  fi

  rm -f "$RESULT_FILE"
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
archive_run
exit 1
