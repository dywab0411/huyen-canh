import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_ORIGIN?: string;
  LOOKUP_PEPPER_V1?: string;
  MANUAL_DELIVERY_ENABLED?: string;
}
const bucket = "manual-results";
const codeSchema = z.string().regex(/^HC-[A-Za-z0-9_-]{43}$/);
const saveSchema = z
  .object({
    action: z.literal("save"),
    id: z.uuid(),
    version: z.number().int().positive(),
    body: z.string().max(50000),
    video_key: z.string().max(180).nullable(),
  })
  .strict();
const publicError = "Mã chưa đúng hoặc kết quả chưa sẵn sàng.";
export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const reply = (status: number, data: unknown) =>
    Response.json(data, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  if (request.method !== "POST")
    return reply(405, { message: "Chỉ chấp nhận POST." });
  if (!env.PUBLIC_ORIGIN || request.headers.get("Origin") !== env.PUBLIC_ORIGIN)
    return reply(403, { message: "Yêu cầu không hợp lệ." });
  if (
    env.MANUAL_DELIVERY_ENABLED !== "true" ||
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.LOOKUP_PEPPER_V1
  )
    return reply(503, { message: "Chức năng hiện chưa sẵn sàng." });
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return reply(415, { message: "Yêu cầu không hợp lệ." });
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { message: "Yêu cầu không hợp lệ." });
    const chunks: Uint8Array[] = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      n += value.length;
      if (n > 210000) {
        await reader.cancel();
        return reply(413, { message: "Nội dung quá dài." });
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(n);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const input = JSON.parse(new TextDecoder().decode(bytes)) as Record<
      string,
      unknown
    >;
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const digest = async (value: string) => {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.LOOKUP_PEPPER_V1),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      return Array.from(
        new Uint8Array(
          await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode("manual:" + value),
          ),
        ),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
    };
    const requirePrivateBucket = async () => {
      const { data, error } = await db.storage.getBucket(bucket);
      if (
        error ||
        !data ||
        data.public ||
        !data.file_size_limit ||
        data.file_size_limit > 20971520
      )
        throw Error("storage");
    };
    const signedVideo = async (key: string | null) => {
      if (!key) return null;
      await requirePrivateBucket();
      const { data, error } = await db.storage
        .from(bucket)
        .createSignedUrl(key, 60);
      if (error) throw Error("storage");
      return data.signedUrl;
    };
    if (input.action === "lookup") {
      const parsed = codeSchema.safeParse(input.code);
      if (!parsed.success) return reply(404, { message: publicError });
      const hash = await digest(parsed.data);
      const { data: limit, error: limitError } = await db.rpc("consume_limit", {
        p_key: await digest(
          request.headers.get("CF-Connecting-IP") || "unknown",
        ),
        p_code: hash,
        p_route: "manual-lookup",
      });
      if (limitError) throw Error("limit");
      if (!limit?.allowed)
        return reply(429, {
          message: "Bạn thử quá nhiều lần. Vui lòng thử lại sau.",
        });
      const { data, error } = await db
        .from("manual_deliveries")
        .select("body,video_key")
        .eq("code_digest", hash)
        .eq("published", true)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw Error("db");
      if (!data) return reply(404, { message: publicError });
      return reply(200, {
        body: data.body,
        video_url: await signedVideo(data.video_key),
      });
    }
    const jwt = request.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!jwt) return reply(401, { message: "Vui lòng đăng nhập." });
    const { data: user, error: userError } = await db.auth.getUser(jwt);
    if (userError || !user.user)
      return reply(401, { message: "Vui lòng đăng nhập lại." });
    // getUser verifies signature and expiry before claims are inspected. Google sessions cannot enter this workflow.
    const claims = JSON.parse(
      atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { amr?: { method?: string }[] };
    if (!claims.amr?.some((a) => a.method === "password"))
      return reply(403, {
        message: "Vui lòng đăng nhập bằng tài khoản admin và mật khẩu mới.",
      });
    const { data: member, error: memberError } = await db
      .from("admin_members")
      .select("role")
      .eq("user_id", user.user.id)
      .eq("active", true)
      .maybeSingle();
    if (memberError) throw Error("db");
    if (member?.role !== "owner")
      return reply(403, { message: "Bạn không có quyền quản trị." });
    if (input.action === "list") {
      const s = z
        .object({
          action: z.literal("list"),
          before: z.iso.datetime().optional(),
        })
        .strict()
        .parse(input);
      let query = db
        .from("manual_deliveries")
        .select("id,access_code,body,video_key,published,version,created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (s.before) query = query.lt("created_at", s.before);
      const { data, error } = await query;
      if (error) throw Error("db");
      return reply(200, { orders: data });
    }
    if (input.action === "create") {
      const s = z
        .object({ action: z.literal("create"), request_id: z.uuid() })
        .strict()
        .parse(input);
      const random = btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      const code = "HC-" + random;
      const { data, error } = await db
        .from("manual_deliveries")
        .insert({
          id: crypto.randomUUID(),
          request_id: s.request_id,
          access_code: code,
          code_digest: await digest(code),
          created_by: user.user.id,
        })
        .select("id,access_code,body,video_key,published,version,created_at")
        .single();
      if (error?.code === "23505") {
        const { data: existing, error: retryError } = await db
          .from("manual_deliveries")
          .select("id,access_code,body,video_key,published,version,created_at")
          .eq("request_id", s.request_id)
          .is("deleted_at", null)
          .single();
        if (retryError) throw Error("db");
        return reply(200, { order: existing });
      }
      if (error) throw Error("db");
      return reply(200, { order: data });
    }
    if (input.action === "upload") {
      const s = z
        .object({
          action: z.literal("upload"),
          id: z.uuid(),
          size: z.number().int().min(12).max(20971520),
          mime: z.literal("video/mp4"),
        })
        .strict()
        .parse(input);
      const { data: order, error: orderError } = await db
        .from("manual_deliveries")
        .select("id")
        .eq("id", s.id)
        .is("deleted_at", null)
        .maybeSingle();
      if (orderError) throw Error("db");
      if (!order) return reply(404, { message: "Không tìm thấy đơn." });
      await requirePrivateBucket();
      const key = s.id + "/" + crypto.randomUUID() + ".mp4";
      const { error: reserveError } = await db
        .from("manual_delivery_uploads")
        .insert({
          object_key: key,
          delivery_id: s.id,
          created_by: user.user.id,
        });
      if (reserveError) throw Error("db");
      const { data, error } = await db.storage
        .from(bucket)
        .createSignedUploadUrl(key, { upsert: false });
      if (error) throw Error("storage");
      return reply(200, { key, token: data.token });
    }
    if (input.action === "save") {
      const s = saveSchema.parse(input);
      if (!s.body.trim() && !s.video_key)
        return reply(400, { message: "Hãy nhập nội dung hoặc tải video." });
      if (s.video_key) {
        await requirePrivateBucket();
        if (!new RegExp("^" + s.id + "/[0-9a-f-]{36}\\.mp4$").test(s.video_key))
          return reply(400, { message: "Video không thuộc đơn này." });
        const { data: reserved, error: reservedError } = await db
          .from("manual_delivery_uploads")
          .select("object_key")
          .eq("delivery_id", s.id)
          .eq("object_key", s.video_key)
          .maybeSingle();
        if (reservedError) throw Error("db");
        if (!reserved) return reply(400, { message: "Video không hợp lệ." });
        const { data: file, error: fileError } = await db.storage
          .from(bucket)
          .download(s.video_key);
        if (fileError || !file || file.size > 20971520)
          return reply(400, {
            message: "Video chưa tải xong hoặc không hợp lệ.",
          });
        const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
        if (
          head.length < 12 ||
          String.fromCharCode(...head.slice(4, 8)) !== "ftyp"
        )
          return reply(400, { message: "Chỉ nhận video MP4 hợp lệ." });
      }
      const { data, error } = await db
        .from("manual_deliveries")
        .update({
          body: s.body,
          video_key: s.video_key,
          published: true,
          version: s.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", s.id)
        .eq("version", s.version)
        .is("deleted_at", null)
        .select("id,access_code,body,video_key,published,version,created_at")
        .maybeSingle();
      if (error) throw Error("db");
      if (!data)
        return reply(409, {
          message: "Đơn đã thay đổi. Hãy tải lại trước khi lưu.",
        });
      return reply(200, { order: data });
    }
    if (input.action === "delete") {
      const s = z
        .object({
          action: z.literal("delete"),
          id: z.uuid(),
          version: z.number().int().positive(),
        })
        .strict()
        .parse(input);
      const { data, error } = await db
        .from("manual_deliveries")
        .update({
          deleted_at: new Date().toISOString(),
          published: false,
          version: s.version + 1,
        })
        .eq("id", s.id)
        .eq("version", s.version)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();
      if (error) throw Error("db");
      if (!data)
        return reply(409, { message: "Đơn đã thay đổi. Hãy tải lại." });
      return reply(200, { deleted: true });
    }
    return reply(400, { message: "Yêu cầu không hợp lệ." });
  } catch (error) {
    return reply(error instanceof z.ZodError ? 400 : 503, {
      message:
        error instanceof z.ZodError
          ? "Thông tin chưa hợp lệ."
          : "Chưa thể thực hiện. Vui lòng thử lại sau.",
    });
  }
}
