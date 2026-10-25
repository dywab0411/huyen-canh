import { useEffect, useState } from "react";
import { z } from "zod";
export const saleCodes = ["G10", "G20", "G60", "G70"] as const;
export const packageDescriptions = {
  G10: { title: "Một lời an nhiên", text: "Luận giải tích cực bằng văn bản." },
  G20: {
    title: "Hiểu mình thêm chút",
    text: "Luận giải bằng văn bản về mặt tích cực, khó khăn và lời khuyên.",
  },
  G60: {
    title: "Sắc sáng riêng bạn",
    text: "Video hoạt hình cá nhân hóa về mặt tích cực.",
  },
  G70: {
    title: "Câu chuyện trọn vẹn",
    text: "Video hoạt hình cá nhân hóa về tích cực, khó khăn và lời khuyên.",
  },
} as const;
export const packageSchema = z.object({
  code: z.enum(saleCodes),
  price_vnd: z.number().int().positive(),
  delivery_hours: z.null(),
  version: z.number().int().positive(),
  active: z.boolean(),
});
export const quoteSchema = z.object({
  source: z.enum(["server", "defaults"]),
  packages: z
    .array(packageSchema)
    .length(4)
    .refine((p) => new Set(p.map((x) => x.code)).size === 4),
});
export const defaults = quoteSchema.parse({
  source: "defaults",
  packages: [
    ["G10", 10000],
    ["G20", 20000],
    ["G60", 60000],
    ["G70", 70000],
  ].map(([code, price_vnd]) => ({
    code,
    price_vnd,
    delivery_hours: null,
    version: 1,
    active: true,
  })),
});
export async function fetchQuote() {
  const r = await fetch("/api/packages", { cache: "no-store" });
  if (!r.ok) throw Error("Chưa tải được giá đã xác minh.");
  return quoteSchema.parse(await r.json());
}
export function usePackages() {
  const [quote, setQuote] = useState(defaults);
  useEffect(() => {
    let active = true;
    void fetchQuote()
      .then((q) => {
        if (active) setQuote(q);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return { quote, setQuote };
}
