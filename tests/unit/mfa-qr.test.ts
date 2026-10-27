import { expect, it } from "vitest";
import { mfaQrSource } from "../../src/lib/mfa-qr";
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20"/></svg>';
it("renders the installed Supabase SDK data URI without nesting another URI", () => {
  const source = mfaQrSource(`data:image/svg+xml;utf-8,${svg}`);
  expect(decodeURIComponent(source.slice(source.indexOf(",") + 1))).toBe(svg);
});
it("accepts raw SVG and preserves an already encoded SVG data URI", () => {
  expect(decodeURIComponent(mfaQrSource(svg).split(",")[1])).toBe(svg);
  const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  expect(mfaQrSource(encoded)).toBe(encoded);
});
it("rejects external URLs and non SVG data", () => {
  expect(mfaQrSource("https://example.invalid/qr")).toBe("");
  expect(mfaQrSource("data:text/html,test")).toBe("");
});
