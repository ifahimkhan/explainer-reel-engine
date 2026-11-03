import React from "react";

export const ICON_NAMES = [
  "lock", "unlock", "check", "github", "file", "folder", "arrowRight", "arrowDown",
  "arrowLeft", "send", "share", "user", "sparkle", "flame", "chat", "grid", "db",
  "cloud", "layers", "auth", "eyeOff", "wand", "bell", "terminal",
  "image", "video", "mic", "camera", "aperture", "star", "dollar", "code", "download", "heart", "unlink", "plus", "wifi", "signal", "phone", "battery",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const PATHS: Record<IconName, string> = {
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  unlock: "M7 11V8a5 5 0 0 1 9.5-2M5 11h14v10H5z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  github: "M9 19c-4.5 1.4-4.5-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  file: "M14 3H6v18h12V7zM14 3v4h4M9 12h6M9 16h6",
  folder: "M3 6h6l2 2h10v11H3z",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
  send: "M21 3L10 14M21 3l-7 18-4-7-7-4z",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  flame: "M12 22c4 0 7-2.7 7-6.5 0-4-3-6-4-9.5-1.5 2-2 3.5-2 5-1.5-1-2.5-3-2.5-5C7 8 5 11 5 15.5 5 19.3 8 22 12 22z",
  chat: "M4 5h16v11H9l-5 4z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  cloud: "M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  auth: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  eyeOff: "M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.3M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6a9 9 0 0 0 4.4-1.1",
  wand: "M4 20L16 8M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.7 1.3L21 13l-1.3.7L19 15l-.7-1.3L17 13l1.3-.7z",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  terminal: "M4 5h16v14H4zM8 10l3 2-3 2M13 15h4",
  image: "M4 4h16v16H4zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20 15l-5-5-11 10",
  video: "M3 6h12v12H3zM15 10l6-3v10l-6-3",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  camera: "M3 8h4l2-3h6l2 3h4v11H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  aperture: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.3 8l5.7 9.9M9.7 8h11.5M7.4 12l5.7-9.9M9.7 16L4 6.1M14.3 16H2.8M16.6 12l-5.7 9.9",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z",
  dollar: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16",
  download: "M12 3v12M6 10l6 6 6-6M4 20h16",
  heart: "M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.4 12 20 12 20z",
  unlink: "M9 15l-2 2a3.5 3.5 0 0 1-5-5l2-2M15 9l2-2a3.5 3.5 0 0 1 5 5l-2 2M4 4l16 16",
  plus: "M12 5v14M5 12h14",
  wifi: "M2 8.5a15 15 0 0 1 20 0M5 12a10.5 10.5 0 0 1 14 0M8.5 15.5a5.5 5.5 0 0 1 7 0M12 19.5h.01",
  signal: "M4 20v-3M9 20v-7M14 20V9M19 20V4",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  battery: "M3 7h15v10H3zM21 10v4M6 10v4M9 10v4",
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
}

export const Icon: React.FC<IconProps> = ({ name, size = 28, color = "currentColor", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={PATHS[name]} />
  </svg>
);
