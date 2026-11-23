import { Stack } from "expo-router";

import { tabStackScreenOptions } from "@/components/tab-stack-options";

export default function PokedexLayout() {
  return (
    <Stack screenOptions={tabStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: "Pokedex" }} />
      <Stack.Screen name="pokemon/[id]" options={{ headerLargeTitle: false, title: "" }} />
    </Stack>
  );
}
