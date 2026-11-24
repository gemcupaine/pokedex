import Animated, { css } from "react-native-reanimated";
import { StyleSheet, View, type DimensionValue } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** Placeholder in the shape of the details screen while it loads. */
export function DetailsSkeleton() {
  const { palette } = useTheme();
  const block = (height: number, width: DimensionValue = "100%", radius: number = Radius.lg) => (
    <View style={{ height, width, borderRadius: radius, backgroundColor: palette.skeleton }} />
  );

  return (
    <Animated.View
      style={animated.container}
      accessible
      accessibilityLabel="Loading Pokemon"
      accessibilityRole="progressbar"
    >
      <View style={[styles.hero, { backgroundColor: palette.card }]}>
        {block(32, "60%", Radius.sm)}
        {block(16, "35%", Radius.sm)}
        <View style={styles.row}>
          {block(28, 72, Radius.pill)}
          {block(28, 72, Radius.pill)}
        </View>
        <View style={styles.artwork}>{block(200, 200, 100)}</View>
      </View>
      {block(96)}
      <View style={styles.row}>
        <View style={styles.flex}>{block(64)}</View>
        <View style={styles.flex}>{block(64)}</View>
        <View style={styles.flex}>{block(64)}</View>
      </View>
      {block(220)}
    </Animated.View>
  );
}

const animated = css.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.md,
    animationName: { from: { opacity: 1 }, to: { opacity: 0.45 } },
    animationDuration: "900ms",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationTimingFunction: "ease-in-out",
  },
});

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, borderCurve: "continuous", padding: Spacing.xl, gap: Spacing.md },
  row: { flexDirection: "row", gap: Spacing.md },
  flex: { flex: 1 },
  artwork: { alignItems: "center", paddingTop: Spacing.sm },
});
