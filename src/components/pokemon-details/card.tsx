import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** Rounded surface for one section of the details screen. */
export function Card({ title, children }: { title?: string; children: ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card }]}>
      {title && <Text style={[Typography.title, { color: palette.text }]}>{title}</Text>}
      {children}
    </View>
  );
}

/** Small value-over-label tile, laid out in a row of equal widths. */
export function Fact({ label, value }: { label: string; value: string }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.fact, { backgroundColor: palette.card }]}>
      <Text style={[styles.factValue, Typography.numeric, { color: palette.text }]}>{value}</Text>
      <Text style={[Typography.footnote, { color: palette.secondaryText }]}>{label}</Text>
    </View>
  );
}

export function FactsRow({ children }: { children: ReactNode }) {
  return <View style={styles.factsRow}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderCurve: "continuous", padding: Spacing.lg, gap: Spacing.md },
  factsRow: { flexDirection: "row", gap: Spacing.md },
  fact: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderCurve: "continuous",
  },
  factValue: { fontSize: 18, fontWeight: "700" },
});
