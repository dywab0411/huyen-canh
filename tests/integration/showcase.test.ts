import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  owner: true,
  user: true,
  publicBucket: false,
  rows: [] as Record<string, unknown>[],
  fileValid: true,
  signs: [] as string[],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: state.user
            ? { id: "10000000-0000-4000-8000-000000000001" }
            : null,
        },
        error: state.user ? null : {},
      }),
    },
    storage: {
      getBucket: async () => ({
        data: { public: state.publicBucket, file_size_limit: 20971520 },
        error: null,
      }),
      from: () => ({
        createSignedUrl: async (key: string) => {
          state.signs.push(key);
          return {
            data: { signedUrl: "https://fixture.invalid/signed" },
            error: null,
          };
        },
        createSignedUploadUrl: async () => ({
          data: { signedUrl: "https://fixture.invalid/upload" },
          error: null,
        }),
        download: async () => ({
          data: new Blob([
            state.fileValid
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
      let op = "select",
        payload: Record<string, unknown> = {};
      const filters: ((r: Record<string, unknown>) => boolean)[] = [];
      const exec = () => {
        if (table === "admin_members")
          return { data: state.owner ? { role: "owner" } : null, error: null };
        if (op === "insert") {
          const row = {
            title: "",
            description: "",
            visibility: "hidden",
            validated: false,
            rights_confirmed: false,
            version: 1,
            created_at: "2026-10-28T00:00:00Z",
            deleted_at: null,
            ...payload,
          };
          state.rows.push(row);
          return { data: [row], error: null };
        }
        const rows = state.rows.filter((r) => filters.every((f) => f(r)));
        if (op === "update")
          for (const row of rows) Object.assign(row, payload);
        return { data: rows, error: null };
      };
      const q = {
        select: () => q,
        insert: (p: Record<string, unknown>) => {
          op = "insert";
          payload = p;
          return q;
        },
        update: (p: Record<string, unknown>) => {
          op = "update";
          payload = p;
          return q;
        },
        eq: (k: string, v: unknown) => {
          filters.push((r) => r[k] === v);
          return q;
        },
        is: (k: string, v: unknown) => {
          filters.push((r) => (r[k] ?? null) === v);
          return q;
        },
        order: () => q,
        limit: () => q,
        lt: () => q,
        single: async () => {
          const r = exec();
          return { ...r, data: Array.isArray(r.data) ? r.data[0] : r.data };
        },
        maybeSingle: async () => {
          const r = exec();
          return {
            ...r,
            data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          };
        },
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve(exec()).then(resolve),
      };
      return q;
    },
  }),
}));
import { onRequest } from "../../functions/api/showcase";
const env = {
  MANUAL_DELIVERY_ENABLED: "true",
  SUPABASE_URL: "https://fixture.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "fixture-secret",
  PUBLIC_ORIGIN: "https://site.test",
};
const jwt = (method = "password") =>
  `e30.${btoa(JSON.stringify({ amr: [{ method }] }))}.fixture`;
const run = (
  body: unknown,
  token: string | null = jwt(),
  origin = env.PUBLIC_ORIGIN,
) =>
  onRequest({
    request: new Request(env.PUBLIC_ORIGIN + "/api/showcase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify(body),
    }),
    env,
  });
const gallery = () =>
  onRequest({ request: new Request(env.PUBLIC_ORIGIN + "/api/showcase"), env });
const reserve = async () => {
  const r = await run({
    action: "reserve",
    request_id: crypto.randomUUID(),
    mime: "video/mp4",
    size: 12,
  });
  expect(r.status).toBe(200);
  return (await r.json()).id as string;
};
const save = (id: string, extra: Record<string, unknown> = {}) =>
  run({
    action: "save",
    id,
    version: 1,
    title: "Fixture video",
    description: "Safe invented content",
    visibility: "public",
    rights_confirmed: true,
    ...extra,
  });
beforeEach(() => {
  state.owner = true;
  state.user = true;
  state.publicBucket = false;
  state.rows = [];
  state.fileValid = true;
  state.signs = [];
});
it("denies anon, invalid session, editor and OAuth-only sessions", async () => {
  expect((await run({ action: "list" }, null)).status).toBe(401);
  state.user = false;
  expect((await run({ action: "list" })).status).toBe(401);
  state.user = true;
  state.owner = false;
  expect((await run({ action: "list" })).status).toBe(403);
  state.owner = true;
  expect((await run({ action: "list" }, jwt("oauth"))).status).toBe(403);
});
it("rejects wrong origin and unsafe size/type", async () => {
  expect(
    (await run({ action: "list" }, jwt(), "https://evil.test")).status,
  ).toBe(403);
  for (const patch of [{ size: 20971521 }, { mime: "text/html" }])
    expect(
      (
        await run({
          action: "reserve",
          request_id: crypto.randomUUID(),
          mime: "video/mp4",
          size: 12,
          ...patch,
        })
      ).status,
    ).toBe(400);
});
it("does not sign drafts and never exposes private keys or paths in public DTO", async () => {
  const id = await reserve();
  expect((await (await gallery()).json()).posts).toEqual([]);
  expect(state.signs).toEqual([]);
  expect((await save(id)).status).toBe(200);
  const r = await gallery();
  expect(r.status).toBe(200);
  const text = await r.text();
  expect(text).toContain("Fixture video");
  for (const privateField of [
    "object_key",
    "created_by",
    "request_id",
    "fixture-secret",
  ])
    expect(text).not.toContain(privateField);
});
it("requires explicit editorial rights and validates uploaded bytes", async () => {
  const id = await reserve();
  expect((await save(id, { rights_confirmed: false })).status).toBe(400);
  state.fileValid = false;
  expect((await save(id)).status).toBe(400);
  expect((await (await gallery()).json()).posts).toEqual([]);
});
it("keeps optimistic concurrency and hides/deletes without deleting storage", async () => {
  const id = await reserve();
  await save(id);
  expect((await save(id)).status).toBe(409);
  expect((await run({ action: "hide", id, version: 2 })).status).toBe(200);
  expect((await (await gallery()).json()).posts).toEqual([]);
  expect((await run({ action: "delete", id, version: 3 })).status).toBe(200);
  expect((await (await run({ action: "list" })).json()).videos).toEqual([]);
});
it("refuses uploads and signed playback when bucket is public", async () => {
  state.publicBucket = true;
  expect(
    (
      await run({
        action: "reserve",
        request_id: crypto.randomUUID(),
        mime: "video/mp4",
        size: 12,
      })
    ).status,
  ).toBe(503);
  expect(state.rows).toHaveLength(0);
});
