import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { Colors } from "@/constants/theme";

export default function PokedexScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
    >
      {/* TODO: temporary button for testing navigation — replace with the Pokemon list */}
      <Link href="/pokemon/25" asChild>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Open Pikachu</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  button: {
    backgroundColor: Colors.pokedexRed,
    borderRadius: 14,
    borderCurve: "continuous",
    paddingVertical: 14,
    alignItems: "center",
  },
  pressed: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
});
