import { describe, it, expect } from "vitest";
import { qualityColor, qualityTextColor, hotColdIcon, hotColdColor } from "../intel-badge";

describe("qualityColor", () => {
  it("returns fallback for null", () => {
    expect(qualityColor(null)).toBe("bg-muted-foreground/30");
  });

  it("returns fallback for undefined", () => {
    expect(qualityColor(undefined)).toBe("bg-muted-foreground/30");
  });

  it("maps elite to amber/gold", () => {
    expect(qualityColor("elite")).toBe("bg-[#d4a017]");
  });

  it("maps strong to green", () => {
    expect(qualityColor("strong")).toBe("bg-[#15803d]");
  });

  it("maps average to green-gray", () => {
    expect(qualityColor("average")).toBe("bg-[#5c7266]");
  });

  it("maps below to amber", () => {
    expect(qualityColor("below")).toBe("bg-[#c28800]");
  });

  it("maps poor to red", () => {
    expect(qualityColor("poor")).toBe("bg-[#c0392b]");
  });

  it("returns fallback for unknown tier", () => {
    expect(qualityColor("unknown")).toBe("bg-muted-foreground/30");
  });
});

describe("qualityTextColor", () => {
  it("returns fallback for null", () => {
    expect(qualityTextColor(null)).toBe("text-muted-foreground");
  });

  it("returns fallback for undefined", () => {
    expect(qualityTextColor(undefined)).toBe("text-muted-foreground");
  });

  it("maps elite to amber text", () => {
    expect(qualityTextColor("elite")).toBe("text-[#b8860b] dark:text-[#d4a017]");
  });

  it("maps strong to green text", () => {
    expect(qualityTextColor("strong")).toBe("text-[#15803d] dark:text-[#4ade80]");
  });

  it("maps average to green-gray text", () => {
    expect(qualityTextColor("average")).toBe("text-[#5c7266] dark:text-[#7d9b88]");
  });

  it("maps below to amber text", () => {
    expect(qualityTextColor("below")).toBe("text-[#c28800] dark:text-[#f5b731]");
  });

  it("maps poor to red text", () => {
    expect(qualityTextColor("poor")).toBe("text-[#c0392b] dark:text-[#f87171]");
  });
});

describe("hotColdIcon", () => {
  it("returns empty for null", () => {
    expect(hotColdIcon(null)).toBe("");
  });

  it("returns empty for undefined", () => {
    expect(hotColdIcon(undefined)).toBe("");
  });

  it("returns fire for hot", () => {
    expect(hotColdIcon("hot")).toBe("\u{1F525}");
  });

  it("returns up arrow for warm", () => {
    expect(hotColdIcon("warm")).toBe("\u2191");
  });

  it("returns empty for neutral", () => {
    expect(hotColdIcon("neutral")).toBe("");
  });

  it("returns snowflake for cold", () => {
    expect(hotColdIcon("cold")).toBe("\u2744\uFE0F");
  });

  it("returns double snowflake for ice", () => {
    expect(hotColdIcon("ice")).toBe("\u2744\uFE0F\u2744\uFE0F");
  });
});

describe("hotColdColor", () => {
  it("returns empty for null", () => {
    expect(hotColdColor(null)).toBe("");
  });

  it("returns empty for undefined", () => {
    expect(hotColdColor(undefined)).toBe("");
  });

  it("maps hot to red", () => {
    expect(hotColdColor("hot")).toBe("text-red-500");
  });

  it("maps warm to orange", () => {
    expect(hotColdColor("warm")).toBe("text-orange-400");
  });

  it("maps neutral to muted", () => {
    expect(hotColdColor("neutral")).toBe("text-muted-foreground");
  });

  it("maps cold to blue-400", () => {
    expect(hotColdColor("cold")).toBe("text-blue-400");
  });

  it("maps ice to blue-500", () => {
    expect(hotColdColor("ice")).toBe("text-blue-500");
  });
});
