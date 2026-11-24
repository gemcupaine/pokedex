import { StyleSheet, Text, View } from "react-native";

import { Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatName } from "@/lib/pokeapi";
import type { PokemonDetails } from "@/types/pokemon";

/** Ability chips; hidden abilities get a dashed outline and a tag. */
export function Abilities({
  abilities,
  accent,
}: {
  abilities: PokemonDetails["abilities"];
  accent: string;
}) {
  const { palette } = useTheme();
  return (
    <View style={styles.row}>
      {abilities.map(({ ability, is_hidden }) => (
        <View
          key={ability.name}
          style={[
            styles.chip,
            { backgroundColor: palette.background },
            is_hidden && [styles.hidden, { borderColor: accent }],
          ]}
        >
          <Text style={[styles.name, { color: palette.text }]}>{formatName(ability.name)}</Text>
          {is_hidden && (
            <Text style={[Typography.caption, { color: palette.secondaryText }]}>Hidden</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
  },
  hidden: { borderWidth: 1, borderStyle: "dashed" },
  name: { fontSize: 15, fontWeight: "600" },
});
