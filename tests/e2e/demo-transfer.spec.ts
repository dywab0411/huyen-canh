import { test, expect } from "@playwright/test";
test("demo transfer remains actionable after first click and clearly leads to lookup without real payment", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.goto("/dat-don?demo=1&goi=G20");
  await page
    .getByLabel("Ngày tháng năm sinh người thứ nhất")
    .fill("29/02/2000");
  await page
    .getByRole("button", { name: "Tạo đơn DEMO · không gửi đơn thật" })
    .click();
  const code = await page
    .getByLabel("Mã tra cứu DEMO", { exact: true })
    .inputValue();
  await page
    .getByRole("button", {
      name: "Giả lập báo chuyển khoản · không thanh toán",
    })
    .click();
  const again = page.getByRole("button", {
    name: "Xem lại thông báo chuyển khoản DEMO",
  });
  await expect(again).toBeEnabled();
  await expect(
    page.getByText("Đã ghi nhận thông báo chuyển khoản DEMO.", { exact: true }),
  ).toBeVisible();
  await again.click();
  await expect(page.getByRole("status")).toContainText("đã được ghi nhận");
  await expect(
    page.getByRole("link", { name: "Tra cứu DEMO bằng mã vừa nhận →" }),
  ).toBeVisible();
  expect(
    JSON.parse(
      (await page.evaluate(() => sessionStorage.getItem("hc-local-demo-v1")))!,
    )[0].stage,
  ).toBe("claimed");
  await page
    .getByRole("link", { name: "Tra cứu DEMO bằng mã vừa nhận →" })
    .click();
  await page.getByLabel("Mã tra cứu DEMO", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Mở bản ghi DEMO" }).click();
  await page.getByRole("button", { name: "Giả lập trả kết quả mẫu" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Kết quả mẫu DEMO · không phải bài dành riêng",
    }),
  ).toBeVisible();
  expect(posts).toEqual([]);
});
