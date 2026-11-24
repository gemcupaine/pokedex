import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatName } from "@/lib/pokeapi";
import { getCatchChance, getFemaleRatio } from "@/lib/pokemon-insights";
import type { PokemonSpecies } from "@/types/pokemon";

/** Catch rate, friendship, growth and breeding facts from the species data. */
export function Training({ species }: { species: PokemonSpecies }) {
  const { palette } = useTheme();
  const catchChance = getCatchChance(species.capture_rate);
  const rows: [string, string][] = [
    ["Catch rate", `${species.capture_rate} · ≈${(catchChance * 100).toFixed(1)}% per ball`],
    ["Base friendship", species.base_happiness != null ? String(species.base_happiness) : "—"],
    ["Growth rate", formatName(species.growth_rate.name)],
    ["Egg groups", species.egg_groups.map((g) => formatName(g.name)).join(", ") || "—"],
    ["Egg cycles", species.hatch_counter != null ? String(species.hatch_counter) : "—"],
  ];

  return (
    <View style={styles.list}>
      <GenderRatio genderRate={species.gender_rate} />
      {rows.map(([label, value], index) => (
        <View
          key={label}
          style={[
            styles.row,
            index > 0 && { borderTopColor: palette.separator, borderTopWidth: StyleSheet.hairlineWidth },
          ]}
        >
          <Text style={[Typography.callout, { color: palette.secondaryText }]}>{label}</Text>
          <Text style={[Typography.callout, styles.value, { color: palette.text }]}>{value}</Text>
        </View>
      ))}
      <Text style={[Typography.caption, { color: palette.secondaryText }]}>
        Catch chance is for a Poke Ball at full HP with no status condition.
      </Text>
    </View>
  );
}

function GenderRatio({ genderRate }: { genderRate: number }) {
  const { palette } = useTheme();
  const female = getFemaleRatio(genderRate);

  if (female === null) {
    return (
      <View style={styles.gender}>
        <Text style={[Typography.callout, { color: palette.secondaryText }]}>Gender</Text>
        <Text style={[Typography.headline, { color: palette.text }]}>Genderless</Text>
      </View>
    );
  }

  const male = 1 - female;
  return (
    <View
      style={styles.gender}
      accessible
      accessibilityLabel={`${Math.round(male * 100)}% male, ${Math.round(female * 100)}% female`}
    >
      <View style={styles.genderLabels}>
        <Text style={[Typography.headline, { color: Colors.male }]}>
          ♂ {Math.round(male * 100)}%
        </Text>
        <Text style={[Typography.headline, { color: Colors.female }]}>
          {Math.round(female * 100)}% ♀
        </Text>
      </View>
      <View style={[styles.genderBar, { backgroundColor: palette.track }]}>
        {male > 0 && <View style={{ flex: male, backgroundColor: Colors.male }} />}
        {female > 0 && <View style={{ flex: female, backgroundColor: Colors.female }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  value: { flexShrink: 1, textAlign: "right", fontWeight: "600" },
  gender: { gap: Spacing.sm, paddingBottom: Spacing.md },
  genderLabels: { flexDirection: "row", justifyContent: "space-between" },
  genderBar: {
    flexDirection: "row",
    height: 10,
    gap: 2,
    borderRadius: Radius.pill,
    overflow: "hidden",
  },
});
