import { useColorScheme } from "react-native";

export type EmojiPickerColors = {
  textPrimary: string;
  textSecondary: string;
  border: string;
  placeholder: string;
  surfaceTop: string;
  handle: string;
};

const LIGHT: EmojiPickerColors = {
  textPrimary: "#111",
  textSecondary: "#6B7280",
  border: "rgba(0,0,0,0.1)",
  placeholder: "rgba(0,0,0,0.45)",
  surfaceTop: "rgba(255,255,255,0.95)",
  handle: "#C7C7CC",
};

const DARK: EmojiPickerColors = {
  textPrimary: "#F4F4F5",
  textSecondary: "#A1A1AA",
  border: "rgba(255,255,255,0.12)",
  placeholder: "rgba(255,255,255,0.45)",
  surfaceTop: "rgba(44,44,46,0.95)",
  handle: "#48484A",
};

export function useEmojiPickerColors(): EmojiPickerColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? DARK : LIGHT;
}
