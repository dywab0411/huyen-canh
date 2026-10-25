import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const legacy = JSON.parse(
  readFileSync("tests/fixtures/reading-v1.json", "utf8"),
) as { sections: { title: string; body: string }[] };
test("HC-RPT-004 opens all original saved sections without recomputation", async ({
  page,
}) => {
  await page.goto("/tests/ui-harness.html?snapshot");
  await page.locator("summary").click();
  for (const s of legacy.sections) {
    await expect(
      page.getByRole("heading", { name: s.title, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(s.body, { exact: true })).toBeVisible();
  }
  await expect(
    page.getByText("Engine 1.0.0 · Dữ liệu 2026.10.25-v1", { exact: true }),
  ).toBeVisible();
});
const id = "20000000-0000-4000-8000-000000000001";
test("HC-RPT-005/006 payment acknowledgement cannot authorize publication, refresh and conflict require explicit retry", async ({
  page,
}) => {
  let version = 1;
  let conflict = false;
  const mutations: { path: string; version: number }[] = [];
  await page.route("**/api/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = route.request().postDataJSON();
    const order = {
      id,
      order_code: "HC0123456789AB",
      package_code: "G10",
      price_vnd: 10000,
      version,
      internal_state: version === 1 ? "awaiting_payment" : "paid",
    };
    if (path.endsWith("/orders"))
      return route.fulfill({
        json: {
          orders: [
            order,
            {
              ...order,
              id: "20000000-0000-4000-8000-000000000002",
              order_code: "HCABCDEFGHJKMN",
            },
          ],
        },
      });
    if (path.endsWith("/order-details"))
      return route.fulfill({
        json: {
          details: {
            name: "Fixture",
            gender: "Nam",
            birth_date: "2000-02-29",
            birth_hour: null,
          },
        },
      });
    mutations.push({ path, version: body.version });
    if (conflict) {
      version++;
      return route.fulfill({
        status: 409,
        json: {
          code: "ORDER_VERSION_CONFLICT",
          message: "Đơn đã thay đổi. Tải lại trước khi tiếp tục.",
        },
      });
    }
    version++;
    return route.fulfill({
      json: { message: "Đã lưu fixture", order: { ...order, version } },
    });
  });
  await page.goto("/tests/ui-harness.html");
  await page
    .getByRole("button", { name: "Tải tối đa 100 đơn gần nhất" })
    .click();
  await page.getByRole("button", { name: /^HC0123456789AB/ }).click();
  const pay = page.getByRole("checkbox", {
    name: "Tôi đã đối chiếu tiền",
    exact: false,
  });
  const publish = page.getByRole("checkbox", {
    name: "Tôi đã xem bản cuối",
    exact: false,
  });
  await pay.check();
  await page.getByRole("button", { name: "Xem bản khách đọc" }).click();
  await expect(publish).not.toBeChecked();
  await publish.check();
  await page
    .getByLabel("Nội dung văn bản thuần")
    .fill("Nội dung thay đổi cần duyệt lại.");
  await page.getByRole("button", { name: "Xem bản khách đọc" }).click();
  await expect(publish).not.toBeChecked();
  await page
    .getByLabel("Tham chiếu giao dịch (không chứa thông tin cá nhân)")
    .fill("SYNTHETIC-REF");
  await pay.check();
  await page
    .getByRole("button", { name: "Xác nhận nhận tiền", exact: true })
    .click();
  await expect(page.getByText(/VNĐ · v2/)).toBeVisible();
  await expect(pay).not.toBeChecked();
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByText(/VNĐ · v3/)).toBeVisible();
  expect(mutations.at(-1)?.version).toBe(2);
  conflict = true;
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByText(/VNĐ · v4/)).toBeVisible();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /thay đổi|xung đột/i })
      .first(),
  ).toBeVisible();
  expect(mutations).toHaveLength(3);
  await page.getByRole("button", { name: /^HCABCDEFGHJKMN/ }).click();
  await expect(pay).not.toBeChecked();
  await page.getByRole("button", { name: "Xem bản khách đọc" }).click();
  await expect(publish).not.toBeChecked();
});
test("HC-RPT-003 homepage and checkout consume server quote", async ({
  page,
}) => {
  await page.route("**/api/packages", (r) =>
    r.fulfill({
      json: {
        source: "server",
        packages: [
          {
            code: "G10",
            price_vnd: 12000,
            delivery_hours: null,
            version: 2,
            active: true,
          },
          {
            code: "G20",
            price_vnd: 22000,
            delivery_hours: null,
            version: 2,
            active: true,
          },
          {
            code: "G60",
            price_vnd: 62000,
            delivery_hours: null,
            version: 2,
            active: true,
          },
          {
            code: "G70",
            price_vnd: 72000,
            delivery_hours: null,
            version: 2,
            active: true,
          },
        ],
      },
    }),
  );
  await page.goto("/dich-vu");
  await expect(page.getByText("12.000đ", { exact: true })).toBeVisible();
  await page.goto("/dat-don?goi=G10");
  await expect(page.getByRole("option", { name: /12.000/ })).toHaveCount(1);
});
test("HC-RPT-015 consumed challenge cannot be reused and retry keeps idempotency key", async ({
  page,
}) => {
  let token = 0;
  const calls: Record<string, unknown>[] = [];
  await page.route("https://challenges.cloudflare.com/**", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `window.turnstile={render(el,o){window.fixtureCallback=o.callback;const b=document.createElement('button');b.type='button';b.textContent='Xác minh thử nghiệm';b.onclick=()=>o.callback('fixture-token-'+(++window.fixtureCounter));el.append(b);return 'widget';},reset(){window.fixtureCallback('');},remove(){}};window.fixtureCounter=0;`,
    }),
  );
  await page.route("**/api/config", (r) =>
    r.fulfill({
      json: { checkout_enabled: true, turnstile_site_key: "fixture" },
    }),
  );
  await page.route("**/api/packages", (r) =>
    r.fulfill({
      json: {
        source: "server",
        packages: [
          ["G10", 10000, null],
          ["G20", 20000, null],
          ["G60", 60000, null],
          ["G70", 70000, null],
        ].map(([code, price, hours]) => ({
          code,
          price_vnd: price,
          delivery_hours: hours,
          version: 1,
          active: true,
        })),
      },
    }),
  );
  await page.route("**/api/orders", async (r) => {
    const data = r.request().postDataJSON();
    calls.push(data);
    token++;
    await r.fulfill({
      status: 503,
      json: { message: "Lỗi giả lập sau xác minh token" },
    });
  });
  await page.goto("/dat-don");
  await page
    .getByLabel("Họ và tên người thứ nhất", { exact: true })
    .fill("Đặng Minh An");
  await page.getByLabel("Số điện thoại liên hệ").fill("0912345678");
  await page
    .getByLabel("Ghi chú thêm (tùy chọn)")
    .fill("Dữ liệu giả để kiểm thử");
  await page.getByLabel("Giới tính người thứ nhất").selectOption("Nam");
  await page
    .getByLabel("Ngày tháng năm sinh người thứ nhất")
    .fill("29/02/2000");
  await page.getByRole("button", { name: "Xác minh thử nghiệm" }).click();
  const submit = page.getByRole("button", {
    name: "Tạo đơn với giá đã hiển thị",
  });
  await submit.click();
  await expect(page.getByRole("status")).toContainText("Lỗi giả lập");
  await expect(submit).toBeDisabled();
  await page.getByRole("button", { name: "Xác minh thử nghiệm" }).click();
  await submit.click();
  await expect.poll(() => calls.length).toBe(2);
  expect(token).toBe(2);
  expect(calls[0].challenge).not.toBe(calls[1].challenge);
  expect(calls[0].idempotency_key).toBe(calls[1].idempotency_key);
});
