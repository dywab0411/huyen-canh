import { expect, it } from "vitest";
import { videoHeaderValid } from "../../src/lib/video-header";
it("accepts only MP4 and WebM headers, not renamed HTML or short files", () => {
  const mp4 = new Uint8Array([
    0, 0, 0, 12, 102, 116, 121, 112, 105, 115, 111, 109,
  ]);
  const webm = new Uint8Array([26, 69, 223, 163, 0, 0, 0, 0, 0, 0, 0, 0]);
  expect(videoHeaderValid(mp4, "video/mp4")).toBe(true);
  expect(videoHeaderValid(webm, "video/webm")).toBe(true);
  expect(videoHeaderValid(webm, "video/mp4")).toBe(false);
  expect(videoHeaderValid(mp4, "video/webm")).toBe(false);
  expect(
    videoHeaderValid(
      new TextEncoder().encode("<html>fixture</html>"),
      "video/mp4",
    ),
  ).toBe(false);
  expect(videoHeaderValid(mp4.slice(0, 5), "video/mp4")).toBe(false);
});
