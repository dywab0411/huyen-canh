import { expect, it } from "vitest";
import { authConfig, oauthCallback } from "../../src/lib/auth-config";
import { createClient } from "@supabase/supabase-js";
const url = "https://example.supabase.co";
// Deliberately fake fixtures, no usable project credentials.
const publishable = "sb_publishable_test_fixture_not_a_real_key";
const jwt = (role: string) => `e30.${btoa(JSON.stringify({ role }))}.fixture`;
it("accepts a new publishable key without interpreting it as JWT", () => {
  expect(authConfig(false, url, publishable).reason).toBeNull();
});
it("retains legacy anon support", () => {
  expect(authConfig(false, url, jwt("anon")).reason).toBeNull();
});
it("rejects server keys including legacy service_role", () => {
  expect(authConfig(false, url, "sb_secret_fixture").reason).toBe(
    "SERVER_KEY_REJECTED",
  );
  expect(authConfig(false, url, jwt("service_role")).reason).toBe(
    "SERVER_KEY_REJECTED",
  );
});
it("reports missing build variables without exposing values", () => {
  expect(authConfig(false, url)).toEqual({ reason: "BUILD_ENV_MISSING" });
});
it("retains the explicit public preview lock with configured credentials", () => {
  expect(authConfig(true, url, publishable)).toEqual({
    reason: "PUBLIC_PREVIEW_ONLY",
  });
});
it("rejects malformed URLs and trims surrounding whitespace", () => {
  expect(authConfig(false, "invalid", publishable).reason).toBe(
    "BUILD_URL_INVALID",
  );
  expect(authConfig(false, ` ${url} `, ` ${publishable} `).reason).toBeNull();
});
it("uses the code exchange callback before returning to the account page", () => {
  expect(oauthCallback("https://huyencanh.pages.dev")).toBe(
    "https://huyencanh.pages.dev/auth/callback",
  );
});
it("the installed Supabase SDK creates a Google PKCE URL with a publishable key", async () => {
  const db = createClient(url, publishable, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: () => {
        throw Error("Unexpected network request in SDK URL test");
      },
    },
  });
  const result = await db.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: oauthCallback("https://huyencanh.pages.dev"),
      skipBrowserRedirect: true,
    },
  });
  expect(result.error).toBeNull();
  const target = new URL(result.data.url!);
  expect(target.pathname).toBe("/auth/v1/authorize");
  expect(target.searchParams.get("provider")).toBe("google");
  expect(target.searchParams.get("redirect_to")).toBe(
    "https://huyencanh.pages.dev/auth/callback",
  );
  expect(target.searchParams.get("code_challenge")).toBeTruthy();
});
