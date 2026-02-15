import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", undefined, false, null, "active")).toBe("base active");
  });

  it("deduplicates conflicting Tailwind utilities", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
