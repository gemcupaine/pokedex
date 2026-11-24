import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { TypeChip } from "@/components/type-chip";
import { Radius, Spacing, Typography, withAlpha } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatDexNumber, formatName, getArtworkUrl } from "@/lib/pokeapi";
import type { PokemonDetails, PokemonSpeciesInfo } from "@/types/pokemon";

type Props = {
  pokemon: PokemonDetails;
  species: PokemonSpeciesInfo | null;
  accent: string;
};

/** Gradient header card: name, category, types and artwork. */
export function Hero({ pokemon, species, accent }: Props) {
  const { palette } = useTheme();
  const artwork = getArtworkUrl(pokemon);
  const name = formatName(pokemon.name);
  const badge = species?.isMythical ? "Mythical" : species?.isLegendary ? "Legendary" : null;

  return (
    <View
      style={[
        styles.hero,
        {
          experimental_backgroundImage: `linear-gradient(160deg, ${withAlpha(accent, 0.4)} 0%, ${withAlpha(accent, 0.08)} 100%)`,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.title}>
          <Text
            style={[Typography.display, { color: palette.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {name}
          </Text>
          {species?.genus && (
            <Text style={[Typography.callout, { color: palette.secondaryText }]}>
              {species.genus}
            </Text>
          )}
        </View>
        <Text style={[styles.dexNumber, Typography.numeric, { color: palette.secondaryText }]}>
          {formatDexNumber(pokemon.id)}
        </Text>
      </View>

      <View style={styles.chips}>
        {pokemon.types.map(({ type }) => (
          <TypeChip key={type.name} type={type.name} />
        ))}
        {badge && (
          <View style={[styles.chip, styles.badge, { borderColor: accent }]}>
            <Text style={[styles.chipText, { color: palette.text }]}>★ {badge}</Text>
          </View>
        )}
      </View>

      {artwork && (
        <Image
          source={artwork}
          style={styles.artwork}
          contentFit="contain"
          transition={250}
          accessibilityLabel={name}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: Radius.xl,
    borderCurve: "continuous",
    padding: Spacing.xl,
    gap: Spacing.md,
    overflow: "hidden",
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  title: { flex: 1, gap: 2 },
  dexNumber: { fontSize: 17, fontWeight: "700", paddingTop: Spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.pill },
  chipText: { fontSize: 14, fontWeight: "700" },
  badge: { borderWidth: 1.5, backgroundColor: "transparent" },
  artwork: { width: 240, height: 240, alignSelf: "center" },
});
