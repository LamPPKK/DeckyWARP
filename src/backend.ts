import { callable } from "@decky/api";

export type WarpState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "unregistered"
  | "error"
  | "missing"
  | "installing";

export type UpdateResult =
  | {
      status: "update_available";
      current: string;
      latest: string;
      changelog: string;
    }
  | { status: "up_to_date"; current: string }
  | { status: "error"; current: string; detail: string };

export const get_state = callable<[], WarpState>("get_state");
export const toggle_warp = callable<[], WarpState>("toggle_warp");
export const install_warp = callable<[], "started" | "installing" | "error">("install_warp");
export const get_install_log = callable<[], string>("get_install_log");
export const update_plugin = callable<[], "update_started" | "updating" | "error">("update_plugin");
export const get_update_log = callable<[], string>("get_update_log");
export const get_version = callable<[], { version: string }>("get_version");
export const check_update = callable<[], UpdateResult>("check_update");
export const clear_logs = callable<[], string>("clear_logs");
export const stop_warp = callable<[], WarpState>("stop_warp");
