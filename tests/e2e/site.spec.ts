import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { tools, reading } from "../../src/engine";
const fixture = {
  name: "Đặng Minh An",
  date: "2000-02-29",
  name2: "Nguyễn Bình Yên",
  date2: "1999-01-12",
  hour: "không rõ",
  hand: "Nét tay rõ",
  face: "Hay cười",
  trait: "Thích lắng nghe",
  trait2: "Thích lắng nghe",
  dream: "một giấc mơ với ký hiệu chưa biết <script>alert(1)</script>",
  space: "Góc nhỏ gần cửa sổ",
  topic: "Học tập",
};
for (const width of [360, 390, 768, 1024, 1440])
  test("responsive " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("tĩnh lặng");
    await expect(page.locator(".tool-card")).toHaveCount(12);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `docs/screenshots/home-${width}.png`,
      fullPage: true,
    });
  });
test("UI02 axe and keyboard", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("main")
    .evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeInViewport();
});
test("search without accents and prices", async ({ page }) => {
  await page.goto("/kham-pha");
  await page.getByRole("textbox", { name: "Tìm công cụ" }).fill("tinh duyen");
  await expect(page.locator(".tool-card")).toHaveCount(1);
  await page.goto("/dich-vu");
  for (const price of ["10.000đ", "20.000đ", "60.000đ", "70.000đ"])
    await expect(page.getByText(price, { exact: true })).toBeVisible();
});
for (const tool of tools)
  test(
    "reading offline, runtime equality " + tool[0],
    async ({ page, context }) => {
      await page.goto("/boi/" + tool[0]);
      for (const field of tool[4].split(",")) {
        const locator = page.locator(`[name="${field}"]`);
        if (await locator.evaluate((e) => e.tagName === "SELECT"))
          await locator.selectOption(fixture[field as keyof typeof fixture]);
        else await locator.fill(fixture[field as keyof typeof fixture]);
      }
      await context.setOffline(true);
      await page
        .getByRole("button", { name: "Mở lời gửi dành cho bạn" })
        .click();
      await expect(page.locator(".result")).toBeVisible();
      await page.getByRole("button", { name: "Bỏ qua hiệu ứng" }).click();
      const r = await reading(tool[0], fixture, "2026-10-25");
      await expect(page.locator(".result h2")).toHaveText(r.sections[0].title);
      await expect(page.locator(".score")).toContainText(String(r.score));
      expect(
        (await page.locator(".result section p").allTextContents())
          .join(" ")
          .split(/\s+/u).length,
      ).toBeGreaterThanOrEqual(501);
      await expect(page.locator(".result script")).toHaveCount(0);
      await expect(page.locator("input[type=checkbox]")).not.toBeChecked();
      if (tool[0] === "ngay-sinh") {
        await page.screenshot({
          path: "docs/screenshots/result-desktop.png",
          fullPage: true,
        });
        const dl = page.waitForEvent("download");
        await page.getByRole("button", { name: "Tải ảnh PNG" }).click();
        const image = await dl;
        await image.saveAs("docs/screenshots/share-default.png");
      }
      await page.screenshot({
        path: "docs/screenshots/" + tool[0] + "-desktop.png",
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.screenshot({
        path: "docs/screenshots/" + tool[0] + "-mobile-reduced.png",
        fullPage: true,
      });
      await context.setOffline(false);
    },
  );
test("reduced motion and mobile result", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/boi/giac-mo");
  await page.locator("[name=dream]").fill("Một hồ sen trong sương");
  await page.getByRole("button", { name: "Mở lời gửi dành cho bạn" }).click();
  await expect(page.locator(".reveal")).toBeHidden();
  expect(
    await page
      .locator("main")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  await page.screenshot({
    path: "docs/screenshots/result-mobile-reduced.png",
    fullPage: true,
  });
});
test("routes no dead links local checkout lock and video", async ({ page }) => {
  for (const route of [
    "/dat-don",
    "/tra-cuu",
    "/tai-khoan",
    "/admin",
    "/thu-vien",
    "/chinh-sach/rieng-tu",
    "/chinh-sach/dieu-khoan",
    "/chinh-sach/hoan-tien",
    "/chinh-sach/lien-he",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("/dat-don");
  await expect(
    page.getByText(
      "Nhận đơn thật đang khóa cho đến khi hệ thống được cấu hình và kiểm thử đầy đủ.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Tạo đơn với giá đã hiển thị",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Xem trước yêu cầu", exact: true }),
  ).toBeEnabled();
  expect(
    (await (await page.request.get("/api/config")).json()).checkout_enabled,
  ).toBe(false);
  await page.goto("/video-mau");
  await page.locator("video").evaluate((v: HTMLVideoElement) => v.play());
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.duration),
    )
    .toBe(36);
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: "docs/screenshots/video-playing.png" });
});

test("F02 byte-stable 100 times Node and browser each tool", async ({
  page,
}) => {
  await page.goto("/kham-pha");
  for (const tool of tools) {
    const expected = await reading(tool[0], fixture, "2026-10-25");
    const actual = await page.evaluate(
      async ({ id, input }) => {
        const path = "/src/engine/index.ts";
        const module = await import(path);
        const all = [];
        for (let i = 0; i < 100; i++)
          all.push(await module.reading(id, input, "2026-10-25"));
        return all;
      },
      { id: tool[0], input: fixture },
    );
    expect(actual).toHaveLength(100);
    for (const result of actual) expect(result).toEqual(expected);
  }
});
test("640px reflow simulating 200% desktop zoom, landscape and accessible forms", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const path of [
    "/boi/ngay-sinh",
    "/dat-don",
    "/tra-cuu",
    "/tai-khoan",
    "/admin",
  ]) {
    await page.goto(path);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .locator("main")
      .evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "docs/screenshots/" + path.replaceAll("/", "-") + "-landscape.png",
      fullPage: true,
    });
  }
});

test("motion override and music manual only", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("may-som.wav")) requests.push(r.url());
  });
  await page.goto("/");
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "♫ Bật nhạc", exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  await page.getByRole("button", { name: "♫ Tắt nhạc", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Chế độ hiệu ứng" })
    .selectOption("reduce");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.getByRole("link", { name: "Khám phá", exact: true }).click();
  expect(
    await page
      .locator("main")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  await page
    .getByRole("combobox", { name: "Chế độ hiệu ứng" })
    .selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "system");
});
