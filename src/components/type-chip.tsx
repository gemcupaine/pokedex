import { StyleSheet, Text, View } from "react-native";

import { getTypeColor } from "@/constants/pokemon-types";
import { Radius, readableTextOn } from "@/constants/theme";
import { formatName } from "@/lib/pokeapi";

/** Pill in the type's color with readable text. */
export function TypeChip({ type, size = "md" }: { type: string; size?: "sm" | "md" }) {
  const color = getTypeColor(type);
  return (
    <View style={[styles.chip, size === "sm" && styles.chipSm, { backgroundColor: color }]}>
      <Text style={[styles.text, size === "sm" && styles.textSm, { color: readableTextOn(color) }]}>
        {formatName(type)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.pill },
  chipSm: { paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 14, fontWeight: "700" },
  textSm: { fontSize: 12 },
});
