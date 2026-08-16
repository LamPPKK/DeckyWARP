import { PanelSection, ButtonItem, PanelSectionRow } from "@decky/ui";

const open = (url: string) => {
  try {
    window.open(url, "_blank");
  } catch (error) {
    console.error("Failed to open URL:", url, error);
  }
};

const ru = navigator.language?.toLowerCase().startsWith("ru");

const Credits = () => (
  <PanelSection>
    <PanelSectionRow>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <ButtonItem layout="below" onClick={() => open("https://github.com/Kit1112/DeckyWARP")}>
          <span style={{ color: "#71c6ff" }}>{ru ? "Оригинальный DeckyWARP" : "Original DeckyWARP"}</span>
        </ButtonItem>
        <ButtonItem layout="below" onClick={() => open("https://github.com/dafta/DeckMTP")}>
          <span style={{ color: "#71c6ff" }}>DeckMTP</span> — {ru ? "основа фронтенда" : "original frontend base"}
        </ButtonItem>
        <ButtonItem layout="below" onClick={() => open("https://github.com/DeckThemes/SDH-CssLoader")}>
          <span style={{ color: "#71c6ff" }}>CSSLoader</span> — {ru ? "реализация настроек" : "settings implementation reference"}
        </ButtonItem>
        <ButtonItem layout="below" onClick={() => open("https://github.com/LamPPKK/DeckyWARP")}>
          <span style={{ color: "#71c6ff" }}>{ru ? "Поддерживаемый форк" : "Maintained fork"}</span>
        </ButtonItem>
      </div>
    </PanelSectionRow>
  </PanelSection>
);

export default Credits;
