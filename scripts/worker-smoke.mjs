import { writeFile } from "node:fs/promises";
const base = "http://127.0.0.1:8788";
const results = [];
for (const [path, method, expected] of [
  ["/", "GET", 200],
  ["/api/config", "GET", 200],
  ["/api/public", "GET", 200],
  ["/api/dataset", "GET", 503],
  ["/api/orders/lookup", "GET", 405],
  ["/api/orders", "POST", 403],
  ["/api/admin/session", "POST", 403],
]) {
  const r = await fetch(base + path, {
    method,
    headers:
      method === "POST"
        ? { Origin: base, "Content-Type": "application/json" }
        : {},
    ...(method === "POST" ? { body: "{}" } : {}),
  });
  if (r.status !== expected)
    throw Error(path + ": expected " + expected + ", got " + r.status);
  if (path.startsWith("/api/") && r.headers.get("Cache-Control") !== "no-store")
    throw Error("API cache header");
  if (path === "/api/config") {
    const c = await r.json();
    if (c.checkout_enabled !== false)
      throw Error("unconfigured checkout unlocked");
  }
  results.push({ path, method, status: r.status, pass: true });
}
await writeFile(
  "docs/WORKER_LOCAL_REPORT.json",
  JSON.stringify(
    {
      date: "2026-10-25",
      environment: "Wrangler Pages local, no Supabase credentials",
      results,
      limits:
        "Origin guard returns 403 without PUBLIC_ORIGIN. No cloud data operations verified.",
    },
    null,
    2,
  ),
);
console.log("7 real HTTP local Worker smoke checks passed.");
