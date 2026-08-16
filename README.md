# DeckyWARP

DeckyWARP installs and controls the Cloudflare WARP Linux client from Decky Loader's Quick Access menu.

This maintained fork continues the original [Kit1112/DeckyWARP](https://github.com/Kit1112/DeckyWARP) project for current SteamOS and Cloudflare WARP releases.

## Features

- Install or update Cloudflare WARP without adding Chaotic-AUR to `pacman.conf`.
- Connect and disconnect WARP from Gaming Mode.
- Register the consumer WARP client and select `warp+doh` mode automatically.
- Preserve SteamOS readonly state after installation, including failure paths.
- Check and install plugin updates from `LamPPKK/DeckyWARP` releases.
- Verify both the Cloudflare package and DeckyWARP release with SHA-256 checksums.
- Install root-executed plugin files as root-owned and read-only.

## Install

Decky Loader must already be installed. In Desktop Mode, run:

```bash
curl -fsSL https://raw.githubusercontent.com/LamPPKK/DeckyWARP/main/InstallPlugin.sh \
  -o /tmp/install-deckywarp.sh
bash /tmp/install-deckywarp.sh
```

Return to Gaming Mode, open DeckyWARP, and choose **Install Cloudflare WARP**. Building the package can take several minutes.

Automation can pin both the plugin tag and release archive checksum:

```bash
DECKYWARP_RELEASE_TAG=v1.6.1 \
DECKYWARP_RELEASE_SHA256='<sha256-from-the-v1.6.1-release>' \
bash /tmp/install-deckywarp.sh
```

## Uninstall

The default uninstall removes only the Decky plugin and preserves the system WARP client:

```bash
curl -fsSL https://raw.githubusercontent.com/LamPPKK/DeckyWARP/main/UninstallPlugin.sh \
  -o /tmp/uninstall-deckywarp.sh
bash /tmp/uninstall-deckywarp.sh
```

To remove both the plugin and `cloudflare-warp-bin`:

```bash
REMOVE_WARP=1 bash /tmp/uninstall-deckywarp.sh
```

This preserves Cloudflare registration data in `/var/lib/cloudflare-warp`. Remove that directory manually only if you explicitly want to purge the device registration too.

## SteamOS notes

- Cloudflare does not officially list SteamOS or Arch Linux as supported client platforms. This project packages Cloudflare's official Ubuntu binary using a pinned AUR-derived recipe.
- Release 1.6.1 pins `cloudflare-warp-bin` 2026.6.880-1, its official download URL, and SHA-256 from [the maintained AUR package](https://aur.archlinux.org/packages/cloudflare-warp-bin) at commit `0d9fb97e2a4ce66bf07ce6e6fbf70b7e0188ea36`.
- SteamOS system updates may replace packages installed through `pacman`. If WARP disappears after a major SteamOS update, install it again from the plugin.
- The WARP taskbar application is not enabled. DeckyWARP is the intended interface.
- WARP is a network tunnel, not a country-selection or anonymity VPN.
- Older DeckyWARP releases added Chaotic-AUR globally. Version 1.6.0 warns when that legacy repository is detected, but does not remove a repository that other software may share.

## Build and test

Requires Node.js and pnpm:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

## Tiếng Việt

DeckyWARP cho phép cài, bật và tắt Cloudflare WARP ngay trong menu Quick Access của Decky Loader.

- Cài plugin bằng lệnh trong mục **Install**.
- Vào Gaming Mode, mở DeckyWARP và chọn **Install Cloudflare WARP**.
- Sau khi cài xong, dùng công tắc trong plugin để kết nối hoặc ngắt WARP.
- Gỡ plugin theo mặc định sẽ giữ lại WARP hệ thống. Dùng `REMOVE_WARP=1` nếu muốn gỡ cả hai.
- Cloudflare không hỗ trợ SteamOS/Arch chính thức, nên bản này vẫn cần kiểm thử thực tế trên thiết bị sau khi phát hành.

## Credits

- [Kit1112](https://github.com/Kit1112) — original DeckyWARP author.
- [DeckMTP](https://github.com/dafta/DeckMTP) — original frontend structure.
- [CSSLoader](https://github.com/DeckThemes/SDH-CssLoader) — settings and header UI references.
- [Emuchievements](https://github.com/EmuDeck/Emuchievements) — notification implementation reference.

Cloudflare and WARP are trademarks of Cloudflare, Inc. This project is not affiliated with Cloudflare.

## License status

The original repository did not include an explicit open-source license. This fork therefore does not claim permission to relicense the inherited code. Contact the original author before redistributing modified copies outside GitHub's fork functionality.
