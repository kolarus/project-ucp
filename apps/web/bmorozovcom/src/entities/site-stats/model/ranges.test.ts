// Guards: a hostile ?range= slipping past parseRange into the stats query.
import { describe, expect, it } from "vitest";

import { parseRange } from "./ranges";

describe("parseRange", () => {
  it.each(["24h", "7d", "30d", "90d"] as const)("accepts %s", (range) => {
    expect(parseRange(range)).toBe(range);
  });

  // Fixed 2026-09-23: an `in` check accepted inherited names like `toString`.
  it.each([
    "toString",
    "constructor",
    "__proto__",
    "hasOwnProperty",
    "",
    "7D",
    ["7d", "30d"],
    undefined,
  ])("falls back to 24h for %j", (value) => {
    expect(parseRange(value)).toBe("24h");
  });
});
