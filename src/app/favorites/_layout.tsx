import { Stack } from "expo-router";

import { useTabStackScreenOptions } from "@/components/tab-stack-options";

export default function FavoritesLayout() {
  return (
    <Stack screenOptions={useTabStackScreenOptions()}>
      <Stack.Screen name="index" options={{ title: "Favorites" }} />
    </Stack>
  );
}
