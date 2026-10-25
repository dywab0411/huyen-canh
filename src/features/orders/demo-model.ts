import { z } from "zod";
import { saleCodes, defaults } from "../../lib/packages";
export function demoAllowed() {
  return (
    import.meta.env.DEV &&
    typeof location !== "undefined" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
  );
}
const key = "hc-local-demo-v1";
const entry = z
  .object({
    code: z.string().regex(/^DEMO-[a-f0-9-]{36}$/),
    access: z.string().regex(/^DEMO-[a-f0-9-]{36}$/),
    pkg: z.enum(saleCodes),
    price: z.number().int().positive(),
    expires: z.number(),
    stage: z.enum(["created", "claimed", "sample"]),
  })
  .strict();
export type DemoEntry = z.infer<typeof entry>;
function read(): DemoEntry[] {
  if (!demoAllowed()) throw Error("DEMO chỉ có trên dev server local.");
  try {
    return z
      .array(entry)
      .max(20)
      .parse(JSON.parse(sessionStorage.getItem(key) || "[]"))
      .filter((v) => v.expires > Date.now());
  } catch {
    return [];
  }
}
export function createDemo(pkg: (typeof saleCodes)[number]): DemoEntry {
  const price = defaults.packages.find((p) => p.code === pkg)!.price_vnd;
  const item: DemoEntry = {
    code: "DEMO-" + crypto.randomUUID(),
    access: "DEMO-" + crypto.randomUUID(),
    pkg,
    price,
    expires: Date.now() + 3600000,
    stage: "created",
  };
  sessionStorage.setItem(key, JSON.stringify([...read().slice(-19), item]));
  return item;
}
export function lookupDemo(access: string) {
  return read().find((v) => v.access === access) ?? null;
}
export function advanceDemo(access: string, stage: DemoEntry["stage"]) {
  const all = read();
  const i = all.findIndex((v) => v.access === access);
  if (i < 0) throw Error("Mã DEMO không tồn tại hoặc đã hết hạn.");
  if (stage === "sample" && all[i].stage !== "claimed")
    throw Error("Hãy thử bước báo chuyển khoản giả lập trước.");
  all[i] = { ...all[i], stage };
  sessionStorage.setItem(key, JSON.stringify(all));
  return all[i];
}
export function clearDemo() {
  if (demoAllowed()) sessionStorage.removeItem(key);
}
