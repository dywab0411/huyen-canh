import { it, expect } from "vitest";
import {
  dateFromDisplay,
  dateForDisplay,
  maskDate,
  maskTime,
  timeForDisplay,
} from "../../src/features/orders/birth-format";
import { birthDate, birthHour } from "../../src/features/orders/order-model";
it("Vietnamese date display converts to canonical ISO without month/day ambiguity", () => {
  expect(maskDate("29022000")).toBe("29/02/2000");
  expect(dateFromDisplay("29/02/2000")).toBe("2000-02-29");
  expect(dateForDisplay("2000-02-29")).toBe("29/02/2000");
  expect(birthDate.safeParse(dateFromDisplay("31/02/2000")).success).toBe(
    false,
  );
  expect(dateFromDisplay("2/3/2000")).toBe("");
});
it("clock accepts precise 24h minutes and displays legacy hours without inventing minutes", () => {
  expect(maskTime("0937")).toBe("09:37");
  expect(birthHour.parse("09:37")).toBe("09:37");
  expect(birthHour.parse(null)).toBe(null);
  expect(timeForDisplay("09")).toBe("09 giờ (chưa có phút)");
  expect(timeForDisplay("09:37")).toBe("09:37");
  expect(timeForDisplay(null)).toBe("Không rõ");
});
