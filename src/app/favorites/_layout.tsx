import { Stack } from "expo-router";

import { tabStackScreenOptions } from "@/components/tab-stack-options";

export default function FavoritesLayout() {
  return (
    <Stack screenOptions={tabStackScreenOptions}>
      <Stack.Screen name="index" options={{ title: "Favorites" }} />
    </Stack>
  );
}
