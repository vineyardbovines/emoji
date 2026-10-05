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

export type Column = { kind: "emoji"; cells: EmojiEntry[]; categoryName: CategoryName };

export type ChunkedData = {
  columns: Column[];
  sectionOffsets: Partial<Record<CategoryName, number>>;
  visibleCategories: CategoryName[];
};

export const ROWS = 4;
