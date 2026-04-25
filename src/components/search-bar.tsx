import { type ComponentType, type ElementType, useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { EmojiPickerColors } from "../lib/colors";
import { DefaultSearchIcon } from "../lib/default-icons";
import type { SurfaceMode } from "./surface";
import { Surface } from "./surface";

export type SearchBarIconProps = { name: "search" | "clear"; size: number; color: string };

type Props = {
  value: string;
  placeholder: string;
  onChangeText: (v: string) => void;
  onFocusChange?: (focused: boolean) => void;
  InputComponent?: ElementType;
  IconComponent?: ComponentType<SearchBarIconProps>;
  surfaceMode: SurfaceMode;
  colors: EmojiPickerColors;
};

export function SearchBar({
  value,
  placeholder,
  onChangeText,
  onFocusChange,
  InputComponent,
  IconComponent,
  surfaceMode,
  colors,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const Input = (InputComponent ?? TextInput) as ElementType;
  const Icon = IconComponent ?? DefaultSearchIcon;

  return (
    <Surface mode={surfaceMode} style={styles.surface}>
      <View style={styles.row}>
        <View style={styles.leading}>
          <Icon name="search" size={18} color={colors.textSecondary} />
        </View>
        <Input
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { color: colors.textPrimary }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 ? (
          <Pressable
            style={styles.trailing}
            hitSlop={8}
            onPress={() => {
              onChangeText("");
              inputRef.current?.blur();
            }}
          >
            <Icon name="clear" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 999,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leading: {
    marginRight: 8,
  },
  trailing: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
