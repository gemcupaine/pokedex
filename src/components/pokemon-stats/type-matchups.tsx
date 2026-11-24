import { StyleSheet, Text, View } from "react-native";

import { TypeChip } from "@/components/type-chip";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatMultiplier } from "@/lib/pokemon-insights";
import type { TypeMatchupGroup } from "@/types/pokemon";

type Props = {
  weaknesses: TypeMatchupGroup[];
  resistances: TypeMatchupGroup[];
  immunities: string[];
};

/** Which attacking types hit this Pokemon hard, softly, or not at all. */
export function TypeMatchups({ weaknesses, resistances, immunities }: Props) {
  const { palette } = useTheme();
  const sections = [
    { title: "Weak to", groups: weaknesses },
    { title: "Resists", groups: resistances },
    { title: "Immune to", groups: immunities.length ? [{ multiplier: 0, types: immunities }] : [] },
  ].filter((section) => section.groups.length > 0);

  return (
    <View style={styles.sections}>
      {sections.map(({ title, groups }) => (
        <View key={title} style={styles.section}>
          <Text style={[Typography.footnote, { color: palette.secondaryText }]}>{title}</Text>
          {groups.map(({ multiplier, types }) => (
            <View key={multiplier} style={styles.group}>
              <View
                style={[
                  styles.multiplier,
                  { backgroundColor: palette.background },
                  multiplier === 4 && styles.multiplierStrong,
                ]}
              >
                <Text
                  style={[
                    styles.multiplierText,
                    { color: multiplier === 4 ? Colors.white : palette.text },
                  ]}
                >
                  {formatMultiplier(multiplier)}
                </Text>
              </View>
              <View style={styles.chips}>
                {types.map((type) => (
                  <TypeChip key={type} type={type} size="sm" />
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: Spacing.lg },
  section: { gap: Spacing.sm },
  group: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  multiplier: {
    minWidth: 40,
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
  },
  multiplierStrong: { backgroundColor: Colors.danger },
  multiplierText: { fontSize: 13, fontWeight: "800", ...Typography.numeric },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
