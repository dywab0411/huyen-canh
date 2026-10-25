import { it, expect } from "vitest";
import { onRequest } from "../../functions/api/[[path]]";
import { onRequestGet as library } from "../../functions/api/library";
it("unconfigured public library returns empty data without negative/internal marketing text", async () => {
  const r = await library({ env: {} });
  expect(r.status).toBe(200);
  expect(r.headers.get("Cache-Control")).toBe("no-store");
  expect(await r.json()).toEqual({ posts: [] });
});
import { onRequestGet as packages } from "../../functions/api/packages";
it("HC-RPT-003 unconfigured public quote is explicitly a default, no-store and has no private fields", async () => {
  const r = await packages({ env: {} });
  expect(r.status).toBe(200);
  expect(r.headers.get("Cache-Control")).toBe("no-store");
  const body = await r.json();
  expect(body.source).toBe("defaults");
  expect(body.packages.map((p: { price_vnd: number }) => p.price_vnd)).toEqual([
    10000, 20000, 60000, 70000,
  ]);
  expect(Object.keys(body)).toEqual(["source", "packages"]);
});
it("unconfigured API fails closed, no-store, no body logs", async () => {
  const r = await onRequest({
    request: new Request("https://local.test/api/orders", {
      method: "POST",
      headers: {
        Origin: "https://local.test",
        "Content-Type": "application/json",
      },
      body: "{}",
    }),
    env: { PUBLIC_ORIGIN: "https://local.test" },
    params: {},
  });
  expect(r.status).toBe(503);
  expect(r.headers.get("Cache-Control")).toBe("no-store");
  expect(await r.text()).not.toContain("secret");
});
it("GET and foreign Origin rejected", async () => {
  const req = (method: string, origin: string) =>
    new Request("https://local.test/api/orders/lookup", {
      method,
      headers: { Origin: origin },
    });
  expect(
    (
      await onRequest({
        request: req("GET", "https://local.test"),
        env: {},
        params: {},
      })
    ).status,
  ).toBe(405);
  expect(
    (
      await onRequest({
        request: req("POST", "https://evil.test"),
        env: { PUBLIC_ORIGIN: "https://local.test" },
        params: {},
      })
    ).status,
  ).toBe(403);
});

it("unconfigured checkout reports precise safe blocker codes and never enables orders", async () => {
  const { onRequestGet } = await import("../../functions/api/config");
  const r = await onRequestGet({ env: {} });
  const j = await r.json();
  expect(j.checkout_enabled).toBe(false);
  expect(j.checkout_blockers).toEqual(
    expect.arrayContaining([
      "BACKEND_NOT_CONFIGURED",
      "CHECKOUT_FLAG_OFF",
      "CHALLENGE_NOT_CONFIGURED",
      "SECURITY_NOT_CONFIGURED",
    ]),
  );
});
