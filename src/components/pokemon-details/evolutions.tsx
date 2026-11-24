import { Image } from "expo-image";
import { Link } from "expo-router";
import { Fragment } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Spacing, withAlpha } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatName, getSpriteUrl } from "@/lib/pokeapi";
import type { PokemonListItem } from "@/types/pokemon";

type Props = {
  stages: PokemonListItem[][];
  currentId: number;
  accent: string;
};

/** Horizontal evolution line; branching stages (e.g. Eevee) stack vertically. */
export function Evolutions({ stages, currentId, accent }: Props) {
  const { palette } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {stages.map((stage, index) => (
        <Fragment key={stage.map((p) => p.id).join("-")}>
          {index > 0 && <Text style={[styles.arrow, { color: palette.secondaryText }]}>→</Text>}
          <View style={styles.stage}>
            {stage.map((item) => (
              <EvolutionItem
                key={item.id}
                item={item}
                current={item.id === currentId}
                accent={accent}
              />
            ))}
          </View>
        </Fragment>
      ))}
    </ScrollView>
  );
}

function EvolutionItem({
  item,
  current,
  accent,
}: {
  item: PokemonListItem;
  current: boolean;
  accent: string;
}) {
  const { palette } = useTheme();
  const name = formatName(item.name);
  const content = (
    <>
      <View
        style={[
          styles.spriteWrap,
          { backgroundColor: withAlpha(accent, 0.14) },
          current && { borderColor: accent, borderWidth: 2 },
        ]}
      >
        <Image source={getSpriteUrl(item.id)} style={styles.sprite} contentFit="contain" />
      </View>
      <Text
        style={[styles.name, { color: current ? palette.text : palette.secondaryText }]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </>
  );

  if (current) {
    return (
      <View style={styles.item} accessibilityState={{ selected: true }}>
        {content}
      </View>
    );
  }

  return (
    <Link href={`/pokemon/${item.id}`} push asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${name}`}
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", gap: Spacing.sm },
  arrow: { fontSize: 20, fontWeight: "600" },
  stage: { gap: Spacing.md },
  item: { alignItems: "center", gap: 6, width: 88 },
  pressed: { opacity: 0.7 },
  spriteWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  sprite: { width: 64, height: 64 },
  name: { fontSize: 13, fontWeight: "600" },
});
