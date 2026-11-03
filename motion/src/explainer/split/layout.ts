import { EX_HEIGHT } from "../theme";

/** Split-screen bands on the 1080x1920 canvas: graphics on top, camera below. */
export const GFX_H = 1150;
export const VIDEO_TOP = GFX_H;
export const VIDEO_H = EX_HEIGHT - GFX_H;

/** Generic scenes keep their content inside this vertical band of the graphics area. */
export const SPLIT_CONTENT = { top: 250, bottom: 1030 } as const;

/** Caption card is centred on the seam between graphics and video. */
export const SPLIT_CAPTION_TOP = GFX_H - 100;
