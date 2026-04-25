import { useColorScheme } from "react-native";

export type EmojiPickerColors = {
  textPrimary: string;
  textSecondary: string;
  border: string;
  placeholder: string;
};

const LIGHT: EmojiPickerColors = {
  textPrimary: "#111",
  textSecondary: "#6B7280",
  border: "rgba(0,0,0,0.1)",
  placeholder: "rgba(0,0,0,0.45)",
};

const DARK: EmojiPickerColors = {
  textPrimary: "#F4F4F5",
  textSecondary: "#A1A1AA",
  border: "rgba(255,255,255,0.12)",
  placeholder: "rgba(255,255,255,0.45)",
};

export function useEmojiPickerColors(): EmojiPickerColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? DARK : LIGHT;
}
