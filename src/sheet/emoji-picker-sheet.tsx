import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { Surface } from "../components/surface";
import { EmojiPicker, type EmojiPickerProps } from "../emoji-picker";
import { useEmojiPickerColors } from "../lib/colors";

export type EmojiPickerSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

export type EmojiPickerSheetProps = Omit<EmojiPickerProps, "SearchInputComponent"> & {
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
};

const DEFAULT_SNAP_POINTS: (string | number)[] = ["56%"];

export const EmojiPickerSheet = forwardRef<EmojiPickerSheetHandle, EmojiPickerSheetProps>(
  function EmojiPickerSheet(
    { snapPoints, onDismiss, onRequestClose, variant = "glass", ...pickerProps },
    ref
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const colors = useEmojiPickerColors();
    const resolvedSnapPoints = snapPoints ?? DEFAULT_SNAP_POINTS;

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      []
    );

    useEffect(() => {
      const sub = Keyboard.addListener("keyboardWillHide", () => {
        sheetRef.current?.snapToIndex(0);
      });
      return () => sub.remove();
    }, []);

    const handleRequestClose = () => {
      Keyboard.dismiss();
      sheetRef.current?.dismiss();
      onRequestClose?.();
    };

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} />
    );

    const renderBackground = (props: BottomSheetBackgroundProps) => (
      <Surface mode={variant} style={[props.style, styles.background]} />
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={resolvedSnapPoints}
        onDismiss={onDismiss}
        enablePanDownToClose
        enableContentPanningGesture={false}
        backdropComponent={renderBackdrop}
        backgroundComponent={renderBackground}
        handleIndicatorStyle={[styles.handle, { backgroundColor: colors.handle }]}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.sheetBody}>
          <EmojiPicker
            {...pickerProps}
            variant={variant}
            onRequestClose={handleRequestClose}
            SearchInputComponent={BottomSheetTextInput}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  handle: {
    width: 36,
  },
  sheetBody: {
    flex: 1,
  },
});
