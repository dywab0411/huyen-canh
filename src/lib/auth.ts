import { publicPreview } from "./deployment";
import { createClient } from "@supabase/supabase-js";
import { ApiError } from "./api-error";
import { authConfig, oauthCallback } from "./auth-config";
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  string | undefined;
const config = authConfig(publicPreview, url, publishableKey || key);
export const authConfigurationIssue = config.reason;
export const auth =
  config.reason === null
    ? createClient(config.url, config.key, {
        auth: { flowType: "pkce", detectSessionInUrl: false },
      })
    : null;
export async function login() {
  if (!auth)
    throw Error(
      "Chưa cấu hình Google OAuth/Supabase. Miễn phí vẫn hoạt động không cần tài khoản.",
    );
  const { error } = await auth.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: oauthCallback(location.origin) },
  });
  if (error) throw error;
}
export async function api(path: string, body: unknown, csrf?: string) {
  const session = auth ? await auth.auth.getSession() : null;
  const response = await fetch("/api/" + path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      ...(session?.data.session
        ? { Authorization: "Bearer " + session.data.session.access_token }
        : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.headers.get("Content-Type")?.includes("application/json"))
    throw Error(
      "API chưa được cấu hình trong bản local này. Chưa thực hiện thao tác trên máy chủ.",
    );
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok)
    throw new ApiError(
      String(
        data.message ?? "Dịch vụ chưa thể truy cập. Vui lòng thử lại sau.",
      ),
      response.status,
      typeof data.code === "string" ? data.code : undefined,
    );
  return data;
}
