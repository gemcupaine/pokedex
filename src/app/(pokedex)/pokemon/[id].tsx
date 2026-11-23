import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { StatLabels, TypeColors } from "@/constants/pokemon-types";
import {
  formatDexNumber,
  formatName,
  getArtworkUrl,
  getPokemon,
  type PokemonDetails,
} from "@/lib/pokeapi";

const MAX_STAT = 255;

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; pokemon: PokemonDetails };

type Result = { id: string } & Exclude<State, { status: "loading" }>;

export default function PokemonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [result, setResult] = useState<Result | null>(null);
  const dark = useColorScheme() === "dark";
  const palette = dark ? darkPalette : lightPalette;

  useEffect(() => {
    const controller = new AbortController();
    getPokemon(id, controller.signal)
      .then((pokemon) => setResult({ id, status: "success", pokemon }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setResult({ id, status: "error", message: error.message });
      });
    return () => controller.abort();
  }, [id]);

  // A result for a previous id counts as still loading.
  const state: State = result?.id === id ? result : { status: "loading" };

  if (state.status !== "success") {
    return (
      <View style={[styles.centered, { backgroundColor: palette.background }]}>
        <Stack.Screen options={{ title: "" }} />
        {state.status === "loading" ? (
          <ActivityIndicator color={Colors.pokedexRed} />
        ) : (
          <Text style={[styles.body, { color: palette.secondaryText }]}>{state.message}</Text>
        )}
      </View>
    );
  }

  const { pokemon } = state;
  const artwork = getArtworkUrl(pokemon);
  const primaryType = pokemon.types[0]?.type.name;
  const accent = (primaryType && TypeColors[primaryType]) || Colors.pokedexRed;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: formatName(pokemon.name) }} />

      <View style={[styles.hero, { backgroundColor: accent + "33" }]}>
        {artwork && (
          <Image
            source={artwork}
            style={styles.artwork}
            contentFit="contain"
            transition={200}
            accessibilityLabel={formatName(pokemon.name)}
          />
        )}
        <Text style={[styles.dexNumber, { color: palette.secondaryText }]}>
          {formatDexNumber(pokemon.id)}
        </Text>
        <View style={styles.row}>
          {pokemon.types.map(({ type }) => (
            <View
              key={type.name}
              style={[styles.typeChip, { backgroundColor: TypeColors[type.name] ?? Colors.inactive }]}
            >
              <Text style={styles.typeChipText}>{formatName(type.name)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Section title="About" palette={palette}>
        <InfoRow label="Height" value={`${(pokemon.height / 10).toFixed(1)} m`} palette={palette} />
        <InfoRow label="Weight" value={`${(pokemon.weight / 10).toFixed(1)} kg`} palette={palette} />
        <InfoRow
          label="Abilities"
          value={pokemon.abilities
            .map((a) => formatName(a.ability.name) + (a.is_hidden ? " (hidden)" : ""))
            .join(", ")}
          palette={palette}
        />
      </Section>

      <Section title="Base Stats" palette={palette}>
        {pokemon.stats.map(({ stat, base_stat }) => (
          <View key={stat.name} style={styles.statRow}>
            <Text style={[styles.statLabel, { color: palette.secondaryText }]}>
              {StatLabels[stat.name] ?? formatName(stat.name)}
            </Text>
            <Text style={[styles.statValue, { color: palette.text }]}>{base_stat}</Text>
            <View style={[styles.statTrack, { backgroundColor: palette.track }]}>
              <View
                style={[
                  styles.statFill,
                  { width: `${(base_stat / MAX_STAT) * 100}%`, backgroundColor: accent },
                ]}
              />
            </View>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

type Palette = typeof lightPalette;

function Section({
  title,
  palette,
  children,
}: {
  title: string;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: palette.card }]}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, palette }: { label: string; value: string; palette: Palette }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.body, { color: palette.secondaryText }]}>{label}</Text>
      <Text style={[styles.body, styles.infoValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const lightPalette = {
  background: "#F2F2F7",
  card: "#FFFFFF",
  text: "#000000",
  secondaryText: "#6C6C70",
  track: "#E5E5EA",
};

const darkPalette: Palette = {
  background: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  secondaryText: "#AEAEB2",
  track: "#3A3A3C",
};

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  content: { padding: 16, gap: 16 },
  hero: { alignItems: "center", borderRadius: 24, borderCurve: "continuous", padding: 16, gap: 8 },
  artwork: { width: 220, height: 220 },
  dexNumber: { fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  typeChipText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  section: { borderRadius: 16, borderCurve: "continuous", padding: 16, gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  infoValue: { flexShrink: 1, textAlign: "right" },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statLabel: { width: 64, fontSize: 14 },
  statValue: { width: 32, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  statTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  statFill: { height: "100%", borderRadius: 4 },
});
