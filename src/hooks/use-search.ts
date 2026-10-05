import Fuse from "fuse.js";
import { useDeferredValue, useState } from "react";
import { EMOJI_DATA, type EmojiEntry } from "../data";
import { hasSkinToneCodepoint } from "../lib/skin-tones";

const EMOJI_FLAT: EmojiEntry[] = EMOJI_DATA.flatMap((c) => c.emojis).filter(
  (e) => !hasSkinToneCodepoint(e.emoji)
);

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

  const q = deferred.trim();
  let results: EmojiEntry[] | null;
  if (q.length === 0) {
    results = null;
  } else if (q.length < 2) {
    results = [];
  } else {
    results = FUSE.search(q, { limit: RESULT_LIMIT }).map((r) => r.item);
  }

  return { query, setQuery, results };
}
