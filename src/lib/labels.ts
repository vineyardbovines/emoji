export type EmojiPickerLabels = {
  search: string;
  recents: string;
};

export const DEFAULT_LABELS: EmojiPickerLabels = {
  search: "Search",
  recents: "Recents",
};

export function resolveLabels(partial?: Partial<EmojiPickerLabels>): EmojiPickerLabels {
  if (!partial) return DEFAULT_LABELS;
  return { ...DEFAULT_LABELS, ...partial };
}
