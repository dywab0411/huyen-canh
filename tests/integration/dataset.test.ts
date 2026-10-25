import { it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { tools } from "../../src/engine";
import { corpus } from "../../src/content/corpus";
it("ADM02 SQL owner-only validated dataset publish immutable", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select null::uuid$$;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);`,
    );
    for (const name of [
      "202610250001_initial.sql",
      "202610250002_consent.sql",
      "202610250003_operations.sql",
    ])
      await db.exec(
        readFileSync("supabase/migrations/" + name, "utf8").replace(
          "create extension if not exists pgcrypto;",
          "",
        ),
      );
    const owner = "10000000-0000-4000-8000-000000000001",
      editor = "10000000-0000-4000-8000-000000000002";
    await db.exec(
      `insert into auth.users values('${owner}'),('${editor}');insert into public.admin_members(user_id,role) values('${owner}','owner'),('${editor}','editor')`,
    );
    const content = Object.fromEntries(
      tools.map((t) => {
        const e = corpus[t[0]];
        return [
          t[0],
          {
            title: e.title,
            sections: [e.intro, e.strength, e.pause, e.practice],
          },
        ];
      }),
    );
    const call = (actor: string, value: unknown, publish: boolean) =>
      db.query(
        `select public.save_dataset($1,'test-v2',$2::jsonb,'Original project content','Project license',$3,'ignored-client-hash')`,
        [actor, JSON.stringify(value), publish],
      );
    await expect(call(editor, content, true)).rejects.toThrow();
    await expect(call(owner, {}, true)).rejects.toThrow();
    await call(owner, content, false);
    await call(owner, content, true);
    await expect(call(owner, content, true)).rejects.toThrow();
    expect(
      (await db.query(`select hash from public.dataset_versions`)).rows[0],
    ).toHaveProperty("hash");
  } finally {
    await db.close();
  }
}, 30000);
