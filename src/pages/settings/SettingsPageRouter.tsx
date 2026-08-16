import { SidebarNavigation } from "@decky/ui";
import { BsGearFill } from "react-icons/bs";
import { FaDownload, FaHeart } from "react-icons/fa";
import PluginSettings from "./PluginSettings";
import Updates from "./Updates";
import Credits from "./Credits";

const ru = navigator.language?.toLowerCase().startsWith("ru");

const t = (key: string): string => {
  const dict: Record<string, string> = {
    general: ru ? "Настройки" : "Settings",
    updates: ru ? "Обновление" : "Updates",
    credits: ru ? "Благодарности" : "Credits",
  };
  return dict[key] || key;
};

const SettingsPageRouter = () => (
  <SidebarNavigation
    pages={[
      {
        title: t("general"),
        icon: <BsGearFill />,
        route: "/deckywarp/settings/general",
        content: <PluginSettings />,
      },
      {
        title: t("updates"),
        icon: <FaDownload />,
        route: "/deckywarp/settings/updates",
        content: <Updates />,
      },
      {
        title: t("credits"),
        icon: <FaHeart />,
        route: "/deckywarp/settings/credits",
        content: <Credits />,
      },
    ]}
  />
);

export default SettingsPageRouter;
