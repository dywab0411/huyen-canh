import { expect, it } from "vitest";
import { passwordChangeMessage } from "../../src/lib/password-error";
it("identifies an MFA block instead of asking for repeated password attempts", () => {
  expect(passwordChangeMessage({ code: "insufficient_aal" })).toContain(
    "xác minh hai bước",
  );
});
it("identifies expired and reauthentication sessions", () => {
  expect(passwordChangeMessage({ code: "reauthentication_needed" })).toContain(
    "xác minh lại",
  );
  expect(passwordChangeMessage({ code: "session_not_found" })).toContain(
    "hết hạn",
  );
});
it("handles weak or unchanged passwords with a short message", () => {
  expect(passwordChangeMessage({ code: "weak_password" })).toContain(
    "chưa đạt yêu cầu",
  );
  expect(passwordChangeMessage({ code: "same_password" })).toContain(
    "đang được sử dụng",
  );
});
it("never renders arbitrary provider errors or sensitive message contents", () => {
  expect(
    passwordChangeMessage({
      code: "unknown",
      message: "fixture-sensitive-text",
    }),
  ).not.toContain("fixture-sensitive-text");
  expect(passwordChangeMessage(null)).toContain("Chưa đổi được");
});
