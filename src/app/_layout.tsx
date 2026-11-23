import { NativeTabs } from "expo-router/native-tabs";

import { Colors } from "@/constants/theme";

const isAndroid = process.env.EXPO_OS === "android";

export default function RootLayout() {
  return (
    <NativeTabs
      // iOS 26+: the system draws the Liquid Glass bar and adapts unselected
      // icon/label colors to the content behind it, so only the accent is set.
      tintColor={Colors.pokedexRed}
      minimizeBehavior="onScrollDown"
      // Android (Material) keeps explicit colors.
      iconColor={
        isAndroid ? { default: Colors.inactive, selected: Colors.pokedexRed } : undefined
      }
      labelStyle={
        isAndroid
          ? {
              default: { color: Colors.inactive },
              selected: { color: Colors.pokedexRed, fontWeight: "600" },
            }
          : undefined
      }
      indicatorColor={Colors.pokedexRedSoft}
      rippleColor={Colors.pokedexRedSoft}
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
