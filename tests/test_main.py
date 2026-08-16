import asyncio
import json
import os
import pathlib
import tempfile
import time
import unittest
from unittest import mock

import main


class StateTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tempdir.cleanup)
        self.root = pathlib.Path(self.tempdir.name)
        self.warp_bin = self.root / "warp-cli"
        self.install_flag = self.root / "job"
        self.patchers = [
            mock.patch.object(main, "WARP_BIN", self.warp_bin),
            mock.patch.object(main, "JOB_FLAG", self.install_flag),
        ]
        for patcher in self.patchers:
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_missing_binary(self):
        self.assertEqual(main._state(), "missing")

    def test_installing_takes_precedence(self):
        self.install_flag.write_text("deckywarp-install-123\n", encoding="utf-8")
        with mock.patch.object(
            main, "_run_sync", return_value=mock.Mock(returncode=0, stdout="active\n")
        ):
            self.assertEqual(main._state(), "installing")

    def test_activating_oneshot_keeps_job_lock(self):
        self.install_flag.write_text("deckywarp-install-456\n", encoding="utf-8")
        os.utime(self.install_flag, (time.time() - 60, time.time() - 60))
        with mock.patch.object(
            main,
            "_run_sync",
            return_value=mock.Mock(returncode=3, stdout="activating\n"),
        ):
            self.assertTrue(main._job_active(self.install_flag))
        self.assertTrue(self.install_flag.exists())

    def test_current_warp_statuses(self):
        self.warp_bin.touch()
        cases = {
            "Status update: Connected": "connected",
            "Status update: Connecting": "connecting",
            "Status update: Disconnected": "disconnected",
            "Registration Missing": "unregistered",
            "Please accept the WARP terms": "unregistered",
            "Unable to connect to the CloudflareWARP daemon": "disconnected",
            "unexpected output": "error",
        }
        for output, expected in cases.items():
            with self.subTest(output=output), mock.patch.object(main, "_raw_status", return_value=output):
                self.assertEqual(main._state(), expected)


class PluginTests(unittest.IsolatedAsyncioTestCase):
    async def test_disconnects_when_connected(self):
        plugin = main.Plugin()
        run = mock.AsyncMock()
        wait_for = mock.AsyncMock(return_value="disconnected")
        with (
            mock.patch.object(main, "_state", return_value="connected"),
            mock.patch.object(main, "_run", run),
            mock.patch.object(main, "_wait_for", wait_for),
        ):
            self.assertEqual(await plugin.toggle_warp(), "disconnected")
        run.assert_awaited_once_with(str(main.WARP_BIN), "disconnect")

    async def test_registers_before_connecting(self):
        plugin = main.Plugin()
        run = mock.AsyncMock(side_effect=[mock.Mock(returncode=0) for _ in range(4)])
        with (
            mock.patch.object(main, "_state", side_effect=["unregistered", "unregistered"]),
            mock.patch.object(main, "_run", run),
            mock.patch.object(main, "_wait_for", mock.AsyncMock(return_value="connected")),
            mock.patch.object(asyncio, "sleep", mock.AsyncMock()),
        ):
            self.assertEqual(await plugin.toggle_warp(), "connected")
        self.assertEqual(
            [call.args for call in run.await_args_list],
            [
                ("systemctl", "start", main.WARP_SERVICE),
                (str(main.WARP_BIN), "--accept-tos", "registration", "new"),
                (str(main.WARP_BIN), "mode", "warp+doh"),
                (str(main.WARP_BIN), "connect"),
            ],
        )

    async def test_enforces_warp_mode_for_existing_registration(self):
        plugin = main.Plugin()
        run = mock.AsyncMock(side_effect=[mock.Mock(returncode=0) for _ in range(3)])
        with (
            mock.patch.object(main, "_state", side_effect=["disconnected", "disconnected"]),
            mock.patch.object(main, "_run", run),
            mock.patch.object(main, "_wait_for", mock.AsyncMock(return_value="connected")),
            mock.patch.object(asyncio, "sleep", mock.AsyncMock()),
        ):
            self.assertEqual(await plugin.toggle_warp(), "connected")
        self.assertEqual(
            [call.args for call in run.await_args_list],
            [
                ("systemctl", "start", main.WARP_SERVICE),
                (str(main.WARP_BIN), "mode", "warp+doh"),
                (str(main.WARP_BIN), "connect"),
            ],
        )

    async def test_install_and_plugin_update_share_one_lock(self):
        plugin = main.Plugin()
        with mock.patch.object(main, "_job_active", return_value=True):
            self.assertEqual(await plugin.install_warp(), "installing")
            self.assertEqual(await plugin.update_plugin(), "updating")

    async def test_update_check_uses_release_version(self):
        plugin = main.Plugin()
        with (
            mock.patch.object(main, "_current_version", return_value="1.5.0"),
            mock.patch.object(main, "_latest_release", return_value=("1.6.1", "Changes")),
        ):
            result = await plugin.check_update()
        self.assertEqual(result["status"], "update_available")
        self.assertEqual(result["latest"], "1.6.1")

    async def test_update_check_does_not_offer_downgrade(self):
        plugin = main.Plugin()
        with (
            mock.patch.object(main, "_current_version", return_value="1.7.0"),
            mock.patch.object(main, "_latest_release", return_value=("1.6.1", "Older")),
        ):
            result = await plugin.check_update()
        self.assertEqual(result, {"status": "up_to_date", "current": "1.7.0"})

    async def test_update_check_rejects_invalid_version(self):
        plugin = main.Plugin()
        with (
            mock.patch.object(main, "_current_version", return_value="unknown"),
            mock.patch.object(main, "_latest_release", return_value=("1.6.1", "Changes")),
        ):
            result = await plugin.check_update()
        self.assertEqual(result["status"], "error")
        self.assertIn("unsupported version format", result["detail"])


class VersionTests(unittest.TestCase):
    def test_reads_plugin_version(self):
        with tempfile.TemporaryDirectory() as tempdir:
            plugin_json = pathlib.Path(tempdir) / "plugin.json"
            plugin_json.write_text(json.dumps({"version": "1.6.1"}), encoding="utf-8")
            with mock.patch.object(main, "PLUGIN_JSON", plugin_json):
                self.assertEqual(main._current_version(), "1.6.1")


if __name__ == "__main__":
    unittest.main()
