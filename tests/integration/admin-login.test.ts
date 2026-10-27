import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  member: vi.fn(),
  getUser: vi.fn(),
  password: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    from: () => ({
      select: () => ({
        eq: () => ({ eq: () => ({ limit: mocks.member }) }),
      }),
    }),
    auth: {
      admin: { getUserById: mocks.getUser },
      signInWithPassword: mocks.password,
    },
  }),
}));
import { onRequest } from "../../functions/api/admin-login";
const env = {
  PUBLIC_ORIGIN: "https://local.test",
  SUPABASE_URL: "https://fixture.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "fixture-server-only",
  LOOKUP_PEPPER_V1: "fixture-pepper",
};
const req = (
  body: unknown = { username: "admin", password: "fixture-password" },
  origin = "https://local.test",
) =>
  new Request("https://local.test/api/admin-login", {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.1",
    },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rpc.mockResolvedValue({ data: { allowed: true }, error: null });
  mocks.member.mockResolvedValue({
    data: [{ user_id: "fixture-owner", role: "owner" }],
    error: null,
  });
  mocks.getUser.mockResolvedValue({
    data: { user: { email: "owner@example.invalid" } },
    error: null,
  });
  mocks.password.mockResolvedValue({
    data: {
      user: { id: "fixture-owner" },
      session: {
        access_token: "fixture-access",
        refresh_token: "fixture-refresh",
      },
    },
    error: null,
  });
});
it("fails closed for missing server config and foreign origin", async () => {
  expect((await onRequest({ request: req(), env: {} })).status).toBe(403);
  expect(
    (
      await onRequest({
        request: req(),
        env: { PUBLIC_ORIGIN: env.PUBLIC_ORIGIN },
      })
    ).status,
  ).toBe(503);
  expect(
    (await onRequest({ request: req(undefined, "https://evil.test"), env }))
      .status,
  ).toBe(403);
  expect(mocks.password).not.toHaveBeenCalled();
});
it("limits login attempts before checking credentials", async () => {
  mocks.rpc.mockResolvedValue({ data: { allowed: false }, error: null });
  expect((await onRequest({ request: req(), env })).status).toBe(429);
  expect(mocks.password).not.toHaveBeenCalled();
});
it("rejects non admin username and inactive membership without auth", async () => {
  expect(
    (
      await onRequest({
        request: req({ username: "customer", password: "fixture" }),
        env,
      })
    ).status,
  ).toBe(401);
  mocks.member.mockResolvedValue({ data: [], error: null });
  expect((await onRequest({ request: req(), env })).status).toBe(503);
  expect(mocks.password).not.toHaveBeenCalled();
});
it("rejects another identity even when provider returns a session", async () => {
  mocks.password.mockResolvedValue({
    data: { user: { id: "other" }, session: { access_token: "fixture" } },
    error: null,
  });
  const r = await onRequest({ request: req(), env });
  expect(r.status).toBe(401);
  expect(await r.text()).not.toContain("access_token");
});
it("returns only user session, no server key or email, without granting AAL2", async () => {
  const r = await onRequest({ request: req(), env });
  expect(r.status).toBe(200);
  expect(r.headers.get("Cache-Control")).toBe("no-store");
  const body = await r.text();
  expect(body).not.toContain(env.SUPABASE_SERVICE_ROLE_KEY);
  expect(body).not.toContain("owner@example.invalid");
  expect(body).not.toContain("aal2");
  expect(mocks.password).toHaveBeenCalledWith({
    email: "owner@example.invalid",
    password: "fixture-password",
  });
});
it("hides provider errors and rejects oversized payload", async () => {
  mocks.password.mockResolvedValue({
    data: {},
    error: { message: "sensitive-provider-detail" },
  });
  const r = await onRequest({ request: req(), env });
  expect(r.status).toBe(401);
  expect(await r.text()).not.toContain("sensitive-provider-detail");
  expect(
    (
      await onRequest({
        request: req({ username: "admin", password: "x".repeat(3000) }),
        env,
      })
    ).status,
  ).toBe(413);
});

it("fails closed when owner alias is ambiguous", async () => {
  mocks.member.mockResolvedValue({
    data: [
      { user_id: "one", role: "owner" },
      { user_id: "two", role: "owner" },
    ],
    error: null,
  });
  expect((await onRequest({ request: req(), env })).status).toBe(503);
  expect(mocks.password).not.toHaveBeenCalled();
});
