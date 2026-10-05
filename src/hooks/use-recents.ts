import { useEffect, useState } from "react";
import { type EmojiPickerStorage, RECENTS_LIMIT, STORAGE_KEYS } from "../lib/storage";

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useRecents(storage?: EmojiPickerStorage, limit: number = RECENTS_LIMIT) {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    if (!storage) return;
    let cancelled = false;
    storage.get(STORAGE_KEYS.recents).then((raw) => {
      if (!cancelled) setRecents(parse(raw).slice(0, limit));
    });
    return () => {
      cancelled = true;
    };
  }, [storage, limit]);

  const push = (emoji: string) => {
    setRecents((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, limit);
      storage?.set(STORAGE_KEYS.recents, JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setRecents([]);
    storage?.set(STORAGE_KEYS.recents, JSON.stringify([]));
  };

  return { recents, push, clear };
}
