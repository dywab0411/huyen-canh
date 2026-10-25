import { customerPhotos } from "../customer-photos";
import {
  orderRequest,
  accessCodeSchema,
} from "../../src/features/orders/order-model";
import { saleCodes } from "../../src/lib/packages";
import { libraryAdmin, libraryConsent, LibraryError } from "../library";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { phone, sha256 } from "../../src/engine";
import { textOnly } from "../../src/domain";
import { datasetSchema } from "../../src/content/dataset";
import { filePolicy, matchesMagic } from "../../src/file-policy";
class VersionConflict extends Error {}
interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  LOOKUP_PEPPER_V1?: string;
  PUBLIC_ORIGIN?: string;
  CHECKOUT_ENABLED?: string;
  TURNSTILE_SECRET_KEY?: string;
}
type Context = {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
};
const failure = "Thông tin tra cứu chưa đúng hoặc chưa thể truy cập";
const token = (bytes: number) =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(bytes))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
    ),
  ]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export const lookupSchema = z
  .object({
    order_code: z.string().regex(/^HC[0-9A-HJKMNP-TV-Z]{12}$/),
    phone: z.string().max(30),
    secret: z.string().regex(/^[\w-]{22}$/),
  })
  .strict();
const orderSchema = orderRequest;
export async function onRequest({ request, env }: Context): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  const reply = (status: number, data: unknown) =>
    new Response(JSON.stringify(data), { status, headers });
  if (request.method !== "POST")
    return reply(405, { message: "Chỉ chấp nhận POST." });
  if (!env.PUBLIC_ORIGIN || request.headers.get("Origin") !== env.PUBLIC_ORIGIN)
    return reply(403, { message: "Nguồn yêu cầu không hợp lệ." });
  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.LOOKUP_PEPPER_V1
  )
    return reply(503, {
      message:
        "Dịch vụ chưa được cấu hình. Chưa tiếp nhận đơn hoặc dữ liệu thật.",
    });
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return reply(415, { message: "Yêu cầu JSON." });
  const path = new URL(request.url).pathname.replace(/^\/api\//, "");
  const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const rpc = async (name: string, args: Record<string, unknown>) => {
    const { data, error } = await db.rpc(name, args);
    if (error?.code === "40001") throw new VersionConflict();
    if (error) throw Error("db");
    return data;
  };
  try {
    const reader = request.body?.getReader();
    let length = 0;
    const chunks: Uint8Array[] = [];
    if (!reader) return reply(400, { message: "Thiếu nội dung." });
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (
        length >
        (path === "admin/datasets"
          ? 512000
          : path === "admin/library-save"
            ? 100000
            : 16000)
      ) {
        await reader.cancel();
        return reply(413, { message: "Nội dung quá lớn." });
      }
      chunks.push(value);
    }
    const raw = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      raw.set(chunk, offset);
      offset += chunk.length;
    }
    const b = JSON.parse(new TextDecoder().decode(raw)) as Record<
      string,
      unknown
    >;
    let actor: string | null = null;
    let role: string | null = null;
    let aal = false;
    const jwt = request.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (jwt) {
      const { data, error } = await db.auth.getUser(jwt);
      if (error || !data.user)
        return reply(401, { message: "Phiên đăng nhập không hợp lệ." });
      actor = data.user.id;
      const { data: member, error: memberError } = await db
        .from("admin_members")
        .select("role")
        .eq("user_id", actor)
        .eq("active", true)
        .maybeSingle();
      if (memberError) throw Error("db");
      role = member?.role ?? null;
      try {
        const claims = JSON.parse(
          atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        ) as { aal?: string };
        aal = claims.aal === "aal2";
      } catch {
        aal = false;
      }
    }
    if (path.startsWith("admin/")) {
      if (!actor || !role || !aal)
        return reply(403, {
          message: "Cần thành viên quản trị còn hiệu lực và phiên MFA AAL2.",
        });
      if (path === "admin/session") return reply(200, { role });
      const library = await libraryAdmin(db, path, b, actor, role);
      if (library) return reply(200, library);
      if (path === "admin/upload-reserve") {
        const s = z
          .object({
            order_id: z.uuid(),
            filename: z.string().min(1).max(120),
            mime: z.string().max(80),
            size: z.number().int().positive(),
            classification: z.enum([
              "source",
              "private_result",
              "public_derivative",
            ]),
          })
          .parse(b);
        filePolicy(s.filename, s.mime, s.size);
        const id = crypto.randomUUID();
        const bucket =
          s.classification === "source"
            ? "source-photos"
            : s.classification === "private_result"
              ? "private-results"
              : "public-derivatives";
        const key = s.order_id + "/" + id;
        await rpc("reserve_attachment", {
          p_actor: actor,
          p_id: id,
          p_order: s.order_id,
          p_key: key,
          p_bucket: bucket,
          p_mime: s.mime,
          p_size: s.size,
          p_classification: s.classification,
        });
        const { data, error } = await db.storage
          .from(bucket)
          .createSignedUploadUrl(key, { upsert: false });

        if (error) throw Error("db");
        return reply(200, {
          id,
          bucket,
          path: key,
          token: data.token,
          message:
            "Tệp sẽ nằm trong quarantine, chưa được giao hoặc công khai.",
        });
      }
      if (path === "admin/upload-finish") {
        const { attachment_id } = z
          .object({ attachment_id: z.uuid() })
          .parse(b);
        const { data: a, error } = await db
          .from("attachments")
          .select("storage_key,bucket,mime,size,release_state")
          .eq("id", attachment_id)
          .single();
        if (error || !a || a.release_state !== "quarantine")
          return reply(409, { message: "Không có tệp trong quarantine." });
        const { data: file, error: downloadError } = await db.storage
          .from(a.bucket)
          .download(a.storage_key);
        if (downloadError || !file) throw Error("db");
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (bytes.length !== Number(a.size) || !matchesMagic(bytes, a.mime)) {
          await db
            .from("attachments")
            .update({ release_state: "rejected" })
            .eq("id", attachment_id);
          await db.storage.from(a.bucket).remove([a.storage_key]);
          return reply(400, {
            message: "Tệp không khớp MIME/magic hoặc size; đã từ chối.",
          });
        }
        await db
          .from("attachments")
          .update({
            checksum: Array.from(
              new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
              (n) => n.toString(16).padStart(2, "0"),
            ).join(""),
          })
          .eq("id", attachment_id);
        return reply(200, {
          message:
            "Đã nhận tệp vào quarantine. Cần chạy validator local để decode/re-encode/strip metadata và release; chưa giao tệp này.",
        });
      }
      if (path === "admin/order-details") {
        const { order_id } = z.object({ order_id: z.uuid() }).parse(b);
        const { data, error } = await db
          .from("orders")
          .select("id,name,inputs")
          .eq("id", order_id)
          .single();
        if (error || !data)
          return reply(404, { message: "Không tìm thấy đơn." });
        const fields = [
          "gender",
          "birth_date",
          "birth_hour",
          "name2",
          "gender2",
          "birth_date2",
          "birth_hour2",
        ];
        return reply(200, {
          details: {
            id: data.id,
            name: data.name,
            ...Object.fromEntries(
              fields.map((k) => [k, data.inputs?.[k] ?? null]),
            ),
          },
        });
      }
      if (path === "admin/orders") {
        const { data, error } = await db
          .from("orders")
          .select(
            "id,order_code,package_code,price_vnd,internal_state,version,created_at",
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw Error("db");
        return reply(200, { orders: data });
      }
      if (path === "admin/config") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const s = z
          .object({
            bank: z.object({
              bank_name: z.string().min(2).max(100),
              account_number: z.string().regex(/^\d{5,30}$/),
              beneficiary: z.string().min(3).max(100),
            }),
            refund_policy: z.string().min(20).max(10000),
            support: z.string().min(5).max(500),
            retention_approved: z.boolean(),
          })
          .parse(b);
        textOnly(JSON.stringify(s));
        await rpc("set_config", {
          p_actor: actor,
          p_bank: s.bank,
          p_refund: s.refund_policy,
          p_support: s.support,
          p_retention: s.retention_approved,
        });
        return reply(200, {
          message:
            "Đã lưu. Thay đổi cấu hình khóa release_verified; phải nghiệm thu lại trước nhận tiền.",
        });
      }
      if (path === "admin/packages") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const s = z
          .object({
            code: z.enum(saleCodes),
            price: z.number().int(),
            hours: z.null().default(null),
            version: z.number().int(),
          })
          .parse(b);
        await rpc("set_package", {
          p_actor: actor,
          p_code: s.code,
          p_price: s.price,
          p_hours: s.hours,
          p_version: s.version,
        });
        return reply(200, {
          message:
            "Đã cập nhật gói version mới, đơn cũ giữ snapshot. Cần nghiệm thu lại bảng giá UI trước mở nhận đơn.",
        });
      }
      if (path === "admin/reviews") {
        const { data, error } = await db
          .from("reviews")
          .select("id,rating,body,nickname,moderation_state")
          .eq("moderation_state", "pending")
          .limit(100);

        if (error) throw Error("db");
        return reply(200, { reviews: data });
      }
      if (path === "admin/removal-tasks") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const { data, error } = await db
          .from("external_removal_tasks")
          .select("id,media_id,platform,state,created_at")
          .eq("state", "pending")
          .limit(100);

        if (error) throw Error("db");
        return reply(200, { tasks: data });
      }
      if (path === "admin/complete-removal") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const { task_id } = z.object({ task_id: z.uuid() }).parse(b);
        await rpc("complete_external_removal", {
          p_actor: actor,
          p_task: task_id,
        });
        return reply(200, {
          message:
            "Đã ghi nhận owner xác minh gỡ trên nền tảng ngoài; không khẳng định xóa mọi bản sao.",
        });
      }
      if (path === "admin/retention-dry-run") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const data = await rpc("retention_candidates", {});
        const counts: Record<string, number> = {};
        for (const row of data ?? [])
          counts[row.kind] = (counts[row.kind] ?? 0) + 1;
        return reply(200, {
          counts,
          message:
            "Chỉ xem số lượng ứng viên theo A15, không xóa. Việc xóa PII/Storage cần policy owner chốt và quy trình đã diễn tập.",
        });
      }
      if (path === "admin/confirm") {
        const s = z
          .object({
            order_id: z.uuid(),
            version: z.number().int(),
            amount: z.number().int().positive(),
            reference: z.string().min(4).max(100),
            reason: z.string().max(500).default(""),
          })
          .parse(b);
        const order = await rpc("confirm_payment_versioned", {
          p_actor: actor,
          p_order: s.order_id,
          p_version: s.version,
          p_amount: s.amount,
          p_reference: textOnly(s.reference),
          p_reason: textOnly(s.reason),
        });
        return reply(200, { message: "Đã xác nhận đối soát.", order });
      }
      if (path === "admin/draft" || path === "admin/publish") {
        const s = z
          .object({
            order_id: z.uuid(),
            version: z.number().int().positive(),
            body: z.string().min(2).max(60000),
          })
          .parse(b);
        const order = await rpc("write_result_versioned", {
          p_version: s.version,
          p_actor: actor,
          p_order: s.order_id,
          p_body: textOnly(s.body),
          p_publish: path.endsWith("publish"),
        });
        return reply(200, {
          order,
          message: path.endsWith("publish")
            ? "Đã phát hành."
            : "Đã lưu bản nháp.",
        });
      }
      if (path === "admin/publish-media") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const s = z
          .object({
            asset_id: z.uuid(),
            scope: z.enum([
              "website_public_gallery",
              "youtube_publication",
              "tiktok_publication",
            ]),
          })
          .parse(b);
        await rpc("publish_media", {
          p_actor: actor,
          p_asset: s.asset_id,
          p_scope: s.scope,
        });
        return reply(200, {
          message:
            "Đã ghi nhận phê duyệt. Nền tảng ngoài cần owner thao tác thủ công.",
        });
      }
      if (path === "admin/datasets") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const s = z
          .object({
            version: z.string().regex(/^[\w.-]{1,60}$/),
            content: z.record(
              z.string(),
              z.object({
                title: z.string().min(3),
                sections: z.array(z.string()).min(1),
              }),
            ),
            source: z.string().min(10).max(2000),
            license: z.string().min(3).max(500),
            publish: z.boolean(),
          })
          .parse(b);
        datasetSchema.parse({ version: s.version, content: s.content });
        if (
          Object.keys(s.content).length !== 12 ||
          Object.values(s.content).some(
            (e) => e.sections.join(" ").trim().split(/\s+/u).length < 501,
          )
        )
          return reply(400, {
            message: "Cần đủ 12 công cụ, mỗi nội dung ≥501 từ.",
          });
        textOnly(JSON.stringify(s.content));
        await rpc("save_dataset", {
          p_actor: actor,
          p_version: s.version,
          p_content: s.content,
          p_source: s.source,
          p_license: s.license,
          p_publish: s.publish,
          p_hash: await sha256(JSON.stringify(s.content)),
        });
        return reply(200, {
          message: s.publish
            ? "Đã xuất bản phiên bản bất biến."
            : "Đã lưu dataset draft.",
        });
      }
      if (path === "admin/members") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const s = z
          .object({
            user_id: z.uuid(),
            role: z.enum(["owner", "editor"]),
            active: z.boolean(),
          })
          .parse(b);
        await rpc("set_member", {
          p_actor: actor,
          p_user: s.user_id,
          p_role: s.role,
          p_active: s.active,
        });
        return reply(200, { message: "Đã cập nhật thành viên." });
      }
      if (path === "admin/moderate-review") {
        const s = z
          .object({ review_id: z.uuid(), approve: z.boolean() })
          .parse(b);
        if (s.approve) {
          const { data } = await db
            .from("reviews")
            .select("body,nickname")
            .eq("id", s.review_id)
            .single();
          if (
            !data ||
            /[\w.+-]+@[\w.-]+\.\w{2,}|(?:\+84|0)[\d .-]{8,}/u.test(
              data.body + " " + data.nickname,
            )
          )
            return reply(400, {
              message:
                "Nội dung có dấu hiệu chứa liên hệ riêng; từ chối hoặc yêu cầu khách sửa.",
            });
        }
        await rpc("moderate_review", {
          p_actor: actor,
          p_review: s.review_id,
          p_approve: s.approve,
        });
        return reply(200, { message: "Đã duyệt đánh giá." });
      }
      if (path === "admin/reset-secret") {
        if (role !== "owner") return reply(403, { message: "Chỉ owner." });
        const s = z
          .object({ order_id: z.uuid(), reason: z.string().min(20).max(500) })
          .parse(b);
        const secret = "HCX-" + token(32);
        await rpc("reset_order_access", {
          p_actor: actor,
          p_order: s.order_id,
          p_digest: await hmac(env.LOOKUP_PEPPER_V1, secret),
          p_legacy_digest: await hmac(env.LOOKUP_PEPPER_V1, token(16)),
          p_reason: textOnly(s.reason),
        });
        return reply(200, {
          secret,
          message: "Lưu mã mới một lần. Phiên và mã cũ đã bị thu hồi.",
        });
      }
      return reply(501, {
        message: "Thao tác này chưa được triển khai và kiểm thử; đang khóa.",
      });
    }
    if (
      ![
        "orders",
        "orders/lookup",
        "orders/lookup-code",
        "orders/upgrade-access",
        "orders/photo-reserve",
        "orders/photo-finish",
        "orders/claim-transfer",
        "reviews",
        "results/file-url",
        "consents/change",
        "consents/assets",
        "consents/photo-permission",
        "consents/preview",
        "consents/library-posts",
        "consents/library-preview",
        "consents/library-grant",
      ].includes(path)
    )
      return reply(404, { message: "Không có thao tác này." });
    // CF-Connecting-IP is set by Cloudflare. No trust in client X-Forwarded-For.
    const ip = request.headers.get("CF-Connecting-IP");
    if (!ip)
      return reply(503, {
        message: "Thiếu lớp mạng Cloudflare đáng tin; route được khóa an toàn.",
      });
    const ipHash = await hmac(env.LOOKUP_PEPPER_V1, ip);
    const code =
      path === "orders/lookup-code"
        ? typeof b.access_code === "string"
          ? b.access_code.slice(0, 100)
          : ""
        : typeof b.order_code === "string"
          ? b.order_code.toUpperCase().slice(0, 32)
          : "";
    const limit = await rpc("consume_limit", {
      p_key: ipHash,
      p_code: await hmac(env.LOOKUP_PEPPER_V1, ipHash + code),
      p_route: path,
    });
    if (!limit || !limit.allowed)
      return reply(429, {
        message: "Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.",
      });
    if (
      (limit.challenge &&
        ["orders/lookup", "orders/lookup-code"].includes(path)) ||
      path === "orders"
    ) {
      if (!env.TURNSTILE_SECRET_KEY || typeof b.challenge !== "string")
        return reply(403, {
          message: "Cần xác minh chống lạm dụng trước khi tiếp tục.",
        });
      const check = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: env.TURNSTILE_SECRET_KEY,
            response: b.challenge,
            remoteip: ip,
          }),
        },
      );
      const proof = (await check.json()) as {
        success: boolean;
        hostname?: string;
        action?: string;
      };
      if (
        !proof.success ||
        proof.hostname !== new URL(env.PUBLIC_ORIGIN).hostname ||
        proof.action !== (path === "orders" ? "order" : "lookup")
      )
        return reply(403, { message: "Xác minh chống lạm dụng chưa hợp lệ." });
    }
    if (path === "orders") {
      if (env.CHECKOUT_ENABLED !== "true")
        return reply(503, { message: "Nhận đơn thật đang khóa." });
      const s = orderSchema.parse(b);
      const accessCode = "HCX-" + token(32);
      const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
      const orderCode =
        "HC" +
        [...crypto.getRandomValues(new Uint8Array(12))]
          .map((n) => alphabet[n % 32])
          .join("");
      const data = await rpc("create_order_v2", {
        p_package_version: s.package_version,
        p_key: s.idempotency_key,
        p_user: actor,
        p_code: orderCode,
        p_legacy_digest: await hmac(env.LOOKUP_PEPPER_V1, token(16)),
        p_access_digest: await hmac(env.LOOKUP_PEPPER_V1, accessCode),
        p_phone: phone(s.phone),
        p_phone_hash: await hmac(env.LOOKUP_PEPPER_V1, phone(s.phone)),
        p_package: s.package_code,
        p_name: textOnly(s.name, 100),

        p_inputs: {
          gender: s.gender,
          birth_date: s.birth_date,
          birth_hour: s.birth_hour,
          ...(s.name2
            ? {
                name2: textOnly(s.name2, 100),
                gender2: s.gender2,
                birth_date2: s.birth_date2,
                birth_hour2: s.birth_hour2,
              }
            : {}),
          notes: textOnly(s.notes, 2000),
          photo_consent: s.photo_consent,
          age_band: s.photo_adult && s.photo_consent ? "18+" : "unknown",
          processing_notice: "order-v3-submit",
        },
      });
      return reply(201, {
        ...data,
        ...(data.created ? { access_code: accessCode } : {}),
        message: data.created
          ? "Lưu mã bảo mật tra cứu ngay. Chỉ hiển thị một lần."
          : "Yêu cầu đã được xử lý. Mã bí mật không được phát lại.",
      });
    }
    if (path === "orders/lookup-code") {
      const parsed = accessCodeSchema.safeParse(b.access_code);
      const session = token(32),
        csrf = token(24);
      const data = await rpc("lookup_order_access", {
        p_digest: await hmac(
          env.LOOKUP_PEPPER_V1,
          parsed.success ? parsed.data : "invalid",
        ),
        p_session: await sha256(session),
        p_csrf: await sha256(csrf),
      });
      if (!parsed.success || !data) return reply(401, { message: failure });
      headers.set(
        "Set-Cookie",
        `hc_lookup=${session}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=900`,
      );
      return reply(200, {
        ...data,
        csrf,
        message: data.result
          ? "Kết quả đã phát hành."
          : "Lời gửi sẽ xuất hiện khi được phát hành.",
      });
    }
    if (path === "orders/lookup") {
      const parsed = lookupSchema.safeParse({
        order_code: code,
        phone: b.phone,
        secret: b.secret,
      });
      let p = "invalid";
      try {
        p = phone(String(b.phone ?? ""));
      } catch {
        /* uniform failure */
      }
      const digest = await hmac(
        env.LOOKUP_PEPPER_V1,
        parsed.success ? parsed.data.secret : "invalid",
      );
      const session = token(32),
        csrf = token(24);
      const data = await rpc("lookup_order", {
        p_code: code,
        p_phone_hash: await hmac(env.LOOKUP_PEPPER_V1, p),
        p_digest: digest,
        p_session: await sha256(session),
        p_csrf: await sha256(csrf),
      });
      if (!parsed.success || !data) return reply(401, { message: failure });
      headers.set(
        "Set-Cookie",
        `hc_lookup=${session}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=900`,
      );
      return reply(200, {
        ...data,
        csrf,
        message: data.result ? "Kết quả đã phát hành." : "Chưa có kết quả.",
      });
    }
    const cookie = request.headers
      .get("Cookie")
      ?.match(/(?:^|;\s*)hc_lookup=([\w-]{43})(?:;|$)/)?.[1];
    const csrf = request.headers.get("X-CSRF-Token");
    if (!cookie || !csrf) return reply(401, { message: failure });
    const session = await rpc("resolve_lookup", {
      p_token: await sha256(cookie),
      p_csrf: await sha256(csrf),
    });
    if (!session) return reply(401, { message: failure });
    if (path === "orders/upgrade-access") {
      const code = "HCX-" + token(32);
      await rpc("upgrade_order_access", {
        p_order: session,
        p_digest: await hmac(env.LOOKUP_PEPPER_V1, code),
      });
      return reply(200, {
        access_code: code,
        message:
          "Lưu mã bảo mật mới ngay. Không đưa mã vào URL hoặc chuyển khoản.",
      });
    }
    const photo = await customerPhotos(db, path, b, session);
    if (photo) return reply(200, photo);
    const library = await libraryConsent(
      db,
      path,
      b,
      session,
      await sha256(cookie),
      await sha256(csrf),
    );
    if (library) return reply(200, library);
    if (path === "orders/claim-transfer") {
      await rpc("claim_transfer", { p_order: session });
      return reply(200, {
        message:
          "Đã ghi nhận bạn báo chuyển khoản; chưa xác nhận đã nhận tiền.",
      });
    }
    if (path === "consents/assets") {
      const { data, error } = await db
        .from("attachments")
        .select("id,mime,size,checksum,asset_version")
        .eq("order_id", session)
        .eq("classification", "public_derivative")
        .eq("release_state", "released");

      if (error) throw Error("db");
      return reply(200, { assets: data });
    }
    if (path === "consents/photo-permission") {
      const s = z.object({ granted: z.boolean() }).parse(b);
      await rpc("photo_permission", { p_order: session, p_granted: s.granted });
      return reply(200, {
        message: s.granted
          ? "Đã cho phép dùng ảnh riêng để dựng video; không bao gồm quyền công khai."
          : "Đã thu hồi quyền dùng ảnh cho lần xử lý tiếp theo. Liên hệ hỗ trợ để xử lý dữ liệu đã dựng.",
      });
    }
    if (path === "consents/preview") {
      const { asset_id } = z.object({ asset_id: z.uuid() }).parse(b);
      await rpc("record_preview", {
        p_token: await sha256(cookie),
        p_csrf: await sha256(csrf),
        p_asset: asset_id,
      });
      const { data: a } = await db
        .from("attachments")
        .select("bucket,storage_key,mime,checksum,asset_version")
        .eq("id", asset_id)
        .eq("order_id", session)
        .single();
      if (!a) throw Error("db");
      const { data, error } = await db.storage
        .from(a.bucket)
        .createSignedUrl(a.storage_key, 60);

      if (error) throw Error("db");
      return reply(200, {
        url: data.signedUrl,
        mime: a.mime,
        hash: a.checksum,
        version: a.asset_version,
      });
    }
    if (path === "consents/change") {
      const s = z
        .object({
          asset_id: z.uuid(),
          scope: z.enum([
            "customer_photo_for_private_video",
            "website_public_gallery",
            "youtube_publication",
            "tiktok_publication",
          ]),
          granted: z.boolean(),
          asset_hash: z.string().min(1).max(128),
          asset_version: z.number().int().positive(),
        })
        .parse(b);
      const { data: asset, error } = await db
        .from("attachments")
        .select("checksum,asset_version")
        .eq("id", s.asset_id)
        .eq("order_id", session)
        .maybeSingle();
      if (
        error ||
        !asset ||
        asset.checksum !== s.asset_hash ||
        asset.asset_version !== s.asset_version
      )
        return reply(409, {
          message: "Phiên bản tệp đã thay đổi. Cần xem và xác nhận bản mới.",
        });
      if (s.granted) {
        await rpc("grant_after_preview", {
          p_token: await sha256(cookie),
          p_csrf: await sha256(csrf),
          p_asset: s.asset_id,
          p_scope: s.scope,
          p_hash: s.asset_hash,
          p_version: s.asset_version,
        });
        return reply(200, {
          message:
            "Đã ghi nhận quyền đúng nền tảng và bản cuối được xem. Bạn có thể thu hồi bất cứ lúc nào.",
        });
      }
      await rpc("change_consent", {
        p_order: session,
        p_asset: s.asset_id,
        p_scope: s.scope,
        p_granted: false,
      });
      return reply(200, {
        message:
          "Đã thu hồi quyền. Bản website được gỡ; nền tảng ngoài vào hàng đợi xử lý thủ công.",
      });
    }
    if (path === "reviews") {
      const s = z
        .object({
          rating: z.number().int().min(1).max(5),
          text: z.string().max(1000),
          nickname: z.string().min(2).max(40),
        })
        .parse(b);
      await rpc("write_review", {
        p_order: session,
        p_rating: s.rating,
        p_text: textOnly(s.text, 1000),
        p_nickname: textOnly(s.nickname, 40),
      });
      return reply(200, { message: "Đánh giá đang chờ duyệt." });
    }
    if (path === "results/file-url") {
      const { attachment_id } = z.object({ attachment_id: z.uuid() }).parse(b);
      const { data, error } = await db
        .from("attachments")
        .select("storage_key,order_id,bucket,release_state,classification")
        .eq("id", attachment_id)
        .eq("order_id", session)
        .eq("release_state", "released")
        .eq("classification", "private_result")
        .maybeSingle();
      if (error || !data) return reply(404, { message: failure });
      const { data: result } = await db
        .from("reading_results")
        .select("id")
        .eq("order_id", session)
        .eq("state", "published")
        .maybeSingle();
      if (!result) return reply(404, { message: failure });
      const { data: url, error: signError } = await db.storage
        .from(data.bucket)
        .createSignedUrl(data.storage_key, 60, { download: true });
      if (signError) throw Error("db");
      return reply(200, { url: url.signedUrl, expires_in: 60 });
    }
    return reply(501, {
      message: "Chức năng chưa được triển khai, đang khóa.",
    });
  } catch (e) {
    if (e instanceof LibraryError)
      return reply(e.status, { message: e.message });
    if (e instanceof VersionConflict)
      return reply(409, {
        code:
          path === "orders"
            ? "PACKAGE_VERSION_CONFLICT"
            : "ORDER_VERSION_CONFLICT",
        message:
          "Phiên bản đã thay đổi. Tải lại và kiểm tra trước khi xác nhận lại.",
      });
    if (e instanceof z.ZodError)
      return reply(400, {
        message: path === "orders/lookup" ? failure : "Thông tin chưa hợp lệ.",
      });
    return reply(503, {
      message:
        path === "orders/lookup"
          ? failure
          : "Dịch vụ tạm không khả dụng. Chưa xác nhận thao tác thành công.",
    });
  }
}
