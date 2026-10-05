const SKIN_TONE_CODEPOINTS: ReadonlySet<number> = new Set([
  0x1f3fb, 0x1f3fc, 0x1f3fd, 0x1f3fe, 0x1f3ff,
]);

export function hasSkinToneCodepoint(emoji: string): boolean {
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined && SKIN_TONE_CODEPOINTS.has(cp)) return true;
  }
  return false;
}
