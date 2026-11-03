import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

/** Self-hosted variable fonts (public/fonts) so renders don't depend on Google Fonts being reachable. */
const LOCAL_FONTS = [
  { family: "Montserrat", file: "fonts/Montserrat-latin.woff2", weight: "600 900" },
  { family: "JetBrains Mono", file: "fonts/JetBrainsMono-latin.woff2", weight: "500 700" },
  { family: "Inter", file: "fonts/Inter-latin.woff2", weight: "500 800" },
] as const;

const loadLocalFonts = (): void => {
  if (typeof document === "undefined") return;
  const handle = delayRender("Loading local fonts");
  Promise.all(
    LOCAL_FONTS.map(async ({ family, file, weight }) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((err: unknown) => cancelRender(err));
};

loadLocalFonts();

export const FONT_FAMILIES = {
  display: "Montserrat, sans-serif",
  mono: "'JetBrains Mono', monospace",
  sans: "Inter, sans-serif",
} as const;
