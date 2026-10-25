import { it, expect } from "vitest";
import { profileSchema } from "../../src/features/account/Account";
import { snapshotSchema } from "../../src/features/account/SavedSnapshot";
import legacy from "../fixtures/reading-v1.json";
it("HC-RPT-004 validates profile and immutable legacy snapshot without running new engine", () => {
  expect(
    profileSchema.parse({ display_name: " Minh An ", age_band: "18+" })
      .display_name,
  ).toBe("Minh An");
  for (const display_name of ["", "<script>", "x".repeat(101)])
    expect(
      profileSchema.safeParse({ display_name, age_band: "18+" }).success,
    ).toBe(false);
  expect(snapshotSchema.parse(legacy).datasetVersion).toBe("2026.10.25-v1");
  expect(snapshotSchema.safeParse({ sections: [] }).success).toBe(false);
});
