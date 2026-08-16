const manifest = {"name":"DeckyWARP"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const routerHook = api.routerHook;
const toaster = api.toaster;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaHeart (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}function FaCloud (props) {
  return GenIcon({"attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4z"},"child":[]}]})(props);
}

// THIS FILE IS AUTO GENERATED
function BsGearFill (props) {
  return GenIcon({"attr":{"fill":"currentColor","viewBox":"0 0 16 16"},"child":[{"tag":"path","attr":{"d":"M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"},"child":[]}]})(props);
}

const CustomButtonItem = ({ onClick, children, disabled = false, }) => {
    const baseStyle = {
        backgroundColor: disabled ? "rgb(30, 34, 36)" : "rgb(43, 51, 55)",
        color: disabled ? "rgba(255, 255, 255, 0.4)" : "white",
        fontSize: "16px",
        fontWeight: "normal",
        padding: "10px 28px",
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        borderRadius: "2px",
        display: "inline-block",
        lineHeight: 1.25,
        transition: "background-color 0.2s, color 0.2s",
        pointerEvents: disabled ? "none" : "auto",
    };
    const handleMouseEnter = (event) => {
        if (!disabled)
            event.currentTarget.style.backgroundColor = "rgb(57, 65, 69)";
    };
    const handleMouseLeave = (event) => {
        if (!disabled) {
            event.currentTarget.style.backgroundColor = "rgb(43, 51, 55)";
            event.currentTarget.style.color = "white";
        }
    };
    const handleMouseDown = (event) => {
        if (!disabled) {
            event.currentTarget.style.backgroundColor = "rgb(108, 113, 116)";
            event.currentTarget.style.color = "rgb(43, 51, 55)";
        }
    };
    const handleMouseUp = (event) => {
        if (!disabled) {
            event.currentTarget.style.backgroundColor = "rgb(57, 65, 69)";
            event.currentTarget.style.color = "white";
        }
    };
    return (SP_JSX.jsx(DFL.Focusable, { onActivate: !disabled ? onClick : undefined, children: SP_JSX.jsx("div", { onClick: !disabled ? onClick : undefined, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onMouseDown: handleMouseDown, onMouseUp: handleMouseUp, style: baseStyle, children: children }) }));
};

const get_state = callable("get_state");
const toggle_warp = callable("toggle_warp");
const install_warp = callable("install_warp");
const get_install_log = callable("get_install_log");
const update_plugin = callable("update_plugin");
const get_update_log = callable("get_update_log");
const get_version = callable("get_version");
const check_update = callable("check_update");
const clear_logs = callable("clear_logs");
callable("stop_warp");

const ru$3 = navigator.language?.toLowerCase().startsWith("ru");
const PluginSettings = () => {
    const [debugMode, setDebugMode] = SP_REACT.useState(false);
    const [isClearing, setIsClearing] = SP_REACT.useState(false);
    const [clearMessage, setClearMessage] = SP_REACT.useState(null);
    const logPaths = [
        "/var/log/deckywarp/plugin.log",
        "/var/log/deckywarp/update.log",
        "/var/log/deckywarp/install.log",
    ];
    const storageKeys = [
        { key: "update_status", commentRu: "статус последней проверки", commentEn: "last update check status" },
        { key: "update_latest", commentRu: "доступная версия", commentEn: "available version" },
        { key: "update_changelog", commentRu: "текст изменений", commentEn: "changelog text" },
        { key: "update_in_progress", commentRu: "флаг, что идёт обновление", commentEn: "flag indicating update is in progress" },
        { key: "update_ignored_version", commentRu: "версия, которую нужно игнорировать", commentEn: "version to ignore" },
    ];
    SP_REACT.useEffect(() => {
        const stored = localStorage.getItem("debug_mode");
        if (stored !== null)
            setDebugMode(stored === "true");
    }, []);
    const handleDebugToggle = (value) => {
        setDebugMode(value);
        localStorage.setItem("debug_mode", value.toString());
    };
    const handleClearLogs = async () => {
        setIsClearing(true);
        setClearMessage(null);
        try {
            await clear_logs();
            setClearMessage(ru$3 ? "✅ Логи очищены" : "✅ Logs cleared");
        }
        catch (_) {
            setClearMessage(ru$3 ? "❌ Ошибка при очистке логов" : "❌ Error while clearing logs");
        }
        finally {
            setIsClearing(false);
        }
    };
    return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.ToggleField, { label: ru$3 ? "Режим отладки" : "Debug mode", checked: debugMode, onChange: handleDebugToggle }), debugMode && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontWeight: "bold", marginBottom: "4px" }, children: ru$3 ? "Логи" : "Logs" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", width: "100%" }, children: [SP_JSX.jsx(CustomButtonItem, { onClick: handleClearLogs, disabled: isClearing, children: isClearing ? (ru$3 ? "Очищаем..." : "Clearing...") : (ru$3 ? "Очистить логи" : "Clear logs") }), clearMessage && SP_JSX.jsx("div", { style: { marginLeft: "auto", color: "#aaa", fontSize: "13px", whiteSpace: "nowrap" }, children: clearMessage })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: "#aaa", fontSize: "13px", padding: "4px 0" }, children: [ru$3 ? "Логи находятся по пути (нужен root):" : "Root-owned log file locations:", SP_JSX.jsx("br", {}), logPaths.map(path => SP_JSX.jsx("div", { children: path }, path))] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontWeight: "bold", marginTop: "8px" }, children: ru$3 ? "Удалить ключи в LocalStorage" : "Delete LocalStorage keys" }) }), storageKeys.map(({ key, commentRu, commentEn }) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", width: "100%" }, children: [SP_JSX.jsx(CustomButtonItem, { onClick: () => localStorage.removeItem(key), children: ru$3 ? `Удалить ключ ${key}` : `Delete key ${key}` }), SP_JSX.jsx("div", { style: { marginLeft: "auto", color: "#aaa", fontSize: "13px", whiteSpace: "nowrap" }, children: ru$3 ? commentRu : commentEn })] }) }, key)))] }))] }));
};

const CustomTextBox = ({ label, content, }) => (SP_JSX.jsxs("div", { style: { width: "100%" }, children: [SP_JSX.jsx("div", { style: {
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "4px",
            }, children: label }), SP_JSX.jsx("div", { style: {
                whiteSpace: "pre-wrap",
                backgroundColor: "rgb(30, 34, 37)",
                color: "rgb(184, 188, 192)",
                padding: "10px",
                borderRadius: "4px",
            }, children: content })] }));

const ru$2 = navigator.language?.toLowerCase().startsWith("ru");
const t$1 = (key) => {
    const dict = {
        logs_placeholder: ru$2 ? "Логи проверки обновлений появятся здесь..." : "Update check logs will appear here...",
        check_error: ru$2 ? "Ошибка проверки обновлений!" : "Update check error!",
        update_available: ru$2 ? "Доступно обновление до версии" : "Update available: version",
        up_to_date: ru$2 ? "У вас актуальная версия" : "You're on the latest version",
        current_version: ru$2 ? "Текущая версия:" : "Current version:",
        install: ru$2 ? "Установить" : "Install",
        installing: ru$2 ? "Установка..." : "Installing...",
        check: ru$2 ? "Проверить обновления" : "Check for updates",
        checking: ru$2 ? "Проверяем..." : "Checking...",
        ignore: ru$2 ? "Игнорировать" : "Ignore",
        changelog: ru$2 ? "Список изменений" : "Changelog",
        log_label: ru$2 ? "логи" : "logs",
        auto_check: ru$2 ? "Авто-проверка обновлений" : "Auto update check",
        update_found_toast: ru$2 ? "Найдено обновление!" : "Update available!",
        update_ignored: ru$2 ? "🔕 Обновление версии" : "🔕 Update version",
        ignored: ru$2 ? "проигнорировано." : "ignored.",
        error_checking: ru$2 ? "❌ Ошибка при вызове check_update:\n" : "❌ Error during check_update:\n",
        starting_update: ru$2 ? "🚀 Устанавливаем обновление..." : "🚀 Starting update...",
        update_launched: ru$2 ? "✅ Обновление запущено. Плагин скоро перезапустится." : "✅ Update started. Plugin will restart soon.",
        already_updating: ru$2 ? "⏳ Обновление уже выполняется." : "⏳ An update is already running.",
        error_during_update: ru$2 ? "❌ Ошибка при установке обновления:\n" : "❌ Error during update:\n",
    };
    return dict[key] || key;
};
const Updates = () => {
    const [autoCheck, setAutoCheck] = SP_REACT.useState(false);
    const [log, setLog] = SP_REACT.useState(t$1("logs_placeholder"));
    const [status, setStatus] = SP_REACT.useState(null);
    const [currentVersion, setCurrentVersion] = SP_REACT.useState(null);
    const [latestVersion, setLatestVersion] = SP_REACT.useState(null);
    const [changelog, setChangelog] = SP_REACT.useState(null);
    const [debugMode, setDebugMode] = SP_REACT.useState(false);
    const [isUpdating, setIsUpdating] = SP_REACT.useState(false);
    const [isChecking, setIsChecking] = SP_REACT.useState(false);
    const [isUpdateLocked, setIsUpdateLocked] = SP_REACT.useState(localStorage.getItem("update_in_progress") === "true");
    const ignoredKey = "update_ignored_version";
    const onCheckUpdates = async () => {
        setIsChecking(true);
        setLog(previous => previous + `\n⏳ ${t$1("check")}...`);
        try {
            const result = await check_update();
            const ignored = localStorage.getItem(ignoredKey);
            if (result.status === "update_available" && result.latest === ignored) {
                setLog(previous => previous + `\n🔕 ${t$1("update_available")} ${result.latest} ${t$1("ignored")}`);
                setStatus("up_to_date");
                setLatestVersion(null);
                setChangelog(null);
                localStorage.setItem("update_status", "up_to_date");
                return;
            }
            setStatus(result.status);
            setLatestVersion(result.status === "update_available" ? result.latest : null);
            setCurrentVersion(result.current);
            if (result.status === "update_available") {
                setChangelog(result.changelog);
                toaster.toast({ title: "DeckyWARP", body: t$1("update_found_toast") });
                localStorage.setItem("update_latest", result.latest);
                localStorage.setItem("update_changelog", result.changelog);
            }
            else {
                setChangelog(null);
                localStorage.removeItem("update_latest");
                localStorage.removeItem("update_changelog");
            }
            setLog(previous => previous + "\n" + JSON.stringify(result, null, 2));
            localStorage.setItem("update_status", result.status);
            localStorage.setItem("update_current", result.current);
            if (result.status !== "update_available") {
                localStorage.removeItem("update_in_progress");
                setIsUpdateLocked(false);
            }
        }
        catch (error) {
            setStatus("error");
            setLog(previous => previous + `\n${t$1("error_checking")}${error}`);
            setChangelog(null);
            localStorage.setItem("update_status", "error");
            localStorage.removeItem("update_changelog");
        }
        finally {
            setIsChecking(false);
        }
    };
    SP_REACT.useEffect(() => {
        localStorage.removeItem("update_in_progress");
        setIsUpdateLocked(false);
        const storedDebug = localStorage.getItem("debug_mode");
        if (storedDebug !== null)
            setDebugMode(storedDebug === "true");
        const storedAutoCheck = localStorage.getItem("auto_check") === "true";
        setAutoCheck(storedAutoCheck);
        const storedStatus = localStorage.getItem("update_status");
        const storedLatest = localStorage.getItem("update_latest");
        const storedCurrent = localStorage.getItem("update_current");
        const storedChangelog = localStorage.getItem("update_changelog");
        if (storedStatus)
            setStatus(storedStatus);
        if (storedLatest)
            setLatestVersion(storedLatest);
        if (storedCurrent)
            setCurrentVersion(storedCurrent);
        if (storedStatus === "update_available" && storedChangelog)
            setChangelog(storedChangelog);
        void (async () => {
            try {
                const result = await get_version();
                setCurrentVersion(result.version);
            }
            catch (_) {
                setCurrentVersion(null);
            }
            if (storedAutoCheck)
                await onCheckUpdates();
        })();
    }, []);
    SP_REACT.useEffect(() => {
        if (!debugMode && !isUpdating && !isUpdateLocked)
            return;
        const timer = setInterval(async () => {
            try {
                const result = await get_update_log();
                if (result)
                    setLog(result);
            }
            catch (_) { }
        }, 1000);
        return () => clearInterval(timer);
    }, [debugMode, isUpdating, isUpdateLocked]);
    const resetUpdateState = () => {
        localStorage.setItem(ignoredKey, latestVersion || "");
        ["update_status", "update_latest", "update_changelog", "update_in_progress"].forEach(key => localStorage.removeItem(key));
        setStatus(null);
        setLatestVersion(null);
        setChangelog(null);
        setIsUpdateLocked(false);
        setAutoCheck(false);
        localStorage.setItem("auto_check", "false");
        setLog(previous => previous + `\n${t$1("update_ignored")} ${latestVersion} ${t$1("ignored")}`);
    };
    const onUpdate = async () => {
        setIsUpdating(true);
        setIsUpdateLocked(true);
        localStorage.setItem("update_in_progress", "true");
        setLog(previous => previous + `\n${t$1("starting_update")}`);
        try {
            const result = await update_plugin();
            if (result === "error")
                throw new Error("The updater could not be started");
            setLog(previous => previous + `\n${result === "updating" ? t$1("already_updating") : t$1("update_launched")}`);
        }
        catch (error) {
            setLog(previous => previous + `\n${t$1("error_during_update")}${error}`);
        }
        finally {
            setIsUpdating(false);
            localStorage.removeItem("update_in_progress");
            setIsUpdateLocked(false);
        }
    };
    const renderStatus = () => {
        if (status === "error")
            return t$1("check_error");
        if (status === "update_available" && latestVersion)
            return `${t$1("update_available")} ${latestVersion}!`;
        if (status === "up_to_date" && currentVersion)
            return `${t$1("up_to_date")} (${currentVersion})!`;
        if (currentVersion)
            return `${t$1("current_version")} ${currentVersion}`;
        return "";
    };
    return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", width: "100%" }, children: [status === "update_available" ? (SP_JSX.jsx(CustomButtonItem, { onClick: onUpdate, disabled: isUpdating || isUpdateLocked, children: isUpdating ? t$1("installing") : t$1("install") })) : (SP_JSX.jsx(CustomButtonItem, { onClick: onCheckUpdates, disabled: isChecking, children: isChecking ? t$1("checking") : t$1("check") })), SP_JSX.jsx("div", { style: { marginLeft: "auto", fontSize: "14px", color: "white", opacity: 0.7, paddingLeft: "16px" }, children: renderStatus() })] }) }), status === "update_available" && changelog && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CustomTextBox, { label: t$1("changelog"), content: changelog }) })), status === "update_available" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CustomButtonItem, { onClick: resetUpdateState, disabled: isUpdating, children: t$1("ignore") }) })), debugMode && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(CustomTextBox, { label: t$1("log_label"), content: log }) })), SP_JSX.jsx(DFL.ToggleField, { label: t$1("auto_check"), checked: autoCheck, onChange: value => {
                    setAutoCheck(value);
                    localStorage.setItem("auto_check", value.toString());
                    if (value)
                        void onCheckUpdates();
                } })] }));
};

const open = (url) => {
    try {
        window.open(url, "_blank");
    }
    catch (error) {
        console.error("Failed to open URL:", url, error);
    }
};
const ru$1 = navigator.language?.toLowerCase().startsWith("ru");
const Credits = () => (SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px", width: "100%" }, children: [SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => open("https://github.com/Kit1112/DeckyWARP"), children: SP_JSX.jsx("span", { style: { color: "#71c6ff" }, children: ru$1 ? "Оригинальный DeckyWARP" : "Original DeckyWARP" }) }), SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: () => open("https://github.com/dafta/DeckMTP"), children: [SP_JSX.jsx("span", { style: { color: "#71c6ff" }, children: "DeckMTP" }), " \u2014 ", ru$1 ? "основа фронтенда" : "original frontend base"] }), SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: () => open("https://github.com/DeckThemes/SDH-CssLoader"), children: [SP_JSX.jsx("span", { style: { color: "#71c6ff" }, children: "CSSLoader" }), " \u2014 ", ru$1 ? "реализация настроек" : "settings implementation reference"] }), SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => open("https://github.com/LamPPKK/DeckyWARP"), children: SP_JSX.jsx("span", { style: { color: "#71c6ff" }, children: ru$1 ? "Поддерживаемый форк" : "Maintained fork" }) })] }) }) }));

const ru = navigator.language?.toLowerCase().startsWith("ru");
const t = (key) => {
    const dict = {
        general: ru ? "Настройки" : "Settings",
        updates: ru ? "Обновление" : "Updates",
        credits: ru ? "Благодарности" : "Credits",
    };
    return dict[key] || key;
};
const SettingsPageRouter = () => (SP_JSX.jsx(DFL.SidebarNavigation, { pages: [
        {
            title: t("general"),
            icon: SP_JSX.jsx(BsGearFill, {}),
            route: "/deckywarp/settings/general",
            content: SP_JSX.jsx(PluginSettings, {}),
        },
        {
            title: t("updates"),
            icon: SP_JSX.jsx(FaDownload, {}),
            route: "/deckywarp/settings/updates",
            content: SP_JSX.jsx(Updates, {}),
        },
        {
            title: t("credits"),
            icon: SP_JSX.jsx(FaHeart, {}),
            route: "/deckywarp/settings/credits",
            content: SP_JSX.jsx(Credits, {}),
        },
    ] }));

const txt = (ru, state) => {
    const ruText = {
        connected: "Статус WARP: Подключено",
        disconnected: "Статус WARP: Отключено",
        connecting: "Статус WARP: Подключение…",
        unregistered: "WARP требует регистрации",
        error: "Статус WARP: Неизвестно",
        missing: "WARP не установлен",
        installing: "Установка WARP…",
    };
    const enText = {
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
    SP_REACT.useEffect(() => {
        const observer = new MutationObserver(() => {
            const topBar = document.querySelector('[class*="TopBar"], [class*="topBar"]');
            if (!topBar || topBar.querySelector(".deckywarp-top-icon"))
                return;
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
    const [state, setState] = SP_REACT.useState("error");
    const [log, setLog] = SP_REACT.useState("");
    const ru = navigator.language?.toLowerCase().startsWith("ru");
    const refreshState = async () => {
        try {
            setState(await get_state());
        }
        catch (_) {
            setState("error");
        }
    };
    const refreshLog = async () => {
        try {
            setLog(await get_install_log());
        }
        catch (_) {
            setLog("");
        }
    };
    SP_REACT.useEffect(() => {
        void refreshState();
        const timer = setInterval(() => {
            void refreshState();
            void refreshLog();
        }, 3000);
        return () => clearInterval(timer);
    }, []);
    return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: txt(ru, state) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { height: 8 } }) }), state === "missing" ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: async () => {
                        setState("installing");
                        const result = await install_warp();
                        if (result === "error")
                            setState("error");
                    }, children: ru ? "Установить Cloudflare WARP" : "Install Cloudflare WARP" }) })) : state === "installing" ? (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("progress", { style: { width: "100%" } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("code", { style: { fontSize: 12 }, children: log || "…" }) })] })) : (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Cloudflare WARP", checked: state === "connected", onChange: async () => setState(await toggle_warp()) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: async () => {
                                setState("installing");
                                const result = await install_warp();
                                if (result === "error")
                                    setState("error");
                            }, children: ru ? "Обновить / восстановить Cloudflare WARP" : "Update / repair Cloudflare WARP" }) })] }))] }));
};
const TitleView = () => {
    const openSettings = () => {
        DFL.Navigation.CloseSideMenus();
        DFL.Navigation.Navigate("/deckywarp/settings");
    };
    return (SP_JSX.jsxs(DFL.Focusable, { style: {
            display: "flex",
            padding: "0",
            width: "100%",
            boxShadow: "none",
            alignItems: "center",
            justifyContent: "space-between",
        }, className: DFL.staticClasses.Title, children: [SP_JSX.jsx("div", { style: { marginLeft: 8 }, children: "DeckyWARP" }), SP_JSX.jsx(DFL.DialogButton, { style: { height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }, onClick: openSettings, children: SP_JSX.jsx(BsGearFill, { style: { marginTop: "-4px", display: "block" } }) })] }));
};
var index = definePlugin(() => {
    routerHook.addRoute("/deckywarp/settings", SettingsPageRouter);
    return {
        name: "DeckyWARP",
        titleView: SP_JSX.jsx(TitleView, {}),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaCloud, {}),
        onDismount() {
            routerHook.removeRoute("/deckywarp/settings");
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
