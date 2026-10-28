import { defaults } from "../src/lib/packages";
type Context = {
  request: Request;
  env: { PUBLIC_PREVIEW_ONLY?: string; MANUAL_DELIVERY_ENABLED?: string };
  next: () => Promise<Response>;
};
export async function onRequest({ request, env, next }: Context) {
  if (env.PUBLIC_PREVIEW_ONLY !== "true") return next();
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return next();
  // Authentication only: admin data and checkout remain guarded below.
  if (url.pathname === "/api/admin-login") return next();
  if (
    ["/api/delivery", "/api/showcase"].includes(url.pathname) &&
    env.MANUAL_DELIVERY_ENABLED === "true"
  )
    return next();
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (request.method === "GET") {
    if (url.pathname === "/api/config")
      return Response.json(
        {
          checkout_enabled: false,
          checkout_blockers: ["PUBLIC_PREVIEW_ONLY"],
          public_preview: true,
          turnstile_site_key: null,
          support: null,
          refund_policy: null,
          retention_approved: false,
          message: "Chức năng miễn phí đang mở; chưa tiếp nhận đơn riêng.",
        },
        { headers },
      );
    if (url.pathname === "/api/packages")
      return Response.json(defaults, { headers });
    if (url.pathname === "/api/public")
      return Response.json(
        { media: [], reviews: [], configured: false },
        { headers },
      );
    if (url.pathname === "/api/library")
      return Response.json({ posts: [] }, { headers });
    if (url.pathname === "/api/dataset")
      return Response.json(
        { message: "Dữ liệu miễn phí được đóng gói cùng ứng dụng." },
        { status: 503, headers },
      );
    return Response.json(
      { message: "Phương thức không được hỗ trợ." },
      { status: 405, headers },
    );
  }
  return Response.json(
    {
      message:
        "Bản giới thiệu chưa tiếp nhận dữ liệu hoặc thao tác tài khoản, đơn hàng.",
    },
    { status: 403, headers },
  );
}
