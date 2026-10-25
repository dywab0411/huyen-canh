import { test, expect } from "@playwright/test";
for (const mode of ["", "&demo=1"])
  test(
    "DD/MM/YYYY and HH:mm can be entered immediately " +
      (mode ? "DEMO" : "real"),
    async ({ page }) => {
      let payload: Record<string, unknown> = {};
      if (!mode) {
        await page.route("**/api/orders", async (route) => {
          payload = route.request().postDataJSON();
          return route.fulfill({
            status: 503,
            json: { message: "Synthetic not submitted" },
          });
        });
      }
      await page.goto("/dat-don?goi=G20" + mode);
      const date = page.getByLabel("Ngày tháng năm sinh người thứ nhất"),
        time = page.getByLabel("Giờ sinh người thứ nhất (HH:mm, tùy chọn)");
      await expect(date).toHaveAttribute("placeholder", "DD/MM/YYYY");
      await expect(time).toBeEnabled();
      await expect(time).toHaveValue("");
      await expect(time).toHaveAttribute("placeholder", "00:00");
      await date.fill("29022000");
      await expect(date).toHaveValue("29/02/2000");
      await expect(page.locator("input[name=birth_date]")).toHaveValue(
        "2000-02-29",
      );
      await time.fill("0937");
      await expect(time).toHaveValue("09:37");
      await page
        .getByRole("checkbox", { name: "Thêm người thứ hai (tùy chọn)" })
        .check();
      await page
        .getByLabel("Ngày tháng năm sinh người thứ hai")
        .fill("12011999");
      await page
        .getByLabel("Giờ sinh người thứ hai (HH:mm, tùy chọn)")
        .fill("0000");
      await expect(
        page.getByLabel("Ngày tháng năm sinh người thứ hai"),
      ).toHaveValue("12/01/1999");
      await expect(
        page.getByLabel("Giờ sinh người thứ hai (HH:mm, tùy chọn)"),
      ).toHaveValue("00:00");
      await page
        .getByRole("checkbox", {
          name: "Không rõ giờ sinh người thứ nhất",
          exact: true,
        })
        .check();
      await expect(time).toBeDisabled();
      await expect(time).toHaveValue("");
      await page
        .getByRole("checkbox", {
          name: "Không rõ giờ sinh người thứ nhất",
          exact: true,
        })
        .uncheck();
      await expect(time).toBeEnabled();
      await expect(time).toHaveValue("");
      await time.fill("23:59");
      if (mode) {
        await page
          .getByRole("button", { name: "Tạo đơn DEMO · không gửi đơn thật" })
          .click();
        await expect(
          page.getByLabel("Mã tra cứu DEMO", { exact: true }),
        ).toHaveValue(/^DEMO-/);
      } else expect(payload).toEqual({});
    },
  );
