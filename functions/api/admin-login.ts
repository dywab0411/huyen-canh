import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_ORIGIN?: string;
  LOOKUP_PEPPER_V1?: string;
}
const credentials = z
  .object({
    username: z.literal("admin"),
    password: z.string().min(1).max(256),
  })
  .strict();
export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const reply = (
    status: number,
    message: string,
    session?: { access_token: string; refresh_token: string },
  ) =>
    Response.json(
      { message, ...(session ? { session } : {}) },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  if (request.method !== "POST") return reply(405, "Chỉ chấp nhận POST.");
  if (!env.PUBLIC_ORIGIN || request.headers.get("Origin") !== env.PUBLIC_ORIGIN)
    return reply(403, "Nguồn yêu cầu không hợp lệ.");
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return reply(415, "Yêu cầu JSON.");
  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.LOOKUP_PEPPER_V1
  )
    return reply(503, "Đăng nhập admin chưa được cấu hình.");
  try {
    // Limit the stream before parsing; never log credentials or return provider errors.
    const reader = request.body?.getReader();
    if (!reader) return reply(400, "Thông tin đăng nhập không hợp lệ.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 2048) {
        await reader.cancel();
        return reply(413, "Nội dung quá lớn.");
      }
      chunks.push(value);
    }
    const raw = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      raw.set(chunk, offset);
      offset += chunk.length;
    }
    const input: unknown = JSON.parse(new TextDecoder().decode(raw));
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const hash = async (value: string) =>
      Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(
              env.LOOKUP_PEPPER_V1 + ":admin-login:" + value,
            ),
          ),
        ),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
    const { data: limit, error: limitError } = await db.rpc("consume_limit", {
      p_key: await hash(request.headers.get("CF-Connecting-IP") || "unknown"),
      p_code: await hash("admin"),
      p_route: "admin-login",
    });
    if (limitError)
      return reply(503, "Chưa thể đăng nhập. Vui lòng thử lại sau.");
    if (!limit?.allowed)
      return reply(429, "Đã thử quá nhiều lần. Vui lòng thử lại sau.");
    const parsed = credentials.safeParse(input);
    if (!parsed.success)
      return reply(401, "Tài khoản hoặc mật khẩu không đúng.");
    const { data: members, error: memberError } = await db
      .from("admin_members")
      .select("user_id,role")
      .eq("role", "owner")
      .eq("active", true)
      .limit(2);
    if (memberError || !members || members.length !== 1)
      return reply(503, "Đăng nhập admin chưa được cấu hình.");
    const ownerId = members[0].user_id;
    const { data: account, error: accountError } =
      await db.auth.admin.getUserById(ownerId);
    if (accountError || !account.user?.email)
      return reply(401, "Tài khoản hoặc mật khẩu không đúng.");
    const passwordClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await passwordClient.auth.signInWithPassword({
      email: account.user.email,
      password: parsed.data.password,
    });
    if (error || !data.session || data.user?.id !== ownerId)
      return reply(401, "Tài khoản hoặc mật khẩu không đúng.");
    return reply(200, "Đã đăng nhập.", {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch {
    return reply(400, "Chưa thể đăng nhập. Vui lòng thử lại.");
  }
}
