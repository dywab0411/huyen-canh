import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { onRequest } from "../../functions/_middleware";
it("deploys manual delivery while keeping payment and legacy preview closed", () => {
  const config = readFileSync("wrangler.toml", "utf8");
  expect(config).toMatch(/MANUAL_DELIVERY_ENABLED\s*=\s*"true"/);
  expect(config).toMatch(/CHECKOUT_ENABLED\s*=\s*"false"/);
  expect(config).toMatch(/PUBLIC_PREVIEW_ONLY\s*=\s*"true"/);
});
it("enabled manual delivery reaches its own auth guard, paid APIs stay closed", async () => {
  for (const path of ["/api/delivery", "/api/orders", "/api/admin/session"]) {
    const next = vi.fn(
      async () => new Response("own-auth-guard", { status: 401 }),
    );
    const response = await onRequest({
      request: new Request("https://fixture.invalid" + path, {
        method: "POST",
      }),
      env: { PUBLIC_PREVIEW_ONLY: "true", MANUAL_DELIVERY_ENABLED: "true" },
      next,
    });
    expect(response.status).toBe(path === "/api/delivery" ? 401 : 403);
    expect(next.mock.calls.length).toBe(path === "/api/delivery" ? 1 : 0);
  }
});
