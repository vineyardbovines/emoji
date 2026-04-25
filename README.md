# @vineyardbovines/emoji

React Native emoji picker and dataset.

## Install

```sh
bun add @vineyardbovines/emoji
# or: npm install, yarn add, pnpm add
```

### Peer dependencies

Required:
- `react` ≥ 19
- `react-native` ≥ 0.83
- `@shopify/flash-list` ≥ 2
- `react-native-safe-area-context` ≥ 5
- `react-native-gesture-handler` ≥ 2
- `react-native-reanimated` ≥ 4

Optional (needed for specific features):
- `@gorhom/bottom-sheet` ≥ 5 — import `@vineyardbovines/emoji/sheet`
- `expo-blur` ≥ 55 — `variant="blur"` or the `variant="glass"` fallback
- `expo-glass-effect` ≥ 55 — `variant="glass"` on iOS 17+
- `expo-haptics` ≥ 55 — haptic feedback on long-press
- `expo-symbols` ≥ 1 — native iOS SF Symbols for the default tab / search icons
- `@expo/vector-icons` ≥ 15 — Ionicons fallback for the default tab / search icons on Android

## Usage

### Picker

```tsx
import { EmojiPicker, type EmojiPickerStorage } from "@vineyardbovines/emoji";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage: EmojiPickerStorage = {
  get: (key) => AsyncStorage.getItem(key),
  set: (key, value) => AsyncStorage.setItem(key, value),
};

<EmojiPicker
  variant="glass"
  storage={storage}
  onEmojiSelected={(emoji) => console.log(emoji)}
/>;
```

### Sheet wrapper

```tsx
import { useRef } from "react";
import {
  EmojiPickerSheet,
  type EmojiPickerSheetHandle,
} from "@vineyardbovines/emoji/sheet";

const ref = useRef<EmojiPickerSheetHandle>(null);

<EmojiPickerSheet
  ref={ref}
  storage={storage}
  onEmojiSelected={(emoji) => console.log(emoji)}
/>;

// Open/close:
ref.current?.present();
ref.current?.dismiss();
```

The sheet hard-codes `BottomSheetTextInput` so keyboard focus stays within the gorhom sheet. Consumers cannot override the search input on the sheet wrapper — use the raw `EmojiPicker` if you need a custom input.

### Dataset only

```ts
import {
  EMOJI_DATA,
  SKIN_TONE_VARIANTS,
  type EmojiEntry,
  type EmojiCategory,
} from "@vineyardbovines/emoji/data";
```

Pure data + types. No React Native dependency.

## Regenerating the dataset

```sh
bun run emoji:generate
```

Fetches the latest `emoji-test.txt`, CLDR annotations, and gemoji keywords, and rewrites `src/data/generated.ts`.

## License

MIT.
