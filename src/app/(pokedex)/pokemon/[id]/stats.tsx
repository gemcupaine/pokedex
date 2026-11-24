import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Card } from "@/components/pokemon-details/card";
import { StatRanges } from "@/components/pokemon-stats/stat-ranges";
import { Training } from "@/components/pokemon-stats/training";
import { TypeMatchups } from "@/components/pokemon-stats/type-matchups";
import { getTypeColor } from "@/constants/pokemon-types";
import { Colors, Radius, Spacing, Typography, withAlpha } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatDexNumber, formatName, getSpriteUrl, usePokemonInsights } from "@/lib/pokeapi";
import { getArchetype, getTotalTier } from "@/lib/pokemon-insights";

/** Form sheet with deeper stats: battle role, level 100 ranges, matchups and training data. */
export default function PokemonStatsSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, retry } = usePokemonInsights(id);
  const { palette } = useTheme();

  if (state.status !== "success") {
    return (
      <View style={styles.centered}>
        {state.status === "loading" ? (
          <ActivityIndicator size="large" color={Colors.pokedexRed} />
        ) : (
          <>
            <Text style={[Typography.body, styles.centerText, { color: palette.secondaryText }]}>
              {state.message}
            </Text>
            <Pressable
              onPress={retry}
              accessibilityRole="button"
              style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
            >
              <Text style={[Typography.headline, { color: Colors.white }]}>Try again</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const { pokemon, species, weaknesses, resistances, immunities } = state.data;
  const accent = getTypeColor(pokemon.types[0]?.type.name, Colors.pokedexRed);
  const total = pokemon.stats.reduce((sum, { base_stat }) => sum + base_stat, 0);
  const archetype = getArchetype(pokemon.stats);

  const sections = [
    <View key="summary" style={styles.summary}>
      <View style={[styles.summaryTile, { backgroundColor: withAlpha(accent, 0.16) }]}>
        <Text style={[styles.totalValue, Typography.numeric, { color: palette.text }]}>{total}</Text>
        <Text style={[Typography.footnote, { color: palette.secondaryText }]}>
          Base total · {getTotalTier(total)}
        </Text>
      </View>
      <View style={[styles.summaryTile, { backgroundColor: palette.card }]}>
        <Text style={[Typography.headline, { color: accent }]}>{archetype.label}</Text>
        <Text style={[Typography.footnote, { color: palette.secondaryText }]}>
          {archetype.detail}
        </Text>
      </View>
    </View>,
    <Card key="ranges" title="Level 100 Stats">
      <StatRanges stats={pokemon.stats} />
    </Card>,
    <Card key="matchups" title="Type Matchups">
      <TypeMatchups weaknesses={weaknesses} resistances={resistances} immunities={immunities} />
    </Card>,
    species && (
      <Card key="training" title="Training & Breeding">
        <Training species={species} />
      </Card>
    ),
  ].filter(Boolean);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.spriteWrap, { backgroundColor: withAlpha(accent, 0.18) }]}>
          <Image source={getSpriteUrl(pokemon.id)} style={styles.sprite} contentFit="contain" />
        </View>
        <View style={styles.headerText}>
          <Text style={[Typography.caption, Typography.numeric, { color: palette.secondaryText }]}>
            {formatDexNumber(pokemon.id)}
          </Text>
          <Text style={[Typography.title, { color: palette.text }]} numberOfLines={1}>
            {formatName(pokemon.name)} Stats
          </Text>
        </View>
      </View>

      {sections.map((section, index) => (
        <Animated.View key={index} entering={FadeInDown.delay(index * 70).duration(350)}>
          {section}
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxl },
  centered: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  centerText: { textAlign: "center" },
  retry: {
    backgroundColor: Colors.pokedexRed,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
  },
  pressed: { opacity: 0.7 },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.xs },
  headerText: { flex: 1, gap: 2 },
  spriteWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  sprite: { width: 52, height: 52 },
  summary: { flexDirection: "row", gap: Spacing.md },
  summaryTile: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderRadius: Radius.lg,
    borderCurve: "continuous",
  },
  totalValue: { fontSize: 34, fontWeight: "800", letterSpacing: -0.5 },
});
