import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { type EmojiEntry, SKIN_TONE_VARIANTS } from "../data";
import { type HapticStyle, impact } from "../lib/haptics";

type Position = { x: number; y: number; width: number };

type EmojiCellProps = {
  entry: EmojiEntry;
  cellSize: number;
  longPressDurationMs: number;
  hapticStyle: HapticStyle;
  onSelect: (emoji: string) => void;
  onLongPress: (emoji: string, position: Position) => void;
};

export function EmojiCell({
  entry,
  cellSize,
  longPressDurationMs,
  hapticStyle,
  onSelect,
  onLongPress,
}: EmojiCellProps) {
  const hasTones = entry.emoji in SKIN_TONE_VARIANTS;

  const longPress = Gesture.LongPress()
    .minDuration(longPressDurationMs)
    .enabled(hasTones)
    .runOnJS(true)
    .onStart((e) => {
      impact(hapticStyle);
      onLongPress(entry.emoji, {
        x: e.absoluteX - e.x,
        y: e.absoluteY - e.y,
        width: cellSize,
      });
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => {
      onSelect(entry.emoji);
    });

  const gesture = Gesture.Exclusive(longPress, tap);

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.cell, { width: cellSize, height: cellSize }]}>
        <Text style={{ fontSize: cellSize * 0.66 }}>{entry.emoji}</Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
});
