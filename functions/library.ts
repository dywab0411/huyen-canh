import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { postPayload } from "../src/features/library/model";
import { filePolicy, matchesMagic } from "../src/file-policy";
export class LibraryError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function rpc(
  db: SupabaseClient,
  name: string,
  args: Record<string, unknown>,
) {
  const { data, error } = await db.rpc(name, args);
  if (error)
    throw new LibraryError(
      error.code === "40001" ? 409 : error.code === "23514" ? 400 : 503,
      error.code === "40001"
        ? "Bài đăng đã thay đổi. Tải lại trước khi tiếp tục."
        : error.code === "23514"
          ? "Cần tệp đã kiểm định và đủ quyền công khai đúng phiên bản."
          : "Chưa thực hiện được thao tác thư viện.",
    );
  return data;
}
export async function libraryAdmin(
  db: SupabaseClient,
  path: string,
  b: unknown,
  actor: string,
  role: string,
) {
  if (!path.startsWith("admin/library-")) return null;
  if (role !== "owner")
    throw new LibraryError(403, "Chỉ chủ website được quản lý thư viện.");
  if (path === "admin/library-list") {
    const [posts, assets] = await Promise.all([
      db
        .from("library_posts")
        .select(
          "id,payload,version,content_revision,state,published_at,created_at",
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("library_assets")
        .select("id,mime,size,release_state,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (posts.error || assets.error)
      throw new LibraryError(503, "Chưa tải được thư viện.");
    return { posts: posts.data, assets: assets.data };
  }
  if (path === "admin/library-save") {
    const s = z
      .object({
        id: z.uuid().nullable(),
        version: z.number().int().positive().nullable(),
        payload: postPayload,
      })
      .strict()
      .parse(b);
    return {
      post: await rpc(db, "save_library_post", {
        p_actor: actor,
        p_id: s.id,
        p_version: s.version,
        p_payload: s.payload,
      }),
      message:
        "Đã lưu bản nháp. Mỗi lần sửa cần kiểm tra lại trước khi công khai.",
    };
  }
  if (path === "admin/library-transition") {
    const s = z
      .object({
        id: z.uuid(),
        version: z.number().int().positive(),
        action: z.enum(["publish", "hide", "delete"]),
      })
      .strict()
      .parse(b);
    return {
      post: await rpc(db, "transition_library_post", {
        p_actor: actor,
        p_id: s.id,
        p_version: s.version,
        p_action: s.action,
      }),
      message:
        s.action === "publish"
          ? "Đã công khai bài đăng."
          : s.action === "hide"
            ? "Đã ẩn bài đăng."
            : "Đã xóa bài đăng khỏi thư viện.",
    };
  }
  if (path === "admin/library-upload") {
    const s = z
      .object({
        filename: z.string().max(120),
        mime: z.enum(["video/mp4", "image/jpeg", "image/png", "image/webp"]),
        size: z.number().int().positive(),
      })
      .strict()
      .parse(b);
    filePolicy(s.filename, s.mime, s.size);
    const id = crypto.randomUUID(),
      key = id + "/original";
    const { error } = await db.from("library_assets").insert({
      id,
      storage_key: key,
      mime: s.mime,
      size: s.size,
      uploader: actor,
    });
    if (error)
      throw new LibraryError(503, "Chưa chuẩn bị được vị trí tải tệp.");
    const { data, error: uploadError } = await db.storage
      .from("library-media")
      .createSignedUploadUrl(key, { upsert: false });
    if (uploadError)
      throw new LibraryError(503, "Chưa tạo được phiên tải tệp.");
    return { id, bucket: "library-media", path: key, token: data.token };
  }
  if (path === "admin/library-upload-finish") {
    const { id } = z.object({ id: z.uuid() }).strict().parse(b);
    const { data: a, error } = await db
      .from("library_assets")
      .select("id,mime,size,storage_key,release_state")
      .eq("id", id)
      .single();
    if (error || a?.release_state !== "quarantine")
      throw new LibraryError(409, "Tệp không còn ở trạng thái chờ kiểm định.");
    const { data: file, error: downloadError } = await db.storage
      .from("library-media")
      .download(a.storage_key);
    if (downloadError || !file)
      throw new LibraryError(503, "Chưa đọc được tệp đã tải.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length !== Number(a.size) || !matchesMagic(bytes, a.mime)) {
      const { error: rejectError } = await db
        .from("library_assets")
        .update({ release_state: "rejected" })
        .eq("id", id)
        .eq("release_state", "quarantine");
      if (rejectError)
        throw new LibraryError(503, "Chưa ghi nhận được tệp bị từ chối.");
      await db.storage.from("library-media").remove([a.storage_key]);
      throw new LibraryError(400, "Tệp không khớp định dạng hoặc kích thước.");
    }
    const checksum = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (n) => n.toString(16).padStart(2, "0"),
    ).join("");
    const { error: finishError } = await db
      .from("library_assets")
      .update({ checksum })
      .eq("id", id)
      .eq("release_state", "quarantine");
    if (finishError) throw new LibraryError(503, "Chưa ghi nhận được tệp.");
    return {
      id,
      message: "Đã tải tệp riêng. Chạy validator trước khi dùng để công khai.",
    };
  }
  throw new LibraryError(404, "Không có thao tác thư viện này.");
}
export async function libraryConsent(
  db: SupabaseClient,
  path: string,
  b: unknown,
  order: string,
  token: string,
  csrf: string,
) {
  if (!path.startsWith("consents/library-")) return null;
  if (path === "consents/library-posts") {
    const { data, error } = await db
      .from("library_posts")
      .select(
        "id,payload,content_revision,version,state,published_at,created_at",
      )
      .eq("payload->>kind", "customer")
      .eq("payload->>order_id", order)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new LibraryError(503, "Chưa tải được bài đăng liên quan.");
    return { posts: data };
  }
  if (path === "consents/library-preview") {
    const { id } = z.object({ id: z.uuid() }).strict().parse(b);
    const post = await rpc(db, "preview_library_post", {
      p_token: token,
      p_csrf: csrf,
      p_post: id,
    });
    const urls: Record<string, string> = {};
    for (const key of ["video", "cover"]) {
      const { data: a, error } = await db
        .from("attachments")
        .select("bucket,storage_key")
        .eq("id", post.payload[key + "_id"])
        .eq("order_id", order)
        .eq("classification", "public_derivative")
        .eq("release_state", "released")
        .single();
      if (error)
        throw new LibraryError(403, "Tệp chưa sẵn sàng để xem và cho phép.");
      const { data, error: signError } = await db.storage
        .from(a.bucket)
        .createSignedUrl(a.storage_key, 60);
      if (signError) throw new LibraryError(503, "Chưa mở được tệp xem trước.");
      urls[key + "_url"] = data.signedUrl;
    }
    return { post, ...urls };
  }
  if (path === "consents/library-grant") {
    const s = z
      .object({
        id: z.uuid(),
        revision: z.number().int().positive(),
        granted: z.boolean(),
      })
      .strict()
      .parse(b);
    await rpc(db, "consent_library_post", {
      p_token: token,
      p_csrf: csrf,
      p_post: s.id,
      p_revision: s.revision,
      p_granted: s.granted,
    });
    return {
      message: s.granted
        ? "Đã ghi nhận quyền công khai đúng nội dung vừa xem."
        : "Đã thu hồi quyền công khai bài đăng.",
    };
  }
  throw new LibraryError(404, "Không có thao tác này.");
}
