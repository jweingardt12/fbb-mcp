export interface RoundKeyInfo {
  rawKey: string;
  label: string;
  shortLabel: string;
  sortOrder: number;
  start: number | null;
  end: number | null;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(function (word) {
      return word[0] ? word[0].toUpperCase() + word.slice(1) : "";
    })
    .join(" ");
}

function numericOrNull(value: string | undefined): number | null {
  if (!value) return null;
  var n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parseRoundKey(rawKey: string): RoundKeyInfo {
  var key = String(rawKey || "").trim();
  var numericMatch = /^(\d+)$/.exec(key);
  if (numericMatch) {
    var round = numericOrNull(numericMatch[1]) || 0;
    return {
      rawKey: rawKey,
      label: "Round " + round,
      shortLabel: "R" + round,
      sortOrder: round,
      start: round,
      end: round,
    };
  }

  var rangeMatch = /^rounds_(\d+)_(\d+)$/i.exec(key);
  if (rangeMatch) {
    var start = numericOrNull(rangeMatch[1]) || 0;
    var end = numericOrNull(rangeMatch[2]) || start;
    var min = Math.min(start, end);
    var max = Math.max(start, end);
    return {
      rawKey: rawKey,
      label: "Rounds " + min + "-" + max,
      shortLabel: "R" + min + "-" + max,
      sortOrder: min,
      start: min,
      end: max,
    };
  }

  var plusMatch = /^rounds_(\d+)_plus$/i.exec(key);
  if (plusMatch) {
    var plusStart = numericOrNull(plusMatch[1]) || 0;
    return {
      rawKey: rawKey,
      label: "Rounds " + plusStart + "+",
      shortLabel: "R" + plusStart + "+",
      sortOrder: plusStart,
      start: plusStart,
      end: null,
    };
  }

  var singleRounds = /^rounds_(\d+)$/i.exec(key);
  if (singleRounds) {
    var single = numericOrNull(singleRounds[1]) || 0;
    return {
      rawKey: rawKey,
      label: "Round " + single,
      shortLabel: "R" + single,
      sortOrder: single,
      start: single,
      end: single,
    };
  }

  var normalized = key.replace(/^rounds_/i, "").replace(/_/g, " ");
  var human = normalized ? titleCase(normalized) : "General";
  return {
    rawKey: rawKey,
    label: human,
    shortLabel: human,
    sortOrder: Number.MAX_SAFE_INTEGER,
    start: null,
    end: null,
  };
}

export function sortRoundEntries<T>(entries: Array<[string, T]>): Array<[RoundKeyInfo, T]> {
  return entries
    .map(function (entry) {
      return [parseRoundKey(entry[0]), entry[1]] as [RoundKeyInfo, T];
    })
    .sort(function (a, b) {
      if (a[0].sortOrder !== b[0].sortOrder) return a[0].sortOrder - b[0].sortOrder;
      return a[0].label.localeCompare(b[0].label);
    });
}
