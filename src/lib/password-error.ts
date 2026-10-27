export function passwordChangeMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  switch (code) {
    case "insufficient_aal":
      return "Tài khoản đang bật xác minh hai bước. Cần xử lý xác minh hai bước trước khi đổi mật khẩu.";
    case "reauthentication_needed":
    case "reauth_nonce_missing":
    case "reauthentication_not_valid":
      return "Cần xác minh lại tài khoản trước khi đổi mật khẩu.";
    case "session_not_found":
    case "session_expired":
    case "bad_jwt":
      return "Phiên xác minh đã hết hạn. Vui lòng mở liên kết đặt mật khẩu mới.";
    case "weak_password":
      return "Mật khẩu mới chưa đạt yêu cầu. Hãy chọn mật khẩu mạnh hơn.";
    case "same_password":
      return "Mật khẩu này đang được sử dụng. Hãy chọn mật khẩu mới.";
    default:
      return "Chưa đổi được mật khẩu. Vui lòng thử lại.";
  }
}
