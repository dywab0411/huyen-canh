import { it, expect } from "vitest";
import {
  orderRequest,
  accessCodeSchema,
} from "../../src/features/orders/order-model";
import { canPublish } from "../../src/domain";
const input = {
  package_code: "G60",
  package_version: 1,
  name: "Đặng Minh An",
  gender: "Nam",
  birth_date: "2000-02-29",
  birth_hour: null,
  phone: "0912345678",
  idempotency_key: "90000000-0000-4000-8000-000000000001",
};
it("v2 validates one person, optional pair and explicit independent photo rights", () => {
  expect(orderRequest.safeParse(input).success).toBe(true);
  expect(
    orderRequest.safeParse({ ...input, name2: "Nguyễn Bình Yên" }).success,
  ).toBe(false);
  expect(
    orderRequest.safeParse({
      ...input,
      name2: "Nguyễn Bình Yên",
      gender2: "Nữ",
      birth_date2: "1999-01-12",
    }).success,
  ).toBe(true);
  expect(
    orderRequest.safeParse({ ...input, photo_consent: true }).success,
  ).toBe(false);
  expect(
    orderRequest.safeParse({ ...input, photo_consent: true, photo_adult: true })
      .success,
  ).toBe(true);
  expect(
    orderRequest.safeParse({ ...input, package_code: "G50" }).success,
  ).toBe(false);
});
it("one-field access accepts only the 256-bit capability format, never a public payment reference", () => {
  expect(accessCodeSchema.safeParse("HCX-" + "a".repeat(43)).success).toBe(
    true,
  );
  for (const code of ["HC0123456789AB", "a".repeat(22), "HCX-short"])
    expect(accessCodeSchema.safeParse(code).success).toBe(false);
});
it("new video plans and legacy G50 all retain released-video gate", () => {
  for (const code of ["G50", "G60", "G70"]) {
    expect(canPublish("paid", code, "từ ".repeat(501), false)).toBe(false);
    expect(canPublish("paid", code, "từ ".repeat(501), true)).toBe(true);
  }
});

it("birth validation rejects impossible and future dates, requires both people dates, preserves unknown hour null", () => {
  const valid = { ...input, birth_date: "2000-02-29" };
  expect(orderRequest.parse(valid).birth_hour).toBe(null);
  for (const birth_date of [
    "2001-02-29",
    "2024-02-30",
    "9999-01-01",
    "2020-13-01",
    "0000-01-01",
    "",
  ])
    expect(orderRequest.safeParse({ ...valid, birth_date }).success).toBe(
      false,
    );
  for (const birth_hour of ["24:00", "09", "9:00", "12:60"])
    expect(orderRequest.safeParse({ ...valid, birth_hour }).success).toBe(
      false,
    );
  for (const birth_hour of ["00:00", "09:30", "23:59", null])
    expect(orderRequest.safeParse({ ...valid, birth_hour }).success).toBe(true);
  expect(
    orderRequest.safeParse({ ...valid, name2: "Người Thứ Hai", gender2: "Nữ" })
      .success,
  ).toBe(false);
  expect(
    orderRequest.safeParse({ ...valid, birth_date2: "2000-01-01" }).success,
  ).toBe(false);
});
