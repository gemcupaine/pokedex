import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Radius, Spacing, Typography, type Palette } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  formatDexNumber,
  formatName,
  getSpriteUrl,
  usePokemonList,
} from "@/lib/pokeapi";
import type { PokemonListItem } from "@/types/pokemon";

export default function PokedexScreen() {
  const { pokemon, total, hasMore, loading, error, loadMore } = usePokemonList();
  const { palette } = useTheme();
  const isEmpty = pokemon.length === 0;

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={[styles.content, isEmpty && styles.contentEmpty]}
      data={pokemon}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PokemonRow item={item} palette={palette} />}
      onEndReached={() => {
        // After an error, wait for the retry button instead of re-requesting on every scroll.
        if (!error && hasMore) loadMore();
      }}
      onEndReachedThreshold={0.5}
      // First load: full-screen spinner or error.
      ListEmptyComponent={
        error ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              Couldn&apos;t load the Pokedex
            </Text>
            <Text style={[styles.secondary, styles.centerText, { color: palette.secondaryText }]}>
              {error}
            </Text>
            <RetryButton onPress={loadMore} />
          </View>
        ) : loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.pokedexRed} />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.secondary, { color: palette.secondaryText }]}>
              No Pokemon found.
            </Text>
          </View>
        )
      }
      // Later pages: inline error, spinner, or end-of-list marker.
      ListFooterComponent={
        isEmpty ? undefined : error ? (
          <View style={styles.footer}>
            <Text style={[styles.secondary, styles.centerText, { color: palette.secondaryText }]}>
              {error}
            </Text>
            <RetryButton onPress={loadMore} />
          </View>
        ) : loading ? (
          <View style={styles.footer}>
            <ActivityIndicator color={Colors.pokedexRed} />
          </View>
        ) : !hasMore ? (
          <View style={styles.footer}>
            <Text style={[styles.secondary, { color: palette.secondaryText }]}>
              You&apos;ve seen all {(total ?? pokemon.length).toLocaleString()} Pokemon
            </Text>
          </View>
        ) : undefined
      }
    />
  );
}

function RetryButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
    >
      <Text style={styles.retryText}>Try again</Text>
    </Pressable>
  );
}

function PokemonRow({ item, palette }: { item: PokemonListItem; palette: Palette }) {
  return (
    <Link href={`/pokemon/${item.id}`} asChild>
      <Pressable style={({ pressed }) => pressed && styles.pressed}>
        {/* Layout lives on this View: Link's asChild doesn't reliably keep a function style. */}
        <View style={[styles.row, { backgroundColor: palette.card }]}>
          <Image
            source={getSpriteUrl(item.id)}
            style={styles.sprite}
            contentFit="contain"
            recyclingKey={String(item.id)}
            transition={150}
          />
          <View style={styles.rowText}>
            <Text style={[styles.name, { color: palette.text }]}>{formatName(item.name)}</Text>
            <Text style={[styles.secondary, { color: palette.secondaryText }]}>
              {formatDexNumber(item.id)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.sm },
  contentEmpty: { flexGrow: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyTitle: { ...Typography.title, textAlign: "center" },
  centerText: { textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderCurve: "continuous",
  },
  pressed: { opacity: 0.7 },
  sprite: { width: 64, height: 64 },
  rowText: { gap: 2 },
  name: Typography.headline,
  secondary: { fontSize: 15, ...Typography.numeric },
  footer: { paddingVertical: Spacing.xl, alignItems: "center", gap: Spacing.md },
  retry: {
    backgroundColor: Colors.pokedexRed,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
  },
  retryText: { ...Typography.headline, color: Colors.white },
});
