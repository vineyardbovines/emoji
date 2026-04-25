#!/usr/bin/env bun
/**
 * Regenerate constants/emoji.ts from Unicode + CLDR + gemoji.
 *
 * Usage: bun scripts/generate-emoji.ts
 *
 * Sources:
 *   - https://unicode.org/Public/emoji/latest/emoji-test.txt   (emojis, names, categories)
 *   - https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotations/en.xml          (keywords)
 *   - https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotationsDerived/en.xml   (derived keywords)
 *   - https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json                       (slang/aliases)
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const UNICODE_EMOJI_TEST = "https://unicode.org/Public/emoji/latest/emoji-test.txt";
const CLDR_ANNOTATIONS =
  "https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotations/en.xml";
const CLDR_ANNOTATIONS_DERIVED =
  "https://raw.githubusercontent.com/unicode-org/cldr/main/common/annotationsDerived/en.xml";
const GEMOJI = "https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json";

const OUTPUT_PATH = join(import.meta.dir, "..", "src", "data", "generated.ts");

type Entry = { emoji: string; name: string; keywords?: string[] };
type Category = { name: string; emojis: Entry[] };

// Light → medium-light → medium → medium-dark → dark
const SKIN_TONE_CPS = [0x1f3fb, 0x1f3fc, 0x1f3fd, 0x1f3fe, 0x1f3ff];

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

function parseEmojiTest(raw: string): {
  version: string;
  date: string;
  categories: Category[];
  skinToneVariants: Record<string, string[]>;
} {
  const version = raw.match(/#\s*Version:\s*(\S+)/)?.[1] ?? "unknown";
  const date = raw.match(/#\s*Date:\s*([\d-]+)/)?.[1] ?? "unknown";

  const categories: Category[] = [];
  let current: Category | null = null;
  // baseEmoji -> [variant per skin tone slot]; only bases with all 5 slots are emitted.
  const skinToneMap = new Map<string, string[]>();

  for (const line of raw.split(/\r?\n/)) {
    const groupMatch = line.match(/^#\s*group:\s*(.+)$/);
    if (groupMatch) {
      const name = groupMatch[1].trim();
      if (name === "Component") {
        current = null;
        continue;
      }
      current = { name, emojis: [] };
      categories.push(current);
      continue;
    }
    if (!line || line.startsWith("#")) continue;

    // 1F600                     ; fully-qualified     # 😀 E1.0 grinning face
    // 1F44B 1F3FB               ; fully-qualified     # 👋🏻 E1.0 waving hand: light skin tone
    const match = line.match(/^([0-9A-F ]+);\s*(\S+)\s*#\s*(\S+)\s+E[\d.]+\s+(.+)$/);
    if (!match) continue;
    const [, cpsStr, status, emoji, name] = match;
    if (status !== "fully-qualified") continue;

    if (current) current.emojis.push({ emoji, name: name.trim() });

    // Skin tone: exactly one skin-tone codepoint in the sequence → it's a single-tone variant
    // of some base. Base = sequence with the skin-tone codepoint removed.
    const cps = cpsStr
      .trim()
      .split(/\s+/)
      .map((h) => Number.parseInt(h, 16));
    const toneCps = cps.filter((cp) => SKIN_TONE_CPS.includes(cp));
    if (toneCps.length !== 1) continue;
    const slot = SKIN_TONE_CPS.indexOf(toneCps[0]);
    const baseCps = cps.filter((cp) => !SKIN_TONE_CPS.includes(cp));
    const baseEmoji = String.fromCodePoint(...baseCps);
    let slots = skinToneMap.get(baseEmoji);
    if (!slots) {
      slots = new Array(5);
      skinToneMap.set(baseEmoji, slots);
    }
    slots[slot] ??= emoji;
  }

  const skinToneVariants: Record<string, string[]> = {};
  for (const [base, slots] of skinToneMap) {
    if (slots.every((v) => v !== undefined)) skinToneVariants[base] = slots;
  }

  return { version, date, categories, skinToneVariants };
}

function parseCldrAnnotations(raw: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  // <annotation cp="😀">face | grin | grinning face</annotation>
  // <annotation cp="😀" type="tts">grinning face</annotation>  <-- skip (name, not keywords)
  const regex = /<annotation\s+cp="([^"]+)"(?:\s+type="([^"]+)")?\s*>([^<]+)<\/annotation>/g;
  for (const m of raw.matchAll(regex)) {
    const [, cp, type, value] = m;
    if (type === "tts") continue;
    const keywords = value
      .split("|")
      .map((k) => k.trim())
      .filter(Boolean);
    const existing = result.get(cp) ?? [];
    result.set(cp, [...existing, ...keywords]);
  }
  return result;
}

async function fetchGemoji(): Promise<Map<string, string[]>> {
  const raw = await fetchText(GEMOJI);
  const data: Array<{ emoji: string; aliases?: string[]; tags?: string[] }> = JSON.parse(raw);
  const result = new Map<string, string[]>();
  for (const entry of data) {
    const keywords = [...(entry.aliases ?? []), ...(entry.tags ?? [])];
    if (keywords.length) result.set(entry.emoji, keywords);
  }
  return result;
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function serialize(
  categories: Category[],
  skinToneVariants: Record<string, string[]>,
  version: string,
  date: string
): string {
  const header = `// Auto-generated from Unicode Emoji ${version} (emoji-test.txt, ${date})
// Keywords from CLDR annotations + GitHub gemoji
// Source: https://unicode.org/Public/emoji/latest/emoji-test.txt
// Regenerate via: bun scripts/generate-emoji.ts

export type EmojiEntry = { emoji: string; name: string; keywords?: string[] };

export type EmojiCategory = {
  name: string;
  emojis: EmojiEntry[];
};

export const EMOJI_DATA: EmojiCategory[] = `;
  // Biome will fix up quoting/trailing commas on the next format pass.
  return `${header}${JSON.stringify(categories, null, 2)};

export const SKIN_TONE_VARIANTS: Record<string, string[]> = ${JSON.stringify(skinToneVariants, null, 2)};
`;
}

async function main() {
  console.log("Fetching Unicode emoji-test.txt…");
  const emojiTest = await fetchText(UNICODE_EMOJI_TEST);

  console.log("Fetching CLDR annotations…");
  const [cldrMain, cldrDerived, gemoji] = await Promise.all([
    fetchText(CLDR_ANNOTATIONS),
    fetchText(CLDR_ANNOTATIONS_DERIVED),
    fetchGemoji(),
  ]);

  const { version, date, categories, skinToneVariants } = parseEmojiTest(emojiTest);

  const cldr = parseCldrAnnotations(cldrMain);
  for (const [cp, kws] of parseCldrAnnotations(cldrDerived)) {
    cldr.set(cp, [...(cldr.get(cp) ?? []), ...kws]);
  }

  let totalEmojis = 0;
  let withKeywords = 0;
  for (const cat of categories) {
    for (const e of cat.emojis) {
      totalEmojis++;
      const keywords = dedupe([...(cldr.get(e.emoji) ?? []), ...(gemoji.get(e.emoji) ?? [])]);
      if (keywords.length) {
        e.keywords = keywords;
        withKeywords++;
      }
    }
  }

  writeFileSync(OUTPUT_PATH, serialize(categories, skinToneVariants, version, date), "utf8");
  console.log(
    `Wrote ${OUTPUT_PATH}\n  Unicode ${version} (${date}) — ${categories.length} categories, ${totalEmojis} emojis (${withKeywords} with keywords), ${Object.keys(skinToneVariants).length} skin-tone bases.\n  Run "bun run format" to normalize formatting.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
