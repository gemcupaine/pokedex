import { NativeTabs } from "expo-router/native-tabs";

import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const isAndroid = process.env.EXPO_OS === "android";

export default function RootLayout() {
  const { palette } = useTheme();

  return (
    <NativeTabs
      // iOS 26+: the system draws the Liquid Glass bar and adapts unselected
      // icon/label colors to the content behind it, so only the accent is set.
      tintColor={Colors.pokedexRed}
      minimizeBehavior="onScrollDown"
      labelStyle={
        isAndroid
          ? {
              default: { color: palette.secondaryText, fontSize: 12, fontWeight: "500" },
              selected: { color: Colors.pokedexRed, fontSize: 12, fontWeight: "700" },
            }
          : { selected: { fontWeight: "600" } }
      }
      // Android (Material 3): solid surface, soft red pill behind the active icon.
      iconColor={
        isAndroid ? { default: palette.secondaryText, selected: Colors.pokedexRed } : undefined
      }
      backgroundColor={isAndroid ? palette.card : undefined}
      indicatorColor={palette.accentSoft}
      rippleColor={palette.accentSoft}
      labelVisibilityMode="labeled"
      badgeBackgroundColor={Colors.pokedexRed}
      badgeTextColor={Colors.white}
    >
      <NativeTabs.Trigger name="(pokedex)">
        <NativeTabs.Trigger.Label>Pokedex</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "book.closed", selected: "book.closed.fill" }}
          md="catching_pokemon"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          md={{ default: "favorite_border", selected: "favorite" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
