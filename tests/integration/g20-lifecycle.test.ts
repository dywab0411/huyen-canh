import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { expect, it } from "vitest";

it("G20 isolated database lifecycle: quote, idempotency, claim, payment, draft, publish and private lookup", async () => {
  const db = new PGlite();
  const actor = "10000000-0000-4000-8000-000000000001";
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);insert into auth.users values('${actor}');`,
    );
    for (const file of readdirSync("supabase/migrations")
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(
        readFileSync("supabase/migrations/" + file, "utf8").replace(
          "create extension if not exists pgcrypto;",
          "",
        ),
      );
    // Only this disposable in-memory database gets synthetic admin/release data.
    await db.query(
      "insert into public.admin_members(user_id,role) values($1,'owner')",
      [actor],
    );
    const inputs = JSON.stringify({
      gender: "Nam",
      birth_date: "2000-02-29",
      birth_hour: "00:00",
      age_band: "unknown",
      photo_consent: false,
    });
    const create = () =>
      db.query<{ v: { created: boolean; price_vnd: number } }>(
        `select public.create_order_v2((select version from public.service_packages where code='G20'),'90000000-0000-4000-8000-000000000020',null,'HC000000000020',repeat('a',64),repeat('b',64),'+84912345678','fixture-phone','G20','Fictional local fixture',$1::jsonb) v`,
        [inputs],
      );
    await expect(create()).rejects.toThrow();
    await db.exec(
      "update public.site_config set refund_policy='Synthetic policy for isolated database test',retention_approved=true,release_verified=true",
    );
    expect((await create()).rows[0].v).toMatchObject({
      created: true,
      price_vnd: 20000,
    });
    expect((await create()).rows[0].v).toEqual({ created: false });
    const id = (await db.query<{ id: string }>("select id from public.orders"))
      .rows[0].id;
    const state = async () =>
      (
        await db.query<{
          version: number;
          internal_state: string;
          price_vnd: number;
        }>(
          "select version,internal_state,price_vnd from public.orders where id=$1",
          [id],
        )
      ).rows[0];
    let n = 0;
    const lookup = async (digest = "b".repeat(64)) =>
      (
        await db.query<{
          v: null | {
            order_code: string;
            price_vnd: number;
            result: null | { body: string; revision: number };
          };
        }>("select public.lookup_order_access($1,$2,$3) v", [
          digest,
          `fixture-session-${++n}`,
          `fixture-csrf-${n}`,
        ])
      ).rows[0].v;
    expect(await lookup("HC000000000020")).toBeNull();
    expect(await lookup("0".repeat(64))).toBeNull();
    expect((await lookup())?.result).toBeNull();
    await db.query("select public.claim_transfer($1)", [id]);
    await db.query("select public.claim_transfer($1)", [id]);
    expect((await state()).internal_state).toBe("payment_claimed");
    expect(
      (
        await db.query(
          "select * from public.payment_events where kind='claimed'",
        )
      ).rows,
    ).toHaveLength(1);
    const body = "Synthetic local result. ".repeat(180);
    const result = async (publish: boolean, version?: number) =>
      db.query("select public.write_result_versioned($1,$2,$3,$4,$5)", [
        actor,
        id,
        version ?? (await state()).version,
        body,
        publish,
      ]);
    await expect(result(true)).rejects.toThrow();
    const beforePayment = (await state()).version;
    await expect(
      db.query(
        "select public.confirm_payment_versioned($1,$2,$3,10000,'LOCAL-ONLY-REFERENCE','fixture')",
        [actor, id, beforePayment],
      ),
    ).rejects.toThrow();
    const pay = () =>
      db.query(
        "select public.confirm_payment_versioned($1,$2,$3,20000,'LOCAL-ONLY-REFERENCE','fixture')",
        [actor, id, beforePayment],
      );
    await pay();
    await pay();
    expect((await state()).internal_state).toBe("paid");
    expect((await lookup())?.result).toBeNull();
    await result(false);
    expect((await lookup())?.result).toBeNull();
    await expect(result(true, beforePayment)).rejects.toThrow();
    await result(true);
    const delivered = await lookup();
    expect(delivered).toMatchObject({
      order_code: "HC000000000020",
      price_vnd: 20000,
      result: { body },
    });
    expect(JSON.stringify(delivered)).not.toContain("fixture-phone");
    expect(JSON.stringify(delivered)).not.toContain("2000-02-29");
    expect((await state()).internal_state).toBe("delivered");
    expect((await state()).price_vnd).toBe(20000);
    expect(
      (
        await db.query(
          "select * from public.payment_events where kind='verified'",
        )
      ).rows,
    ).toHaveLength(1);
  } finally {
    await db.close();
  }
}, 30000);
