import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { videoHeaderValid } from "../../src/lib/video-header";
type Env = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_ORIGIN?: string;
  MANUAL_DELIVERY_ENABLED?: string;
};
const bucket = "showcase-videos";
const fields =
  "id,title,description,mime,visibility,validated,rights_confirmed,version,created_at";
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const reply = (status: number, data: unknown) =>
    Response.json(data, { status, headers });
  if (
    env.MANUAL_DELIVERY_ENABLED !== "true" ||
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY
  )
    return reply(503, { message: "Thư viện chưa sẵn sàng." });
  if (request.method !== "GET" && request.method !== "POST")
    return reply(405, { message: "Yêu cầu không hợp lệ." });
  if (
    request.method === "POST" &&
    (!env.PUBLIC_ORIGIN || request.headers.get("Origin") !== env.PUBLIC_ORIGIN)
  )
    return reply(403, { message: "Yêu cầu không hợp lệ." });
  const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const privateBucket = async () => {
    const { data, error } = await db.storage.getBucket(bucket);
    if (
      error ||
      !data ||
      data.public ||
      !data.file_size_limit ||
      data.file_size_limit > 20971520
    )
      throw Error("bucket");
  };
  try {
    if (request.method === "GET") {
      const { data, error } = await db
        .from("showcase_videos")
        .select("id,title,description,mime,object_key,created_at")
        .eq("visibility", "public")
        .eq("validated", true)
        .eq("rights_confirmed", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw Error("db");
      await privateBucket();
      const posts = [];
      for (const row of data ?? []) {
        const { data: link, error: signError } = await db.storage
          .from(bucket)
          .createSignedUrl(row.object_key, 300);
        if (signError) throw Error("storage");
        posts.push({
          id: row.id,
          title: row.title,
          body: row.description,
          category: "Thước phim",
          published_at: row.created_at,
          video_url: link.signedUrl,
          cover_url: "",
        });
      }
      return reply(200, { posts });
    }
    if (!request.headers.get("Content-Type")?.startsWith("application/json"))
      return reply(415, { message: "Yêu cầu không hợp lệ." });
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { message: "Thiếu nội dung." });
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 100000) {
        await reader.cancel();
        return reply(413, { message: "Nội dung quá dài." });
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of chunks) {
      bytes.set(part, offset);
      offset += part.length;
    }
    const input = JSON.parse(new TextDecoder().decode(bytes)) as Record<
      string,
      unknown
    >;
    const jwt = request.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!jwt) return reply(401, { message: "Vui lòng đăng nhập." });
    const { data: user, error: userError } = await db.auth.getUser(jwt);
    if (userError || !user.user)
      return reply(401, { message: "Vui lòng đăng nhập lại." });
    const claims = JSON.parse(
      atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { amr?: { method?: string }[] };
    if (!claims.amr?.some((a) => a.method === "password"))
      return reply(403, { message: "Vui lòng đăng nhập admin bằng mật khẩu." });
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
        .from("showcase_videos")
        .select(fields)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (s.before) query = query.lt("created_at", s.before);
      const { data, error } = await query;
      if (error) throw Error("db");
      return reply(200, { videos: data });
    }
    if (input.action === "reserve") {
      const s = z
        .object({
          action: z.literal("reserve"),
          request_id: z.uuid(),
          mime: z.enum(["video/mp4", "video/webm"]),
          size: z.number().int().min(12).max(20971520),
        })
        .strict()
        .parse(input);
      await privateBucket();
      const id = crypto.randomUUID(),
        key =
          id +
          "/" +
          crypto.randomUUID() +
          (s.mime === "video/mp4" ? ".mp4" : ".webm");
      const { data, error } = await db
        .from("showcase_videos")
        .insert({
          id,
          request_id: s.request_id,
          object_key: key,
          mime: s.mime,
          expected_size: s.size,
          created_by: user.user.id,
        })
        .select("id,object_key")
        .single();
      // Do not overwrite a previous capability after an ambiguous upload response.
      if (error?.code === "23505")
        return reply(409, {
          message:
            "Yêu cầu tải này đã tồn tại. Tải lại danh sách trước khi thử lại.",
        });
      if (error) throw Error("db");
      const { data: link, error: linkError } = await db.storage
        .from(bucket)
        .createSignedUploadUrl(data.object_key, { upsert: false });
      if (linkError) throw Error("storage");
      return reply(200, { id: data.id, upload_url: link.signedUrl });
    }
    if (
      input.action === "save" ||
      input.action === "hide" ||
      input.action === "delete"
    ) {
      const s = z
        .discriminatedUnion("action", [
          z
            .object({
              action: z.literal("save"),
              id: z.uuid(),
              version: z.number().int().positive(),
              title: z.string().trim().min(1).max(160),
              description: z.string().max(20000),
              visibility: z.enum(["hidden", "public"]),
              rights_confirmed: z.boolean(),
            })
            .strict(),
          z
            .object({
              action: z.enum(["hide", "delete"]),
              id: z.uuid(),
              version: z.number().int().positive(),
            })
            .strict(),
        ])
        .parse(input);
      const { data: row, error: rowError } = await db
        .from("showcase_videos")
        .select("object_key,mime,expected_size,validated")
        .eq("id", s.id)
        .is("deleted_at", null)
        .maybeSingle();
      if (rowError) throw Error("db");
      if (!row) return reply(404, { message: "Không tìm thấy video." });
      let patch: Record<string, unknown> = {
        visibility: "hidden",
        version: s.version + 1,
        updated_at: new Date().toISOString(),
      };
      if (s.action === "save") {
        if (s.visibility === "public" && !s.rights_confirmed)
          return reply(400, {
            message: "Cần xác nhận quyền sử dụng trước khi công khai.",
          });
        await privateBucket();
        if (!row.validated) {
          const { data: file, error: fileError } = await db.storage
            .from(bucket)
            .download(row.object_key);
          if (
            fileError ||
            !file ||
            file.size !== row.expected_size ||
            file.size > 20971520
          )
            return reply(400, {
              message:
                "Video tải chưa xong hoặc dung lượng không đúng. Chọn tải lại.",
            });
          if (
            !videoHeaderValid(
              new Uint8Array(await file.slice(0, 12).arrayBuffer()),
              row.mime,
            )
          )
            return reply(400, { message: "Tệp không phải MP4/WebM hợp lệ." });
        }
        patch = {
          ...patch,
          title: s.title,
          description: s.description,
          visibility: s.visibility,
          rights_confirmed: s.rights_confirmed,
          validated: true,
        };
      } else if (s.action === "delete")
        patch.deleted_at = new Date().toISOString();
      const { data, error } = await db
        .from("showcase_videos")
        .update(patch)
        .eq("id", s.id)
        .eq("version", s.version)
        .is("deleted_at", null)
        .select(fields)
        .maybeSingle();
      if (error) throw Error("db");
      if (!data)
        return reply(409, {
          message: "Video đã thay đổi. Tải lại danh sách trước khi lưu.",
        });
      return reply(200, {
        video: data,
        message:
          s.action === "delete"
            ? "Đã xóa video khỏi thư viện."
            : "Đã lưu video.",
      });
    }
    return reply(400, { message: "Yêu cầu không hợp lệ." });
  } catch (error) {
    return reply(
      error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 503,
      {
        message:
          error instanceof z.ZodError
            ? "Thông tin chưa hợp lệ."
            : "Chưa thực hiện được. Vui lòng thử lại sau.",
      },
    );
  }
}
