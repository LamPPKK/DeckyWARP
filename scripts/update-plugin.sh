#!/usr/bin/env bash
set -Eeuo pipefail

readonly RUNTIME_DIR="/run/deckywarp"
readonly LOG_DIR="/var/log/deckywarp"
readonly JOB_FLAG="$RUNTIME_DIR/job"
readonly UPDATE_LOG="$LOG_DIR/update.log"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
readonly SCRIPT_DIR PLUGIN_ROOT

(( EUID == 0 )) || {
    echo "ERROR: update-plugin.sh must run as root." >&2
    exit 1
}

for command_name in install tee; do
    command -v "$command_name" >/dev/null 2>&1 || {
        echo "ERROR: required command not found: $command_name" >&2
        exit 1
    }
done

for safe_dir in "$RUNTIME_DIR" "$LOG_DIR"; do
    [[ ! -L "$safe_dir" ]] || {
        echo "ERROR: refusing symlinked DeckyWARP directory: $safe_dir" >&2
        exit 1
    }
done
install -d -m 0700 -o root -g root "$RUNTIME_DIR"
install -d -m 0750 -o root -g root "$LOG_DIR"

exec > >(tee -a "$UPDATE_LOG") 2>&1
trap 'rm -f -- "$JOB_FLAG"' EXIT

echo "Installing the latest LamPPKK/DeckyWARP release"
"$PLUGIN_ROOT/InstallPlugin.sh"
