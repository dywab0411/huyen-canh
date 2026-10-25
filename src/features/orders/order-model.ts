import { z } from "zod";
import { saleCodes } from "../../lib/packages";
export function todayInVietnam() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const v = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${v("year")}-${v("month")}-${v("day")}`;
}
export const birthDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) => {
      const d = new Date(v + "T00:00:00Z");
      return (
        !Number.isNaN(d.getTime()) &&
        d.toISOString().slice(0, 10) === v &&
        v >= "0001-01-01" &&
        v <= todayInVietnam()
      );
    },
    { message: "Ngày sinh không hợp lệ hoặc ở tương lai." },
  );
export const birthHour = z
  .string()
  .regex(/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/)
  .nullable()
  .default(null);
const name = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .regex(/^[\p{L} .'-]+$/u);
export const orderRequest = z
  .object({
    package_code: z.enum(saleCodes),
    package_version: z.number().int().positive(),
    name,
    gender: z.enum(["Nam", "Nữ"]),
    birth_date: birthDate,
    birth_hour: birthHour,
    birth_date2: birthDate.optional(),
    birth_hour2: birthHour,
    name2: name.optional(),
    gender2: z.enum(["Nam", "Nữ"]).optional(),
    phone: z.string().max(30),
    notes: z.string().trim().max(2000).default(""),
    photo_consent: z.boolean().default(false),
    photo_adult: z.boolean().default(false),
    idempotency_key: z.uuid(),
    challenge: z.string().max(4000).optional(),
  })
  .strict()
  .refine(
    (p) =>
      Boolean(p.name2) === Boolean(p.gender2) &&
      Boolean(p.name2) === Boolean(p.birth_date2) &&
      (Boolean(p.name2) || p.birth_hour2 === null),
    {
      message: "Người thứ hai cần họ tên, giới tính và ngày sinh.",
    },
  )
  .refine((p) => !p.photo_consent || p.photo_adult, {
    message: "Ảnh cá nhân cần xác nhận từ 18 tuổi và quyền sử dụng riêng.",
  });
export const accessCodeSchema = z.string().regex(/^HCX-[A-Za-z0-9_-]{43}$/);
