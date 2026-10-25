import { createClient } from "@supabase/supabase-js";
import { datasetSchema } from "../../src/content/dataset";
export async function onRequestGet({
  env,
}: {
  env: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string };
}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    return Response.json(
      { message: "Chưa cấu hình dataset từ máy chủ; dùng bản đi kèm." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await db
      .from("dataset_versions")
      .select("version,content,hash,source_metadata")
      .eq("state", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !data) throw Error("missing");
    const parsed = datasetSchema.parse(data);
    return Response.json(
      { ...parsed, hash: data.hash, source_metadata: data.source_metadata },
      {
        headers: {
          "Cache-Control": "public,max-age=60",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { message: "Chưa có phiên bản public hợp lệ; dùng dữ liệu đi kèm." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
