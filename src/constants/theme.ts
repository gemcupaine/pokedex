import { StyleSheet } from "react-native";

/** Brand and fixed colors that don't change with the color scheme. */
export const Colors = {
  pokedexRed: "#E3350D",
  pokedexRedSoft: "#FDE2DB",
  pokedexRedSoftDark: "#4A1A10",
  inactive: "#8E8E93",
  white: "#FFFFFF",
  ink: "#1C1C1E",
  danger: "#F2545B",
  male: "#4F8EF7",
  female: "#F45D9A",
} as const;

/** Surface and text colors per color scheme. Use via `useTheme()`. */
export const Palettes = {
  light: {
    background: "#F2F2F7",
    card: "#FFFFFF",
    text: "#000000",
    secondaryText: "#6C6C70",
    separator: "#E5E5EA",
    track: "#E5E5EA",
    skeleton: "#E5E5EA",
    accentSoft: Colors.pokedexRedSoft,
  },
  dark: {
    background: "#000000",
    card: "#1C1C1E",
    text: "#FFFFFF",
    secondaryText: "#AEAEB2",
    separator: "#2C2C2E",
    track: "#3A3A3C",
    skeleton: "#2C2C2E",
    accentSoft: Colors.pokedexRedSoftDark,
  },
} as const;

export type Palette = (typeof Palettes)[keyof typeof Palettes];

/** Base-stat tiers, low to high: used for stat bar fills. */
export const StatTierColors = [
  { min: 0, color: "#F2545B" },
  { min: 60, color: "#F7A23B" },
  { min: 90, color: "#F2C94C" },
  { min: 110, color: "#7AC74C" },
  { min: 130, color: "#2FB385" },
] as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Text presets; combine with a palette color, e.g. `[Typography.body, { color: palette.text }]`. */
export const Typography = StyleSheet.create({
  display: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: "700" },
  headline: { fontSize: 17, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 23 },
  callout: { fontSize: 15, fontWeight: "500" },
  footnote: { fontSize: 13, fontWeight: "500" },
  caption: { fontSize: 12, fontWeight: "500" },
  numeric: { fontVariant: ["tabular-nums"] },
});

/** `#RRGGBB` plus an alpha between 0 and 1, as `#RRGGBBAA`. */
export function withAlpha(hex: string, alpha: number): string {
  const byte = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex.slice(0, 7)}${byte.toString(16).padStart(2, "0")}`;
}

/** Ink or white, whichever reads better on `hex` (e.g. on Electric yellow). */
export function readableTextOn(hex: string): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const luminance = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luminance > 170 ? Colors.ink : Colors.white;
}

export function getStatTierColor(value: number): string {
  let color: string = StatTierColors[0].color;
  for (const tier of StatTierColors) if (value >= tier.min) color = tier.color;
  return color;
}
