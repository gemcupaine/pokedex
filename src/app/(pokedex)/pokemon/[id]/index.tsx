import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Abilities } from "@/components/pokemon-details/abilities";
import { Card, Fact, FactsRow } from "@/components/pokemon-details/card";
import { Evolutions } from "@/components/pokemon-details/evolutions";
import { Hero } from "@/components/pokemon-details/hero";
import { DetailsSkeleton } from "@/components/pokemon-details/skeleton";
import { Stats } from "@/components/pokemon-details/stats";
import { getTypeColor } from "@/constants/pokemon-types";
import { Colors, Radius, Spacing, Typography, withAlpha } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatName, usePokemonDetails } from "@/lib/pokeapi";

export default function PokemonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, retry } = usePokemonDetails(id);
  const { palette } = useTheme();

  if (state.status === "loading") {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: palette.background }}
        scrollEnabled={false}
      >
        <Stack.Screen options={{ title: "" }} />
        <DetailsSkeleton />
      </ScrollView>
    );
  }

  if (state.status === "error") {
    return (
      <View style={[styles.centered, { backgroundColor: palette.background }]}>
        <Stack.Screen options={{ title: "" }} />
        <Text style={[Typography.title, styles.centerText, { color: palette.text }]}>
          Couldn&apos;t load this Pokemon
        </Text>
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
      </View>
    );
  }

  const { pokemon, species } = state.data;
  const accent = getTypeColor(pokemon.types[0]?.type.name, Colors.pokedexRed);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: formatName(pokemon.name) }} />

      <Hero pokemon={pokemon} species={species} accent={accent} />

      {species?.description && (
        <Card>
          <Text style={[Typography.body, { color: palette.text }]} selectable>
            {species.description}
          </Text>
        </Card>
      )}

      <FactsRow>
        <Fact label="Height" value={`${(pokemon.height / 10).toFixed(1)} m`} />
        <Fact label="Weight" value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
        <Fact label="Base XP" value={pokemon.base_experience?.toString() ?? "—"} />
      </FactsRow>

      <Card title="Abilities">
        <Abilities abilities={pokemon.abilities} accent={accent} />
      </Card>

      <Card title="Base Stats">
        <Stats stats={pokemon.stats} />
        <Link href={`/pokemon/${pokemon.id}/stats`} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Opens level 100 stats, type matchups and breeding info"
            style={({ pressed }) => [
              styles.moreStats,
              { backgroundColor: withAlpha(accent, 0.14) },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[Typography.headline, styles.flex, { color: palette.text }]}>
              More stats & matchups
            </Text>
            <Text style={[Typography.headline, { color: accent }]}>›</Text>
          </Pressable>
        </Link>
      </Card>

      {species && species.evolutions.length > 1 && (
        <Card title="Evolution">
          <Evolutions stages={species.evolutions} currentId={pokemon.id} accent={accent} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  centerText: { textAlign: "center" },
  retry: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.pokedexRed,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
  },
  pressed: { opacity: 0.7 },
  flex: { flex: 1 },
  moreStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
  },
});
