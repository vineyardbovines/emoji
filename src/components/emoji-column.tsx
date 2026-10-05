import { View } from "react-native";
import type { EmojiEntry } from "../data";
import type { HapticStyle } from "../lib/haptics";
import { ROWS } from "../lib/types";
import { EmojiCell } from "./emoji-cell";

type Position = { x: number; y: number; width: number };

type EmojiColumnProps = {
  cells: EmojiEntry[];
  cellSize: number;
  longPressDurationMs: number;
  hapticStyle: HapticStyle;
  onSelect: (emoji: string) => void;
  onLongPress: (emoji: string, position: Position) => void;
};

export function EmojiColumn({
  cells,
  cellSize,
  longPressDurationMs,
  hapticStyle,
  onSelect,
  onLongPress,
}: EmojiColumnProps) {
  return (
    <View style={{ width: cellSize, height: cellSize * ROWS }}>
      {cells.map((entry) => (
        <EmojiCell
          key={entry.emoji}
          entry={entry}
          cellSize={cellSize}
          longPressDurationMs={longPressDurationMs}
          hapticStyle={hapticStyle}
          onSelect={onSelect}
          onLongPress={onLongPress}
        />
      ))}
    </View>
  );
}
