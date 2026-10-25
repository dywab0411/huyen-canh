import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { filePolicy, matchesMagic } from "../src/file-policy";
import { LibraryError } from "./library";
export async function customerPhotos(
  db: SupabaseClient,
  path: string,
  b: unknown,
  order: string,
) {
  if (path === "orders/photo-reserve") {
    const s = z
      .object({
        filename: z.string().max(120),
        mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
        size: z.number().int().positive().max(5242880),
      })
      .strict()
      .parse(b);
    filePolicy(s.filename, s.mime, s.size);
    const id = crypto.randomUUID(),
      key = order + "/" + id;
    const { error } = await db.rpc("reserve_customer_photo", {
      p_order: order,
      p_id: id,
      p_mime: s.mime,
      p_size: s.size,
    });
    if (error)
      throw new LibraryError(
        403,
        "Cần quyền dùng ảnh riêng và xác nhận từ 18 tuổi.",
      );
    const { data, error: uploadError } = await db.storage
      .from("source-photos")
      .createSignedUploadUrl(key, { upsert: false });
    if (uploadError)
      throw new LibraryError(503, "Chưa chuẩn bị được kho ảnh riêng.");
    return { id, bucket: "source-photos", path: key, token: data.token };
  }
  if (path === "orders/photo-finish") {
    const { attachment_id } = z
      .object({ attachment_id: z.uuid() })
      .strict()
      .parse(b);
    const { data: a, error } = await db
      .from("attachments")
      .select("id,mime,size,storage_key,release_state")
      .eq("id", attachment_id)
      .eq("order_id", order)
      .eq("bucket", "source-photos")
      .eq("classification", "source")
      .single();
    if (error || a?.release_state !== "quarantine")
      throw new LibraryError(403, "Không truy cập được tệp của đơn này.");
    const { data: file, error: downloadError } = await db.storage
      .from("source-photos")
      .download(a.storage_key);
    if (downloadError || !file)
      throw new LibraryError(503, "Ảnh chưa tải lên được.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length !== Number(a.size) || !matchesMagic(bytes, a.mime)) {
      const { error: rejected } = await db
        .from("attachments")
        .update({ release_state: "rejected" })
        .eq("id", a.id)
        .eq("order_id", order);
      if (rejected)
        throw new LibraryError(503, "Chưa ghi nhận được tệp không hợp lệ.");
      await db.storage.from("source-photos").remove([a.storage_key]);
      throw new LibraryError(400, "Ảnh không khớp định dạng hoặc kích thước.");
    }
    const checksum = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (n) => n.toString(16).padStart(2, "0"),
    ).join("");
    const { error: updated } = await db
      .from("attachments")
      .update({ checksum })
      .eq("id", a.id)
      .eq("order_id", order)
      .eq("release_state", "quarantine");
    if (updated) throw new LibraryError(503, "Chưa ghi nhận được ảnh.");
    return {
      message: "Ảnh đã vào kho riêng và chờ kiểm định. Không công khai.",
    };
  }
  return null;
}
