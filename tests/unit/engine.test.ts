import { describe, it, expect } from "vitest";
import {
  tools,
  reading,
  canonicalize,
  normalize,
  transliterate,
  phone,
  validDate,
  lifePath,
} from "../../src/engine";
import {
  canConfirm,
  canPublish,
  canPublic,
  retentionCandidate,
  textOnly,
} from "../../src/domain";
export const fixture = {
  name: "Đặng Minh An",
  date: "2000-02-29",
  name2: "Nguyễn Bình Yên",
  date2: "1999-01-12",
  hour: "không rõ",
  hand: "Nét tay rõ",
  face: "Hay cười",
  trait: "Lắng nghe",
  trait2: "Nói rõ",
  dream: "một biểu tượng chưa biết <script>alert(1)</script>",
  space: "Góc nhỏ gần cửa sổ",
  topic: "Học tập",
};
describe("F01–F06 deterministic engines", () => {
  for (const tool of tools)
    it(tool[0] + " repeated 100 times, complete original result", async () => {
      const r = await reading(tool[0], fixture, "2026-10-25");
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(
        r.sections
          .map((x) => x.body)
          .join(" ")
          .trim()
          .split(/\s+/u).length,
      ).toBeGreaterThanOrEqual(501);
      expect(new Set(r.sections.map((x) => x.body)).size).toBe(4);
      for (let n = 0; n < 100; n++)
        expect(await reading(tool[0], fixture, "2026-10-25")).toEqual(r);
      expect(await reading(tool[0], fixture, "2027-01-01")).toEqual(r);
    });
  it("NFC whitespace case and Đ", () => {
    expect(normalize("  ĐẶNG   Minh  An ".normalize("NFD"))).toBe(
      "đặng minh an",
    );
    expect(transliterate("Đặng")).toBe("dang");
  });
  it("phone consistent", () => {
    expect(phone("0912 345 678")).toBe(phone("+84912345678"));
    expect(() => phone("123")).toThrow();
  });
  it("dates leap and future", () => {
    expect(validDate("2000-02-29", "2026-10-25")).toBe("2000-02-29");
    for (const date of ["1900-02-29", "2025-02-29", "2026-13-01", "2027-01-01"])
      expect(() => validDate(date, "2026-10-25")).toThrow();
  });
  it("pair symmetry names/dates stay coupled", async () => {
    for (const id of ["hop-tuoi", "tinh-duyen"] as const) {
      expect(await reading(id, fixture, "2026-10-25")).toEqual(
        await reading(
          id,
          {
            ...fixture,
            name: fixture.name2,
            name2: fixture.name,
            date: fixture.date2,
            date2: fixture.date,
          },
          "2026-10-25",
        ),
      );
    }
  });
  it("names and unknown hour validation", () => {
    expect(() =>
      canonicalize("ngay-sinh", { ...fixture, name: "bé yêu" }, "2026-10-25"),
    ).not.toThrow();
    expect(() =>
      canonicalize("ngay-sinh", { ...fixture, name: "nickname" }, "2026-10-25"),
    ).toThrow();
    expect(canonicalize("gio-sinh", fixture, "2026-10-25").hour).toBe(
      "không rõ",
    );
    expect(() =>
      canonicalize("gio-sinh", { ...fixture, hour: "99:10" }, "2026-10-25"),
    ).toThrow();
  });
  it("dream max and safe fallback", async () => {
    expect(() =>
      canonicalize("giac-mo", { dream: "x".repeat(2001) }, "2026-10-25"),
    ).toThrow();
    const r = await reading("giac-mo", fixture, "2026-10-25");
    expect(r.sections.map((x) => x.body).join(" ")).not.toContain("<script>");
  });
  it("life path masters retained", () => {
    expect(lifePath("2000-02-29")).toBe(6);
    expect(lifePath("2000-01-08")).toBe(11);
  });
});
describe("ORD/CON/OPS domain gates", () => {
  it("confirm state amount and late reason", () => {
    expect(canConfirm("awaiting_payment", 10000, 10000)).toBe(true);
    expect(canConfirm("paid", 10000, 10000)).toBe(false);
    expect(canConfirm("expired", 10000, 10000)).toBe(false);
    expect(canConfirm("expired", 10000, 10000, "Đã đối chiếu")).toBe(true);
    expect(canConfirm("awaiting_payment", 1, 10000)).toBe(false);
  });
  it("G50 requires video, paid required", () => {
    expect(canPublish("paid", "G50", "từ ".repeat(501), false)).toBe(false);
    expect(canPublish("paid", "G50", "từ ".repeat(501), true)).toBe(true);
    expect(canPublish("awaiting_payment", "G10", "từ ".repeat(501), true)).toBe(
      false,
    );
  });
  it("consent scope/version/revocation/adult", () => {
    const c = {
      scope: "website_public_gallery" as const,
      assetHash: "abc",
      assetVersion: 1,
      granted: true,
      adult: true,
    };
    expect(canPublic([c], c.scope, "abc", 1)).toBe(true);
    expect(canPublic([c], "youtube_publication", "abc", 1)).toBe(false);
    expect(canPublic([c], c.scope, "abc", 2)).toBe(false);
    expect(canPublic([c, { ...c, granted: false }], c.scope, "abc", 1)).toBe(
      false,
    );
    expect(canPublic([{ ...c, adult: false }], c.scope, "abc", 1)).toBe(false);
  });
  it("retention never selects active paid", () => {
    expect(retentionCandidate("paid", null, "2020-01-01", "2026-10-25")).toBe(
      false,
    );
    expect(
      retentionCandidate("expired", null, "2020-01-01", "2026-10-25"),
    ).toBe(true);
  });
  it("reject HTML script", () => {
    expect(() => textOnly("<script>x</script>")).toThrow();
    expect(() => textOnly("javascript:alert(1)")).toThrow();
  });
});
