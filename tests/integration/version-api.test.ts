import { it, expect, vi, beforeEach } from "vitest";
const state = vi.hoisted(() => ({
  role: "owner" as string | null,
  conflict: false,
  calls: [] as string[],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "10000000-0000-4000-8000-000000000001" } },
        error: null,
      }),
    },
    from: () => ({
      select() {
        return this;
      },
      eq() {
        return this;
      },
      single: async () => ({
        data: {
          id: "20000000-0000-4000-8000-000000000001",
          name: "Fixture",
          inputs: {
            birth_date: "2000-02-29",
            birth_hour: null,
            phone: "do-not-expose",
            notes: "private-extra",
          },
        },
        error: null,
      }),
      maybeSingle: async () => ({
        data: state.role ? { role: state.role } : null,
        error: null,
      }),
    }),
    rpc: async (name: string) => {
      state.calls.push(name);
      return state.conflict
        ? { data: null, error: { code: "40001" } }
        : { data: { version: 3 }, error: null };
    },
  }),
}));
import { onRequest } from "../../functions/api/[[path]]";
beforeEach(() => {
  state.role = "owner";
  state.conflict = false;
  state.calls = [];
});
async function request(body: unknown, aal = "aal2", path = "admin/draft") {
  return onRequest({
    request: new Request("https://local.test/api/" + path, {
      method: "POST",
      headers: {
        Origin: "https://local.test",
        "Content-Type": "application/json",
        Authorization:
          "Bearer fixture." + btoa(JSON.stringify({ aal })) + ".fixture",
      },
      body: JSON.stringify(body),
    }),
    env: {
      PUBLIC_ORIGIN: "https://local.test",
      SUPABASE_URL: "https://fixture.invalid",
      SUPABASE_SERVICE_ROLE_KEY: "synthetic-test",
      LOOKUP_PEPPER_V1: "synthetic-test",
    },
    params: {},
  });
}
const body = {
  order_id: "20000000-0000-4000-8000-000000000001",
  body: "Nội dung giả",
  version: 2,
};
it("HC-RPT-006 API requires expected version and returns fresh order DTO", async () => {
  expect((await request({ ...body, version: undefined })).status).toBe(400);
  const r = await request(body);
  expect(r.status).toBe(200);
  expect((await r.json()).order.version).toBe(3);
  expect(state.calls).toEqual(["write_result_versioned"]);
});
it("library admin API retains MFA and owner-only membership checks", async () => {
  expect((await request({}, "aal1", "admin/library-list")).status).toBe(403);
  state.role = "editor";
  expect((await request({}, "aal2", "admin/library-list")).status).toBe(403);
  state.role = null;
  expect((await request({}, "aal2", "admin/library-save")).status).toBe(403);
  expect(state.calls).toHaveLength(0);
});
it("HC-RPT-006 API exposes conflict explicitly without raw database detail", async () => {
  state.conflict = true;
  const r = await request(body);
  expect(r.status).toBe(409);
  expect((await r.json()).code).toBe("ORDER_VERSION_CONFLICT");
});
it("HC-RPT-006 version fix retains membership and MFA checks", async () => {
  expect((await request(body, "aal1")).status).toBe(403);
  state.role = null;
  expect((await request(body)).status).toBe(403);
  expect(state.calls).toHaveLength(0);
});

it("birth details endpoint requires membership+MFA and returns an explicit narrow DTO", async () => {
  expect(
    (await request({ order_id: body.order_id }, "aal1", "admin/order-details"))
      .status,
  ).toBe(403);
  state.role = null;
  expect(
    (await request({ order_id: body.order_id }, "aal2", "admin/order-details"))
      .status,
  ).toBe(403);
  state.role = "owner";
  const r = await request(
    { order_id: body.order_id },
    "aal2",
    "admin/order-details",
  );
  expect(r.status).toBe(200);
  const j = await r.json();
  expect(j.details.birth_date).toBe("2000-02-29");
  expect(j.details.birth_hour).toBe(null);
  expect(JSON.stringify(j)).not.toContain("private-extra");
  expect(JSON.stringify(j)).not.toContain("do-not-expose");
});
