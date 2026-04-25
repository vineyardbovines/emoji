import { useCallback, useEffect, useRef, useState } from "react";
import { type EmojiPickerStorage, STORAGE_KEYS } from "../lib/storage";

function parse(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter(([k, v]) => typeof k === "string" && typeof v === "string")
      ) as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}

export function useSkinToneMemory(storage?: EmojiPickerStorage) {
  const [memory, setMemory] = useState<Record<string, string>>({});
  const storageRef = useRef(storage);
  storageRef.current = storage;

  useEffect(() => {
    if (!storage) return;
    let cancelled = false;
    storage.get(STORAGE_KEYS.skinTones).then((raw) => {
      if (!cancelled) setMemory(parse(raw));
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const remember = useCallback((base: string, variant: string) => {
    setMemory((prev) => {
      const next = { ...prev, [base]: variant };
      storageRef.current?.set(STORAGE_KEYS.skinTones, JSON.stringify(next));
      return next;
    });
  }, []);

  return { memory, remember };
}
