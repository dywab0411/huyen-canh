import { createClient } from "@supabase/supabase-js";
export async function onRequestGet({
  env,
}: {
  env: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string };
}) {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return Response.json(
      { media: [], reviews: [], configured: false },
      { headers },
    );
  try {
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: rows, error } = await db.rpc("public_gallery");
    if (error) throw Error("db");
    const media = [];
    for (const row of (rows ?? []).slice(0, 24)) {
      const { data, error } = await db.storage
        .from(row.bucket)
        .createSignedUrl(row.storage_key, 60);
      if (!error)
        media.push({ id: row.id, mime: row.mime, url: data.signedUrl });
    }
    const { data: reviews, error: reviewError } = await db
      .from("reviews")
      .select("id,rating,body,nickname")
      .eq("moderation_state", "approved")
      .order("updated_at", { ascending: false })
      .limit(30);
    if (reviewError) throw Error("db");
    return Response.json({ media, reviews, configured: true }, { headers });
  } catch {
    return Response.json(
      {
        message: "Thư viện tạm không khả dụng.",
        media: [],
        reviews: [],
        configured: false,
      },
      { status: 503, headers },
    );
  }
}
