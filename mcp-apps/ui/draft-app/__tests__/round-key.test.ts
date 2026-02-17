import { describe, it, expect } from "vitest";
import { parseRoundKey, sortRoundEntries } from "../round-key";

describe("parseRoundKey", () => {
  it("parses numeric keys", () => {
    expect(parseRoundKey("7")).toMatchObject({
      label: "Round 7",
      shortLabel: "R7",
      sortOrder: 7,
    });
  });

  it("parses rounds ranges", () => {
    expect(parseRoundKey("rounds_10_12")).toMatchObject({
      label: "Rounds 10-12",
      shortLabel: "R10-12",
      sortOrder: 10,
    });
  });

  it("parses plus ranges", () => {
    expect(parseRoundKey("rounds_13_plus")).toMatchObject({
      label: "Rounds 13+",
      shortLabel: "R13+",
      sortOrder: 13,
    });
  });

  it("humanizes unknown keys", () => {
    expect(parseRoundKey("sleepers_only")).toMatchObject({
      label: "Sleepers Only",
      sortOrder: Number.MAX_SAFE_INTEGER,
    });
  });

  it("normalizes reversed ranges", () => {
    expect(parseRoundKey("rounds_12_10")).toMatchObject({
      label: "Rounds 10-12",
      shortLabel: "R10-12",
      sortOrder: 10,
    });
  });

  it("falls back gracefully for empty keys", () => {
    expect(parseRoundKey("")).toMatchObject({
      label: "General",
      shortLabel: "General",
      sortOrder: Number.MAX_SAFE_INTEGER,
    });
  });
});

describe("sortRoundEntries", () => {
  it("sorts mixed entries by normalized order", () => {
    var sorted = sortRoundEntries([
      ["rounds_13_plus", "late"],
      ["2", "early"],
      ["rounds_10_12", "mid"],
      ["sleepers_only", "other"],
    ]);

    expect(sorted.map(function (entry) { return entry[0].label; })).toEqual([
      "Round 2",
      "Rounds 10-12",
      "Rounds 13+",
      "Sleepers Only",
    ]);
  });
});
