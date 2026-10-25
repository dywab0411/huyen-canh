import { test, expect } from "@playwright/test";
test("closed checkout shows a real local summary and nearby DEMO action without posting orders", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.goto("/dat-don?goi=G60");
  await page.getByLabel("Họ và tên người thứ nhất").fill("Người Thử Nghiệm");
  await page.getByLabel("Giới tính người thứ nhất").selectOption("Nam");
  await page
    .getByLabel("Ngày tháng năm sinh người thứ nhất")
    .fill("29/02/2000");
  await page
    .getByLabel("Giờ sinh người thứ nhất (HH:mm, tùy chọn)")
    .fill("09:37");
  await page.getByLabel("Số điện thoại liên hệ").fill("0912345678");
  await page.getByLabel("Ghi chú thêm (tùy chọn)").fill("Nội dung thử nghiệm");
  await page
    .getByRole("button", { name: "Xem trước yêu cầu", exact: true })
    .click();
  const preview = page.getByRole("region", { name: "Bản xem trước yêu cầu" });
  await expect(preview).toBeVisible();
  await expect(preview).toContainText("29/02/2000");
  await expect(preview).toContainText("09:37");
  await expect(preview).toContainText("60.000đ");
  await expect(preview).toContainText("Nội dung thử nghiệm");
  await expect(preview).toContainText("Chưa tạo đơn");
  await expect(
    preview.getByRole("link", { name: "Thử đặt đơn DEMO" }),
  ).toHaveAttribute("href", "/dat-don?demo=1&goi=G60");
  expect(posts).toEqual([]);
  await page.getByLabel("Ghi chú thêm (tùy chọn)").fill("Đã sửa");
  await expect(preview).toHaveCount(0);
});
