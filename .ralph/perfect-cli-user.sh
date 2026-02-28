#!/bin/bash
# perfect-cli-user.sh — Invoke Claude to perform a fresh-user CLI experience test and create PRD(s) for frictions found.
#
# Usage: bash .ralph/perfect-cli-user.sh
#
# This script launches a single Claude session (default model) that:
#   1. Spins up a Docker container simulating a brand-new user environment
#   2. Installs the opentabs CLI from npm and exercises every command
#   3. Identifies UX frictions, confusing output, broken flows, and error handling gaps
#   4. Uses the ralph skill to generate PRD(s) targeting the root monorepo
#
# Prerequisites:
#   - Docker running (Docker Desktop or OrbStack)
#   - ralph-worker image built: bash .ralph/docker-build.sh
#   - ~/.npmrc with valid auth token for @opentabs-dev packages
#
# The ralph daemon (.ralph/ralph.sh) must be running to pick up the PRDs.
# This script does NOT start ralph — it only creates the PRD files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are a QA engineer performing a fresh-user experience test of the OpenTabs CLI. Your job is to install and use the CLI exactly as a real new user would — someone who has never heard of OpenTabs before — identify every friction point, then use the ralph skill to create PRD(s) to fix them.

You are sensitive to UX for general people (not nitpicking, not a plugin developer). You are a normal user who wants to try OpenTabs for the first time.

## IMPORTANT: Skip source code reading — go straight to testing

Do NOT spend time reading source code, CLAUDE.md files, or exploring the codebase. The value of this test comes from testing the CLI as a real user would — not from understanding the implementation. A real user has zero knowledge of the source code. Your fresh perspective IS the test.

Read only these two files for orientation (30 seconds max):
1. README.md — the landing page a user would see on GitHub
2. The docs Quick Start page: docs/content/docs/quick-start.mdx

Then immediately proceed to Docker setup and testing.

## Step 1: Set up a clean Docker environment

Launch a Docker container to simulate a brand-new user machine:

```bash
docker run --rm -d \
  --name opentabs-ux-test \
  --init --ipc=host --shm-size=2g \
  --network host \
  -e "HOME=/home/testuser" \
  -v "$HOME/.npmrc:/tmp/staging/.npmrc:ro" \
  ralph-worker:latest \
  "mkdir -p /home/testuser && cp /tmp/staging/.npmrc /home/testuser/.npmrc 2>/dev/null; sleep 86400"
```

Key details:
- Uses `ralph-worker:latest` image (has Node.js, npm, Chromium pre-installed)
- Mounts `~/.npmrc` read-only for npm auth (required — @opentabs-dev packages are private on npm)
- Sets a clean HOME at `/home/testuser` so there is no prior opentabs config
- All `docker exec` commands run as: `docker exec opentabs-ux-test <command>`

IMPORTANT: Clean up the container when done (`docker kill opentabs-ux-test`).

## Step 2: Walk through the COMPLETE new-user journey

Act as a new user. Exercise every command and workflow. Be thorough and methodical.

### Phase 1: Installation and first impression
- Install: `npm install -g @opentabs-dev/cli`
- `opentabs --version` and `opentabs --help`
- `opentabs` with no arguments (what does a new user see?)
- Typo: `opentabs strat` (error handling)

### Phase 2: First run
- `opentabs doctor` (before starting — what's the diagnostic?)
- `opentabs status` (before starting)
- `opentabs logs` (before starting)
- Run `opentabs start` in the background:
  ```bash
  docker exec -d opentabs-ux-test bash -c 'opentabs start > /tmp/start-output.txt 2>&1'
  sleep 3
  docker exec opentabs-ux-test cat /tmp/start-output.txt
  ```
- Analyze the first-time output: Is it clear? Complete? Correct? Would the MCP config snippets actually work?

### Phase 3: Server running — test ALL commands
With the server running, test every command systematically:

**Status & diagnostics:**
- `opentabs status` and `opentabs status --json`
- `opentabs doctor`
- `opentabs logs` and `opentabs logs --lines 5`
- `opentabs audit` and `opentabs audit --json` and `opentabs audit --file`

**Config management:**
- `opentabs config show` and `opentabs config show --json`
- `opentabs config show --show-secret` and `opentabs config show --json --show-secret`
- `opentabs config path`
- `opentabs config set port 8080` then `opentabs config set port 9515`
- `opentabs config set tool.` (list available tools)
- `opentabs config set invalidkey foo` (error handling)
- `opentabs config set prot 9515` (typo — does it suggest "port"?)
- `opentabs config set port notanumber` (validation)
- `opentabs config set browser-tool.browser_execute_script disabled` then re-enable
- `opentabs config set localPlugins.add /tmp/nonexistent` (warning?)
- `opentabs config set localPlugins.remove /tmp/nonexistent`
- `opentabs config reset` (without --confirm)
- `opentabs config rotate-secret` (without --confirm)

**Plugin management:**
- `opentabs plugin` and `opentabs plugin --help`
- `opentabs plugin search` (no query — discover what's available)
- `opentabs plugin search slack`
- `opentabs plugin search nonexistent-thing-12345`
- `opentabs plugin list` and `opentabs plugin list --json`
- `opentabs plugin install slack` (then verify with `opentabs plugin list` and `opentabs status`)
- `opentabs plugin list --verbose` (see tool names)
- `opentabs plugin remove slack` (without --confirm)
- `opentabs plugin remove slack --confirm`
- `opentabs plugin install nonexistent-plugin` (error handling)
- `opentabs plugin create test-plugin --domain .example.com` (scaffolding in a temp dir)

**Other commands:**
- `opentabs update`
- `opentabs start` again while server is running (port conflict error)
- Every `--help` flag on every subcommand

### Phase 4: Server stopped — test offline behavior
Kill the server process and test:
- `opentabs status` — graceful "not running" message?
- `opentabs doctor` — degrades gracefully?
- `opentabs audit` — handles no server?
- `opentabs logs` — still works from file?
- `opentabs plugin list` — offline mode?
- `opentabs config show` — works without server?

### Phase 5: Cleanup
- `docker kill opentabs-ux-test`

## Step 3: Evaluate every interaction for friction

For each command, evaluate from a NORMAL USER's perspective (not a developer):

1. **Clarity**: Would a new user understand the output and know what to do next?
2. **Correctness**: Does the output match reality? Are configs functional? Are counts accurate?
3. **Completeness**: Is important information missing?
4. **Error handling**: Do errors provide actionable guidance?
5. **Consistency**: Are patterns consistent across commands?
6. **Progressive disclosure**: Right amount of info for beginners vs power users?

### Categories of friction:
- **Broken flows**: Output that leads users to do the wrong thing
- **Confusing output**: Messages that don't make sense without insider knowledge
- **Missing information**: Important details not shown when needed
- **Excessive information**: Output that overwhelms or buries the important stuff
- **Silent failures**: Things that fail without telling the user
- **Poor error messages**: Errors that don't tell you how to fix the problem
- **Discoverability gaps**: Features that exist but users would never find

### What NOT to report as friction:
- Plugin ecosystem being WIP (limited plugins available, missing descriptions) — this is temporary
- `opentabs-plugin` CLI not being globally available — WIP, not final state
- Stylistic preferences about output formatting
- Features that work correctly but you'd design differently
- Docker/headless environment issues — OpenTabs is designed for headed mode (Chrome on the desktop). You are testing in Docker only for a clean environment; do not report "no browser found" or headless-related issues as frictions
- `opentabs` with no args showing "Server not running" — this is intentional (status is the default command)

## Step 4: Create PRD(s) using the ralph skill

After completing all testing, compile findings and use the skill tool to load the "ralph" skill, then create PRD(s).

Key parameters:
- Target project: "OpenTabs Platform" (root monorepo) unless the fix is docs-only
- For docs-only fixes: project "OpenTabs Docs", workingDirectory "docs", qualityChecks "cd docs && npm run build && npm run type-check && npm run lint && npm run knip && npm run format:check"
- Do NOT set workingDirectory or qualityChecks for root monorepo
- Group related fixes into the same PRD (fixes to the same file go together)
- All stories: e2eCheckpoint: false (CLI/docs changes are not browser-observable)
- Small stories (1-3 files per story)
- Include repo-root-relative file paths in notes
- Concrete, verifiable acceptance criteria
- Skip clarifying questions — this prompt provides all context

Severity triage:
- **HIGH**: Broken flows (user copies output that doesn't work), silent data loss, crashes
- **MEDIUM**: Confusing output, missing information, poor discoverability
- **LOW**: Cosmetic issues, minor inconsistencies, edge case polish

Only create PRDs for HIGH and MEDIUM issues. Document LOW issues in the PRD description.
PROMPT_EOF

echo "=== perfect-cli-user.sh ==="
echo "Launching Claude to test CLI user experience and create PRD(s)..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
