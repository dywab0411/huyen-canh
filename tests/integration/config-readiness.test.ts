import { beforeEach, it, expect, vi } from "vitest";
const fixture = vi.hoisted(() => ({
  schema: 13,
  schemaError: false,
  dbError: false,
  release: true,
  retention: true,
  bankMatch: true,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select() {
        return this;
      },
      limit() {
        return this;
      },
      single: async () => ({
        error: fixture.dbError ? {} : null,
        data: {
          bank: fixture.bankMatch
            ? {
                bank_name: "SACOMBANK",
                account_number: "040058981194",
                beneficiary: "NGUYỄN MINH CHÍNH",
              }
            : { bank_name: "wrong" },
          refund_policy: "Synthetic policy only",
          support: "Synthetic contact only",
          retention_approved: fixture.retention,
          release_verified: fixture.release,
        },
      }),
    }),
    rpc: async () => ({
      data: fixture.schema,
      error: fixture.schemaError ? {} : null,
    }),
  }),
}));
import { onRequestGet } from "../../functions/api/config";
const env = {
  SUPABASE_URL: "https://fixture.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "synthetic-not-secret",
  CHECKOUT_ENABLED: "true",
  TURNSTILE_SITE_KEY: "synthetic",
  TURNSTILE_SECRET_KEY: "synthetic",
  LOOKUP_PEPPER_V1: "synthetic",
  PUBLIC_ORIGIN: "https://fixture.invalid",
};
beforeEach(() =>
  Object.assign(fixture, {
    schema: 13,
    schemaError: false,
    dbError: false,
    release: true,
    retention: true,
    bankMatch: true,
  }),
);
async function status(overrides: Partial<typeof env> = {}) {
  return (await onRequestGet({ env: { ...env, ...overrides } })).json();
}
it("only all configured and preverified conditions enable checkout", async () => {
  const j = await status();
  expect(j.checkout_enabled).toBe(true);
  expect(j.checkout_blockers).toEqual([]);
});
it("old database schema never enables checkout", async () => {
  fixture.schema = 12;
  const j = await status();
  expect(j.checkout_enabled).toBe(false);
  expect(j.checkout_blockers).toContain("DATABASE_MIGRATION_REQUIRED");
});
it("schema probe failure never enables checkout", async () => {
  fixture.schemaError = true;
  expect((await status()).checkout_enabled).toBe(false);
});
it("unverified release or retention never enables checkout", async () => {
  fixture.release = false;
  expect((await status()).checkout_enabled).toBe(false);
  fixture.release = true;
  fixture.retention = false;
  expect((await status()).checkout_enabled).toBe(false);
});
it("bank mismatch cannot enable checkout", async () => {
  fixture.bankMatch = false;
  expect((await status()).checkout_enabled).toBe(false);
});
it("database error cannot enable checkout", async () => {
  fixture.dbError = true;
  expect((await status()).checkout_enabled).toBe(false);
});
it("feature flag, origin or challenge must not be bypassed", async () => {
  for (const overrides of [
    { CHECKOUT_ENABLED: "false" },
    { PUBLIC_ORIGIN: "" },
    { TURNSTILE_SECRET_KEY: "" },
    { LOOKUP_PEPPER_V1: "" },
  ])
    expect((await status(overrides)).checkout_enabled).toBe(false);
});
