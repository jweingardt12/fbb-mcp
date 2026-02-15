import { describe, it, expect } from "vitest";
import { str } from "../types.js";

describe("str", () => {
  it("returns empty string for null", () => {
    expect(str(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(str(undefined)).toBe("");
  });

  it("returns string as-is", () => {
    expect(str("hello")).toBe("hello");
  });

  it("converts number to string", () => {
    expect(str(42)).toBe("42");
  });
});
