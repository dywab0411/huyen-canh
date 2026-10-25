import { it, expect } from "vitest";
import { tools, reading, datasetVersion } from "../../src/engine";
import { corpus } from "../../src/content/corpus";
import { datasetSchema } from "../../src/content/dataset";
it("F07 new version affects new result while old snapshot remains unchanged", async () => {
  const content = Object.fromEntries(
    tools.map((t) => {
      const e = corpus[t[0]];
      return [
        t[0],
        {
          title: e.title,
          sections: [e.intro, e.strength, e.pause, e.practice],
        },
      ];
    }),
  );
  const v2 = datasetSchema.parse({ version: "test-v2", content });
  const input = { name: "Đặng Minh An", date: "2000-02-29" };
  const old = await reading("ngay-sinh", input, "2026-10-25");
  const snapshot = JSON.stringify(old);
  const newer = await reading("ngay-sinh", input, "2026-10-25", v2);
  expect(newer.datasetVersion).toBe("test-v2");
  expect(JSON.stringify(old)).toBe(snapshot);
  expect(old.datasetVersion).toBe(datasetVersion);
  expect(() =>
    datasetSchema.parse({ ...v2, content: { bad: content["ngay-sinh"] } }),
  ).toThrow();
});
