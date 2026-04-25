export type EmojiPickerStorage = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
};

export const STORAGE_KEYS = {
  recents: "@vineyardbovines/emoji:recents",
  skinTones: "@vineyardbovines/emoji:skin-tone-memory",
} as const;

export const RECENTS_LIMIT = 24;
