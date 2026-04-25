import type { ComponentType, ReactNode } from "react";
import { Platform, Text } from "react-native";
import type { SearchBarIconProps } from "../components/search-bar";
import type { TabIconProps } from "../components/tab-bar";
import type { CategoryName } from "./types";

type SymbolsModule = {
  SymbolView: ComponentType<{
    name: string;
    size?: number;
    tintColor?: string;
    resizeMode?: "scaleAspectFit" | "scaleAspectFill" | "center";
  }>;
};

type VectorIconsModule = {
  Ionicons: ComponentType<{
    name: string;
    size?: number;
    color?: string;
  }>;
};

let symbols: SymbolsModule | null = null;
try {
  symbols = require("expo-symbols") as SymbolsModule;
} catch {
  symbols = null;
}

let vectorIcons: VectorIconsModule | null = null;
try {
  vectorIcons = require("@expo/vector-icons") as VectorIconsModule;
} catch {
  vectorIcons = null;
}

const CATEGORY_SYMBOLS: Record<CategoryName, string> = {
  Recents: "clock",
  "Smileys & People": "face.smiling",
  "Animals & Nature": "pawprint",
  "Food & Drink": "fork.knife",
  Activities: "soccerball",
  "Travel & Places": "car",
  Objects: "lightbulb",
  Symbols: "heart",
  Flags: "flag",
};

const CATEGORY_IONICONS: Record<CategoryName, string> = {
  Recents: "time-outline",
  "Smileys & People": "happy-outline",
  "Animals & Nature": "paw-outline",
  "Food & Drink": "fast-food-outline",
  Activities: "football-outline",
  "Travel & Places": "car-outline",
  Objects: "bulb-outline",
  Symbols: "heart-outline",
  Flags: "flag-outline",
};

const CATEGORY_EMOJI_FALLBACK: Record<CategoryName, string> = {
  Recents: "🕒",
  "Smileys & People": "🙂",
  "Animals & Nature": "🐾",
  "Food & Drink": "🍎",
  Activities: "⚽",
  "Travel & Places": "🚗",
  Objects: "💡",
  Symbols: "❤️",
  Flags: "🏳️",
};

const SEARCH_SYMBOLS = {
  search: "magnifyingglass",
  clear: "xmark.circle.fill",
} as const;

const SEARCH_IONICONS = {
  search: "search",
  clear: "close-circle",
} as const;

export function DefaultTabIcon({ category, size, color }: TabIconProps): ReactNode {
  if (Platform.OS === "ios" && symbols) {
    const { SymbolView } = symbols;
    return (
      <SymbolView
        name={CATEGORY_SYMBOLS[category]}
        size={size}
        tintColor={color}
        resizeMode="scaleAspectFit"
      />
    );
  }
  if (vectorIcons) {
    const { Ionicons } = vectorIcons;
    return <Ionicons name={CATEGORY_IONICONS[category]} size={size} color={color} />;
  }
  return <Text style={{ fontSize: size, color }}>{CATEGORY_EMOJI_FALLBACK[category]}</Text>;
}

export function DefaultSearchIcon({ name, size, color }: SearchBarIconProps): ReactNode {
  if (Platform.OS === "ios" && symbols) {
    const { SymbolView } = symbols;
    return (
      <SymbolView
        name={SEARCH_SYMBOLS[name]}
        size={size}
        tintColor={color}
        resizeMode="scaleAspectFit"
      />
    );
  }
  if (vectorIcons) {
    const { Ionicons } = vectorIcons;
    return <Ionicons name={SEARCH_IONICONS[name]} size={size} color={color} />;
  }
  return (
    <Text style={{ fontSize: size, color }}>{name === "search" ? "🔍" : "✕"}</Text>
  );
}
