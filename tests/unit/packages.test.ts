import { it, expect } from "vitest";
import { defaults, quoteSchema } from "../../src/lib/packages";
it("HC-RPT-003 default price remains 10k/20k/60k/70k and malformed server quotes cannot unlock checkout", () => {
  expect(defaults.source).toBe("defaults");
  expect(defaults.packages.map((p) => p.price_vnd)).toEqual([
    10000, 20000, 60000, 70000,
  ]);
  expect(
    quoteSchema.safeParse({
      ...defaults,
      source: "server",
      packages: [
        defaults.packages[0],
        defaults.packages[0],
        defaults.packages[2],
      ],
    }).success,
  ).toBe(false);
  expect(
    quoteSchema.safeParse({
      ...defaults,
      packages: defaults.packages.map((p) => ({ ...p, version: 0 })),
    }).success,
  ).toBe(false);
});
