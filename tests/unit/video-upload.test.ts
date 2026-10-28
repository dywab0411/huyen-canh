import { beforeEach, expect, it, vi } from "vitest";
vi.mock("../../src/lib/auth", () => ({ auth: {} }));
import { uploadVideo } from "../../src/lib/video-upload";
let fake: {
  upload: {
    onprogress:
      | ((e: {
          lengthComputable: boolean;
          loaded: number;
          total: number;
        }) => void)
      | null;
  };
  status: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  ontimeout: (() => void) | null;
  onabort: (() => void) | null;
  open: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  setRequestHeader: ReturnType<typeof vi.fn>;
};
beforeEach(() => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://fixture.supabase.co");
  fake = {
    upload: { onprogress: null },
    status: 200,
    onload: null,
    onerror: null,
    ontimeout: null,
    onabort: null,
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
  };
  vi.stubGlobal(
    "XMLHttpRequest",
    class {
      constructor() {
        return fake;
      }
    },
  );
});
it("reports actual upload progress and only completes on successful response", async () => {
  const progress = vi.fn();
  const p = uploadVideo(
    "https://fixture.supabase.co/storage/v1/object/upload/sign/bucket/path?token=fixture",
    new File(["fixture"], "fixture.mp4"),
    progress,
  );
  fake.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
  expect(progress).toHaveBeenLastCalledWith(50);
  fake.upload.onprogress?.({ lengthComputable: true, loaded: 10, total: 10 });
  expect(progress).toHaveBeenLastCalledWith(99);
  fake.onload?.();
  await p;
  expect(progress).toHaveBeenLastCalledWith(100);
});
it("rejects remote destinations before transmitting a video", async () => {
  await expect(
    uploadVideo(
      "https://evil.invalid/upload",
      new File(["fixture"], "fixture.mp4"),
      vi.fn(),
    ),
  ).rejects.toThrow();
  expect(fake.send).not.toHaveBeenCalled();
});
it("reports network failures without echoing storage response/token", async () => {
  const p = uploadVideo(
    "https://fixture.supabase.co/storage/v1/object/upload/sign/bucket/path?token=fixture",
    new File(["fixture"], "fixture.mp4"),
    vi.fn(),
  );
  fake.onerror?.();
  await expect(p).rejects.toThrow("Kết nối");
});
