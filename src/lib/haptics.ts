type HapticsModule = {
  impactAsync: (style: unknown) => Promise<void>;
  ImpactFeedbackStyle: { Medium: unknown };
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

export function mediumImpact(): void {
  const m = load();
  if (!m) return;
  void m.impactAsync(m.ImpactFeedbackStyle.Medium);
}
