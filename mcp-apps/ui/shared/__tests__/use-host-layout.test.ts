import { describe, it, expect } from "vitest";
import { deriveHostLayout } from "../use-host-layout";

describe("deriveHostLayout", () => {
  it("normalizes width bucket from container width", () => {
    var layout = deriveHostLayout({
      containerDimensions: { width: 375 },
      availableDisplayModes: ["inline", "fullscreen"],
      displayMode: "inline",
      platform: "mobile",
    });

    expect(layout.widthBucket).toBe("narrow");
    expect(layout.canFullscreen).toBe(true);
    expect(layout.platform).toBe("mobile");
    expect(layout.touchCapable).toBe(true);
    expect(layout.safeAreaTotalX).toBe(0);
  });

  it("falls back to inline mode when host mode is unsupported", () => {
    var layout = deriveHostLayout({
      availableDisplayModes: ["inline"],
      displayMode: "fullscreen",
    });

    expect(layout.displayMode).toBe("inline");
    expect(layout.canFullscreen).toBe(false);
  });
});
