import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
const db = new PGlite();
const owner = "10000000-0000-4000-8000-000000000001",
  editor = "10000000-0000-4000-8000-000000000002",
  a = "10000000-0000-4000-8000-000000000003",
  b = "10000000-0000-4000-8000-000000000004",
  order = "20000000-0000-4000-8000-000000000001",
  other = "20000000-0000-4000-8000-000000000002",
  video = "30000000-0000-4000-8000-000000000001",
  cover = "30000000-0000-4000-8000-000000000002";
const payload = {
  title: "Hồ sen của ngày mới",
  body: "Lời gửi fixture, không phải dữ liệu khách thật.",
  category: "Câu chuyện",
  kind: "editorial",
  order_id: null,
  video_id: video,
  cover_id: cover,
  rights_confirmed: true,
};
let editorial: { id: string; version: number },
  customer: { id: string; version: number; content_revision: number };
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);insert into auth.users values('${owner}'),('${editor}'),('${a}'),('${b}');`,
  );
  for (const file of readdirSync("supabase/migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort())
    await db.exec(
      readFileSync("supabase/migrations/" + file, "utf8").replace(
        "create extension if not exists pgcrypto;",
        "",
      ),
    );
  await db.exec(
    `insert into public.admin_members(user_id,role) values('${owner}','owner'),('${editor}','editor');insert into public.library_assets(id,storage_key,mime,size,checksum,release_state,uploader) values('${video}','${video}/clean','video/mp4',123,repeat('a',64),'released','${owner}'),('${cover}','${cover}/clean','image/png',123,repeat('b',64),'released','${owner}');insert into public.orders(id,idempotency_key,order_code,user_id,package_code,price_vnd,delivery_hours,package_version,name,phone_e164,phone_lookup_hmac,inputs) values('${order}',gen_random_uuid(),'HC0123456789AB','${a}','G10',10000,24,1,'Synthetic A','+84912345678','fixture','{"age_band":"18+"}'),('${other}',gen_random_uuid(),'HCABCDEFGHJKMN','${b}','G10',10000,24,1,'Synthetic B','+84912345678','fixture','{"age_band":"18+"}');insert into public.lookup_sessions(token_digest,csrf_digest,order_id) values('a-token','a-csrf','${order}'),('b-token','b-csrf','${other}');insert into public.attachments(id,order_id,storage_key,bucket,mime,size,checksum,classification,release_state,uploader) values('${video}','${order}','${order}/video','public-derivatives','video/mp4',123,repeat('a',64),'public_derivative','released','${owner}');`,
  );
  await db.exec(
    `insert into public.attachments(id,order_id,storage_key,bucket,mime,size,checksum,classification,release_state,uploader) values('${cover}','${order}','${order}/cover','public-derivatives','image/png',123,repeat('b',64),'public_derivative','released','${owner}')`,
  );
}, 30000);
afterAll(() => db.close());
it("library SQL rejects null content and missing rights keys even through service RPC", async () => {
  await expect(save({ ...payload, title: null })).rejects.toThrow();
  await expect(save({ ...payload, rights_confirmed: null })).rejects.toThrow();
});
it("library release remains owner-only and requires quarantine with verified original checksum", async () => {
  const id = "30000000-0000-4000-8000-000000000098";
  await db.query(
    `insert into public.library_assets(id,storage_key,mime,size,uploader) values($1,$2,'video/mp4',123,$3)`,
    [id, id + "/original", owner],
  );
  await expect(
    db.query(
      `select public.release_library_asset($1,$2,$3,repeat('c',64),123)`,
      [owner, id, id + "/clean"],
    ),
  ).rejects.toThrow();
  await db.query(
    `update public.library_assets set checksum=repeat('d',64) where id=$1`,
    [id],
  );
  await expect(
    db.query(
      `select public.release_library_asset($1,$2,$3,repeat('c',64),123)`,
      [editor, id, id + "/clean"],
    ),
  ).rejects.toThrow();
  await db.query(
    `select public.release_library_asset($1,$2,$3,repeat('c',64),123)`,
    [owner, id, id + "/clean"],
  );
  expect(
    (
      await db.query<{ release_state: string }>(
        `select release_state from public.library_assets where id=$1`,
        [id],
      )
    ).rows[0].release_state,
  ).toBe("released");
});
async function save(
  p: unknown,
  id: string | null = null,
  version: number | null = null,
  actor = owner,
) {
  const r = await db.query<{
    v: { id: string; version: number; content_revision: number; state: string };
  }>("select public.save_library_post($1,$2,$3,$4::jsonb) v", [
    actor,
    id,
    version,
    JSON.stringify(p),
  ]);
  return r.rows[0].v;
}
async function transition(
  post: { id: string; version: number },
  action: string,
) {
  const r = await db.query<{ v: typeof post }>(
    "select public.transition_library_post($1,$2,$3,$4) v",
    [owner, post.id, post.version, action],
  );
  return r.rows[0].v;
}
const feed = async () =>
  (
    await db.query<{ v: { id: string; title: string } }>(
      "select public.public_library_posts() v",
    )
  ).rows.map((x) => x.v);
it("library drafts are private; editorial publish/edit/hide/delete uses optimistic concurrency", async () => {
  editorial = await save(payload);
  expect(await feed()).toHaveLength(0);
  editorial = await transition(editorial, "publish");
  expect((await feed())[0].title).toBe(payload.title);
  const stale = editorial;
  editorial = await save(
    { ...payload, title: "Tiêu đề đã sửa" },
    editorial.id,
    editorial.version,
  );
  expect(await feed()).toHaveLength(0);
  await expect(transition(stale, "publish")).rejects.toMatchObject({
    code: "40001",
  });
  editorial = await transition(editorial, "publish");
  editorial = await transition(editorial, "hide");
  expect(await feed()).toHaveLength(0);
  editorial = await transition(editorial, "delete");
  await expect(transition(editorial, "publish")).rejects.toThrow();
});
it("library owner-only, direct anon/customer/editor write and RPC restrictions remain enforced", async () => {
  await expect(save(payload, null, null, editor)).rejects.toThrow();
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    try {
      await expect(
        db.query("select * from public.library_posts"),
      ).rejects.toThrow();
      await expect(
        db.query("select * from public.library_assets"),
      ).rejects.toThrow();
      await expect(
        db.query("select public.public_library_posts()"),
      ).rejects.toThrow();
      await expect(
        db.query(`select public.save_library_post('${owner}',null,null,'{}')`),
      ).rejects.toThrow();
    } finally {
      await db.exec("reset role");
    }
  }
});
it("library does not publish unvalidated assets or missing editorial rights; released files immutable", async () => {
  await db.query(
    `insert into public.library_assets(id,storage_key,mime,size,uploader) values('30000000-0000-4000-8000-000000000099','quarantine-negative-fixture','video/mp4',123,$1)`,
    [owner],
  );
  let post = await save({ ...payload, rights_confirmed: false });
  await expect(transition(post, "publish")).rejects.toMatchObject({
    code: "23514",
  });
  post = await save(
    { ...payload, video_id: "30000000-0000-4000-8000-000000000099" },
    post.id,
    post.version,
  );
  await expect(transition(post, "publish")).rejects.toMatchObject({
    code: "23514",
  });
  await expect(
    db.exec(
      `update public.library_assets set checksum=repeat('c',64) where id='${video}'`,
    ),
  ).rejects.toThrow();
});
it("customer post needs video+cover rights AND exact content preview consent, other order cannot grant", async () => {
  customer = await save({ ...payload, kind: "customer", order_id: order });
  await expect(transition(customer, "publish")).rejects.toMatchObject({
    code: "23514",
  });
  for (const id of [video, cover])
    await db.query(
      `select public.change_consent($1,$2,'website_public_gallery',true)`,
      [order, id],
    );
  await expect(
    db.query(
      `select public.consent_library_post('a-token','a-csrf',$1,1,true)`,
      [customer.id],
    ),
  ).rejects.toThrow();
  await expect(
    db.query(`select public.preview_library_post('b-token','b-csrf',$1)`, [
      customer.id,
    ]),
  ).rejects.toThrow();
  await db.query(`select public.preview_library_post('a-token','a-csrf',$1)`, [
    customer.id,
  ]);
  await db.query(
    `select public.consent_library_post('a-token','a-csrf',$1,1,true)`,
    [customer.id],
  );
  customer = { ...customer, ...(await transition(customer, "publish")) };
  expect((await feed()).some((p) => p.id === customer.id)).toBe(true);
});
it("customer edited title/body/cover invalidates exact-revision permission; stale grant cannot authorize new post", async () => {
  customer = await save(
    {
      ...payload,
      kind: "customer",
      order_id: order,
      body: "Nội dung mới cần xem lại",
    },
    customer.id,
    customer.version,
  );
  await expect(transition(customer, "publish")).rejects.toMatchObject({
    code: "23514",
  });
  await expect(
    db.query(
      `select public.consent_library_post('a-token','a-csrf',$1,1,true)`,
      [customer.id],
    ),
  ).rejects.toThrow();
  await db.query(`select public.preview_library_post('a-token','a-csrf',$1)`, [
    customer.id,
  ]);
  await db.query(
    `select public.consent_library_post('a-token','a-csrf',$1,$2,true)`,
    [customer.id, customer.content_revision],
  );
  customer = { ...customer, ...(await transition(customer, "publish")) };
  expect((await feed()).some((p) => p.id === customer.id)).toBe(true);
});
it("revoking either cover permission or post permission immediately removes post from new feed", async () => {
  await db.query(
    `select public.change_consent($1,$2,'website_public_gallery',false)`,
    [order, cover],
  );
  expect((await feed()).some((p) => p.id === customer.id)).toBe(false);
  await db.query(
    `select public.change_consent($1,$2,'website_public_gallery',true)`,
    [order, cover],
  );
  await db.query(
    `select public.consent_library_post('a-token','a-csrf',$1,$2,false)`,
    [customer.id, customer.content_revision],
  );
  expect((await feed()).some((p) => p.id === customer.id)).toBe(false);
  await expect(
    db.exec("delete from public.library_consents"),
  ).rejects.toThrow();
});
it("minor cannot grant public library content even after viewing a preview", async () => {
  const post = await save({ ...payload, kind: "customer", order_id: order });
  await db.query(
    `update public.orders set inputs='{"age_band":"16-17"}' where id=$1`,
    [order],
  );
  try {
    await db.query(
      `select public.preview_library_post('a-token','a-csrf',$1)`,
      [post.id],
    );
    await expect(
      db.query(
        `select public.consent_library_post('a-token','a-csrf',$1,1,true)`,
        [post.id],
      ),
    ).rejects.toThrow();
    await expect(transition(post, "publish")).rejects.toMatchObject({
      code: "23514",
    });
  } finally {
    await db.query(
      `update public.orders set inputs='{"age_band":"18+"}' where id=$1`,
      [order],
    );
  }
});
it("expired lookup session cannot preview or change publication permission", async () => {
  await db.exec(
    `update public.lookup_sessions set expires_at=now()-interval '1 minute' where token_digest='a-token'`,
  );
  await expect(
    db.query(`select public.preview_library_post('a-token','a-csrf',$1)`, [
      customer.id,
    ]),
  ).rejects.toThrow();
  await expect(
    db.query(
      `select public.consent_library_post('a-token','a-csrf',$1,1,false)`,
      [customer.id],
    ),
  ).rejects.toThrow();
  const count = (
    await db.query<{ n: number }>(
      "select count(*)::int n from public.library_consents",
    )
  ).rows[0].n;
  await db.query("select public.cleanup_technical_ttl(false)");
  expect(
    (
      await db.query(
        `select id from public.lookup_sessions where token_digest='a-token'`,
      )
    ).rows,
  ).toHaveLength(0);
  expect(
    (
      await db.query<{ n: number }>(
        "select count(*)::int n from public.library_consents",
      )
    ).rows[0].n,
  ).toBe(count);
});
