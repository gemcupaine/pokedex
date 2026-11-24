import { StyleSheet, Text, View } from "react-native";

import { StatLabels } from "@/constants/pokemon-types";
import { Radius, Spacing, Typography, getStatTierColor, withAlpha } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatName } from "@/lib/pokeapi";
import { MAX_LEVEL_100_STAT, getStatRange } from "@/lib/pokemon-insights";
import type { PokemonDetails } from "@/types/pokemon";

/**
 * Each stat's possible value at level 100, drawn as a segment on a shared
 * scale so a stat's ceiling and spread are visible at a glance.
 */
export function StatRanges({ stats }: { stats: PokemonDetails["stats"] }) {
  const { palette } = useTheme();
  const pct = (value: number) => `${(value / MAX_LEVEL_100_STAT) * 100}%` as const;

  return (
    <View style={styles.list}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, Typography.caption, { color: palette.secondaryText }]}>
          Stat
        </Text>
        <Text style={[styles.base, Typography.caption, { color: palette.secondaryText }]}>Base</Text>
        <Text style={[Typography.caption, styles.flex, { color: palette.secondaryText }]}>
          Level 100 range
        </Text>
      </View>
      {stats.map(({ stat, base_stat }) => {
        const { min, max } = getStatRange(stat.name, base_stat);
        const color = getStatTierColor(base_stat);
        const label = StatLabels[stat.name] ?? formatName(stat.name);
        return (
          <View
            key={stat.name}
            style={styles.row}
            accessible
            accessibilityLabel={`${label}: base ${base_stat}, ${min} to ${max} at level 100`}
          >
            <Text style={[styles.label, { color: palette.secondaryText }]}>{label}</Text>
            <Text style={[styles.base, Typography.numeric, { color: palette.text }]}>
              {base_stat}
            </Text>
            <View style={styles.flex}>
              <View style={[styles.track, { backgroundColor: palette.track }]}>
                <View
                  style={[
                    styles.segment,
                    {
                      left: pct(min),
                      width: pct(Math.max(max - min, 4)),
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${withAlpha(color, 0.6)}`,
                    },
                  ]}
                />
              </View>
              <Text style={[Typography.caption, Typography.numeric, { color: palette.secondaryText }]}>
                {min === max ? min : `${min} – ${max}`}
              </Text>
            </View>
          </View>
        );
      })}
      <Text style={[Typography.caption, { color: palette.secondaryText }]}>
        Min assumes 0 IVs, 0 EVs and a hindering nature. Max assumes 31 IVs, 252 EVs and a helpful
        nature.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  headerRow: { flexDirection: "row", gap: Spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  label: { width: 64, fontSize: 14, fontWeight: "500" },
  base: { width: 32, fontSize: 14, fontWeight: "700" },
  flex: { flex: 1, gap: Spacing.xs },
  track: { height: 10, borderRadius: Radius.pill },
  segment: { position: "absolute", top: 0, bottom: 0, borderRadius: Radius.pill },
});
