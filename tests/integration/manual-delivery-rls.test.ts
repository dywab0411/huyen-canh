import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("migration 014 preserves old data, denies client table access and uses a private bucket", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);create table public.orders(id int,body text);insert into public.orders values(1,'old paid result');",
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/202610280014_manual_delivery.sql",
        "utf8",
      ),
    );
    expect((await db.query("select body from public.orders")).rows).toEqual([
      { body: "old paid result" },
    ]);
    expect(
      (
        await db.query(
          "select public from storage.buckets where id='manual-results'",
        )
      ).rows,
    ).toEqual([{ public: false }]);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await expect(
        db.query("select * from public.manual_deliveries"),
      ).rejects.toThrow();
      await expect(
        db.exec("delete from public.manual_deliveries"),
      ).rejects.toThrow();
      await expect(
        db.query("select * from public.manual_delivery_uploads"),
      ).rejects.toThrow();
      await db.exec("reset role");
    }
    const rows = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where relname in ('manual_deliveries','manual_delivery_uploads')",
    );
    expect(rows.rows.every((r) => r.relrowsecurity)).toBe(true);
  } finally {
    await db.close();
  }
}, 30000);
