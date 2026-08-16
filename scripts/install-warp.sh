#!/usr/bin/env bash
set -Eeuo pipefail

readonly RUNTIME_DIR="/run/deckywarp"
readonly LOG_DIR="/var/log/deckywarp"
readonly JOB_FLAG="$RUNTIME_DIR/job"
readonly INSTALL_LOG="$LOG_DIR/install.log"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
PACKAGE_SOURCE="$PLUGIN_ROOT/packaging/cloudflare-warp"
readonly SCRIPT_DIR PLUGIN_ROOT PACKAGE_SOURCE

readonly_changed=0
build_root=""

restore_readonly() {
    if (( readonly_changed )); then
        if ! steamos-readonly enable; then
            echo "ERROR: failed to restore SteamOS readonly mode." >&2
            return 1
        fi
        readonly_changed=0
    fi
}

cleanup() {
    local exit_code=$?
    trap - EXIT
    set +e

    rm -f -- "$JOB_FLAG"
    if [[ -n "$build_root" && "$build_root" == /var/tmp/deckywarp-build.* && -d "$build_root" ]]; then
        rm -rf -- "$build_root"
    fi
    if ! restore_readonly && (( exit_code == 0 )); then
        exit_code=1
    fi
    exit "$exit_code"
}

if (( EUID != 0 )); then
    echo "ERROR: install-warp.sh must run as root." >&2
    exit 1
fi

for command_name in install tee grep steamos-devmode steamos-readonly pacman runuser getent systemctl; do
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

exec > >(tee -a "$INSTALL_LOG") 2>&1
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

[[ -f "$PACKAGE_SOURCE/PKGBUILD" ]] || {
    echo "ERROR: bundled Cloudflare WARP package recipe is missing." >&2
    exit 1
}

if id deck >/dev/null 2>&1; then
    build_user=deck
else
    build_user="$(getent passwd 1000 | cut -d: -f1)"
fi
[[ -n "$build_user" && "$build_user" != root ]] || {
    echo "ERROR: could not determine the SteamOS desktop user." >&2
    exit 1
}
build_group="$(id -gn "$build_user")"
build_home="$(getent passwd "$build_user" | cut -d: -f6)"

readonly_status="$(steamos-readonly status 2>&1 || true)"
if grep -qi enabled <<< "$readonly_status"; then
    echo "Temporarily disabling SteamOS readonly mode"
    steamos-readonly disable
    readonly_changed=1
elif ! grep -qi disabled <<< "$readonly_status"; then
    echo "ERROR: could not determine SteamOS readonly state: $readonly_status" >&2
    exit 1
fi

echo "Enabling SteamOS developer mode"
steamos-devmode enable --no-prompt

if grep -q '^\[chaotic-aur\]' /etc/pacman.conf; then
    echo "WARNING: legacy [chaotic-aur] configuration detected in /etc/pacman.conf." >&2
    echo "DeckyWARP no longer uses it and will not remove a repository that other software may share." >&2
fi

echo "Installing build and Cloudflare WARP dependencies"
pacman -S --needed --noconfirm \
    base-devel \
    patchelf \
    at-spi2-core \
    ayatana-ido \
    cairo \
    curl \
    dbus \
    fontconfig \
    gdk-pixbuf2 \
    glib2 \
    gtk3 \
    harfbuzz \
    hicolor-icon-theme \
    libayatana-appindicator \
    libayatana-indicator \
    libdbusmenu-glib \
    libepoxy \
    libsoup3 \
    nftables \
    nspr \
    nss \
    pango \
    tpm2-tss \
    webkit2gtk-4.1

command -v makepkg >/dev/null 2>&1 || {
    echo "ERROR: makepkg is unavailable after installing base-devel." >&2
    exit 1
}

build_root="$(mktemp -d /var/tmp/deckywarp-build.XXXXXX)"
[[ "$build_root" == /var/tmp/deckywarp-build.* && -d "$build_root" ]] || {
    echo "ERROR: could not create build directory." >&2
    exit 1
}
install -d -m 0755 -o "$build_user" -g "$build_group" "$build_root"
cp -a -- "$PACKAGE_SOURCE/." "$build_root/"
chown -R "$build_user:$build_group" "$build_root"

echo "Building the pinned cloudflare-warp-bin package"
pushd "$build_root" >/dev/null
runuser -u "$build_user" -- env HOME="$build_home" \
    makepkg --cleanbuild --force --noconfirm

package_file=""
while IFS= read -r candidate; do
    if [[ "$(basename "$candidate")" == cloudflare-warp-bin-* ]] && \
       [[ "$(basename "$candidate")" != *-debug-* ]]; then
        package_file=$candidate
        break
    fi
done < <(runuser -u "$build_user" -- env HOME="$build_home" makepkg --packagelist)
popd >/dev/null

[[ -n "$package_file" && -f "$package_file" ]] || {
    echo "ERROR: makepkg did not produce cloudflare-warp-bin." >&2
    exit 1
}

echo "Installing $package_file"
pacman -U --needed --noconfirm "$package_file"
systemctl enable warp-svc.service
systemctl restart warp-svc.service
sleep 2

if ! /usr/bin/warp-cli registration show >/dev/null 2>&1; then
    /usr/bin/warp-cli --accept-tos registration new
fi
/usr/bin/warp-cli mode warp+doh
/usr/bin/warp-cli connect || true

echo "Cloudflare WARP installation/update completed"
