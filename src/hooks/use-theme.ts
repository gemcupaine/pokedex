import { useColorScheme } from "react-native";

import { Palettes, type Palette } from "@/constants/theme";

/** The palette for the current system color scheme. */
export function useTheme(): { palette: Palette; dark: boolean } {
  const dark = useColorScheme() === "dark";
  return { palette: dark ? Palettes.dark : Palettes.light, dark };
}
