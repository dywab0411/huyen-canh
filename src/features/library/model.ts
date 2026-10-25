import { z } from "zod";
const plain = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !/[<>\u0000]/u.test(s));
export const categories = [
  "Câu chuyện",
  "Bản thân",
  "Tình duyên",
  "Công danh",
  "Phong thủy",
] as const;
export const postPayload = z
  .object({
    title: plain(160),
    body: plain(20000),
    category: z.enum(categories),
    kind: z.enum(["editorial", "customer"]),
    order_id: z.uuid().nullable(),
    video_id: z.uuid(),
    cover_id: z.uuid(),
    rights_confirmed: z.boolean(),
  })
  .strict()
  .refine((p) =>
    p.kind === "customer" ? p.order_id !== null : p.order_id === null,
  );
export type PostPayload = z.infer<typeof postPayload>;
export type LibraryPost = {
  id: string;
  version: number;
  content_revision: number;
  state: "draft" | "public";
  published_at: string | null;
  created_at: string;
  payload: PostPayload;
};
export type PublicPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  published_at: string;
  video_url: string;
  cover_url: string;
};
