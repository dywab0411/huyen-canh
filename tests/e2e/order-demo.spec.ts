import { test, expect } from "@playwright/test";
const sentence1 =
  "Huyền Cảnh có thể sử dụng video hoạt hình được tạo từ đơn hàng để giới thiệu dịch vụ trên các nền tảng như TikTok, YouTube, Facebook";
const sentence2 =
  "Thông tin liên hệ như sdt của khách hàng sẽ được bảo mật tuyệt đối, sdt chỉ để gửi thông báo kết quả đến khách hàng, tuyệt đối không cung cấp dưới mọi hình thức.";
for (const code of ["G10", "G20", "G60", "G70"])
  test("DEMO isolated round trip " + code, async ({ page }) => {
    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() === "POST") posts.push(r.url());
    });
    await page.goto("/dat-don?demo=1&goi=" + code);
    await expect(
      page.getByRole("heading", { name: "Thử đặt đơn DEMO" }),
    ).toBeVisible();
    await expect(
      page.getByText("DEMO LOCAL · dữ liệu giả lập · không phải đơn thật"),
    ).toBeVisible();
    await page
      .getByLabel("Ngày tháng năm sinh người thứ nhất")
      .fill("29/02/2000");
    await page
      .getByRole("button", { name: "Tạo đơn DEMO · không gửi đơn thật" })
      .click();
    const access = await page
      .getByLabel("Mã tra cứu DEMO", { exact: true })
      .inputValue();
    expect(access).toMatch(/^DEMO-/);
    expect(page.url()).not.toContain(access);
    await page
      .getByRole("button", {
        name: "Giả lập báo chuyển khoản · không thanh toán",
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "không xác nhận đã nhận tiền thật",
    );
    const stored = await page.evaluate(() =>
      sessionStorage.getItem("hc-local-demo-v1"),
    );
    expect(stored).not.toContain("2000-02-29");
    expect(stored).not.toContain("Người Thử");
    await page
      .getByRole("link", { name: "Tra cứu DEMO bằng mã vừa nhận →" })
      .click();
    await page.getByLabel("Mã tra cứu DEMO", { exact: true }).fill(access);
    await page.getByRole("button", { name: "Mở bản ghi DEMO" }).click();
    await page.getByRole("button", { name: "Giả lập trả kết quả mẫu" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Kết quả mẫu DEMO · không phải bài dành riêng",
      }),
    ).toBeVisible();
    await expect(page.locator("video")).toHaveCount(
      ["G60", "G70"].includes(code) ? 1 : 0,
    );
    await page.reload();
    await page.getByLabel("Mã tra cứu DEMO", { exact: true }).fill(access);
    await page.getByRole("button", { name: "Mở bản ghi DEMO" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Kết quả mẫu DEMO · không phải bài dành riêng",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Xóa dữ liệu DEMO" }).click();
    await page.getByRole("button", { name: "Mở bản ghi DEMO" }).click();
    await expect(page.getByRole("status")).toContainText("không tồn tại");
    expect(posts).toEqual([]);
  });
test("birth UI and exact two-sentence video contract, no consent checkbox inside", async ({
  page,
}) => {
  await page.goto("/dat-don?goi=G60");
  await expect(page.locator(".video-terms p")).toHaveText([
    sentence1,
    sentence2,
  ]);
  await expect(page.locator(".video-terms input")).toHaveCount(0);
  await expect(
    page.getByLabel("Ngày tháng năm sinh người thứ nhất"),
  ).toHaveAttribute("required", "");
  await expect(
    page.getByLabel("Giờ sinh người thứ nhất (HH:mm, tùy chọn)"),
  ).toBeEnabled();
  await page
    .getByRole("checkbox", {
      name: "Không rõ giờ sinh người thứ nhất",
      exact: true,
    })
    .uncheck();
  await page
    .getByLabel("Giờ sinh người thứ nhất (HH:mm, tùy chọn)")
    .fill("24:00");
  expect(
    await page
      .getByLabel("Giờ sinh người thứ nhất (HH:mm, tùy chọn)")
      .evaluate((e: HTMLInputElement) => e.checkValidity()),
  ).toBe(false);
  await page
    .getByRole("checkbox", {
      name: "Không rõ giờ sinh người thứ nhất",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", { name: "Thêm người thứ hai (tùy chọn)" })
    .check();
  await expect(
    page.getByLabel("Ngày tháng năm sinh người thứ hai"),
  ).toHaveAttribute("required", "");
  await page.getByLabel("Gói dịch vụ").selectOption("G70");
  await expect(page.locator(".video-terms p")).toHaveText([
    sentence1,
    sentence2,
  ]);
  await page.getByLabel("Gói dịch vụ").selectOption("G20");
  await expect(page.locator(".video-terms")).toHaveCount(0);
  await page.goto("/");
  await expect(
    page.getByText("Dữ liệu của tôi có được chia sẻ công khai?", {
      exact: true,
    }),
  ).toHaveCount(0);
});
test("demo expiry and invalid codes fail closed", async ({ page }) => {
  await page.goto("/tra-cuu?demo=1");
  await page
    .getByLabel("Mã tra cứu DEMO", { exact: true })
    .fill("DEMO-invalid");
  await page.getByRole("button", { name: "Mở bản ghi DEMO" }).click();
  await expect(page.getByRole("status")).toContainText("không tồn tại");
  await page.evaluate(() =>
    sessionStorage.setItem(
      "hc-local-demo-v1",
      JSON.stringify([
        {
          code: "DEMO-00000000-0000-4000-8000-000000000001",
          access: "DEMO-00000000-0000-4000-8000-000000000002",
          pkg: "G10",
          price: 10000,
          expires: 1,
          stage: "sample",
        },
      ]),
    ),
  );
  await page
    .getByLabel("Mã tra cứu DEMO", { exact: true })
    .fill("DEMO-00000000-0000-4000-8000-000000000002");
  await page.getByRole("button", { name: "Mở bản ghi DEMO" }).click();
  await expect(page.getByRole("status")).toContainText("không tồn tại");
});
