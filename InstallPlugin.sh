#!/usr/bin/env bash
set -Eeuo pipefail

readonly RELEASE_URL="https://github.com/LamPPKK/DeckyWARP/releases/latest/download/DeckyWARP.zip"
readonly CHECKSUM_URL="${RELEASE_URL}.sha256"

temp_dir=""
root_work_dir=""
staging_dir=""
backup_dir=""
plugin_dir=""
plugins_dir=""
legacy_plugin_dir=""
legacy_backup_dir=""
plugin_loader_was_active=0
install_complete=0
placement_attempted=0
backup_made=0
legacy_backup_made=0

cleanup() {
    local exit_code=$?
    local rollback_failed=0
    trap - EXIT
    set +e

    if (( ! install_complete )); then
        if (( placement_attempted )) && [[ -n "$plugin_dir" ]]; then
            if ! sudo rm -rf -- "$plugin_dir"; then
                echo "ERROR: failed to remove the incomplete DeckyWARP installation." >&2
                rollback_failed=1
            fi
        fi
        if (( backup_made )) && [[ -e "$backup_dir" || -L "$backup_dir" ]]; then
            if ! sudo mv -T -- "$backup_dir" "$plugin_dir"; then
                echo "ERROR: failed to restore the previous DeckyWARP installation from $backup_dir." >&2
                rollback_failed=1
            fi
        fi
        if (( legacy_backup_made )) && [[ -e "$legacy_backup_dir" || -L "$legacy_backup_dir" ]]; then
            if ! sudo rm -rf -- "$legacy_plugin_dir" || \
               ! sudo mv -T -- "$legacy_backup_dir" "$legacy_plugin_dir"; then
                echo "ERROR: failed to restore the legacy DeckyWARP installation from $legacy_backup_dir." >&2
                rollback_failed=1
            fi
        fi
    fi
    if (( rollback_failed == 0 )) && [[ -n "$root_work_dir" && -d "$root_work_dir" ]]; then
        sudo rm -rf -- "$root_work_dir"
    elif (( rollback_failed )); then
        echo "ERROR: recovery files were preserved at $root_work_dir." >&2
        exit_code=1
    fi
    if [[ -n "$temp_dir" && -d "$temp_dir" ]]; then
        rm -rf -- "$temp_dir"
    fi
    if (( plugin_loader_was_active )); then
        if ! sudo systemctl start plugin_loader.service; then
            echo "ERROR: failed to restart plugin_loader.service." >&2
            if (( exit_code == 0 )); then
                exit_code=1
            fi
        fi
    fi

    exit "$exit_code"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for command_name in curl unzip sha256sum sudo systemctl getent mktemp mkdir findmnt stat find; do
    command -v "$command_name" >/dev/null 2>&1 || {
        echo "ERROR: required command not found: $command_name" >&2
        exit 1
    }
done

if id deck >/dev/null 2>&1; then
    target_user=deck
elif [[ -n "${SUDO_USER:-}" && "${SUDO_USER}" != root ]]; then
    target_user=$SUDO_USER
else
    target_user="$(getent passwd 1000 | cut -d: -f1)"
fi
[[ -n "$target_user" && "$target_user" != root ]] || {
    echo "ERROR: could not determine the SteamOS desktop user." >&2
    exit 1
}
target_home="$(getent passwd "$target_user" | cut -d: -f6)"
[[ "$target_home" == /* && "$target_home" != / ]] || {
    echo "ERROR: invalid home directory for $target_user." >&2
    exit 1
}

plugins_dir="$target_home/homebrew/plugins"
plugin_dir="$plugins_dir/DeckyWARP"
legacy_plugin_dir="$plugins_dir/decky-warp"
temp_dir="$(mktemp -d /tmp/deckywarp-install.XXXXXX)"

echo "Downloading the latest LamPPKK/DeckyWARP release"
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
    --retry 3 --output "$temp_dir/DeckyWARP.zip" "$RELEASE_URL"
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
    --retry 3 --output "$temp_dir/DeckyWARP.zip.sha256" "$CHECKSUM_URL"
(
    cd "$temp_dir"
    sha256sum --check DeckyWARP.zip.sha256
)

unzip -q "$temp_dir/DeckyWARP.zip" -d "$temp_dir/release"
release_root="$temp_dir/release/DeckyWARP"
for required_file in \
    plugin.json \
    main.py \
    dist/index.js \
    InstallPlugin.sh \
    UninstallPlugin.sh \
    scripts/install-warp.sh \
    scripts/update-plugin.sh \
    packaging/cloudflare-warp/PKGBUILD \
    packaging/cloudflare-warp/cloudflare-warp-bin.install; do
    [[ -f "$release_root/$required_file" ]] || {
        echo "ERROR: release is missing $required_file" >&2
        exit 1
    }
done
if [[ -n "$(find "$release_root" -type l -print -quit)" ]]; then
    echo "ERROR: release contains symbolic links; refusing privileged installation." >&2
    exit 1
fi

sudo -v
if sudo systemctl is-active --quiet plugin_loader.service; then
    plugin_loader_was_active=1
    sudo systemctl stop plugin_loader.service
fi

sudo mkdir -p -- "$plugins_dir"
[[ -d "$plugins_dir" && ! -L "$plugins_dir" ]] || {
    echo "ERROR: refusing an invalid or symlinked Decky plugins directory." >&2
    exit 1
}
plugins_mount="$(findmnt --noheadings --output TARGET --target "$plugins_dir")"
[[ "$plugins_mount" == /* && -d "$plugins_mount" && ! -L "$plugins_mount" ]] || {
    echo "ERROR: could not determine a safe filesystem root for Decky plugins." >&2
    exit 1
}
mount_owner="$(stat -c '%u' -- "$plugins_mount")"
mount_mode="$(stat -c '%a' -- "$plugins_mount")"
if [[ "$mount_owner" != 0 ]] || (( (8#$mount_mode & 0022) != 0 )); then
    echo "ERROR: Decky plugins filesystem root is not root-owned and protected: $plugins_mount" >&2
    exit 1
fi
root_work_template="${plugins_mount%/}/.deckywarp-install-root.XXXXXX"
root_work_dir="$(sudo mktemp -d "$root_work_template")"
[[ "$root_work_dir" == "${plugins_mount%/}"/.deckywarp-install-root.* && -d "$root_work_dir" && ! -L "$root_work_dir" ]] || {
    echo "ERROR: could not create a secure root staging directory." >&2
    exit 1
}
[[ "$(stat -c '%d' -- "$root_work_dir")" == "$(stat -c '%d' -- "$plugins_dir")" ]] || {
    echo "ERROR: DeckyWARP staging and plugin directories are on different filesystems." >&2
    exit 1
}
staging_dir="$root_work_dir/DeckyWARP.new"
backup_dir="$root_work_dir/DeckyWARP.backup"
legacy_backup_dir="$root_work_dir/decky-warp.backup"
sudo install -d -m 0755 -o root -g root "$staging_dir"
sudo cp -a -- "$release_root/." "$staging_dir/"
sudo chown -R root:root "$staging_dir"
sudo chmod -R a-w,u+rX,go+rX "$staging_dir"
sudo chmod 0555 \
    "$staging_dir/InstallPlugin.sh" \
    "$staging_dir/UninstallPlugin.sh" \
    "$staging_dir/scripts/install-warp.sh" \
    "$staging_dir/scripts/update-plugin.sh"

if [[ -e "$plugin_dir" || -L "$plugin_dir" ]]; then
    sudo mv -T -- "$plugin_dir" "$backup_dir"
    backup_made=1
fi
if [[ -e "$legacy_plugin_dir" || -L "$legacy_plugin_dir" ]]; then
    sudo mv -T -- "$legacy_plugin_dir" "$legacy_backup_dir"
    legacy_backup_made=1
fi
placement_attempted=1
sudo mv -T -- "$staging_dir" "$plugin_dir"
install_complete=1
if (( backup_made )); then
    sudo rm -rf -- "$backup_dir"
    backup_made=0
fi
legacy_backup_made=0

echo "DeckyWARP installed successfully. Restart Steam if the plugin is not visible."
