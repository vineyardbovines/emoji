import { useMemo } from "react";
import { chunkColumns } from "../lib/chunk-columns";
import type { ChunkedData } from "../lib/types";

export function useEmojiData(
  recents: string[],
  skinToneMemory: Record<string, string>
): ChunkedData {
  return useMemo(() => chunkColumns(recents, skinToneMemory), [recents, skinToneMemory]);
}
