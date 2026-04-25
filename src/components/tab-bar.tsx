import type { ComponentType, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EmojiPickerColors } from "../lib/colors";
import { DefaultTabIcon } from "../lib/default-icons";
import { CATEGORY_ORDER, type CategoryName } from "../lib/types";

export type TabIconProps = { category: CategoryName; active: boolean; size: number; color: string };

type Props = {
  active: CategoryName;
  onSelect: (cat: CategoryName) => void;
  colors: EmojiPickerColors;
  IconComponent?: ComponentType<TabIconProps>;
  renderIcon?: (category: CategoryName, active: boolean) => ReactNode;
};

export function TabBar({ active, onSelect, colors, IconComponent, renderIcon }: Props) {
  const insets = useSafeAreaInsets();
  const Icon = IconComponent ?? DefaultTabIcon;

  return (
    <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
      {CATEGORY_ORDER.map((cat) => {
        const isActive = cat === active;
        return (
          <Pressable
            key={cat}
            accessibilityLabel={cat}
            onPress={() => onSelect(cat)}
            style={[styles.tab, isActive && { backgroundColor: colors.border }]}
          >
            {renderIcon ? (
              renderIcon(cat, isActive)
            ) : (
              <Icon category={cat} active={isActive} size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  tab: {
    padding: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
