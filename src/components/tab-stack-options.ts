import type { ComponentProps } from "react";
import type { Stack } from "expo-router";

import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>["screenOptions"]>;

const isIOS = process.env.EXPO_OS === "ios";

/** Header styling shared by the stack inside each tab. */
export function useTabStackScreenOptions(): StackScreenOptions {
  const { palette } = useTheme();

  return {
    headerLargeTitle: true,
    // Transparent header lets iOS 26 apply its Liquid Glass scroll-edge effect;
    // a headerBlurEffect would replace it with the legacy material blur.
    headerTransparent: isIOS,
    // Android: a solid bar that blends into the grouped background.
    headerStyle: isIOS ? undefined : { backgroundColor: palette.background },
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerTintColor: Colors.pokedexRed,
    headerTitleAlign: "left",
    headerTitleStyle: { color: palette.text, fontWeight: isIOS ? "600" : "700" },
    headerLargeTitleStyle: { color: palette.text, fontWeight: "800" },
    // Chevron only — keeps the detail header clean.
    headerBackButtonDisplayMode: "minimal",
    // Matches the screens' background so pushes don't flash white in dark mode.
    contentStyle: { backgroundColor: palette.background },
  };
}
