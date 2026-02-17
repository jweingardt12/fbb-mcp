import { describe, it, expect } from "vitest";
import { toFiniteNumber, formatFixed, formatPercent } from "../number-format";

describe("number-format", () => {
  it("normalizes unknown values into finite numbers", () => {
    expect(toFiniteNumber(1.2)).toBe(1.2);
    expect(toFiniteNumber("2.5")).toBe(2.5);
    expect(toFiniteNumber(undefined, 7)).toBe(7);
    expect(toFiniteNumber("bad", 9)).toBe(9);
  });

  it("formats fixed decimals safely", () => {
    expect(formatFixed(1.2345, 2)).toBe("1.23");
    expect(formatFixed("4.2", 1)).toBe("4.2");
    expect(formatFixed(null, 1, "-")).toBe("-");
  });

  it("formats percentages safely", () => {
    expect(formatPercent(12.34, 1)).toBe("12.3%");
    expect(formatPercent("8", 0)).toBe("8%");
    expect(formatPercent(undefined, 1, "-")).toBe("-");
  });
});
