export const prices = {
  G10: 10000,
  G20: 20000,
  G60: 60000,
  G70: 70000,
} as const;
export type State =
  | "awaiting_payment"
  | "payment_claimed"
  | "expired"
  | "cancelled"
  | "paid"
  | "in_progress"
  | "ready"
  | "delivered"
  | "refund_pending"
  | "refunded";
export function canConfirm(
  state: State,
  amount: number,
  expected: number,
  lateReason?: string,
) {
  return (
    amount === expected &&
    (["awaiting_payment", "payment_claimed"].includes(state) ||
      (state === "expired" && Boolean(lateReason?.trim())))
  );
}
export function canPublish(
  state: State,
  pkg: string,
  body: string,
  hasVideo: boolean,
) {
  return (
    ["paid", "in_progress", "ready", "delivered"].includes(state) &&
    body.trim().split(/\s+/u).length >= 501 &&
    (!["G50", "G60", "G70"].includes(pkg) || hasVideo)
  );
}
export type Scope =
  | "service_processing"
  | "customer_photo_for_private_video"
  | "website_public_gallery"
  | "youtube_publication"
  | "tiktok_publication";
export type Consent = {
  scope: Scope;
  assetHash: string;
  assetVersion: number;
  granted: boolean;
  adult: boolean;
};
export function canPublic(
  c: Consent[],
  scope: Scope,
  hash: string,
  version: number,
) {
  const latest = c
    .filter(
      (e) =>
        e.scope === scope && e.assetHash === hash && e.assetVersion === version,
    )
    .at(-1);
  return Boolean(latest?.granted && latest.adult);
}
export function retentionCandidate(
  state: State,
  deliveredAt: string | null,
  expiresAt: string,
  now: string,
) {
  const delta = (a: string) => Date.parse(now) - Date.parse(a);
  return state === "delivered"
    ? Boolean(deliveredAt && delta(deliveredAt) > 180 * 86400000)
    : state === "expired" && delta(expiresAt) > 30 * 86400000;
}
export function textOnly(s: string, max = 100000) {
  if (s.length > max || /[<>]/u.test(s) || /javascript:/iu.test(s))
    throw Error("Chỉ chấp nhận văn bản thuần, không HTML hoặc script.");
  return s.normalize("NFC").trim();
}
