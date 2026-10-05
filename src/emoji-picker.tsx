import { FlashList, type FlashListRef, type ViewToken } from "@shopify/flash-list";
import {
  type ComponentType,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { type LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmojiCell } from "./components/emoji-cell";
import { EmojiColumn } from "./components/emoji-column";
import { SearchBar, type SearchBarIconProps } from "./components/search-bar";
import { SkinTonePopover } from "./components/skin-tone-popover";
import type { SurfaceMode } from "./components/surface";
import { TabBar, type TabIconProps } from "./components/tab-bar";
import { SKIN_TONE_VARIANTS } from "./data";
import { useEmojiData } from "./hooks/use-emoji-data";
import { useRecents } from "./hooks/use-recents";
import { useSearch } from "./hooks/use-search";
import { useSkinToneMemory } from "./hooks/use-skin-tone-memory";
import { useEmojiPickerColors } from "./lib/colors";
import type { HapticStyle } from "./lib/haptics";
import { type EmojiPickerLabels, resolveLabels } from "./lib/labels";
import type { EmojiPickerStorage } from "./lib/storage";
import type { CategoryName, Column } from "./lib/types";
import { ROWS } from "./lib/types";

const DEFAULT_LONG_PRESS_MS = 350;

const VISIBLE_COLS = 8.33;
const GRID_PADDING_LEFT = 16;

type Anchor = { x: number; y: number; width: number };

export type EmojiPickerProps = {
  onEmojiSelected: (emoji: string) => void;
  closeOnSelect?: boolean;
  onRequestClose?: () => void;

  variant?: SurfaceMode;
  backgroundColor?: string;

  SearchInputComponent?: ElementType;
  SearchIconComponent?: ComponentType<SearchBarIconProps>;
  TabIconComponent?: ComponentType<TabIconProps>;
  renderTabIcon?: (category: CategoryName, active: boolean) => ReactNode;

  initialCategory?: CategoryName;
  recentsLimit?: number;
  hapticStyle?: HapticStyle;
  skinToneLongPressMs?: number;

  storage?: EmojiPickerStorage;
  labels?: Partial<EmojiPickerLabels>;
};

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60, minimumViewTime: 40 };

function findBaseFor(emoji: string): string | null {
  if (emoji in SKIN_TONE_VARIANTS) return emoji;
  for (const [base, variants] of Object.entries(SKIN_TONE_VARIANTS)) {
    if (variants.includes(emoji)) return base;
  }
  return null;
}

export function EmojiPicker({
  onEmojiSelected,
  closeOnSelect = true,
  onRequestClose,
  variant = "glass",
  backgroundColor,
  SearchInputComponent,
  SearchIconComponent,
  TabIconComponent,
  renderTabIcon,
  initialCategory,
  recentsLimit,
  hapticStyle = "medium",
  skinToneLongPressMs = DEFAULT_LONG_PRESS_MS,
  storage,
  labels,
}: EmojiPickerProps) {
  const resolvedLabels = resolveLabels(labels);
  const colors = useEmojiPickerColors();

  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [popover, setPopover] = useState<{ base: string; anchor: Anchor } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const listRef = useRef<FlashListRef<Column>>(null);
  const pickerRootRef = useRef<View>(null);
  const isProgrammaticScrollRef = useRef(false);
  const targetCategoryRef = useRef<CategoryName | null>(null);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitialScrollRef = useRef(false);

  const { recents, push } = useRecents(storage, recentsLimit);
  const { memory, remember } = useSkinToneMemory(storage);
  const { query, setQuery, results } = useSearch();

  const { columns, sectionOffsets, visibleCategories } = useEmojiData(recents, memory);

  const [initialCategoryResolved] = useState<CategoryName>(
    () => initialCategory ?? (recents.length > 0 ? "Recents" : "Smileys & People")
  );
  const [activeCategory, setActiveCategory] = useState<CategoryName>(initialCategoryResolved);

  const cellSize = containerWidth ? (containerWidth - GRID_PADDING_LEFT) / VISIBLE_COLS : 0;
  const gridHeight = cellSize * ROWS;

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth((prev) => (prev === w ? prev : w));
  };

  const handleSelect = (emoji: string) => {
    const base = findBaseFor(emoji);
    if (base && base !== emoji) remember(base, emoji);
    push(emoji);
    onEmojiSelected(emoji);
    setPopover(null);
    if (closeOnSelect) onRequestClose?.();
  };

  const handleLongPress = (emoji: string, anchor: Anchor) => {
    const node = pickerRootRef.current;
    if (!node) {
      setPopover({ base: emoji, anchor });
      return;
    }
    node.measureInWindow((x, y) => {
      setPopover({
        base: emoji,
        anchor: { x: anchor.x - x, y: anchor.y - y, width: anchor.width },
      });
    });
  };

  const computeScrollOffset = (targetIndex: number) => targetIndex * cellSize;

  const handleTabSelect = (cat: CategoryName) => {
    const idx = sectionOffsets[cat];
    if (idx === undefined) return;
    setActiveCategory(cat);
    const offset = computeScrollOffset(idx);
    isProgrammaticScrollRef.current = true;
    targetCategoryRef.current = cat;
    if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      targetCategoryRef.current = null;
      programmaticScrollTimerRef.current = null;
    }, 1200);
    listRef.current?.scrollToOffset({ offset, animated: true });
  };

  useEffect(() => {
    return () => {
      if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (didInitialScrollRef.current) return;
    if (cellSize === 0) return;
    const target = sectionOffsets[initialCategoryResolved];
    if (target === undefined || target === 0) {
      didInitialScrollRef.current = true;
      return;
    }
    const id = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: target * cellSize,
        animated: false,
      });
      didInitialScrollRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, [cellSize, sectionOffsets, initialCategoryResolved]);

  // FlashList caches this callback at mount, so keep a single stable reference.
  // useState lazy-init creates it once; state returns the same function on every render.
  type ViewableItemsChangeHandler = (args: { viewableItems: ViewToken<Column>[] }) => void;
  const [onViewableItemsChanged] = useState<ViewableItemsChangeHandler>(
    (): ViewableItemsChangeHandler =>
      ({ viewableItems }) => {
        if (viewableItems.length === 0) return;
        let leftmost: ViewToken<Column> | undefined = viewableItems[0];
        for (const v of viewableItems) {
          if (
            (v.index ?? Number.POSITIVE_INFINITY) < (leftmost?.index ?? Number.POSITIVE_INFINITY)
          ) {
            leftmost = v;
          }
        }
        const cat = leftmost?.item?.categoryName;
        if (!cat) return;

        if (isProgrammaticScrollRef.current) {
          if (cat === targetCategoryRef.current) {
            isProgrammaticScrollRef.current = false;
            targetCategoryRef.current = null;
            if (programmaticScrollTimerRef.current) {
              clearTimeout(programmaticScrollTimerRef.current);
              programmaticScrollTimerRef.current = null;
            }
          }
          return;
        }

        setActiveCategory((prev) => (prev === cat ? prev : cat));
      }
  );

  const renderItem = ({ item }: { item: Column }) => (
    <EmojiColumn
      cells={item.cells}
      cellSize={cellSize}
      longPressDurationMs={skinToneLongPressMs}
      hapticStyle={hapticStyle}
      onSelect={handleSelect}
      onLongPress={handleLongPress}
    />
  );

  const keyExtractor = (item: Column, i: number) => `c-${item.categoryName}-${i}`;

  return (
    <View
      ref={pickerRootRef}
      onLayout={handleContainerLayout}
      style={[
        styles.container,
        variant === "opaque" && backgroundColor ? { backgroundColor } : null,
      ]}
    >
      <View style={styles.searchWrap}>
        <SearchBar
          value={query}
          placeholder={resolvedLabels.search}
          onChangeText={setQuery}
          onFocusChange={setIsSearchFocused}
          InputComponent={SearchInputComponent}
          IconComponent={SearchIconComponent}
          surfaceMode={variant}
          colors={colors}
        />
      </View>

      {results ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.resultsRow,
            { paddingBottom: Math.max(insets.bottom, 12) + 12 },
          ]}
        >
          {results.map((entry) => (
            <EmojiCell
              key={entry.emoji}
              entry={entry}
              cellSize={cellSize || 44}
              longPressDurationMs={skinToneLongPressMs}
              hapticStyle={hapticStyle}
              onSelect={handleSelect}
              onLongPress={handleLongPress}
            />
          ))}
        </ScrollView>
      ) : isSearchFocused ? (
        <View style={styles.flex1} />
      ) : cellSize > 0 ? (
        <>
          <View style={{ height: gridHeight }}>
            <FlashList
              ref={listRef}
              horizontal
              data={columns}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={VIEWABILITY_CONFIG}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: GRID_PADDING_LEFT }}
            />
          </View>
          <TabBar
            categories={visibleCategories}
            active={activeCategory}
            onSelect={handleTabSelect}
            colors={colors}
            IconComponent={TabIconComponent}
            renderIcon={renderTabIcon}
          />
        </>
      ) : (
        <View style={{ height: gridHeight }} />
      )}

      {popover ? (
        <SkinTonePopover
          baseEmoji={popover.base}
          anchor={popover.anchor}
          surfaceMode={variant}
          onSelect={handleSelect}
          onDismiss={() => setPopover(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 4,
  },
  flex1: { flex: 1 },
});
