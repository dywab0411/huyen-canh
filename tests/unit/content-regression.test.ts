import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { reading, tools } from "../../src/engine";
it("HC-RPT-007 different meaningful inputs produce distinct substantial narratives", async () => {
  for (const tool of tools) {
    const base = {
      name: "Đặng Minh An",
      date: "2000-02-29",
      hour: "không rõ",
      name2: "Nguyễn Bình Yên",
      date2: "1999-01-12",
      hand: "Nét tay rõ",
      face: "Hay cười",
      trait: "Thích lắng nghe",
      trait2: "Nói rõ",
      dream: "Một hồ sen",
      space: "Góc gần cửa sổ",
      topic: "Học tập",
    };
    const outputs = new Set<string>();
    for (let n = 0; n < 20; n++) {
      const r = await reading(
        tool[0],
        {
          ...base,
          name: `Nguyễn Minh ${String.fromCharCode(65 + n)}`,
          date: `2001-01-${String(n + 1).padStart(2, "0")}`,
          hour: `${String(n).padStart(2, "0")}:00`,
          name2: `Trần Bình ${String.fromCharCode(65 + n)}`,
          hand: `Đặc điểm ${n}`,
          face: `Biểu cảm ${n}`,
          trait: `Giao tiếp ${n}`,
          dream: `Biểu tượng hư cấu ${n}`,
          space: `Góc học tập ${n}`,
          topic: `Chủ đề ${n}`,
        },
        "2026-10-25",
      );
      const narrative = r.sections.map((s) => s.body).join(" ");
      expect(narrative.split(/\s+/u).length).toBeGreaterThanOrEqual(501);
      outputs.add(narrative);
    }
    expect(outputs.size).toBeGreaterThanOrEqual(4);
  }
});
it("legacy fixture is an immutable original snapshot", () => {
  const snapshot = JSON.parse(
    readFileSync("tests/fixtures/reading-v1.json", "utf8"),
  );
  expect(snapshot.datasetVersion).toBe("2026.10.25-v1");
  expect(snapshot.engineVersion).toBe("1.0.0");
});
