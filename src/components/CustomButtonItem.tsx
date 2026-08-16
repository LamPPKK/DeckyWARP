import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { Focusable } from "@decky/ui";

export const CustomButtonItem = ({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => {
  const baseStyle: CSSProperties = {
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

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled) event.currentTarget.style.backgroundColor = "rgb(57, 65, 69)";
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      event.currentTarget.style.backgroundColor = "rgb(43, 51, 55)";
      event.currentTarget.style.color = "white";
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      event.currentTarget.style.backgroundColor = "rgb(108, 113, 116)";
      event.currentTarget.style.color = "rgb(43, 51, 55)";
    }
  };

  const handleMouseUp = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      event.currentTarget.style.backgroundColor = "rgb(57, 65, 69)";
      event.currentTarget.style.color = "white";
    }
  };

  return (
    <Focusable onActivate={!disabled ? onClick : undefined}>
      <div
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={baseStyle}
      >
        {children}
      </div>
    </Focusable>
  );
};
