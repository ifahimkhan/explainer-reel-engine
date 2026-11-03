import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { pop } from "../anim";
import { COLORS, FONTS } from "../theme";

/** Persistent top-right watermark; enters after the hook card. */
export const BrandBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = pop(frame, 0);

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        right: 30,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "8px 22px 8px 8px",
        borderRadius: 50,
        background: COLORS.navyGlass,
        border: `2px solid rgba(61,220,132,0.5)`,
        fontFamily: FONTS.display,
        opacity: enter,
        transform: `translateY(${(1 - enter) * -40}px)`,
      }}
    >
      <Img src={staticFile("logo.png")} style={{ width: 72, height: 72, borderRadius: 36 }} />
      <div style={{ color: COLORS.white, fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>FAHIM KHAN</div>
    </div>
  );
};
