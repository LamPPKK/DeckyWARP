import {
  PanelSection,
  PanelSectionRow,
  ButtonItem,
  ToggleField,
  staticClasses,
  DialogButton,
  Focusable,
  Navigation,
} from "@decky/ui";
import { definePlugin, routerHook } from "@decky/api";
import { FaCloud } from "react-icons/fa";
import { BsGearFill } from "react-icons/bs";
import { Fragment, useEffect, useState } from "react";
import SettingsPageRouter from "./pages/settings/SettingsPageRouter";
import {
  get_install_log,
  get_state,
  install_warp,
  toggle_warp,
  WarpState,
} from "./backend";

const txt = (ru: boolean, state: WarpState): string => {
  const ruText: Record<WarpState, string> = {
    connected: "Статус WARP: Подключено",
    disconnected: "Статус WARP: Отключено",
    connecting: "Статус WARP: Подключение…",
    unregistered: "WARP требует регистрации",
    error: "Статус WARP: Неизвестно",
    missing: "WARP не установлен",
    installing: "Установка WARP…",
  };
  const enText: Record<WarpState, string> = {
    connected: "WARP status: connected",
    disconnected: "WARP status: disconnected",
    connecting: "WARP status: connecting…",
    unregistered: "WARP needs registration",
    error: "WARP status: unknown",
    missing: "WARP is not installed",
    installing: "Installing WARP…",
  };
  return (ru ? ruText : enText)[state];
};

const Content = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const topBar = document.querySelector('[class*="TopBar"], [class*="topBar"]');
      if (!topBar || topBar.querySelector(".deckywarp-top-icon")) return;

      const icon = document.createElement("div");
      icon.className = "deckywarp-top-icon";
      icon.style.width = "24px";
      icon.style.height = "24px";
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.marginLeft = "6px";
      icon.style.color = "white";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("viewBox", "0 0 640 512");
      svg.setAttribute("height", "18");
      svg.setAttribute("width", "18");
      svg.innerHTML = '<path d="M537.6 226.6c-28.7-82.4-111-138.6-200.3-138.6-63.6 0-122.8 29.5-161.2 79.4-72.6 6.3-128.1 67.1-128.1 141.3 0 79.5 64.5 144 144 144H496c70.7 0 128-57.3 128-128 0-63.3-45.9-116-104.4-129.1z"/>';
      icon.appendChild(svg);
      topBar.appendChild(icon);
      observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.querySelector(".deckywarp-top-icon")?.remove();
    };
  }, []);

  const [state, setState] = useState<WarpState>("error");
  const [log, setLog] = useState("");
  const ru = navigator.language?.toLowerCase().startsWith("ru");

  const refreshState = async () => {
    try {
      setState(await get_state());
    } catch (_) {
      setState("error");
    }
  };
  const refreshLog = async () => {
    try {
      setLog(await get_install_log());
    } catch (_) {
      setLog("");
    }
  };

  useEffect(() => {
    void refreshState();
    const timer = setInterval(() => {
      void refreshState();
      void refreshLog();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PanelSection>
      <PanelSectionRow>{txt(ru, state)}</PanelSectionRow>
      <PanelSectionRow>
        <div style={{ height: 8 }} />
      </PanelSectionRow>

      {state === "missing" ? (
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={async () => {
              setState("installing");
              const result = await install_warp();
              if (result === "error") setState("error");
            }}
          >
            {ru ? "Установить Cloudflare WARP" : "Install Cloudflare WARP"}
          </ButtonItem>
        </PanelSectionRow>
      ) : state === "installing" ? (
        <Fragment>
          <PanelSectionRow>
            <progress style={{ width: "100%" }} />
          </PanelSectionRow>
          <PanelSectionRow>
            <code style={{ fontSize: 12 }}>{log || "…"}</code>
          </PanelSectionRow>
        </Fragment>
      ) : (
        <Fragment>
          <PanelSectionRow>
            <ToggleField
              label="Cloudflare WARP"
              checked={state === "connected"}
              onChange={async () => setState(await toggle_warp())}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={async () => {
                setState("installing");
                const result = await install_warp();
                if (result === "error") setState("error");
              }}
            >
              {ru ? "Обновить / восстановить Cloudflare WARP" : "Update / repair Cloudflare WARP"}
            </ButtonItem>
          </PanelSectionRow>
        </Fragment>
      )}
    </PanelSection>
  );
};

const TitleView = () => {
  const openSettings = () => {
    Navigation.CloseSideMenus();
    Navigation.Navigate("/deckywarp/settings");
  };

  return (
    <Focusable
      style={{
        display: "flex",
        padding: "0",
        width: "100%",
        boxShadow: "none",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      className={staticClasses.Title}
    >
      <div style={{ marginLeft: 8 }}>DeckyWARP</div>
      <DialogButton
        style={{ height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }}
        onClick={openSettings}
      >
        <BsGearFill style={{ marginTop: "-4px", display: "block" }} />
      </DialogButton>
    </Focusable>
  );
};

export default definePlugin(() => {
  routerHook.addRoute("/deckywarp/settings", SettingsPageRouter);

  return {
    name: "DeckyWARP",
    titleView: <TitleView />,
    content: <Content />,
    icon: <FaCloud />,
    onDismount() {
      routerHook.removeRoute("/deckywarp/settings");
    },
  };
});
