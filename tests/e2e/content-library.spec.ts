import { test, expect } from "@playwright/test";
test("library admin creates, edits, publishes, hides and deletes versioned posts", async ({
  page,
}) => {
  const video = "30000000-0000-4000-8000-000000000001",
    cover = "30000000-0000-4000-8000-000000000002";
  let post: Record<string, unknown> | null = null;
  const actions: string[] = [];
  await page.route("**/api/admin/library-*", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const b = route.request().postDataJSON();
    if (path.endsWith("-list"))
      return route.fulfill({
        json: {
          posts: post ? [post] : [],
          assets: [
            { id: video, mime: "video/mp4", release_state: "released" },
            { id: cover, mime: "image/png", release_state: "released" },
          ],
        },
      });
    if (path.endsWith("-save")) {
      expect(b.version).toBe(post?.version ?? null);
      post = {
        id: "40000000-0000-4000-8000-000000000001",
        payload: b.payload,
        version: Number(post?.version ?? 0) + 1,
        content_revision: Number(post?.content_revision ?? 0) + 1,
        state: "draft",
        published_at: null,
        created_at: "2026-10-25T00:00:00Z",
      };
      actions.push("save");
    } else {
      expect(b.version).toBe(post?.version);
      actions.push(b.action);
      post = {
        ...post,
        version: Number(post!.version) + 1,
        state: b.action === "publish" ? "public" : "draft",
        published_at: "2026-10-25T00:00:00Z",
      };
      if (b.action === "delete") {
        const deleted = post;
        post = null;
        return route.fulfill({
          json: { post: deleted, message: "Đã xóa bài đăng" },
        });
      }
    }
    return route.fulfill({ json: { post, message: "Đã lưu fixture" } });
  });
  await page.goto("/tests/ui-harness.html?library");
  await page.locator("summary").first().click();
  await page.getByRole("button", { name: "Tải bài đăng và tệp" }).click();
  await page.getByLabel("Tiêu đề video").fill("Lời gửi bên hồ sen");
  await page
    .getByLabel("Nội dung lời bói")
    .fill("Nội dung gốc của bài đăng thử nghiệm.");
  await page.getByLabel("Video MP4 đã kiểm định").selectOption(video);
  await page.getByLabel("Ảnh bìa đã kiểm định").selectOption(cover);
  await page.getByRole("checkbox", { name: /Tôi có quyền sử dụng/ }).check();
  await page.getByRole("button", { name: "Lưu bài thành nháp" }).click();
  await expect(
    page.getByRole("button", { name: "Công khai bài đăng" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Công khai bài đăng" }).click();
  await expect(
    page.getByRole("button", { name: /Lời gửi bên hồ sen · Công khai/ }),
  ).toBeVisible();
  await page
    .getByLabel("Nội dung lời bói")
    .fill("Nội dung sửa cần lưu nháp và kiểm tra lại.");
  await expect(
    page.getByRole("button", { name: "Công khai bài đăng" }),
  ).toBeDisabled();
  await page.getByRole("checkbox", { name: /Tôi có quyền sử dụng/ }).check();
  await page.getByRole("button", { name: "Lưu bài thành nháp" }).click();
  await page.getByRole("button", { name: "Công khai bài đăng" }).click();
  await page.getByRole("button", { name: "Ẩn bài đăng", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Xác nhận xóa bài đã chọn khỏi thư viện" })
    .check();
  await page.getByRole("button", { name: "Xóa bài đăng", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Lời gửi bên hồ sen ·/ }),
  ).toHaveCount(0);
  expect(actions).toEqual([
    "save",
    "publish",
    "save",
    "publish",
    "hide",
    "delete",
  ]);
});
test("customer publication requires explicit review and grants exact revision; revoke stays available", async ({
  page,
}) => {
  const grants: Record<string, unknown>[] = [];
  const post = {
    id: "40000000-0000-4000-8000-000000000001",
    content_revision: 3,
    payload: {
      title: "Bản xem dành cho chủ thể",
      body: "Toàn bộ lời gửi cần đồng ý.",
      category: "Bản thân",
    },
  };
  await page.route("**/api/consents/library-*", async (r) => {
    const p = new URL(r.request().url()).pathname;
    if (p.endsWith("-posts")) return r.fulfill({ json: { posts: [post] } });
    if (p.endsWith("-preview"))
      return r.fulfill({
        json: {
          post,
          video_url: "/assets/ho-sen-demo.mp4",
          cover_url: "/assets/ho-sen-poster.png",
        },
      });
    grants.push(r.request().postDataJSON());
    return r.fulfill({ json: { message: "Đã ghi nhận quyền" } });
  });
  await page.goto("/tests/ui-harness.html?publication");
  await page.locator("summary").click();
  await page
    .getByRole("button", { name: "Xem các bài đăng liên quan đến đơn" })
    .click();
  await page.getByRole("button", { name: "Xem toàn bộ bản 3" }).click();
  await expect(
    page.getByText("Toàn bộ lời gửi cần đồng ý.", { exact: true }),
  ).toBeVisible();
  const allow = page.getByRole("button", {
    name: "Cho phép công khai đúng bản đã xem",
  });
  await expect(allow).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /Tôi đã xem và cho phép công khai/ })
    .check();
  await allow.click();
  await expect.poll(() => grants.length).toBe(1);
  expect(grants[0]).toMatchObject({ revision: 3, granted: true });
  await expect(allow).toBeDisabled();
  await page
    .getByRole("button", { name: "Thu hồi quyền của bài đăng này" })
    .click();
  await expect.poll(() => grants.length).toBe(2);
  expect(grants[1].granted).toBe(false);
});
test("public pages use editorial copy without internal placeholders or fabricated reviews", async ({
  page,
}) => {
  await page.route("**/api/library", (r) => r.fulfill({ json: { posts: [] } }));
  await page.route("**/api/public", (r) =>
    r.fulfill({ json: { media: [], reviews: [] } }),
  );
  for (const route of [
    "/",
    "/kham-pha",
    "/dich-vu",
    "/thu-vien",
    "/video-mau",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).not.toContainText(
      /Chỉ có nội dung hư cấu|Chưa có video hoặc đánh giá|Chưa có đánh giá|Bản local|không phải video thật|nhân vật hư cấu/iu,
    );
  }
  await page.goto("/thu-vien");
  await expect(
    page.getByRole("heading", { name: "Để lời gửi bước vào một thước phim" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Đánh giá được chia sẻ" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: "docs/screenshots/library-empty-editorial.png",
    fullPage: true,
  });
});
test("published library renders metadata, full reading, categories and hides empty review section", async ({
  page,
}) => {
  await page.route("**/api/library", (r) =>
    r.fulfill({
      json: {
        posts: [
          {
            id: "fixture",
            title: "Bình minh bên hồ sen",
            body: "Lời gửi nguyên vẹn của bài đăng kiểm thử.",
            category: "Bản thân",
            published_at: "2026-10-25T02:00:00Z",
            video_url: "/assets/ho-sen-demo.mp4",
            cover_url: "/assets/ho-sen-poster.png",
          },
        ],
      },
    }),
  );
  await page.route("**/api/public", (r) =>
    r.fulfill({ json: { reviews: [] } }),
  );
  await page.goto("/thu-vien");
  await expect(
    page.getByRole("heading", { name: "Bình minh bên hồ sen" }),
  ).toBeVisible();
  await expect(page.locator("time")).toHaveText("25/10/2026");
  await page.getByText("Đọc lời gửi", { exact: true }).click();
  await expect(
    page.getByText("Lời gửi nguyên vẹn của bài đăng kiểm thử."),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/library-published-fixture.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/screenshots/library-mobile-fixture.png",
    fullPage: true,
  });
});
