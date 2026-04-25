import type { EmojiEntry } from "../data";

export type CategoryName =
  | "Recents"
  | "Smileys & People"
  | "Animals & Nature"
  | "Food & Drink"
  | "Activities"
  | "Travel & Places"
  | "Objects"
  | "Symbols"
  | "Flags";

export const CATEGORY_ORDER: CategoryName[] = [
  "Recents",
  "Smileys & People",
  "Animals & Nature",
  "Food & Drink",
  "Activities",
  "Travel & Places",
  "Objects",
  "Symbols",
  "Flags",
];

export type Column =
  | { kind: "empty-recents" }
  | { kind: "emoji"; cells: EmojiEntry[]; categoryName: CategoryName };

export type ChunkedData = {
  columns: Column[];
  sectionOffsets: Record<CategoryName, number>;
};

export const ROWS = 4;
