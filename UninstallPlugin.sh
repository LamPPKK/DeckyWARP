#!/usr/bin/env bash
set -Eeuo pipefail

readonly REMOVE_WARP="${REMOVE_WARP:-0}"
plugin_loader_was_active=0
readonly_changed=0

die() {
    printf 'ERROR: %s\n' "$*" >&2
    exit 1
}

cleanup() {
    local exit_code=$?
    trap - EXIT
    set +e

    if (( readonly_changed )); then
        if ! sudo steamos-readonly enable; then
            printf 'ERROR: failed to restore SteamOS readonly mode.\n' >&2
            if (( exit_code == 0 )); then
                exit_code=1
            fi
        else
            readonly_changed=0
        fi
    fi
    if (( plugin_loader_was_active )); then
        if ! sudo systemctl start plugin_loader.service; then
            printf 'ERROR: failed to restart plugin_loader.service.\n' >&2
            if (( exit_code == 0 )); then
                exit_code=1
            fi
        fi
    fi
    exit "$exit_code"
}

trap cleanup EXIT

for command_name in sudo systemctl getent stat date sed; do
    command -v "$command_name" >/dev/null 2>&1 || die "required command not found: $command_name"
done

if [[ "$REMOVE_WARP" == 1 ]]; then
    for command_name in pacman steamos-readonly; do
        command -v "$command_name" >/dev/null 2>&1 || die "required command not found: $command_name"
    done
fi

if id deck >/dev/null 2>&1; then
    target_user=deck
elif [[ -n "${SUDO_USER:-}" && "${SUDO_USER}" != root ]]; then
    target_user=$SUDO_USER
else
    target_user="$(getent passwd 1000 | cut -d: -f1)"
fi
[[ -n "$target_user" && "$target_user" != root ]] || die "could not determine the SteamOS desktop user."
target_home="$(getent passwd "$target_user" | cut -d: -f6)"
[[ "$target_home" == /* && "$target_home" != / ]] || die "invalid home directory for $target_user."
plugin_dir="$target_home/homebrew/plugins/DeckyWARP"
legacy_plugin_dir="$target_home/homebrew/plugins/decky-warp"

sudo -v
for job_flag in /run/deckywarp/job /run/deckywarp/installing /run/deckywarp/updating; do
    if sudo test -f "$job_flag"; then
        job_unit="$(sudo sed -n '1p' "$job_flag")"
        [[ "$job_unit" =~ ^deckywarp-(install|update)-[0-9]+$ ]] || \
            die "invalid DeckyWARP job flag: $job_flag"
        job_state="$(sudo systemctl is-active "$job_unit" 2>/dev/null || true)"
        job_age=$(($(date +%s) - $(sudo stat -c %Y "$job_flag")))
        if [[ "$job_state" =~ ^(active|activating|reloading|deactivating)$ ]] || (( job_age < 10 )); then
            die "DeckyWARP job $job_unit is still $job_state; wait for it to finish before uninstalling."
        fi
        sudo rm -f -- "$job_flag"
    fi
done

if sudo systemctl is-active --quiet plugin_loader.service; then
    plugin_loader_was_active=1
    sudo systemctl stop plugin_loader.service
fi

sudo rm -rf -- "$plugin_dir"
sudo rm -rf -- "$legacy_plugin_dir"
sudo rm -f -- \
    /run/deckywarp/installing \
    /run/deckywarp/updating \
    /run/deckywarp/job \
    /var/log/deckywarp/plugin.log \
    /var/log/deckywarp/install.log \
    /var/log/deckywarp/update.log

if [[ "$REMOVE_WARP" == 1 ]]; then
    if pacman -Q cloudflare-warp-bin >/dev/null 2>&1; then
        sudo systemctl disable --now warp-svc.service || true
        readonly_status="$(sudo steamos-readonly status 2>&1 || true)"
        if grep -qi enabled <<< "$readonly_status"; then
            sudo steamos-readonly disable
            readonly_changed=1
        elif ! grep -qi disabled <<< "$readonly_status"; then
            die "could not determine SteamOS readonly state: $readonly_status"
        fi
        sudo pacman -Rns --noconfirm cloudflare-warp-bin
    fi
    echo "DeckyWARP plugin and Cloudflare WARP removed."
else
    echo "DeckyWARP plugin removed. Cloudflare WARP was preserved."
    echo "Run with REMOVE_WARP=1 to remove cloudflare-warp-bin as well."
fi
