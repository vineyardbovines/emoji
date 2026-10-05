import { EMOJI_DATA, type EmojiEntry } from "../data";
import { hasSkinToneCodepoint } from "./skin-tones";
import { CATEGORY_ORDER, type CategoryName, type ChunkedData, type Column, ROWS } from "./types";

const UNICODE_TO_CATEGORY: Record<string, CategoryName> = {
  "Smileys & Emotion": "Smileys & People",
  "People & Body": "Smileys & People",
  "Animals & Nature": "Animals & Nature",
  "Food & Drink": "Food & Drink",
  Activities: "Activities",
  "Travel & Places": "Travel & Places",
  Objects: "Objects",
  Symbols: "Symbols",
  Flags: "Flags",
};

function buildBaseMap(): Map<CategoryName, EmojiEntry[]> {
  const map = new Map<CategoryName, EmojiEntry[]>();
  for (const unicodeCat of EMOJI_DATA) {
    const mapped = UNICODE_TO_CATEGORY[unicodeCat.name];
    if (!mapped) continue;
    const bases = unicodeCat.emojis.filter((e) => !hasSkinToneCodepoint(e.emoji));
    const existing = map.get(mapped) ?? [];
    map.set(mapped, existing.concat(bases));
  }
  return map;
}

const BASE_MAP = buildBaseMap();

function applySkinToneMemory(entries: EmojiEntry[], memory: Record<string, string>): EmojiEntry[] {
  if (Object.keys(memory).length === 0) return entries;
  return entries.map((e) => {
    const remembered = memory[e.emoji];
    return remembered ? { ...e, emoji: remembered } : e;
  });
}

function toColumns(entries: EmojiEntry[], categoryName: CategoryName): Column[] {
  const cols: Column[] = [];
  for (let i = 0; i < entries.length; i += ROWS) {
    cols.push({
      kind: "emoji",
      cells: entries.slice(i, i + ROWS),
      categoryName,
    });
  }
  return cols;
}

export function chunkColumns(
  recents: string[],
  skinToneMemory: Record<string, string>
): ChunkedData {
  const columns: Column[] = [];
  const sectionOffsets: Partial<Record<CategoryName, number>> = {};
  const visibleCategories: CategoryName[] = [];

  for (const cat of CATEGORY_ORDER) {
    if (cat === "Recents" && recents.length === 0) continue;

    sectionOffsets[cat] = columns.length;
    visibleCategories.push(cat);

    if (cat === "Recents") {
      const entries: EmojiEntry[] = recents.map((emoji) => ({ emoji, name: emoji }));
      columns.push(...toColumns(entries, cat));
      continue;
    }

    const entries = applySkinToneMemory(BASE_MAP.get(cat) ?? [], skinToneMemory);
    columns.push(...toColumns(entries, cat));
  }

  return { columns, sectionOffsets, visibleCategories };
}
