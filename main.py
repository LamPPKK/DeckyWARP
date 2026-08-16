import asyncio
import json
import os
import pathlib
import re
import subprocess
import time
import urllib.request


PLUGIN_ROOT = pathlib.Path(__file__).resolve().parent
PLUGIN_JSON = PLUGIN_ROOT / "plugin.json"
WARP_BIN = pathlib.Path("/usr/bin/warp-cli")
WARP_SERVICE = "warp-svc.service"
TIMEOUT = 30

RUNTIME_DIR = pathlib.Path("/run/deckywarp")
LOG_DIR = pathlib.Path("/var/log/deckywarp")

JOB_FLAG = RUNTIME_DIR / "job"
INSTALL_LOG = LOG_DIR / "install.log"
INSTALL_SCRIPT = PLUGIN_ROOT / "scripts" / "install-warp.sh"

UPDATE_LOG = LOG_DIR / "update.log"
UPDATE_SCRIPT = PLUGIN_ROOT / "scripts" / "update-plugin.sh"

PLUGIN_LOG = LOG_DIR / "plugin.log"
LATEST_RELEASE_API = "https://api.github.com/repos/LamPPKK/DeckyWARP/releases/latest"


def log_to_file(message: str) -> None:
    try:
        with PLUGIN_LOG.open("a", encoding="utf-8") as log_file:
            log_file.write(f"{message}\n")
    except OSError:
        pass


def _ensure_private_directory(path: pathlib.Path, mode: int) -> None:
    if path.is_symlink():
        raise RuntimeError(f"refusing symlinked DeckyWARP directory: {path}")
    path.mkdir(parents=True, exist_ok=True)
    os.chown(path, 0, 0)
    path.chmod(mode)


def _clean_env():
    """Avoid loading Steam Runtime libraries in host commands."""
    env = os.environ.copy()
    env.pop("LD_LIBRARY_PATH", None)
    return env


def _run_sync(*cmd, timeout=None):
    try:
        return subprocess.run(
            cmd,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=timeout,
            env=_clean_env(),
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        log_to_file(f"command failed: {' '.join(map(str, cmd))}: {error}")
        return None


async def _run(*cmd):
    return await asyncio.to_thread(_run_sync, *cmd)


def _raw_status():
    result = _run_sync(str(WARP_BIN), "status", timeout=10)
    return (result.stdout or "").strip() if result else ""


def _job_active(flag):
    if not flag.exists():
        return False
    try:
        unit_name = flag.read_text(encoding="utf-8").strip()
        age = time.time() - flag.stat().st_mtime
    except OSError:
        return False

    if re.fullmatch(r"deckywarp-(?:install|update)-\d+", unit_name):
        result = _run_sync(
            "systemctl",
            "show",
            "--property=ActiveState",
            "--value",
            unit_name,
            timeout=5,
        )
        active_state = (result.stdout or "").strip() if result else ""
        if active_state in {"active", "activating", "reloading", "deactivating"}:
            return True
        if age < 5:
            return True

    try:
        flag.unlink(missing_ok=True)
    except OSError as error:
        log_to_file(f"could not remove stale job flag {flag}: {error}")
    return False


def _state():
    if _job_active(JOB_FLAG):
        return "installing"
    if not WARP_BIN.exists():
        return "missing"

    status = _raw_status().lower()
    if (
        "registration missing" in status
        or "not registered" in status
        or "accept the warp terms" in status
        or "terms of service" in status
    ):
        return "unregistered"
    if "unable to connect" in status and "daemon" in status:
        return "disconnected"
    if "disconnected" in status:
        return "disconnected"
    if "connecting" in status:
        return "connecting"
    if "connected" in status:
        return "connected"
    return "error"


async def _wait_for(desired_state):
    deadline = time.monotonic() + TIMEOUT
    while time.monotonic() < deadline:
        current_state = _state()
        if current_state == desired_state:
            return current_state
        await asyncio.sleep(0.5)
    return _state()


async def _start_transient_job(name, script, flag):
    if _job_active(flag):
        return False
    if not script.is_file():
        log_to_file(f"missing helper script: {script}")
        return False

    unit_name = f"{name}-{time.time_ns()}"
    try:
        with flag.open("x", encoding="utf-8") as flag_file:
            flag_file.write(f"{unit_name}\n")
        flag.chmod(0o600)
    except FileExistsError:
        return False
    except OSError as error:
        log_to_file(f"could not create job flag {flag}: {error}")
        return False

    result = await _run(
        "systemd-run",
        "--collect",
        f"--unit={unit_name}",
        "--service-type=oneshot",
        "--quiet",
        str(script),
    )
    if not result or result.returncode != 0:
        flag.unlink(missing_ok=True)
        detail = (result.stdout or "").strip() if result else "could not start systemd-run"
        log_to_file(f"{name} failed to start: {detail}")
        return False
    return True


def _current_version():
    try:
        return str(json.loads(PLUGIN_JSON.read_text(encoding="utf-8"))["version"])
    except (OSError, KeyError, TypeError, json.JSONDecodeError):
        return "unknown"


def _parse_version(version):
    match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", version)
    if not match:
        raise ValueError(f"unsupported version format: {version}")
    return tuple(int(part) for part in match.groups())


def _latest_release():
    request = urllib.request.Request(
        LATEST_RELEASE_API,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "DeckyWARP",
        },
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        payload = json.load(response)
    version = str(payload["tag_name"]).removeprefix("v")
    return version, str(payload.get("body", "")).strip()


class Plugin:
    async def _main(self):
        _ensure_private_directory(RUNTIME_DIR, 0o700)
        _ensure_private_directory(LOG_DIR, 0o750)
        log_to_file("DeckyWARP backend started")

    async def _unload(self):
        log_to_file("DeckyWARP backend stopped")

    async def get_state(self):
        return _state()

    async def toggle_warp(self):
        state = _state()
        if state in ("missing", "installing"):
            return state
        if state == "connected":
            await _run(str(WARP_BIN), "disconnect")
            return await _wait_for("disconnected")

        await _run("systemctl", "start", WARP_SERVICE)
        await asyncio.sleep(1)
        if _state() == "unregistered":
            registration = await _run(
                str(WARP_BIN), "--accept-tos", "registration", "new"
            )
            if not registration or registration.returncode != 0:
                return "error"

        mode = await _run(str(WARP_BIN), "mode", "warp+doh")
        if not mode or mode.returncode != 0:
            return "error"

        await _run(str(WARP_BIN), "connect")
        return await _wait_for("connected")

    async def install_warp(self):
        if _job_active(JOB_FLAG):
            return "installing"
        started = await _start_transient_job(
            "deckywarp-install", INSTALL_SCRIPT, JOB_FLAG
        )
        return "started" if started else "error"

    async def get_install_log(self):
        try:
            return INSTALL_LOG.read_text(encoding="utf-8")[-8000:]
        except OSError:
            return ""

    async def update_plugin(self):
        if _job_active(JOB_FLAG):
            return "updating"
        started = await _start_transient_job(
            "deckywarp-update", UPDATE_SCRIPT, JOB_FLAG
        )
        return "update_started" if started else "error"

    async def get_update_log(self):
        try:
            return UPDATE_LOG.read_text(encoding="utf-8")[-8000:]
        except OSError:
            return ""

    async def get_version(self):
        return {"version": _current_version()}

    async def check_update(self):
        current = _current_version()
        try:
            latest, changelog = await asyncio.to_thread(_latest_release)
        except Exception as error:
            log_to_file(f"update check failed: {error}")
            return {"status": "error", "detail": str(error), "current": current}

        try:
            latest_version = _parse_version(latest)
            current_version = _parse_version(current)
        except ValueError as error:
            return {"status": "error", "detail": str(error), "current": current}

        if latest_version > current_version:
            return {
                "status": "update_available",
                "latest": latest,
                "current": current,
                "changelog": changelog or "No changelog provided.",
            }
        return {"status": "up_to_date", "current": current}

    async def clear_logs(self):
        try:
            for log_file in (PLUGIN_LOG, INSTALL_LOG, UPDATE_LOG):
                log_file.unlink(missing_ok=True)
            return "ok"
        except OSError as error:
            return f"error: {error}"

    async def stop_warp(self):
        await _run(str(WARP_BIN), "disconnect")
        return _state()


plugin = Plugin()
