export type HapticStyle = "light" | "medium" | "heavy" | "none";

type HapticsModule = {
  impactAsync: (style: unknown) => Promise<void>;
  ImpactFeedbackStyle: { Light: unknown; Medium: unknown; Heavy: unknown };
};

let cached: HapticsModule | null | undefined;

function load(): HapticsModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require("expo-haptics") as HapticsModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function impact(style: HapticStyle): void {
  if (style === "none") return;
  const m = load();
  if (!m) return;
  const mapped =
    style === "light"
      ? m.ImpactFeedbackStyle.Light
      : style === "heavy"
        ? m.ImpactFeedbackStyle.Heavy
        : m.ImpactFeedbackStyle.Medium;
  void m.impactAsync(mapped);
}
