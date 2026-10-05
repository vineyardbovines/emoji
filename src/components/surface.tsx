import type { ComponentType, PropsWithChildren } from "react";
import { Platform, type StyleProp, View, type ViewStyle } from "react-native";

export type SurfaceMode = "glass" | "blur" | "opaque";

export type SurfaceProps = PropsWithChildren<{
  mode: SurfaceMode;
  backgroundColor?: string;
  tint?: "light" | "dark" | "auto";
  style?: StyleProp<ViewStyle>;
}>;

type GlassEffectModule = {
  GlassView: ComponentType<{
    glassEffectStyle?: "regular" | "clear";
    colorScheme?: "light" | "dark" | "auto";
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }>;
  isLiquidGlassAvailable: () => boolean;
};

type BlurModule = {
  BlurView: ComponentType<{
    intensity?: number;
    tint?: "light" | "dark" | "default" | "extraLight" | "systemChromeMaterial";
    experimentalBlurMethod?: "dimezisBlurView";
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }>;
};

let glassEffect: GlassEffectModule | null = null;
try {
  glassEffect = require("expo-glass-effect") as GlassEffectModule;
} catch {
  glassEffect = null;
}

let blur: BlurModule | null = null;
try {
  blur = require("expo-blur") as BlurModule;
} catch {
  blur = null;
}

const GLASS_AVAILABLE = glassEffect?.isLiquidGlassAvailable() ?? false;

export function Surface({ mode, backgroundColor, tint = "auto", style, children }: SurfaceProps) {
  if (mode === "opaque") {
    return (
      <View style={[{ backgroundColor: backgroundColor ?? "transparent" }, style]}>{children}</View>
    );
  }

  if (mode === "glass" && glassEffect && GLASS_AVAILABLE) {
    const { GlassView } = glassEffect;
    return (
      <GlassView glassEffectStyle="regular" colorScheme={tint} style={style}>
        {children}
      </GlassView>
    );
  }

  if (blur) {
    const { BlurView } = blur;
    const blurTint = tint === "auto" ? "default" : tint;
    const androidOverlay =
      Platform.OS === "android"
        ? {
            backgroundColor:
              backgroundColor ??
              (tint === "dark" ? "rgba(28,28,30,0.9)" : "rgba(242,242,247,0.95)"),
          }
        : null;
    return (
      <BlurView
        intensity={Platform.OS === "android" ? 100 : 90}
        tint={blurTint}
        experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
        style={[style, androidOverlay]}
      >
        {children}
      </BlurView>
    );
  }

  if (Platform.OS === "web") {
    const webStyle = {
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
      backgroundColor: tint === "dark" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)",
    } as ViewStyle;
    return <View style={[webStyle, style]}>{children}</View>;
  }

  return (
    <View style={[{ backgroundColor: backgroundColor ?? "rgba(255,255,255,0.97)" }, style]}>
      {children}
    </View>
  );
}
