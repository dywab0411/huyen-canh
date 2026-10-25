import { z } from "zod";
import { tools } from "../engine";
export const datasetSchema = z
  .object({
    version: z.string().regex(/^[\w.-]{1,60}$/),
    content: z.record(
      z.string(),
      z.object({
        title: z.string().min(3).max(200),
        sections: z.array(z.string().min(1)).min(1).max(12),
      }),
    ),
  })
  .superRefine((v, c) => {
    if (
      Object.keys(v.content).length !== 12 ||
      tools.some((t) => !v.content[t[0]])
    )
      c.addIssue({ code: "custom", message: "Cần đúng 12 slug công cụ." });
    for (const e of Object.values(v.content)) {
      if (
        e.sections.join(" ").trim().split(/\s+/u).length < 501 ||
        /[<>]|javascript:/iu.test(e.title + e.sections.join(" "))
      )
        c.addIssue({
          code: "custom",
          message: "Nội dung cần ≥501 từ, không HTML/script.",
        });
    }
  });
export type Dataset = z.infer<typeof datasetSchema>;
