import type { ComponentProps } from "react";
import type { Stack } from "expo-router";

import { Colors } from "@/constants/theme";

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>["screenOptions"]>;

export const tabStackScreenOptions: StackScreenOptions = {
  headerLargeTitle: true,
  // Transparent header lets iOS 26 apply its Liquid Glass scroll-edge effect;
  // a headerBlurEffect would replace it with the legacy material blur.
  headerTransparent: process.env.EXPO_OS === "ios",
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerTintColor: Colors.pokedexRed,
};
