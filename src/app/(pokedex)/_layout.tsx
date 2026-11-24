import { Stack } from "expo-router";

import { useTabStackScreenOptions } from "@/components/tab-stack-options";

export default function PokedexLayout() {
  return (
    <Stack screenOptions={useTabStackScreenOptions()}>
      <Stack.Screen
        name="index"
        // iOS large titles are always left-aligned, so use the standard centered title here.
        options={{ title: "Pokedex", headerLargeTitle: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen name="pokemon/[id]/index" options={{ headerLargeTitle: false, title: "" }} />
      <Stack.Screen
        name="pokemon/[id]/stats"
        options={{
          presentation: "formSheet",
          headerShown: false,
          // Opens at medium height; drag or scroll up for full height.
          sheetAllowedDetents: [0.6, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: 28,
        }}
      />
    </Stack>
  );
}
