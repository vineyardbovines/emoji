import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { EmojiPickerStorage } from "@vineyardbovines/emoji";
import {
  EmojiPickerSheet,
  type EmojiPickerSheetHandle,
} from "@vineyardbovines/emoji/sheet";
import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function createMemoryStorage(): EmojiPickerStorage {
  const store = new Map<string, string>();
  return {
    get: async (key) => store.get(key) ?? null,
    set: async (key, value) => {
      store.set(key, value);
    },
  };
}

export default function App() {
  const storage = useMemo(createMemoryStorage, []);
  const [selected, setSelected] = useState<string | null>(null);
  const sheetRef = useRef<EmojiPickerSheetHandle>(null);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <BottomSheetModalProvider>
          <View style={styles.content}>
            <Text style={styles.selectedEmoji}>{selected ?? "🙂"}</Text>
            <Text style={styles.hint}>
              {selected ? "Nice pick" : "Tap the button to open the picker"}
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => sheetRef.current?.present()}
            >
              <Text style={styles.buttonText}>Open emoji picker</Text>
            </Pressable>
          </View>

          <EmojiPickerSheet
            ref={sheetRef}
            variant="glass"
            storage={storage}
            onEmojiSelected={(emoji) => {
              setSelected(emoji);
              sheetRef.current?.dismiss();
            }}
          />
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  selectedEmoji: { fontSize: 96 },
  hint: { fontSize: 16, color: "#666", textAlign: "center" },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#111",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
