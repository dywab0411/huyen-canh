import { it, expect, vi } from "vitest";
import { onRequest } from "../../functions/_middleware";
it("public preview denies all writes before any database or auth call", async () => {
  for (const path of [
    "/api/orders",
    "/api/orders/lookup-code",
    "/api/admin/session",
    "/api/orders/photo-reserve",
    "/api/consents/grant",
  ]) {
    const next = vi.fn();
    const r = await onRequest({
      request: new Request("https://preview.test" + path, {
        method: "POST",
        body: "{}",
      }),
      env: { PUBLIC_PREVIEW_ONLY: "true" },
      next,
    });
    expect(r.status).toBe(403);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect(next).not.toHaveBeenCalled();
  }
});
it("public preview read DTOs never use next even if cloud secrets might be set", async () => {
  for (const path of [
    "/api/config",
    "/api/packages",
    "/api/library",
    "/api/public",
  ]) {
    const next = vi.fn();
    const r = await onRequest({
      request: new Request("https://preview.test" + path),
      env: { PUBLIC_PREVIEW_ONLY: "true" },
      next,
    });
    expect(r.status).toBe(200);
    expect(next).not.toHaveBeenCalled();
    if (path.endsWith("/config"))
      expect((await r.json()).checkout_enabled).toBe(false);
  }
});
it("normal backend path retains existing guards through next", async () => {
  const next = vi.fn(async () => new Response("guarded"));
  await onRequest({
    request: new Request("https://stage.test/api/orders"),
    env: { PUBLIC_PREVIEW_ONLY: "false" },
    next,
  });
  expect(next).toHaveBeenCalledOnce();
});
it("private GET and unimplemented dataset fail closed, no fallback SPA data", async () => {
  for (const [path, status] of [
    ["/api/orders/lookup-code", 405],
    ["/api/dataset", 503],
  ] as const) {
    const next = vi.fn();
    const r = await onRequest({
      request: new Request("https://preview.test" + path),
      env: { PUBLIC_PREVIEW_ONLY: "true" },
      next,
    });
    expect(r.status).toBe(status);
    expect(next).not.toHaveBeenCalled();
  }
});
