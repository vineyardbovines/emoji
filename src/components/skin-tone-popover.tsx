import { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { SKIN_TONE_VARIANTS } from "../data";
import { Surface, type SurfaceMode } from "./surface";

const VARIANT_FONT_SIZE = 34;
const ITEM_SIZE = 44;
const PADDING = 6;
const ARROW_SIZE = 8;
const SCREEN_PADDING = 12;

type Props = {
  baseEmoji: string;
  anchor: { x: number; y: number; width: number };
  surfaceMode: SurfaceMode;
  onSelect: (variant: string) => void;
  onDismiss: () => void;
};

export function SkinTonePopover({ baseEmoji, anchor, surfaceMode, onSelect, onDismiss }: Props) {
  const { width: screenW } = useWindowDimensions();
  const variants = useMemo(
    () => [baseEmoji, ...(SKIN_TONE_VARIANTS[baseEmoji] ?? [])],
    [baseEmoji]
  );

  const popWidth = variants.length * ITEM_SIZE + PADDING * 2;
  const popHeight = ITEM_SIZE + PADDING * 2;

  const anchorCenterX = anchor.x + anchor.width / 2;
  let left = anchorCenterX - popWidth / 2;
  left = Math.max(SCREEN_PADDING, Math.min(left, screenW - popWidth - SCREEN_PADDING));
  const top = anchor.y - popHeight - ARROW_SIZE;

  const arrowLeft = anchorCenterX - left - ARROW_SIZE;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
      <Animated.View
        entering={ZoomIn.springify().damping(75)}
        style={[styles.wrap, { left, top, width: popWidth }]}
      >
        <Surface mode={surfaceMode} style={styles.surface}>
          <View style={styles.row}>
            {variants.map((v) => (
              <Pressable key={v} onPress={() => onSelect(v)} style={styles.item}>
                <Text style={{ fontSize: VARIANT_FONT_SIZE }}>{v}</Text>
              </Pressable>
            ))}
          </View>
        </Surface>
        <View style={[styles.arrow, { left: arrowLeft }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
  },
  surface: {
    borderRadius: 18,
    padding: PADDING,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    position: "absolute",
    bottom: -ARROW_SIZE,
    width: ARROW_SIZE * 2,
    height: ARROW_SIZE,
    backgroundColor: "rgba(255,255,255,0.95)",
    transform: [{ rotate: "45deg" }],
  },
});
