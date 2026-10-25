import { PGlite } from "@electric-sql/pglite";
import { readFileSync, writeFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
const db = new PGlite();
const owner = "10000000-0000-4000-8000-000000000001",
  editor = "10000000-0000-4000-8000-000000000002",
  a = "10000000-0000-4000-8000-000000000003",
  b = "10000000-0000-4000-8000-000000000004";
const order = "20000000-0000-4000-8000-000000000001";
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);insert into auth.users values('${owner}'),('${editor}'),('${a}'),('${b}');`,
  );
  for (const file of [
    "202610250001_initial.sql",
    "202610250002_consent.sql",
    "202610250003_operations.sql",
    "202610250004_files.sql",
    "202610250005_release.sql",
    "202610250006_preview.sql",
    "202610250007_config.sql",
    "202610250008_retention_tasks.sql",
    "202610250009_local_fixes.sql",
    "202610250010_video_library.sql",
    "202610250011_visible_orders_v2.sql",
    "202610250012_order_birth.sql",
    "202610250013_birth_minutes.sql",
  ])
    await db.exec(
      readFileSync("supabase/migrations/" + file, "utf8").replace(
        "create extension if not exists pgcrypto;",
        "",
      ),
    );
  await db.exec(
    `insert into public.admin_members(user_id,role) values('${owner}','owner'),('${editor}','editor');insert into public.orders(id,idempotency_key,order_code,user_id,package_code,price_vnd,delivery_hours,package_version,name,phone_e164,phone_lookup_hmac,inputs) values('${order}',gen_random_uuid(),'HC0123456789AB','${a}','G10',10000,24,1,'Fictional test','+84912345678','phonehash','{"age_band":"18+"}');insert into public.order_credentials(order_id,secret_digest) values('${order}',repeat('a',64));`,
  );
}, 30000);
afterAll(async () => {
  await db.close();
});
it("HC-RPT-004 profiles and full snapshots remain restricted to their owner", async () => {
  await db.exec(
    `insert into public.profiles(user_id,display_name,age_band) values('${a}','Fixture A','18+'),('${b}','Fixture B','16-17');set role authenticated;set request.jwt.claim.sub='${a}'`,
  );
  try {
    expect(
      (await db.query("select display_name from public.profiles")).rows,
    ).toEqual([{ display_name: "Fixture A" }]);
    expect(
      (
        await db.query(
          `update public.profiles set display_name='attempt' where user_id='${b}' returning id`,
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.query(
        `insert into public.profiles(user_id,display_name) values('${b}','attempt') on conflict(user_id) do update set display_name='attempt'`,
      ),
    ).rejects.toThrow();
  } finally {
    await db.exec("reset role");
  }
  await db.exec("set role anon");
  try {
    await expect(db.query("select * from public.profiles")).rejects.toThrow();
    await expect(
      db.query("select * from public.reading_history"),
    ).rejects.toThrow();
  } finally {
    await db.exec("reset role");
  }
});
it("SEC01 every business table RLS enabled", async () => {
  const r = await db.query<{ relname: string; relrowsecurity: boolean }>(
    `select relname,relrowsecurity from pg_class join pg_namespace on pg_namespace.oid=relnamespace where nspname='public' and relkind='r'`,
  );
  expect(r.rows.length).toBeGreaterThan(18);
  expect(r.rows.every((t) => t.relrowsecurity)).toBe(true);
});
it("SEC01 anon direct orders and RPC denied", async () => {
  await db.exec("set role anon");
  try {
    await expect(db.query("select * from public.orders")).rejects.toThrow();
    await expect(db.query(`select public.expire_orders()`)).rejects.toThrow();
    const r = await db.query("select code from public.service_packages");
    expect(r.rows).toHaveLength(4);
  } finally {
    await db.exec("reset role");
  }
});
it("AUTH02 account A cannot read/update/delete B history", async () => {
  await db.exec(
    `insert into public.reading_history(user_id,tool,engine_version,dataset_version,snapshot) values('${b}','ngay-sinh','1','1','{}');set role authenticated;set request.jwt.claim.sub='${a}'`,
  );
  try {
    expect(
      (await db.query("select * from public.reading_history")).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          `update public.reading_history set tool='bad' returning id`,
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.query(
        `insert into public.reading_history(user_id,tool,engine_version,dataset_version,snapshot) values('${b}','x','1','1','{}')`,
      ),
    ).rejects.toThrow();
    await expect(
      db.query(
        `insert into public.admin_members(user_id,role) values('${a}','owner')`,
      ),
    ).rejects.toThrow();
  } finally {
    await db.exec("reset role");
  }
});
it("ORD04 same payment retry exactly one event, stale second confirm rejected", async () => {
  await db.query(
    `select public.confirm_payment($1,$2,1,10000,'TEST-REF-001','')`,
    [editor, order],
  );
  await db.query(
    `select public.confirm_payment($1,$2,1,10000,'TEST-REF-001','')`,
    [owner, order],
  );
  await expect(
    db.query(`select public.confirm_payment($1,$2,1,10000,'TEST-REF-002','')`, [
      owner,
      order,
    ]),
  ).rejects.toThrow();
  expect(
    (await db.query("select * from public.payment_events")).rows,
  ).toHaveLength(1);
});
it("SEC03 role revoke next request and editor owner restriction", async () => {
  await expect(
    db.query(`select public.require_admin($1,true)`, [editor]),
  ).rejects.toThrow();
  await db.query(
    `update public.admin_members set active=false where user_id=$1`,
    [editor],
  );
  await expect(
    db.query(`select public.require_admin($1)`, [editor]),
  ).rejects.toThrow();
  await db.query(
    `update public.admin_members set active=true where user_id=$1`,
    [editor],
  );
});
it("LOOK01 three fields required, no draft disclosure, session TTL", async () => {
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order('HC0123456789AB','phonehash',repeat('b',64),'sessionbad','csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  const r = await db.query<{ v: { result: unknown } }>(
    `select public.lookup_order('HC0123456789AB','phonehash',repeat('a',64),'sessiongood','csrf') v`,
  );
  expect(r.rows[0].v.result).toBeNull();
  expect(
    (
      await db.query<{ v: string }>(
        `select public.resolve_lookup('sessiongood','csrf') v`,
      )
    ).rows[0].v,
  ).toBe(order);
  await db.exec(
    `update public.lookup_sessions set expires_at=now()-interval '1 second'`,
  );
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.resolve_lookup('sessiongood','csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
});
it("LOOK03 limiter persistent across calls, atomic DB increments", async () => {
  for (let i = 0; i < 5; i++)
    expect(
      (
        await db.query<{ v: { allowed: boolean } }>(
          `select public.consume_limit('haship','pair','lookup') v`,
        )
      ).rows[0].v.allowed,
    ).toBe(true);
  expect(
    (
      await db.query<{ v: { allowed: boolean } }>(
        `select public.consume_limit('haship','pair','lookup') v`,
      )
    ).rows[0].v.allowed,
  ).toBe(false);
});
it("ADM01 draft is not published, unpaid and G50 video gate", async () => {
  await db.query(`select public.write_result($1,$2,'draft only',false)`, [
    editor,
    order,
  ]);
  expect(
    (
      await db.query(
        `select * from public.reading_results where state='published'`,
      )
    ).rows,
  ).toHaveLength(0);
  await db.query(`select public.write_result($1,$2,$3,true)`, [
    editor,
    order,
    "Một ".repeat(501),
  ]);
  await db.exec(
    `update public.orders set package_code='G50' where id='${order}'`,
  );
  await expect(
    db.query(`select public.write_result($1,$2,$3,true)`, [
      editor,
      order,
      "Một ".repeat(501),
    ]),
  ).rejects.toThrow();
});
it("CON02/04 exact asset consent and revoke prevents re-publication", async () => {
  const asset = "30000000-0000-4000-8000-000000000001";
  await db.exec(
    `insert into public.attachments(id,order_id,storage_key,bucket,mime,size,checksum,classification,release_state) values('${asset}','${order}','opaque','public-derivatives','video/mp4',1000,'hash-v1','public_derivative','released')`,
  );
  await expect(
    db.query(`select public.publish_media($1,$2,'website_public_gallery')`, [
      owner,
      asset,
    ]),
  ).rejects.toThrow();
  await db.query(
    `select public.change_consent($1,$2,'website_public_gallery',true)`,
    [order, asset],
  );
  await db.query(
    `select public.publish_media($1,$2,'website_public_gallery')`,
    [owner, asset],
  );
  await expect(
    db.query(`select public.publish_media($1,$2,'youtube_publication')`, [
      owner,
      asset,
    ]),
  ).rejects.toThrow();
  await db.query(
    `select public.change_consent($1,$2,'website_public_gallery',false)`,
    [order, asset],
  );
  await expect(
    db.query(`select public.publish_media($1,$2,'website_public_gallery')`, [
      owner,
      asset,
    ]),
  ).rejects.toThrow();
  expect(
    (
      await db.query(
        `select * from public.public_media where state='published'`,
      )
    ).rows,
  ).toHaveLength(0);
  await expect(db.exec("delete from public.consent_events")).rejects.toThrow();
});
it("CON03 minor cannot grant public scope", async () => {
  await db.exec(
    `update public.orders set inputs='{"age_band":"16-17"}' where id='${order}'`,
  );
  await expect(
    db.query(
      `select public.change_consent($1,'30000000-0000-4000-8000-000000000001','website_public_gallery',true)`,
      [order],
    ),
  ).rejects.toThrow();
});
it("OPS03 dry run leaves records unchanged", async () => {
  const before = await db.query("select id from public.orders");
  await db.query("select * from public.retention_dry_run()");
  expect((await db.query("select id from public.orders")).rows).toEqual(
    before.rows,
  );
});
it("ORD01 SQL price snapshot and idempotency, ORD05 paid never expires", async () => {
  await db.exec(
    `update public.site_config set bank='{"bank_name":"FICTIONAL TEST","account_number":"00000000","beneficiary":"DEMO ONLY"}',refund_policy='Fictional test policy, never live',support='fictional local fixture',retention_approved=true,release_verified=true`,
  );
  const key = "50000000-0000-4000-8000-000000000001";
  const args = [
    key,
    a,
    "HCABCDEFGHJKMN",
    "digest",
    "+84912345678",
    "hash",
    "G20",
    "Fictional test",
    null,
    JSON.stringify({ age_band: "18+", topic: "test", channel: "website" }),
  ];
  const sql =
    "select public.create_order($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb) v";
  const first = await db.query<{ v: { created: boolean; price_vnd: number } }>(
    sql,
    args,
  );
  expect(first.rows[0].v.created).toBe(true);
  expect(first.rows[0].v.price_vnd).toBe(20000);
  const second = await db.query<{
    v: { created: boolean; price_vnd?: number };
  }>(sql, args);
  expect(second.rows[0].v).toEqual({ created: false });
  await db.exec(`update public.orders set expires_at=now()-interval '1 hour'`);
  await db.query("select public.expire_orders()");
  expect(
    (
      await db.query<{ internal_state: string }>(
        `select internal_state from public.orders where id=$1`,
        [order],
      )
    ).rows[0].internal_state,
  ).toBe("delivered");
  expect(
    (
      await db.query<{ internal_state: string }>(
        `select internal_state from public.orders where idempotency_key=$1`,
        [key],
      )
    ).rows[0].internal_state,
  ).toBe("expired");
});
it("CON preview required exact version, released asset immutable, revoke blocks gallery", async () => {
  const asset = "30000000-0000-4000-8000-000000000001";
  await db.exec(
    `update public.orders set inputs='{"age_band":"18+"}' where id='${order}';insert into public.lookup_sessions(token_digest,csrf_digest,order_id) values('preview-session','preview-csrf','${order}')`,
  );
  await expect(
    db.query(
      `select public.grant_after_preview('preview-session','preview-csrf',$1,'website_public_gallery','hash-v1',1)`,
      [asset],
    ),
  ).rejects.toThrow();
  await db.query(
    `select public.record_preview('preview-session','preview-csrf',$1)`,
    [asset],
  );
  await expect(
    db.query(
      `select public.grant_after_preview('preview-session','preview-csrf',$1,'website_public_gallery','wrong-hash',1)`,
      [asset],
    ),
  ).rejects.toThrow();
  await db.query(
    `select public.grant_after_preview('preview-session','preview-csrf',$1,'website_public_gallery','hash-v1',1)`,
    [asset],
  );
  await db.query(
    `select public.publish_media($1,$2,'website_public_gallery')`,
    [owner, asset],
  );
  expect(
    (await db.query("select * from public.public_gallery()")).rows,
  ).toHaveLength(1);
  await expect(
    db.query(`update public.attachments set checksum='replaced' where id=$1`, [
      asset,
    ]),
  ).rejects.toThrow();
  await db.query(
    `select public.change_consent($1,$2,'website_public_gallery',false)`,
    [order, asset],
  );
  expect(
    (await db.query("select * from public.public_gallery()")).rows,
  ).toHaveLength(0);
});
it("LOOK05 owner reset invalidates every session and original credential", async () => {
  await expect(
    db.query(
      `select public.reset_credential($1,$2,repeat('b',64),'verified fictional fixture channel')`,
      [editor, order],
    ),
  ).rejects.toThrow();
  await db.query(
    `select public.reset_credential($1,$2,repeat('b',64),'verified fictional fixture channel')`,
    [owner, order],
  );
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.resolve_lookup('preview-session','preview-csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order('HC0123456789AB','phonehash',repeat('a',64),'oldsecret','csrf') v`,
      )
    ).rows[0].v,
  ).toBeNull();
  expect(
    (
      await db.query<{ v: unknown }>(
        `select public.lookup_order('HC0123456789AB','phonehash',repeat('b',64),'newsecret','csrf') v`,
      )
    ).rows[0].v,
  ).not.toBeNull();
});
it("OPS02 restore actual app migrations/roles/consent and replay later deletion", async () => {
  const historyId = "60000000-0000-4000-8000-000000000001";
  await db.exec(
    `insert into public.reading_history(id,user_id,tool,engine_version,dataset_version,snapshot) values('${historyId}','${a}','ngay-sinh','1','1','{}')`,
  );
  const dump = await db.dumpDataDir("gzip");
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    await dump.arrayBuffer(),
  );
  await db.exec(
    `delete from public.reading_history where id='${historyId}';insert into public.deletion_tombstones(resource_id,resource_type) values('${historyId}','reading_history')`,
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );
  const restored = new PGlite({ loadDataDir: new Blob([decrypted]) });
  try {
    await restored.waitReady;
    expect(
      (await restored.query("select * from public.admin_members")).rows,
    ).toHaveLength(2);
    expect(
      (await restored.query("select * from public.orders")).rows,
    ).toHaveLength(2);
    expect(
      (await restored.query("select * from public.public_gallery()")).rows,
    ).toHaveLength(0);
    expect(
      (
        await restored.query(
          `select id from public.reading_history where id='${historyId}'`,
        )
      ).rows,
    ).toHaveLength(1);
    await restored.query("delete from public.reading_history where id=$1", [
      historyId,
    ]);
    expect(
      (
        await restored.query(
          `select id from public.reading_history where id='${historyId}'`,
        )
      ).rows,
    ).toHaveLength(0);
    await restored.exec(
      `set role authenticated;set request.jwt.claim.sub='${a}'`,
    );
    expect(
      (await restored.query("select * from public.reading_history")).rows,
    ).toHaveLength(0);
    await restored.exec("reset role");
    writeFileSync(
      "docs/RESTORE_APP_REPORT.json",
      JSON.stringify(
        {
          date: "2026-10-25",
          environment:
            "PGlite, all 11 actual app migrations + fixture auth/storage",
          encryption: "AES-256-GCM, key ephemeral in memory",
          encryptedBytes: encrypted.byteLength,
          verified: [
            "app schema and RPC restored",
            "admin memberships restored",
            "order snapshots restored",
            "withdrawn consent prevents gallery after restore",
            "RLS cross-user still enforced",
            "post-backup deletion replayed",
          ],
          notVerified: [
            "Supabase remote Auth identities",
            "actual private Storage object bytes",
            "remote backup provider permissions",
            "RTO/RPO in cloud",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await restored.close();
  }
}, 30000);

it("HC-RPT-006 versioned mutations reject stale drafts and retain atomic snapshots", async () => {
  const id = "20000000-0000-4000-8000-000000000099";
  await db.exec(
    `insert into public.orders(id,idempotency_key,order_code,package_code,price_vnd,delivery_hours,package_version,name,phone_e164,phone_lookup_hmac,inputs) values('${id}',gen_random_uuid(),'HC999999999999','G10',10000,24,1,'Synthetic fixture','+84912345678','fixture','{}')`,
  );
  const confirm = await db.query<{ value: { version: number } }>(
    `select public.confirm_payment_versioned($1,$2,1,10000,'FIX-REF-099','') as value`,
    [owner, id],
  );
  expect(confirm.rows[0].value.version).toBe(2);
  const draft = await db.query<{ value: { version: number } }>(
    `select public.write_result_versioned($1,$2,2,'Bản nháp kiểm thử',false) as value`,
    [owner, id],
  );
  expect(draft.rows[0].value.version).toBe(3);
  await expect(
    db.query(
      `select public.write_result_versioned($1,$2,null,'Missing version',false)`,
      [owner, id],
    ),
  ).rejects.toMatchObject({ code: "40001" });
  await expect(
    db.query(
      `select public.write_result_versioned($1,$2,2,'Ghi đè cũ',false)`,
      [owner, id],
    ),
  ).rejects.toMatchObject({ code: "40001" });
  expect(
    (
      await db.query(
        `select body from public.reading_results where order_id=$1`,
        [id],
      )
    ).rows,
  ).toEqual([{ body: "Bản nháp kiểm thử" }]);
  await expect(
    db.query(
      `select public.confirm_payment_versioned($1,$2,1,10000,'DIFFERENT-REF','')`,
      [owner, id],
    ),
  ).rejects.toMatchObject({ code: "40001" });
  const retry = await db.query<{ value: { version: number } }>(
    `select public.confirm_payment_versioned($1,$2,1,10000,'FIX-REF-099','') as value`,
    [owner, id],
  );
  expect(retry.rows[0].value.version).toBe(3);
  await db.exec("set role service_role");
  try {
    await expect(
      db.query(`select public.write_result($1,$2,'unsafe',false)`, [owner, id]),
    ).rejects.toThrow();
  } finally {
    await db.exec("reset role");
  }
});
it("HC-RPT-003 quoted price changes reject stale quotes, preserve old orders and idempotency", async () => {
  const key = "90000000-0000-4000-8000-000000000001";
  const sql = `select public.create_order_quoted($1,$2,null,'HC888888888888','fixture-digest','+84912345678','fixture-hash','G10','Synthetic fixture',null,'{"age_band":"18+"}') as value`;
  const base = (
    await db.query<{ version: number }>(
      `select version from public.service_packages where code='G10'`,
    )
  ).rows[0].version;
  await db.exec(`update public.site_config set release_verified=true`);
  const first = await db.query<{
    value: { price_vnd: number; created: boolean };
  }>(sql, [base, key]);
  expect(first.rows[0].value.price_vnd).toBe(10000);
  await db.exec(
    `update public.service_packages set price_vnd=12000,version=version+1 where code='G10'`,
  );
  const retry = await db.query<{ value: { created: boolean } }>(sql, [
    base,
    key,
  ]);
  expect(retry.rows[0].value).toEqual({ created: false });
  await expect(
    db.query(sql, [base, "90000000-0000-4000-8000-000000000002"]),
  ).rejects.toMatchObject({ code: "40001" });
  expect(
    (
      await db.query<{ price_vnd: number; package_version: number }>(
        `select price_vnd,package_version from public.orders where idempotency_key=$1`,
        [key],
      )
    ).rows[0],
  ).toEqual({ price_vnd: 10000, package_version: base });
  await db.exec(
    `update public.service_packages set price_vnd=10000,version=version-1 where code='G10'`,
  );
});
