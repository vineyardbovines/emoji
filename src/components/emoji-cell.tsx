import { useCallback } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { type EmojiEntry, SKIN_TONE_VARIANTS } from "../data";
import { mediumImpact } from "../lib/haptics";

type Position = { x: number; y: number; width: number };

type Props = {
  entry: EmojiEntry;
  cellSize: number;
  onSelect: (emoji: string) => void;
  onLongPress: (emoji: string, position: Position) => void;
};

export function EmojiCell({ entry, cellSize, onSelect, onLongPress }: Props) {
  const hasTones = entry.emoji in SKIN_TONE_VARIANTS;

  const handlePress = useCallback(() => {
    onSelect(entry.emoji);
  }, [entry.emoji, onSelect]);

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .enabled(hasTones)
    .onStart((e) => {
      mediumImpact();
      onLongPress(entry.emoji, {
        x: e.absoluteX - e.x,
        y: e.absoluteY - e.y,
        width: cellSize,
      });
    });

  return (
    <GestureDetector gesture={longPress}>
      <Pressable
        onPress={handlePress}
        hitSlop={2}
        style={[styles.cell, { width: cellSize, height: cellSize }]}
      >
        <Text style={{ fontSize: cellSize * 0.66 }}>{entry.emoji}</Text>
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
});
