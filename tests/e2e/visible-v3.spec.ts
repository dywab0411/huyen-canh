import { test, expect } from "@playwright/test";
import { defaults } from "../../src/lib/packages";
test("four visible plans, expanded home sections and no fixed SLA", async ({
  page,
}) => {
  await page.goto("/dich-vu");
  await expect(page.locator(".price")).toHaveText([
    "10.000đ",
    "20.000đ",
    "60.000đ",
    "70.000đ",
  ]);
  await expect(page.locator("main")).not.toContainText(
    /50\.000đ|G50|(?:24|48|72)\s*giờ/u,
  );
  await page.goto("/");
  for (const name of [
    "Vì sao chọn Huyền Cảnh?",
    "Mỗi lời gửi lại đều đáng được lắng nghe",
    "Điểm khác biệt của Huyền Cảnh",
    "Gỡ một chút băn khoăn",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  expect(await page.locator(".faq details").count()).toBeGreaterThanOrEqual(6);
  await expect(page.locator(".difference-grid a")).toHaveCount(6);
});
test("new form supports optional pair and optional photo with separate unticked rights", async ({
  page,
}) => {
  await page.goto("/dat-don");
  await expect(page.getByLabel("Họ và tên người thứ nhất")).toBeVisible();
  await expect(
    page.locator(
      "input[name=email],select[name=age_band],select[name=channel],input[name=service_processing]",
    ),
  ).toHaveCount(0);
  await page.getByLabel("Họ và tên người thứ nhất").fill("Đặng Minh An");
  await page.getByLabel("Giới tính người thứ nhất").selectOption("Nam");
  await page
    .getByLabel("Ngày tháng năm sinh người thứ nhất")
    .fill("29/02/2000");
  await page.getByLabel("Số điện thoại liên hệ").fill("0912345678");
  await page
    .getByRole("checkbox", { name: "Thêm người thứ hai (tùy chọn)" })
    .check();
  await expect(page.getByLabel("Họ và tên người thứ hai")).toHaveAttribute(
    "required",
    "",
  );
  await page.getByLabel("Họ và tên người thứ hai").fill("Nguyễn Bình Yên");
  await page.getByLabel("Giới tính người thứ hai").selectOption("Nữ");
  await page.getByLabel("Ngày tháng năm sinh người thứ hai").fill("12/01/1999");
  await page
    .getByLabel("Ảnh bàn tay hoặc khuôn mặt (tùy chọn)")
    .setInputFiles("public/assets/ho-sen-poster.png");
  const consent = page.getByRole("checkbox", {
    name: /Tôi xác nhận tôi và người nhận diện/,
  });
  await expect(consent).not.toBeChecked();
  await page
    .getByRole("button", { name: "Xem trước yêu cầu", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("quyền đồng ý riêng");
  await consent.check();
  await page
    .getByRole("button", { name: "Xem trước yêu cầu", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Đã xem trước yêu cầu hợp lệ",
  );
  await expect(
    page.getByRole("img", { name: /QR chuyển khoản Sacombank gốc/ }),
  ).toBeVisible();
  await expect(page.locator('a[href="tel:0343321608"]')).toBeVisible();
  await expect(page.locator('a[href="tel:0328026738"]')).toBeVisible();
});
test("new order shows separate payment reference and one-field capability; claimed transfer never asserts paid", async ({
  page,
}) => {
  const access = "HCX-" + "q".repeat(43);
  let payload: Record<string, unknown> = {};
  let claimed = false;
  await page.route("https://challenges.cloudflare.com/**", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: "window.turnstile={render(el,o){let b=document.createElement('button');b.type='button';b.textContent='Xác minh fixture';b.onclick=()=>o.callback('fixture-fresh');el.append(b);return 'one';},remove(){}}",
    }),
  );
  await page.route("**/api/config", (r) =>
    r.fulfill({
      json: { checkout_enabled: true, turnstile_site_key: "fixture" },
    }),
  );
  await page.route("**/api/packages", (r) =>
    r.fulfill({ json: { ...defaults, source: "server" } }),
  );
  await page.route("**/api/orders", async (r) => {
    payload = r.request().postDataJSON();
    await r.fulfill({
      status: 201,
      json: {
        created: true,
        order_code: "HC0123456789AB",
        access_code: access,
        price_vnd: 70000,
        expires_at: "2026-10-27T00:00:00Z",
        bank: {},
      },
    });
  });
  await page.route("**/api/orders/lookup-code", (r) =>
    r.fulfill({
      json: {
        order_code: "HC0123456789AB",
        csrf: "fixture-csrf",
        result: null,
      },
    }),
  );
  await page.route("**/api/orders/claim-transfer", (r) => {
    claimed = true;
    expect(r.request().headers()["x-csrf-token"]).toBe("fixture-csrf");
    return r.fulfill({
      json: { message: "Đã ghi nhận thông báo, chưa xác nhận đã nhận tiền." },
    });
  });
  await page.goto("/dat-don?goi=G70");
  await page.getByLabel("Họ và tên người thứ nhất").fill("Đặng Minh An");
  await page.getByLabel("Giới tính người thứ nhất").selectOption("Nam");
  await page
    .getByLabel("Ngày tháng năm sinh người thứ nhất")
    .fill("29/02/2000");
  await page
    .getByLabel("Giờ sinh người thứ nhất (HH:mm, tùy chọn)")
    .fill("09:37");
  await page.getByLabel("Số điện thoại liên hệ").fill("0912345678");
  await page.getByRole("button", { name: "Xác minh fixture" }).click();
  await page
    .getByRole("button", { name: "Tạo đơn với giá đã hiển thị" })
    .click();
  await expect(page.getByLabel("Mã đơn dùng khi chuyển khoản")).toHaveValue(
    "HC0123456789AB",
  );
  await expect(
    page.getByLabel("Mã bảo mật tra cứu · chỉ cấp một lần"),
  ).toHaveValue(access);
  expect(payload).toMatchObject({
    package_code: "G70",
    gender: "Nam",
    birth_date: "2000-02-29",
    birth_hour: "09:37",
    photo_consent: false,
    photo_adult: false,
  });
  for (const key of [
    "email",
    "channel",
    "age_band",
    "service_processing",
    "website_consent",
    "public_consent",
  ])
    expect(payload).not.toHaveProperty(key);
  await page
    .getByRole("button", { name: "Tôi đã chuyển khoản", exact: true })
    .click();
  await expect.poll(() => claimed).toBe(true);
  await expect(
    page.getByRole("status").filter({ hasText: "chưa xác nhận" }),
  ).toBeVisible();
  expect(page.url()).not.toContain(access);
  await expect(page.getByText("70.000đ", { exact: true })).toBeVisible();
});
test("lookup default has exactly one secret input; legacy flow stays separate and visible only by choice", async ({
  page,
}) => {
  await page.goto("/tra-cuu-cu");
  await expect(page.locator("main input:visible")).toHaveCount(1);
  await expect(
    page.getByLabel("Mã bảo mật tra cứu", { exact: true }),
  ).toHaveAttribute("type", "password");
  await page
    .locator("summary")
    .filter({ hasText: "Tra cứu đơn cũ trước khi có mã HCX" })
    .click();
  await expect(page.getByLabel("Mã đơn cũ", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Số điện thoại của đơn cũ")).toBeVisible();
  await expect(page.getByLabel("Mã bí mật cũ", { exact: true })).toBeVisible();
});
