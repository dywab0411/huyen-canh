import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
const db = new PGlite(),
  owner = "10000000-0000-4000-8000-000000000001",
  user = "10000000-0000-4000-8000-000000000002",
  legacy = "20000000-0000-4000-8000-000000000001";
let legacySnapshot: unknown;
let order: string;
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);insert into auth.users values('${owner}'),('${user}')`,
  );
  for (const file of readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql") && f < "202610250011")
    .sort())
    await db.exec(
      readFileSync("supabase/migrations/" + file, "utf8").replace(
        "create extension if not exists pgcrypto;",
        "",
      ),
    );
  await db.exec(
    `insert into public.admin_members(user_id,role) values('${owner}','owner');insert into public.orders(id,idempotency_key,order_code,package_code,price_vnd,delivery_hours,package_version,name,phone_e164,phone_lookup_hmac,inputs) values('${legacy}',gen_random_uuid(),'HC000000000001','G50',50000,72,1,'Fictional legacy','+84912345678','legacy-phone','{"age_band":"18+","birth_hour":"09"}');insert into public.order_credentials(order_id,secret_digest) values('${legacy}',repeat('a',64));`,
  );
  legacySnapshot = (await db.query("select to_jsonb(o) v from public.orders o"))
    .rows;
  await db.exec(
    readFileSync(
      "supabase/migrations/202610250011_visible_orders_v2.sql",
      "utf8",
    ),
  );
  await db.exec(
    readFileSync("supabase/migrations/202610250012_order_birth.sql", "utf8"),
  );
  await db.exec(
    readFileSync("supabase/migrations/202610250013_birth_minutes.sql", "utf8"),
  );
}, 30000);
afterAll(() => db.close());
it("migration preserves the entire legacy order snapshot and retires standalone G50 only for new sales", async () => {
  expect(
    (await db.query("select to_jsonb(o) v from public.orders o")).rows,
  ).toEqual(legacySnapshot);
  expect(
    (
      await db.query(
        "select code,price_vnd,delivery_hours from public.service_packages where active order by price_vnd",
      )
    ).rows,
  ).toEqual([
    { code: "G10", price_vnd: 10000, delivery_hours: null },
    { code: "G20", price_vnd: 20000, delivery_hours: null },
    { code: "G60", price_vnd: 60000, delivery_hours: null },
    { code: "G70", price_vnd: 70000, delivery_hours: null },
  ]);
});
async function create(
  code = "G70",
  digest = "b",
  key = "90000000-0000-4000-8000-000000000001",
  inputs: Record<string, unknown> = {
    gender: "Nam",
    birth_date: "2000-02-29",
    birth_hour: null,
    notes: "fixture",
    age_band: "unknown",
    photo_consent: false,
  },
) {
  const q = (
    await db.query<{ version: number }>(
      "select version from public.service_packages where code=$1",
      [code],
    )
  ).rows[0];
  return db.query<{ v: { created: boolean; price_vnd: number } }>(
    `select public.create_order_v2($1,$2,$3,'HC000000000002',repeat('c',64),$4,'+84912345678','fixture-phone',$5,'Fictional new',$6::jsonb) v`,
    [q.version, key, user, digest.repeat(64), code, JSON.stringify(inputs)],
  );
}
it("new order respects checkout gate then snapshots 70k/no SLA and same-key retry is idempotent", async () => {
  await expect(create()).rejects.toThrow();
  await db.exec(
    `update public.site_config set refund_policy='Fixture policy not live',retention_approved=true,release_verified=true`,
  );
  expect((await create()).rows[0].v).toMatchObject({
    created: true,
    price_vnd: 70000,
  });
  expect((await create()).rows[0].v).toEqual({ created: false });
  order = (
    await db.query<{ id: string }>(
      `select id from public.orders where order_code='HC000000000002'`,
    )
  ).rows[0].id;
  expect(
    (
      await db.query(
        "select price_vnd,delivery_hours from public.orders where id=$1",
        [order],
      )
    ).rows[0],
  ).toEqual({ price_vnd: 70000, delivery_hours: null });
});
it("one-field lookup rejects public/guessed codes without creating a session and does not expose draft or PII", async () => {
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order_access(repeat('0',64),'bad-session','bad-csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  const r = (
    await db.query<{ v: Record<string, unknown> }>(
      `select public.lookup_order_access(repeat('b',64),'session-a','csrf-a') v`,
    )
  ).rows[0].v;
  expect(r.result).toBeNull();
  expect(Object.keys(r).sort()).toEqual([
    "attachments",
    "order_code",
    "package_code",
    "price_vnd",
    "result",
  ]);
  expect(JSON.stringify(r)).not.toContain("Fictional new");
  expect(JSON.stringify(r)).not.toContain("84912345678");
  expect(
    (
      await db.query(
        `select id from public.lookup_sessions where token_digest='bad-session'`,
      )
    ).rows,
  ).toHaveLength(0);
});
it("G60/G70 publish still requires received money, 501 words and a released private MP4", async () => {
  await db.query(`update public.orders set internal_state='paid' where id=$1`, [
    order,
  ]);
  await expect(
    db.query(
      `select public.write_result_versioned($1,$2,1,repeat('từ ',501),true)`,
      [owner, order],
    ),
  ).rejects.toThrow();
  await db.query(
    `insert into public.attachments(order_id,storage_key,bucket,mime,size,checksum,classification,release_state) values($1,'fixture-private-video','private-results','video/mp4',123,repeat('d',64),'private_result','released')`,
    [order],
  );
  await db.query(
    `select public.write_result_versioned($1,$2,1,repeat('từ ',501),true)`,
    [owner, order],
  );
  const r = (
    await db.query<{ v: { result: { body: string } } }>(
      `select public.lookup_order_access(repeat('b',64),'session-published','csrf-published') v`,
    )
  ).rows[0].v;
  expect(r.result.body.trim().split(/\s+/u)).toHaveLength(501);
});
it("legacy three-factor lookup remains valid and an authenticated legacy order can upgrade only once", async () => {
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order('HC000000000001','legacy-phone',repeat('a',64),'legacy-session','legacy-csrf') v`,
      )
    ).rows[0].v,
  ).not.toBeNull();
  await db.query(`select public.upgrade_order_access($1,repeat('e',64))`, [
    legacy,
  ]);
  await expect(
    db.query(`select public.upgrade_order_access($1,repeat('d',64))`, [legacy]),
  ).rejects.toMatchObject({ code: "40001" });
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order_access(repeat('e',64),'upgraded-session','upgraded-csrf') v`,
      )
    ).rows[0].v,
  ).not.toBeNull();
});
it("verified reset revokes old access, old legacy secret and every existing lookup session", async () => {
  await db.query(
    `select public.reset_order_access($1,$2,repeat('f',64),repeat('9',64),'Fictional verified recovery reason')`,
    [owner, legacy],
  );
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order_access(repeat('e',64),'old-new','old-csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.resolve_lookup('legacy-session','legacy-csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order('HC000000000001','legacy-phone',repeat('a',64),'retry-old','retry-csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order_access(repeat('f',64),'reset-session','reset-csrf') v`,
      )
    ).rows[0].v,
  ).not.toBeNull();
});
it("photo needs explicit private-photo permission and 18+; unknown age is not silently treated as adult", async () => {
  await expect(
    db.query(
      `select public.reserve_customer_photo($1,gen_random_uuid(),'image/png',100)`,
      [order],
    ),
  ).rejects.toThrow();
  await db.query(
    `update public.orders set inputs=inputs||'{"age_band":"18+"}' where id=$1`,
    [order],
  );
  await expect(
    db.query(
      `select public.reserve_customer_photo($1,gen_random_uuid(),'image/png',100)`,
      [order],
    ),
  ).rejects.toThrow();
  await db.query(`select public.photo_permission($1,true)`, [order]);
  await db.query(
    `select public.reserve_customer_photo($1,gen_random_uuid(),'image/png',100)`,
    [order],
  );
  expect(
    (
      await db.query(
        `select bucket,classification,release_state from public.attachments where order_id=$1 and classification='source'`,
        [order],
      )
    ).rows,
  ).toEqual([
    {
      bucket: "source-photos",
      classification: "source",
      release_state: "quarantine",
    },
  ]);
  await db.query(`select public.photo_permission($1,false)`, [order]);
  await expect(
    db.query(
      `select public.reserve_customer_photo($1,gen_random_uuid(),'image/png',100)`,
      [order],
    ),
  ).rejects.toThrow();
});
it("anonymous/authenticated callers cannot directly invoke access or photo RPCs; API requires session CSRF", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    try {
      await expect(
        db.query(
          `select public.lookup_order_access(repeat('b',64),'forged','forged')`,
        ),
      ).rejects.toThrow();
      await expect(
        db.query(`select public.upgrade_order_access($1,repeat('1',64))`, [
          order,
        ]),
      ).rejects.toThrow();
      await expect(
        db.query(
          `select public.reserve_customer_photo($1,gen_random_uuid(),'image/png',1)`,
          [order],
        ),
      ).rejects.toThrow();
    } finally {
      await db.exec("reset role");
    }
  }
});

it("database rejects missing/impossible/future birth dates and invalid HH independently of frontend", async () => {
  for (const p of [
    {},
    { birth_date: "2001-02-29" },
    { birth_date: "9999-01-01" },
    { birth_date: "2000-01-01", birth_hour: "24" },
    { birth_date: "2000-01-01", name2: "Fixture" },
  ])
    await expect(
      db.query("select public.validate_order_birth($1::jsonb)", [
        JSON.stringify(p),
      ]),
    ).rejects.toThrow();
  await db.query("select public.validate_order_birth($1::jsonb)", [
    JSON.stringify({
      birth_date: "2000-02-29",
      birth_hour: null,
      name2: "Fixture",
      birth_date2: "1999-01-12",
      birth_hour2: "00:00",
    }),
  ]);
});
it("birth data stays private: stored null hour, no backfill and published lookup omits birth details", async () => {
  const rows = (
    await db.query<{ inputs: { birth_date: string; birth_hour: null } }>(
      "select inputs from public.orders where id=$1",
      [order],
    )
  ).rows;
  expect(rows[0].inputs.birth_date).toBe("2000-02-29");
  expect(rows[0].inputs.birth_hour).toBe(null);
  expect(
    (
      await db.query(
        "select inputs ? 'birth_date' as has from public.orders where id=$1",
        [legacy],
      )
    ).rows[0],
  ).toEqual({ has: false });
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    try {
      await expect(
        db.query("select inputs from public.orders where id=$1", [order]),
      ).rejects.toThrow();
    } finally {
      await db.exec("reset role");
    }
  }
});

it("new SQL birth-hour validator preserves minutes and rejects hour-only submissions without rewriting legacy hours", async () => {
  for (const birth_hour of ["00:00", "09:37", "23:59", null])
    await db.query("select public.validate_order_birth($1::jsonb)", [
      JSON.stringify({ birth_date: "2000-01-01", birth_hour }),
    ]);
  for (const birth_hour of ["09", "24:00", "23:60", "9:30"])
    await expect(
      db.query("select public.validate_order_birth($1::jsonb)", [
        JSON.stringify({ birth_date: "2000-01-01", birth_hour }),
      ]),
    ).rejects.toThrow();
  expect(
    (
      await db.query(
        "select inputs->>'birth_hour' as hour from public.orders where id=$1",
        [legacy],
      )
    ).rows[0],
  ).toEqual({ hour: "09" });
});
