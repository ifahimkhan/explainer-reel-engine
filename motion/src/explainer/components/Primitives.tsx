import React from "react";
import { EX_FONTS, LIGHT, SHADOW } from "../theme";
import { Icon, IconName } from "./Icon";

interface CardProps {
  style?: React.CSSProperties;
  dark?: boolean;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ style, dark = false, children }) => (
  <div
    style={{
      position: "absolute",
      background: dark ? LIGHT.dark : LIGHT.card,
      border: `2px solid ${dark ? LIGHT.darkLine : LIGHT.line}`,
      borderRadius: 26,
      boxShadow: SHADOW,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

interface PillProps {
  icon?: IconName;
  text: string;
  tone?: "light" | "dark" | "yellow";
  mono?: boolean;
  style?: React.CSSProperties;
}

const PILL_TONES = {
  light: { bg: LIGHT.card, fg: LIGHT.ink, border: LIGHT.line },
  dark: { bg: LIGHT.dark, fg: "#ffffff", border: LIGHT.dark },
  yellow: { bg: LIGHT.yellowSoft, fg: "#7a4b00", border: LIGHT.yellow },
} as const;

export const Pill: React.FC<PillProps> = ({ icon, text, tone = "light", mono = false, style }) => {
  const c = PILL_TONES[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 26px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: `2px solid ${c.border}`,
        boxShadow: SHADOW,
        fontFamily: mono ? EX_FONTS.mono : EX_FONTS.sans,
        fontWeight: mono ? 500 : 700,
        fontSize: mono ? 26 : 30,
        letterSpacing: mono ? 3 : -0.3,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={mono ? 26 : 30} /> : null}
      {text}
    </div>
  );
};

/** Absolutely positioned row that centers its child horizontally. */
export const Centered: React.FC<{ top: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  top,
  style,
  children,
}) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", ...style }}>
    {children}
  </div>
);

/** Small uppercase mono label used as a card header. */
export const CardLabel: React.FC<{ icon: IconName; text: string; color?: string }> = ({
  icon,
  text,
  color = LIGHT.muted,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      color,
      fontFamily: EX_FONTS.mono,
      fontSize: 22,
      letterSpacing: 3,
      textTransform: "uppercase",
    }}
  >
    <Icon name={icon} size={24} />
    {text}
  </div>
);
