import { test, expect } from "@playwright/test";
test("admin shows separate order and library areas, edits library metadata and hides a video", async ({
  page,
}) => {
  const row = {
    id: "30000000-0000-4000-8000-000000000001",
    title: "Fixture library",
    description: "Invented description",
    visibility: "public",
    rights_confirmed: true,
    validated: true,
    version: 1,
    created_at: "2026-10-28T00:00:00Z",
  };
  await page.route("**/api/delivery", (r) =>
    r.fulfill({ json: { orders: [] } }),
  );
  await page.route("**/api/showcase", async (r) => {
    const b = r.request().postDataJSON();
    if (b.action === "list") return r.fulfill({ json: { videos: [row] } });
    expect(b.id).toBe(row.id);
    expect(b.version).toBe(row.version);
    if (b.action === "save") {
      row.title = b.title;
      row.version++;
    }
    if (b.action === "hide") {
      row.visibility = "hidden";
      row.version++;
    }
    return r.fulfill({ json: { video: row } });
  });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Quản lý đơn hàng", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Quản lý thư viện video", exact: true }),
  ).toBeVisible();
  await expect(page.locator('input[type="file"][multiple]')).toHaveAttribute(
    "accept",
    /webm/,
  );
  await page
    .getByRole("button", { name: "Fixture library", exact: true })
    .click();
  await page.getByLabel("Tiêu đề", { exact: true }).fill("Changed fixture");
  await expect(
    page.getByRole("checkbox", { name: /Tôi có quyền/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /Tôi có quyền/ }).check();
  await page
    .getByRole("button", { name: "Lưu chỉnh sửa", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Changed fixture", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ẩn video", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Hiển thị", exact: true }),
  ).toHaveValue("hidden");
});
test("gallery plays published video and renders description safely", async ({
  page,
}) => {
  await page.route("**/api/library", (r) => r.fulfill({ json: { posts: [] } }));
  await page.route("**/api/showcase", (r) =>
    r.fulfill({
      json: {
        posts: [
          {
            id: "fixture",
            title: "Fixture MP4",
            body: "<script>fixture</script>",
            category: "Thước phim",
            published_at: "2026-10-28T00:00:00Z",
            cover_url: "",
            video_url: "/assets/ho-sen-demo.mp4",
          },
        ],
      },
    }),
  );
  await page.goto("/thu-vien");
  const video = page.getByLabel("Fixture MP4", { exact: true });
  await expect(video).toBeVisible();
  await video.evaluate((element) => {
    (element as HTMLVideoElement).muted = true;
    (element as HTMLVideoElement).load();
  });
  await expect
    .poll(() => video.evaluate((e) => (e as HTMLVideoElement).readyState))
    .toBeGreaterThan(0);
  await page.getByText("Đọc lời gửi", { exact: true }).click();
  await expect(page.locator(".library-body")).toHaveText(
    "<script>fixture</script>",
  );
  await expect(page.locator("main script")).toHaveCount(0);
});
