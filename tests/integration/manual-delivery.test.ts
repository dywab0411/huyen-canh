import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  uploads: [] as Record<string, unknown>[],
  owner: true,
  validUser: true,
  limited: false,
  videoValid: true,
  storageFailure: false,
  publicBucket: false,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: state.validUser
            ? { id: "10000000-0000-4000-8000-000000000001" }
            : null,
        },
        error: state.validUser ? null : { message: "bad" },
      }),
    },
    rpc: async () => ({ data: { allowed: !state.limited }, error: null }),
    storage: {
      getBucket: async () => ({
        data: { public: state.publicBucket, file_size_limit: 20971520 },
        error: null,
      }),
      from: () => ({
        createSignedUrl: async (key: string) =>
          state.storageFailure
            ? { data: null, error: {} }
            : {
                data: {
                  signedUrl:
                    "https://fixture.invalid/private/" + key + "?token=fixture",
                },
                error: null,
              },
        createSignedUploadUrl: async () => ({
          data: { token: "fixture-upload-token" },
          error: null,
        }),
        download: async () => ({
          data: new Blob([
            state.videoValid
              ? new Uint8Array([
                  0, 0, 0, 12, 102, 116, 121, 112, 105, 115, 111, 109,
                ])
              : new Uint8Array(12),
          ]),
          error: null,
        }),
      }),
    },
    from: (table: string) => {
      let operation = "select",
        payload: Record<string, unknown> = {};
      const filters: ((r: Record<string, unknown>) => boolean)[] = [];
      const execute = () => {
        if (table === "admin_members")
          return { data: state.owner ? { role: "owner" } : null, error: null };
        const store =
          table === "manual_deliveries" ? state.rows : state.uploads;
        if (operation === "insert") {
          if (
            table === "manual_deliveries" &&
            store.some((r) => r.request_id === payload.request_id)
          )
            return { data: null, error: { code: "23505" } };
          const row = {
            body: "",
            video_key: null,
            published: false,
            version: 1,
            created_at: new Date().toISOString(),
            deleted_at: null,
            ...payload,
          };
          store.push(row);
          return { data: row, error: null };
        }
        const matches = store.filter((r) => filters.every((f) => f(r)));
        if (operation === "update")
          for (const row of matches) Object.assign(row, payload);
        return { data: matches, error: null };
      };
      const q = {
        select: () => q,
        insert: (p: Record<string, unknown>) => {
          operation = "insert";
          payload = p;
          return q;
        },
        update: (p: Record<string, unknown>) => {
          operation = "update";
          payload = p;
          return q;
        },
        eq: (k: string, v: unknown) => {
          filters.push((r) => r[k] === v);
          return q;
        },
        is: (k: string, v: unknown) => {
          filters.push((r) => r[k] === v);
          return q;
        },
        lt: () => q,
        order: () => q,
        limit: () => q,
        single: async () => {
          const r = execute();
          return {
            ...r,
            data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          };
        },
        maybeSingle: async () => {
          const r = execute();
          return {
            ...r,
            data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          };
        },
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve(execute()).then(resolve),
      };
      return q;
    },
  }),
}));
import { onRequest } from "../../functions/api/delivery";
const env = {
  SUPABASE_URL: "https://fixture.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "fixture-server-only",
  PUBLIC_ORIGIN: "https://local.test",
  LOOKUP_PEPPER_V1: "fixture-pepper",
  MANUAL_DELIVERY_ENABLED: "true",
};
const jwt = (method = "password") =>
  `e30.${btoa(JSON.stringify({ amr: [{ method }] }))}.fixture`;
const request = (
  body: unknown,
  token: string | null = jwt(),
  origin = env.PUBLIC_ORIGIN,
) =>
  new Request(env.PUBLIC_ORIGIN + "/api/delivery", {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify(body),
  });
const run = (body: unknown, token: string | null = jwt()) =>
  onRequest({ request: request(body, token), env });
const create = async () => {
  const response = await run({
    action: "create",
    request_id: "20000000-0000-4000-8000-000000000001",
  });
  expect(response.status).toBe(200);
  return (await response.json()).order;
};
beforeEach(() => {
  state.rows = [];
  state.uploads = [];
  state.owner = true;
  state.validUser = true;
  state.limited = false;
  state.videoValid = true;
  state.storageFailure = false;
  state.publicBucket = false;
});
it("keeps disabled deployments and foreign origins closed", async () => {
  expect(
    (
      await onRequest({
        request: request({}),
        env: { ...env, MANUAL_DELIVERY_ENABLED: "false" },
      })
    ).status,
  ).toBe(503);
  expect(
    (await onRequest({ request: request({}, null, "https://evil.test"), env }))
      .status,
  ).toBe(403);
});
it("rejects anonymous, invalid token, Google-only session and non owner writes", async () => {
  expect((await run({ action: "create" }, null)).status).toBe(401);
  state.validUser = false;
  expect((await run({ action: "list" })).status).toBe(401);
  state.validUser = true;
  expect((await run({ action: "list" }, jwt("oauth"))).status).toBe(403);
  state.owner = false;
  expect((await run({ action: "list" })).status).toBe(403);
  expect(state.rows).toHaveLength(0);
});
it("creates unpredictable codes, retries without duplicate, hides drafts and returns only the matching saved content", async () => {
  const order = await create();
  expect(order.access_code).toMatch(/^HC-[A-Za-z0-9_-]{43}$/);
  expect((await create()).id).toBe(order.id);
  expect(state.rows).toHaveLength(1);
  expect(
    (await run({ action: "lookup", code: order.access_code }, null)).status,
  ).toBe(404);
  expect(
    (
      await run({
        action: "save",
        id: order.id,
        version: 1,
        body: "Lời dành riêng cho bạn",
        video_key: null,
      })
    ).status,
  ).toBe(200);
  const r = await run({ action: "lookup", code: order.access_code }, null);
  expect(r.headers.get("Cache-Control")).toBe("no-store");
  const result = await r.json();
  expect(result.body).toBe("Lời dành riêng cho bạn");
  expect(Object.keys(result).sort()).toEqual(["body", "video_url"]);
  expect(
    (await run({ action: "lookup", code: "HC-" + "x".repeat(43) }, null))
      .status,
  ).toBe(404);
});
it("enforces versions and soft deletion revokes lookup without deleting old paid orders", async () => {
  const o = await create();
  expect(
    (
      await run({
        action: "save",
        id: o.id,
        version: 1,
        body: "first",
        video_key: null,
      })
    ).status,
  ).toBe(200);
  expect(
    (
      await run({
        action: "save",
        id: o.id,
        version: 1,
        body: "stale",
        video_key: null,
      })
    ).status,
  ).toBe(409);
  expect(state.rows[0].body).toBe("first");
  expect((await run({ action: "delete", id: o.id, version: 1 })).status).toBe(
    409,
  );
  expect((await run({ action: "delete", id: o.id, version: 2 })).status).toBe(
    200,
  );
  expect(
    (await run({ action: "lookup", code: o.access_code }, null)).status,
  ).toBe(404);
});
it("reserves private uploads and rejects wrong order paths, missing uploads and invalid MP4 bytes", async () => {
  const o = await create();
  expect(
    (
      await run({
        action: "upload",
        id: o.id,
        size: 20971521,
        mime: "video/mp4",
      })
    ).status,
  ).toBe(400);
  const upload = await (
    await run({ action: "upload", id: o.id, size: 12, mime: "video/mp4" })
  ).json();
  expect(upload.key.startsWith(o.id + "/")).toBe(true);
  expect(
    (
      await run({
        action: "save",
        id: o.id,
        version: 1,
        body: "video",
        video_key: "other/path.mp4",
      })
    ).status,
  ).toBe(400);
  state.videoValid = false;
  expect(
    (
      await run({
        action: "save",
        id: o.id,
        version: 1,
        body: "video",
        video_key: upload.key,
      })
    ).status,
  ).toBe(400);
  state.videoValid = true;
  expect(
    (
      await run({
        action: "save",
        id: o.id,
        version: 1,
        body: "video",
        video_key: upload.key,
      })
    ).status,
  ).toBe(200);
  const result = await (
    await run({ action: "lookup", code: o.access_code }, null)
  ).json();
  expect(result.video_url).toContain("?token=fixture");
  expect(result).not.toHaveProperty("video_key");
});
it("limits public lookup and hides storage errors", async () => {
  const o = await create();
  await run({
    action: "save",
    id: o.id,
    version: 1,
    body: "fixture",
    video_key: null,
  });
  state.limited = true;
  expect(
    (await run({ action: "lookup", code: o.access_code }, null)).status,
  ).toBe(429);
});

it("refuses uploads when the bucket has been made public", async () => {
  const o = await create();
  state.publicBucket = true;
  expect(
    (await run({ action: "upload", id: o.id, size: 12, mime: "video/mp4" }))
      .status,
  ).toBe(503);
  expect(state.uploads).toHaveLength(0);
});
