#!/bin/bash
# perfect.sh — Run all perfect-*.sh scripts in parallel.
#
# Usage: bash .ralph/perfect.sh
#
# Discovers all scripts matching .ralph/perfect-*.sh and launches them
# in parallel. Each script runs its own Claude session to audit a different
# area of the codebase and produce PRDs via the ralph skill.
#
# Killing this script (Ctrl+C, SIGTERM, etc.) kills all child processes.

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PIDS=()

cleanup() {
  echo ""
  echo "Shutting down — killing all child processes..."
  for pid in "${PIDS[@]}"; do
    # Kill the child's entire process group (the child runs in its own group
    # via setsid) so that grandchildren (Claude sessions, etc.) also die.
    # Fall back to killing the PID directly if the process group kill fails.
    kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  done
  # Wait briefly for children to exit, then force-kill any survivors
  sleep 1
  for pid in "${PIDS[@]}"; do
    kill -9 -- -"$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
  done
  echo "All child processes killed."
}

trap cleanup EXIT INT TERM

# Find all perfect-*.sh scripts (excluding this file)
SCRIPTS=()
for f in "$SCRIPT_DIR"/perfect-*.sh; do
  [ -f "$f" ] || continue
  SCRIPTS+=("$f")
done

if [ ${#SCRIPTS[@]} -eq 0 ]; then
  echo "No perfect-*.sh scripts found in $SCRIPT_DIR"
  exit 0
fi

echo "Launching ${#SCRIPTS[@]} perfect scripts in parallel:"
for f in "${SCRIPTS[@]}"; do
  name=$(basename "$f" .sh)
  log="/tmp/${name}.log"
  echo "  $name → $log"
  # setsid gives each child its own process group so we can kill the entire
  # subtree (Claude sessions, etc.) with a single kill -- -<pgid>.
  setsid bash "$f" > "$log" 2>&1 &
  PIDS+=($!)
done

echo ""
echo "All launched. Monitor with:"
echo "  tail -f /tmp/perfect-*.log"
echo ""
echo "Waiting for all to finish..."

FAILED=0
for i in "${!PIDS[@]}"; do
  pid=${PIDS[$i]}
  name=$(basename "${SCRIPTS[$i]}" .sh)
  if wait "$pid"; then
    echo "  ✓ $name (PID $pid) completed"
  else
    echo "  ✗ $name (PID $pid) failed (exit $?)"
    FAILED=$((FAILED + 1))
  fi
done

# All children exited normally — disarm the cleanup trap
trap - EXIT INT TERM

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All ${#SCRIPTS[@]} scripts completed successfully."
else
  echo "$FAILED of ${#SCRIPTS[@]} scripts failed."
  exit 1
fi
