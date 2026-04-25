import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { Surface } from "../components/surface";
import { EmojiPicker, type EmojiPickerProps } from "../emoji-picker";

export type EmojiPickerSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

export type EmojiPickerSheetProps = Omit<EmojiPickerProps, "SearchInputComponent"> & {
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
};

export const EmojiPickerSheet = forwardRef<EmojiPickerSheetHandle, EmojiPickerSheetProps>(
  function EmojiPickerSheet(
    { snapPoints, onDismiss, onRequestClose, variant = "glass", ...pickerProps },
    ref
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const resolvedSnapPoints = useMemo(() => snapPoints ?? ["56%"], [snapPoints]);

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

    const handleRequestClose = useCallback(() => {
      Keyboard.dismiss();
      sheetRef.current?.dismiss();
      onRequestClose?.();
    }, [onRequestClose]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} />
      ),
      []
    );

    const renderBackground = useCallback(
      (props: BottomSheetBackgroundProps) => (
        <Surface mode={variant} style={[props.style, styles.background]} />
      ),
      [variant]
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={resolvedSnapPoints}
        onDismiss={onDismiss}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundComponent={renderBackground}
        handleIndicatorStyle={styles.handle}
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
    backgroundColor: "#C7C7CC",
    width: 36,
  },
  sheetBody: {
    flex: 1,
  },
});
