import { test, expect } from "@playwright/test";
const id = "20000000-0000-4000-8000-000000000001",
  code = "HC-" + "x".repeat(43);
test("minimal account has only login fields, a short failure and no customer or setup forms", async ({
  page,
}) => {
  await page.route("**/api/admin-login", (r) =>
    r.fulfill({
      status: 401,
      json: { message: "provider detail must never be shown" },
    }),
  );
  await page.goto("/tai-khoan");
  await expect(page.getByLabel("Tài khoản", { exact: true })).toHaveValue(
    "admin",
  );
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill("fixture-wrong-password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Đăng nhập chưa thành công",
  );
  await expect(page.getByLabel("Mật khẩu", { exact: true })).toHaveValue("");
  await expect(page.locator("main input")).toHaveCount(2);
  await page.screenshot({
    path: "../.manual-simple-20261028/account-local.png",
  });
  await expect(page.locator("main")).not.toContainText(
    /Supabase|OAuth|TOTP|provider detail|Hồ sơ/,
  );
});
test("admin creates code, saves and edits text, lists and deletes a delivery with versions", async ({
  page,
}) => {
  let order: Record<string, unknown> | null = null;
  const actions: string[] = [];
  await page.route("**/api/delivery", async (route) => {
    const b = route.request().postDataJSON();
    actions.push(b.action);
    if (b.action === "list")
      return route.fulfill({ json: { orders: order ? [order] : [] } });
    if (b.action === "create") {
      order = {
        id,
        access_code: code,
        body: "",
        video_key: null,
        published: false,
        version: 1,
        created_at: "2026-10-28T00:00:00Z",
      };
      return route.fulfill({ json: { order } });
    }
    if (b.action === "save") {
      expect(b.version).toBe(order?.version);
      order = {
        ...order,
        body: b.body,
        video_key: b.video_key,
        published: true,
        version: b.version + 1,
      };
      return route.fulfill({ json: { order } });
    }
    if (b.action === "delete") {
      expect(b.version).toBe(order?.version);
      order = null;
      return route.fulfill({ json: { deleted: true } });
    }
    return route.fulfill({ status: 400, json: { message: "unexpected" } });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "Tạo mã đơn hàng tự động" }).click();
  await expect(page.getByLabel("Mã đơn hàng", { exact: true })).toHaveValue(
    code,
  );
  await page
    .getByLabel("Nội dung bài xem bói")
    .fill("Lời luận giải thử nghiệm tích cực.");
  await expect(page.getByLabel("Video MP4 (tối đa 20 MB)")).toHaveAttribute(
    "accept",
    "video/mp4,.mp4",
  );
  await page.getByRole("button", { name: "Lưu đơn hàng", exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Trạng thái đơn hàng" }),
  ).toContainText("Đã lưu đơn hàng");
  await page
    .getByLabel("Nội dung bài xem bói")
    .fill("Bản chỉnh sửa thử nghiệm.");
  await page.getByRole("button", { name: "Lưu đơn hàng", exact: true }).click();
  await expect(
    page.getByRole("status", { name: "Trạng thái đơn hàng" }),
  ).toContainText("Đã lưu đơn hàng");
  await page
    .getByRole("button", { name: "Tải lại danh sách", exact: true })
    .click();
  await expect(page.getByLabel("Nội dung bài xem bói")).toHaveValue(
    "Bản chỉnh sửa thử nghiệm.",
  );
  await page.screenshot({
    path: "../.manual-simple-20261028/admin-local-fixture.png",
  });
  await page.getByRole("button", { name: "Xóa đơn hàng", exact: true }).click();
  await page
    .getByRole("button", { name: "Xác nhận xóa đơn", exact: true })
    .click();
  await expect(
    page.getByText("Chưa có đơn hàng.", { exact: true }),
  ).toBeVisible();
  expect(actions.filter((a) => a === "save")).toHaveLength(2);
});
test("lookup needs only the secret code, shows escaped text and video, and clears previous content on edit", async ({
  page,
}) => {
  await page.route("**/api/delivery", async (route) => {
    const b = route.request().postDataJSON();
    return b.code === code
      ? route.fulfill({
          json: {
            body: "Lời luận giải thử nghiệm <script>không thực thi</script>",
            video_url: "/assets/ho-sen-demo.mp4",
          },
        })
      : route.fulfill({ status: 404, json: { message: "missing" } });
  });
  await page.goto("/tra-cuu");
  await expect(page.locator("main input")).toHaveCount(1);
  await page.getByLabel("Mã đơn hàng", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Xem kết quả", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kết quả dành cho bạn" }),
  ).toBeVisible();
  await expect(page.locator("main script")).toHaveCount(0);
  await expect(page.locator("video")).toHaveAttribute(
    "src",
    "/assets/ho-sen-demo.mp4",
  );
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.duration),
    )
    .toBe(36);
  await page.screenshot({
    path: "../.manual-simple-20261028/lookup-local-fixture.png",
  });
  expect(page.url()).not.toContain(code);
  await page.getByLabel("Mã đơn hàng", { exact: true }).fill("wrong");
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByRole("button", { name: "Xem kết quả", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Mã chưa đúng");
  await expect(
    page.getByRole("heading", { name: "Kết quả dành cho bạn" }),
  ).toHaveCount(0);
});
test("admin denied by server cannot see creation controls", async ({
  page,
}) => {
  await page.route("**/api/delivery", (r) =>
    r.fulfill({ status: 403, json: { message: "forbidden" } }),
  );
  await page.goto("/admin");
  await expect(page.getByRole("status")).toContainText("Chưa mở được");
  await expect(
    page.getByRole("button", { name: "Tạo mã đơn hàng tự động" }),
  ).toHaveCount(0);
});

test("password setup is separate from login and removes recovery fragments when no valid session exists", async ({
  page,
}) => {
  await page.goto(
    "/tai-khoan#type=recovery&access_token=fixture-not-real&refresh_token=fixture-not-real",
  );
  await expect(page).toHaveURL(/\/admin\/dat-mat-khau$/);
  await expect(
    page.getByRole("heading", { name: "Đặt mật khẩu quản trị" }),
  ).toBeVisible();
  await expect(page.getByLabel("Mật khẩu mới", { exact: true })).toHaveCount(0);
});
