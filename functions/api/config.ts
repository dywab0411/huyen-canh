import { bank } from "../../src/lib/site-info";
import { createClient } from "@supabase/supabase-js";
type Env = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CHECKOUT_ENABLED?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  LOOKUP_PEPPER_V1?: string;
  PUBLIC_ORIGIN?: string;
};
export async function onRequestGet({ env }: { env: Env }) {
  let ready = false;
  const blockers: string[] = [];
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    blockers.push("BACKEND_NOT_CONFIGURED");
  if (env.CHECKOUT_ENABLED !== "true") blockers.push("CHECKOUT_FLAG_OFF");
  if (!env.TURNSTILE_SITE_KEY || !env.TURNSTILE_SECRET_KEY)
    blockers.push("CHALLENGE_NOT_CONFIGURED");
  if (!env.LOOKUP_PEPPER_V1 || !env.PUBLIC_ORIGIN)
    blockers.push("SECURITY_NOT_CONFIGURED");
  let support: string | null = null;
  let refund: string | null = null;
  let retention = false;
  try {
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      const { data, error } = await db
        .from("site_config")
        .select(
          "bank,refund_policy,support,retention_approved,release_verified",
        )
        .limit(1)
        .single();
      if (error) blockers.push("DATABASE_UNAVAILABLE");
      if (!data?.refund_policy) blockers.push("REFUND_POLICY_PENDING");
      if (!data?.retention_approved) blockers.push("RETENTION_PENDING");
      if (!data?.release_verified) blockers.push("RELEASE_NOT_VERIFIED");
      const schema = await db.rpc("order_birth_schema_version");
      if (schema.error || schema.data !== 13)
        blockers.push("DATABASE_MIGRATION_REQUIRED");
      ready =
        !schema.error &&
        schema.data === 13 &&
        !error &&
        data?.bank?.bank_name === bank.bank_name &&
        data?.bank?.account_number === bank.account_number &&
        data?.bank?.beneficiary === bank.beneficiary &&
        !!data?.refund_policy &&
        !!data?.support &&
        data.retention_approved &&
        data.release_verified &&
        env.CHECKOUT_ENABLED === "true" &&
        Boolean(
          env.TURNSTILE_SITE_KEY &&
          env.TURNSTILE_SECRET_KEY &&
          env.LOOKUP_PEPPER_V1 &&
          env.PUBLIC_ORIGIN,
        );
      support = data?.support ?? null;
      refund = data?.refund_policy ?? null;
      retention = data?.retention_approved ?? false;
    }
  } catch {
    blockers.push("DATABASE_UNAVAILABLE");
  }
  return Response.json(
    {
      checkout_enabled: ready,
      checkout_blockers: ready
        ? []
        : [
            ...new Set(
              blockers.length ? blockers : ["CONFIGURATION_NOT_VERIFIED"],
            ),
          ],
      turnstile_site_key: env.TURNSTILE_SITE_KEY ?? null,
      support,
      refund_policy: refund,
      retention_approved: retention,
      message: ready
        ? "Đã cấu hình nhận đơn."
        : "Nhận đơn thật đang khóa: cần cấu hình và nghiệm thu phát hành.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
