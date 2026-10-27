import { test, expect } from "@playwright/test";
test("account offers only admin credentials and never prefills a password", async ({
  page,
}) => {
  await page.goto("/tai-khoan");
  await expect(
    page.getByRole("heading", { name: "Đăng nhập quản trị", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đăng nhập bằng Google", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Tài khoản", { exact: true })).toBeVisible();
  const password = page.getByLabel("Mật khẩu", { exact: true });
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Thiết lập TOTP lần đầu" }),
  ).toHaveCount(0);
});
