import Animated from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";

import { StatLabels } from "@/constants/pokemon-types";
import { Radius, Spacing, Typography, getStatTierColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatName } from "@/lib/pokeapi";
import type { PokemonDetails } from "@/types/pokemon";

/** Bars are scaled to this so the strongest stats nearly fill the track. */
const MAX_STAT = 200;

/** Base stats as bars that fill in on mount, colored by strength, plus the total. */
export function Stats({ stats }: { stats: PokemonDetails["stats"] }) {
  const { palette } = useTheme();
  const total = stats.reduce((sum, { base_stat }) => sum + base_stat, 0);

  return (
    <View style={styles.list}>
      {stats.map(({ stat, base_stat }, index) => {
        const label = StatLabels[stat.name] ?? formatName(stat.name);
        const width = `${Math.min(base_stat / MAX_STAT, 1) * 100}%` as const;
        return (
          <View
            key={stat.name}
            style={styles.row}
            accessible
            accessibilityLabel={`${label}: ${base_stat}`}
          >
            <Text style={[styles.label, { color: palette.secondaryText }]}>{label}</Text>
            <Text style={[styles.value, Typography.numeric, { color: palette.text }]}>
              {base_stat}
            </Text>
            <View style={[styles.track, { backgroundColor: palette.track }]}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    width,
                    backgroundColor: getStatTierColor(base_stat),
                    animationName: { from: { width: "0%" }, to: { width } },
                    animationDuration: "700ms",
                    animationDelay: `${index * 60}ms`,
                    animationTimingFunction: "ease-out",
                    animationFillMode: "backwards",
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
      <View style={[styles.row, styles.totalRow, { borderTopColor: palette.separator }]}>
        <Text style={[styles.label, { color: palette.secondaryText }]}>Total</Text>
        <Text style={[styles.total, Typography.numeric, { color: palette.text }]}>{total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  label: { width: 64, fontSize: 14, fontWeight: "500" },
  value: { width: 32, fontSize: 14, fontWeight: "700" },
  total: { fontSize: 14, fontWeight: "800" },
  track: { flex: 1, height: 8, borderRadius: Radius.pill, overflow: "hidden" },
  fill: { height: "100%", borderRadius: Radius.pill },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
});
