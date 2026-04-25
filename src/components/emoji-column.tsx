import { View } from "react-native";
import type { EmojiEntry } from "../data";
import { ROWS } from "../lib/types";
import { EmojiCell } from "./emoji-cell";

type Position = { x: number; y: number; width: number };

type Props = {
  cells: EmojiEntry[];
  cellSize: number;
  onSelect: (emoji: string) => void;
  onLongPress: (emoji: string, position: Position) => void;
};

export function EmojiColumn({ cells, cellSize, onSelect, onLongPress }: Props) {
  return (
    <View style={{ width: cellSize, height: cellSize * ROWS }}>
      {cells.map((entry) => (
        <EmojiCell
          key={entry.emoji}
          entry={entry}
          cellSize={cellSize}
          onSelect={onSelect}
          onLongPress={onLongPress}
        />
      ))}
    </View>
  );
}
