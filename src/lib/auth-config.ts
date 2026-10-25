export function authConfig(preview: boolean, rawUrl?: string, rawKey?: string) {
  if (preview) return { reason: "PUBLIC_PREVIEW_ONLY" } as const;
  const url = rawUrl?.trim();
  const key = rawKey?.trim();
  if (!url || !key) return { reason: "BUILD_ENV_MISSING" } as const;
  try {
    const parsed = new URL(url);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    )
      return { reason: "BUILD_URL_INVALID" } as const;
  } catch {
    return { reason: "BUILD_URL_INVALID" } as const;
  }
  if (key.startsWith("sb_secret_"))
    return { reason: "SERVER_KEY_REJECTED" } as const;
  if (!key.startsWith("sb_publishable_")) {
    try {
      const payload = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { role?: string };
      if (payload.role !== "anon")
        return { reason: "SERVER_KEY_REJECTED" } as const;
    } catch {
      return { reason: "PUBLIC_KEY_INVALID" } as const;
    }
  }
  return { reason: null, url, key } as const;
}

export const oauthCallback = (origin: string) =>
  new URL("/auth/callback", origin).href;
