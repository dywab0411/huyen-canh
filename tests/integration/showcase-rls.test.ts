import { expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
it("015 protects drafts/client writes and preserves existing customer and paid orders", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);create table orders(id int,body text);insert into orders values(1,'paid-old');create table manual_deliveries(id int,body text);insert into manual_deliveries values(2,'private-old');",
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/202610280015_showcase_videos.sql",
        "utf8",
      ),
    );
    expect((await db.query("select body from orders")).rows).toEqual([
      { body: "paid-old" },
    ]);
    expect((await db.query("select body from manual_deliveries")).rows).toEqual(
      [{ body: "private-old" }],
    );
    expect(
      (
        await db.query(
          "select public from storage.buckets where id='showcase-videos'",
        )
      ).rows,
    ).toEqual([{ public: false }]);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      for (const sql of [
        "select * from showcase_videos",
        "delete from showcase_videos",
        "update showcase_videos set visibility='public'",
      ]) {
        await expect(db.query(sql)).rejects.toThrow();
      }
      await db.exec("reset role");
    }
    expect(
      (
        await db.query(
          "select relrowsecurity from pg_class where relname='showcase_videos'",
        )
      ).rows,
    ).toEqual([{ relrowsecurity: true }]);
    await db.exec(
      "insert into auth.users values('10000000-0000-4000-8000-000000000001')",
    );
    await expect(
      db.exec(
        "insert into showcase_videos(id,request_id,object_key,mime,expected_size,created_by,visibility,title) values(gen_random_uuid(),gen_random_uuid(),'fixture','video/mp4',12,'10000000-0000-4000-8000-000000000001','public','no-rights')",
      ),
    ).rejects.toThrow();
  } finally {
    await db.close();
  }
}, 30000);
