import { FlashList, type FlashListRef, type ViewToken } from "@shopify/flash-list";
import {
  type ComponentType,
  type ElementType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmojiCell } from "./components/emoji-cell";
import { EmojiColumn } from "./components/emoji-column";
import { EmptyRecentsColumn } from "./components/empty-recents-column";
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
import { type EmojiPickerLabels, resolveLabels } from "./lib/labels";
import type { EmojiPickerStorage } from "./lib/storage";
import type { CategoryName, Column } from "./lib/types";
import { ROWS } from "./lib/types";

const VISIBLE_COLS = 8.33;
const GRID_PADDING_LEFT = 16;
const EMPTY_RECENTS_WIDTH = 180;

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

  storage?: EmojiPickerStorage;
  labels?: Partial<EmojiPickerLabels>;
};

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
  storage,
  labels,
}: EmojiPickerProps) {
  const resolvedLabels = useMemo(() => resolveLabels(labels), [labels]);
  const colors = useEmojiPickerColors();

  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [popover, setPopover] = useState<{ base: string; anchor: Anchor } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const listRef = useRef<FlashListRef<Column>>(null);
  const isProgrammaticScrollRef = useRef(false);

  const { recents, push } = useRecents(storage);
  const { memory, remember } = useSkinToneMemory(storage);
  const { query, setQuery, results } = useSearch();

  const { columns, sectionOffsets } = useEmojiData(recents, memory);

  const initialCategoryRef = useRef<CategoryName>(
    recents.length > 0 ? "Recents" : "Smileys & People"
  );
  const [activeCategory, setActiveCategory] = useState<CategoryName>(initialCategoryRef.current);
  const didInitialScrollRef = useRef(false);

  const cellSize = containerWidth ? (containerWidth - GRID_PADDING_LEFT) / VISIBLE_COLS : 0;
  const gridHeight = cellSize * ROWS;

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);

  const handleSelect = useCallback(
    (emoji: string) => {
      const base = findBaseFor(emoji);
      if (base && base !== emoji) remember(base, emoji);
      push(emoji);
      onEmojiSelected(emoji);
      setPopover(null);
      if (closeOnSelect) onRequestClose?.();
    },
    [closeOnSelect, onEmojiSelected, onRequestClose, push, remember]
  );

  const handleLongPress = useCallback((emoji: string, anchor: Anchor) => {
    setPopover({ base: emoji, anchor });
  }, []);

  const computeScrollOffset = useCallback(
    (targetIndex: number) => {
      let offset = 0;
      for (let i = 0; i < targetIndex; i++) {
        const col = columns[i];
        if (!col) continue;
        offset += col.kind === "empty-recents" ? EMPTY_RECENTS_WIDTH : cellSize;
      }
      return offset;
    },
    [cellSize, columns]
  );

  const handleTabSelect = useCallback(
    (cat: CategoryName) => {
      setActiveCategory(cat);
      const idx = sectionOffsets[cat];
      const offset = computeScrollOffset(idx);
      isProgrammaticScrollRef.current = true;
      listRef.current?.scrollToOffset({ offset, animated: true });
    },
    [computeScrollOffset, sectionOffsets]
  );

  const handleMomentumScrollEnd = useCallback(() => {
    isProgrammaticScrollRef.current = false;
  }, []);

  useEffect(() => {
    if (didInitialScrollRef.current) return;
    if (cellSize === 0) return;
    const target = sectionOffsets[initialCategoryRef.current];
    if (target === undefined || target === 0) {
      didInitialScrollRef.current = true;
      return;
    }
    const id = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: computeScrollOffset(target),
        animated: false,
      });
      didInitialScrollRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, [cellSize, sectionOffsets, computeScrollOffset]);

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 60, minimumViewTime: 40 }),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Column>[] }) => {
      if (isProgrammaticScrollRef.current) return;
      if (viewableItems.length === 0) return;
      const first = viewableItems[0]?.item;
      if (first?.kind === "emoji") {
        const cat = first.categoryName;
        setActiveCategory((prev) => (prev === cat ? prev : cat));
      } else if (first?.kind === "empty-recents") {
        setActiveCategory("Recents");
      }
    }
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: Column }) => {
      if (item.kind === "empty-recents") {
        return (
          <EmptyRecentsColumn
            width={EMPTY_RECENTS_WIDTH}
            height={gridHeight}
            title={resolvedLabels.emptyRecentsTitle}
            body={resolvedLabels.emptyRecentsBody}
            textColor={colors.textPrimary}
            subtextColor={colors.textSecondary}
          />
        );
      }
      return (
        <EmojiColumn
          cells={item.cells}
          cellSize={cellSize}
          onSelect={handleSelect}
          onLongPress={handleLongPress}
        />
      );
    },
    [cellSize, gridHeight, handleLongPress, handleSelect, resolvedLabels, colors]
  );

  const getItemType = useCallback(
    (item: Column) => (item.kind === "emoji" ? "emoji" : "placeholder"),
    []
  );

  const keyExtractor = useCallback(
    (item: Column, i: number) =>
      item.kind === "empty-recents" ? "empty-recents" : `c-${item.categoryName}-${i}`,
    []
  );

  return (
    <View
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
              getItemType={getItemType}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: GRID_PADDING_LEFT }}
            />
          </View>
          <TabBar
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
