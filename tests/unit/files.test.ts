import { it, expect } from "vitest";
import { filePolicy, matchesMagic } from "../../src/file-policy";
it("SEC05 MIME extension executable zip html svg oversize rejected", () => {
  for (const [name, mime, size] of [
    ["a.exe", "image/png", 100],
    ["a.svg", "image/svg+xml", 100],
    ["a.html", "text/html", 100],
    ["a.zip", "application/zip", 100],
    ["a.png", "image/jpeg", 100],
    ["a.mp4", "video/mp4", 21 * 1024 ** 2],
  ] as const)
    expect(() => filePolicy(name, mime, size)).toThrow();
  expect(matchesMagic(new Uint8Array([77, 90, 1]), "image/png")).toBe(false);
  expect(matchesMagic(new TextEncoder().encode("<svg/>"), "image/png")).toBe(
    false,
  );
  expect(matchesMagic(new TextEncoder().encode("PKxxxx"), "image/jpeg")).toBe(
    false,
  );
  expect(matchesMagic(new TextEncoder().encode("hello"), "text/plain")).toBe(
    true,
  );
  expect(
    matchesMagic(
      new TextEncoder().encode("<script>alert(1)</script>"),
      "text/plain",
    ),
  ).toBe(false);
});
