import Fuse from "fuse.js";
import { useDeferredValue, useMemo, useState } from "react";
import { EMOJI_DATA, type EmojiEntry } from "../data";

const EMOJI_FLAT: EmojiEntry[] = EMOJI_DATA.flatMap((c) => c.emojis);

const FUSE = new Fuse(EMOJI_FLAT, {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "keywords", weight: 0.3 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
  shouldSort: true,
});

const RESULT_LIMIT = 50;

export function useSearch() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results = useMemo<EmojiEntry[] | null>(() => {
    const q = deferred.trim();
    if (q.length === 0) return null;
    if (q.length < 2) return [];
    return FUSE.search(q, { limit: RESULT_LIMIT }).map((r) => r.item);
  }, [deferred]);

  return { query, setQuery, results };
}
