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
    return Response.json({ posts: [] }, { headers });
  try {
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: rows, error } = await db.rpc("public_library_posts");
    if (error) throw error;
    const posts = [];
    for (const r of rows ?? []) {
      const [v, c] = await Promise.all([
        db.storage
          .from(r.video.bucket)
          .createSignedUrl(r.video.storage_key, 60),
        db.storage
          .from(r.cover.bucket)
          .createSignedUrl(r.cover.storage_key, 60),
      ]);
      if (!v.error && !c.error)
        posts.push({
          id: r.id,
          title: r.title,
          body: r.body,
          category: r.category,
          published_at: r.published_at,
          video_url: v.data.signedUrl,
          cover_url: c.data.signedUrl,
        });
    }
    return Response.json({ posts }, { headers });
  } catch {
    return Response.json({ posts: [] }, { status: 503, headers });
  }
}
