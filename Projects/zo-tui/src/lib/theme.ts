// Color palette for the Zo TUI.
// Inspired by Tokyo Night + Phosphor: muted background, semantic accents.

export const theme = {
  bg: "#10100f",
  surface: "#1a1a17",
  surfaceAlt: "#22221d",
  border: "#3a3a32",
  borderActive: "#d8a657",
  fg: "#f5f1e8",
  fgMuted: "#8a857a",
  fgDim: "#5a564d",

  // Semantic
  ok: "#9ece6a",
  warn: "#e0af68",
  err: "#f7768e",
  info: "#7dcfff",
  accent: "#d8a657",
  accent2: "#bb9af7",
  link: "#7aa2f7",

  // Tab bar
  tabInactive: "#2a2a25",
  tabActive: "#d8a657",
} as const;

export type ThemeColor = keyof typeof theme;
