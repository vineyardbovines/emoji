export type EmojiPickerLabels = {
  search: string;
  recents: string;
  emptyRecentsTitle: string;
  emptyRecentsBody: string;
};

export const DEFAULT_LABELS: EmojiPickerLabels = {
  search: "Search",
  recents: "Recents",
  emptyRecentsTitle: "No recent emoji",
  emptyRecentsBody: "Emojis you use will appear here",
};

export function resolveLabels(partial?: Partial<EmojiPickerLabels>): EmojiPickerLabels {
  if (!partial) return DEFAULT_LABELS;
  return { ...DEFAULT_LABELS, ...partial };
}
