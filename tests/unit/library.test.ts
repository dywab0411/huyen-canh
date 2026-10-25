import { it, expect } from "vitest";
import { postPayload } from "../../src/features/library/model";
const value = {
  title: "Ngày mới",
  body: "Lời gửi",
  category: "Câu chuyện",
  kind: "editorial",
  order_id: null,
  video_id: "30000000-0000-4000-8000-000000000001",
  cover_id: "30000000-0000-4000-8000-000000000002",
  rights_confirmed: true,
};
it("library payload rejects HTML, empty fields, unknown category and customer without order", () => {
  expect(postPayload.safeParse(value).success).toBe(true);
  for (const patch of [
    { title: "<img>" },
    { body: "" },
    { category: "unknown" },
    { kind: "customer" },
    { video_id: "https://untrusted.invalid/video.mp4" },
  ])
    expect(postPayload.safeParse({ ...value, ...patch }).success).toBe(false);
});
