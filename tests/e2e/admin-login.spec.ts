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

test("fixed admin alias prevents typing a different account", async ({
  page,
}) => {
  await page.route("**/api/admin-login", async (route) => {
    await route.fulfill({ status: 401, json: { message: "fixture rejected" } });
  });
  await page.goto("/tai-khoan");
  const username = page.getByLabel("Tài khoản", { exact: true });
  await expect(username).toHaveValue("admin");
  await expect(username).not.toBeEditable();
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill("fixture-password-not-real");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Đăng nhập chưa thành công",
  );
  await expect(page.getByLabel("Mật khẩu", { exact: true })).toHaveValue("");
});
