import { PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import { toaster } from "@decky/api";
import { useEffect, useState } from "react";
import { CustomButtonItem } from "../../components/CustomButtonItem";
import { CustomTextBox } from "../../components/CustomTextBox";
import { check_update, get_update_log, get_version, update_plugin } from "../../backend";

const ru = navigator.language?.toLowerCase().startsWith("ru");

const t = (key: string) => {
  const dict: Record<string, string> = {
    logs_placeholder: ru ? "Логи проверки обновлений появятся здесь..." : "Update check logs will appear here...",
    check_error: ru ? "Ошибка проверки обновлений!" : "Update check error!",
    update_available: ru ? "Доступно обновление до версии" : "Update available: version",
    up_to_date: ru ? "У вас актуальная версия" : "You're on the latest version",
    current_version: ru ? "Текущая версия:" : "Current version:",
    install: ru ? "Установить" : "Install",
    installing: ru ? "Установка..." : "Installing...",
    check: ru ? "Проверить обновления" : "Check for updates",
    checking: ru ? "Проверяем..." : "Checking...",
    ignore: ru ? "Игнорировать" : "Ignore",
    changelog: ru ? "Список изменений" : "Changelog",
    log_label: ru ? "логи" : "logs",
    auto_check: ru ? "Авто-проверка обновлений" : "Auto update check",
    update_found_toast: ru ? "Найдено обновление!" : "Update available!",
    update_ignored: ru ? "🔕 Обновление версии" : "🔕 Update version",
    ignored: ru ? "проигнорировано." : "ignored.",
    error_checking: ru ? "❌ Ошибка при вызове check_update:\n" : "❌ Error during check_update:\n",
    starting_update: ru ? "🚀 Устанавливаем обновление..." : "🚀 Starting update...",
    update_launched: ru ? "✅ Обновление запущено. Плагин скоро перезапустится." : "✅ Update started. Plugin will restart soon.",
    already_updating: ru ? "⏳ Обновление уже выполняется." : "⏳ An update is already running.",
    error_during_update: ru ? "❌ Ошибка при установке обновления:\n" : "❌ Error during update:\n",
  };
  return dict[key] || key;
};

const Updates = () => {
  const [autoCheck, setAutoCheck] = useState(false);
  const [log, setLog] = useState(t("logs_placeholder"));
  const [status, setStatus] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [changelog, setChangelog] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdateLocked, setIsUpdateLocked] = useState(localStorage.getItem("update_in_progress") === "true");
  const ignoredKey = "update_ignored_version";

  const onCheckUpdates = async () => {
    setIsChecking(true);
    setLog(previous => previous + `\n⏳ ${t("check")}...`);
    try {
      const result = await check_update();
      const ignored = localStorage.getItem(ignoredKey);
      if (result.status === "update_available" && result.latest === ignored) {
        setLog(previous => previous + `\n🔕 ${t("update_available")} ${result.latest} ${t("ignored")}`);
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
        toaster.toast({ title: "DeckyWARP", body: t("update_found_toast") });
        localStorage.setItem("update_latest", result.latest);
        localStorage.setItem("update_changelog", result.changelog);
      } else {
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
    } catch (error) {
      setStatus("error");
      setLog(previous => previous + `\n${t("error_checking")}${error}`);
      setChangelog(null);
      localStorage.setItem("update_status", "error");
      localStorage.removeItem("update_changelog");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem("update_in_progress");
    setIsUpdateLocked(false);
    const storedDebug = localStorage.getItem("debug_mode");
    if (storedDebug !== null) setDebugMode(storedDebug === "true");
    const storedAutoCheck = localStorage.getItem("auto_check") === "true";
    setAutoCheck(storedAutoCheck);
    const storedStatus = localStorage.getItem("update_status");
    const storedLatest = localStorage.getItem("update_latest");
    const storedCurrent = localStorage.getItem("update_current");
    const storedChangelog = localStorage.getItem("update_changelog");
    if (storedStatus) setStatus(storedStatus);
    if (storedLatest) setLatestVersion(storedLatest);
    if (storedCurrent) setCurrentVersion(storedCurrent);
    if (storedStatus === "update_available" && storedChangelog) setChangelog(storedChangelog);

    void (async () => {
      try {
        const result = await get_version();
        setCurrentVersion(result.version);
      } catch (_) {
        setCurrentVersion(null);
      }
      if (storedAutoCheck) await onCheckUpdates();
    })();
  }, []);

  useEffect(() => {
    if (!debugMode && !isUpdating && !isUpdateLocked) return;
    const timer = setInterval(async () => {
      try {
        const result = await get_update_log();
        if (result) setLog(result);
      } catch (_) {}
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
    setLog(previous => previous + `\n${t("update_ignored")} ${latestVersion} ${t("ignored")}`);
  };

  const onUpdate = async () => {
    setIsUpdating(true);
    setIsUpdateLocked(true);
    localStorage.setItem("update_in_progress", "true");
    setLog(previous => previous + `\n${t("starting_update")}`);
    try {
      const result = await update_plugin();
      if (result === "error") throw new Error("The updater could not be started");
      setLog(previous => previous + `\n${result === "updating" ? t("already_updating") : t("update_launched")}`);
    } catch (error) {
      setLog(previous => previous + `\n${t("error_during_update")}${error}`);
    } finally {
      setIsUpdating(false);
      localStorage.removeItem("update_in_progress");
      setIsUpdateLocked(false);
    }
  };

  const renderStatus = () => {
    if (status === "error") return t("check_error");
    if (status === "update_available" && latestVersion) return `${t("update_available")} ${latestVersion}!`;
    if (status === "up_to_date" && currentVersion) return `${t("up_to_date")} (${currentVersion})!`;
    if (currentVersion) return `${t("current_version")} ${currentVersion}`;
    return "";
  };

  return (
    <PanelSection>
      <PanelSectionRow>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          {status === "update_available" ? (
            <CustomButtonItem onClick={onUpdate} disabled={isUpdating || isUpdateLocked}>
              {isUpdating ? t("installing") : t("install")}
            </CustomButtonItem>
          ) : (
            <CustomButtonItem onClick={onCheckUpdates} disabled={isChecking}>
              {isChecking ? t("checking") : t("check")}
            </CustomButtonItem>
          )}
          <div style={{ marginLeft: "auto", fontSize: "14px", color: "white", opacity: 0.7, paddingLeft: "16px" }}>
            {renderStatus()}
          </div>
        </div>
      </PanelSectionRow>

      {status === "update_available" && changelog && (
        <PanelSectionRow><CustomTextBox label={t("changelog")} content={changelog} /></PanelSectionRow>
      )}
      {status === "update_available" && (
        <PanelSectionRow><CustomButtonItem onClick={resetUpdateState} disabled={isUpdating}>{t("ignore")}</CustomButtonItem></PanelSectionRow>
      )}
      {debugMode && (
        <PanelSectionRow><CustomTextBox label={t("log_label")} content={log} /></PanelSectionRow>
      )}
      <ToggleField
        label={t("auto_check")}
        checked={autoCheck}
        onChange={value => {
          setAutoCheck(value);
          localStorage.setItem("auto_check", value.toString());
          if (value) void onCheckUpdates();
        }}
      />
    </PanelSection>
  );
};

export default Updates;
