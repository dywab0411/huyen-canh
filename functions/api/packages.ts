import { createClient } from "@supabase/supabase-js";
import { defaults, quoteSchema, saleCodes } from "../../src/lib/packages";
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
    return Response.json(defaults, { headers });
  try {
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await db
      .from("service_packages")
      .select("code,price_vnd,delivery_hours,version,active")
      .in("code", [...saleCodes])
      .order("code");
    if (error) throw error;
    return Response.json(
      quoteSchema.parse({ source: "server", packages: data }),
      { headers },
    );
  } catch {
    return Response.json(
      { message: "Chưa tải được giá đã xác minh." },
      { status: 503, headers },
    );
  }
}
