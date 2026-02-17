import { useMemo } from "react";

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type DisplayMode = "inline" | "fullscreen" | "pip";
type WidthBucket = "compact" | "narrow" | "regular" | "wide" | "xwide";

interface ContainerDimensions {
  width?: number;
  maxWidth?: number;
  height?: number;
  maxHeight?: number;
}

interface HostContextLike {
  containerDimensions?: ContainerDimensions;
  safeAreaInsets?: Partial<SafeAreaInsets>;
  platform?: "mobile" | "desktop" | "web";
  displayMode?: DisplayMode;
  availableDisplayModes?: DisplayMode[];
  deviceCapabilities?: {
    touch?: boolean;
    hover?: boolean;
  };
}

export interface HostLayout {
  width: number;
  widthBucket: WidthBucket;
  safeAreaInsets: SafeAreaInsets;
  platform: "mobile" | "desktop" | "web";
  displayMode: DisplayMode;
  availableDisplayModes: DisplayMode[];
  canFullscreen: boolean;
  touchCapable: boolean;
  safeAreaTotalX: number;
  safeAreaTotalY: number;
}

function numeric(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, v);
  return null;
}

function widthBucket(width: number): WidthBucket {
  if (width < 360) return "compact";
  if (width < 480) return "narrow";
  if (width < 768) return "regular";
  if (width < 1024) return "wide";
  return "xwide";
}

function resolveWidth(ctx: HostContextLike | null | undefined): number {
  var dims = ctx?.containerDimensions || {};
  var width = numeric(dims.width);
  if (width !== null) return width;
  var maxWidth = numeric(dims.maxWidth);
  if (maxWidth !== null) return maxWidth;
  if (typeof window !== "undefined" && window.innerWidth) return window.innerWidth;
  return 1024;
}

function resolveSafeArea(ctx: HostContextLike | null | undefined): SafeAreaInsets {
  var insets = ctx?.safeAreaInsets || {};
  return {
    top: numeric(insets.top) ?? 0,
    right: numeric(insets.right) ?? 0,
    bottom: numeric(insets.bottom) ?? 0,
    left: numeric(insets.left) ?? 0,
  };
}

function resolveModes(ctx: HostContextLike | null | undefined): DisplayMode[] {
  var modes = ctx?.availableDisplayModes || [];
  if (!Array.isArray(modes) || modes.length === 0) {
    return ["inline"];
  }
  var unique: DisplayMode[] = [];
  for (var i = 0; i < modes.length; i++) {
    var mode = modes[i];
    if ((mode === "inline" || mode === "fullscreen" || mode === "pip") && !unique.includes(mode)) {
      unique.push(mode);
    }
  }
  return unique.length ? unique : ["inline"];
}

export function deriveHostLayout(hostContext: HostContextLike | null | undefined): HostLayout {
  var width = resolveWidth(hostContext);
  var safeAreaInsets = resolveSafeArea(hostContext);
  var availableDisplayModes = resolveModes(hostContext);
  var displayMode = hostContext?.displayMode || "inline";
  if (!availableDisplayModes.includes(displayMode)) {
    displayMode = availableDisplayModes[0] || "inline";
  }

  var platform = hostContext?.platform || "web";
  if (platform !== "mobile" && platform !== "desktop" && platform !== "web") {
    platform = "web";
  }

  return {
    width: width,
    widthBucket: widthBucket(width),
    safeAreaInsets: safeAreaInsets,
    platform: platform,
    displayMode: displayMode,
    availableDisplayModes: availableDisplayModes,
    canFullscreen: availableDisplayModes.includes("fullscreen"),
    touchCapable: hostContext?.deviceCapabilities?.touch === true || platform === "mobile",
    safeAreaTotalX: safeAreaInsets.left + safeAreaInsets.right,
    safeAreaTotalY: safeAreaInsets.top + safeAreaInsets.bottom,
  };
}

export function useHostLayout(hostContext: HostContextLike | null | undefined): HostLayout {
  return useMemo(function () {
    return deriveHostLayout(hostContext);
  }, [hostContext]);
}
