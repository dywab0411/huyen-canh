import { useState } from "react";
import { mfaQrSource } from "../../lib/mfa-qr";
import { auth } from "../../lib/auth";
export function Mfa() {
  const [qr, setQr] = useState(""),
    [factor, setFactor] = useState(""),
    [code, setCode] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function enroll() {
    if (!auth || busy) return;
    setBusy(true);
    const { data, error } = await auth.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Huyền Cảnh quản trị",
    });
    setBusy(false);
    if (error) {
      setMessage(
        "Chưa tạo được QR. Nếu đã thiết lập dở trước đó, chọn Làm lại thiết lập chưa hoàn tất bên dưới.",
      );
      return;
    }
    setFactor(data.id);
    setQr(data.totp.qr_code);
    setMessage(
      "Quét QR trong ứng dụng xác thực của bạn; đây là QR MFA, không phải QR thanh toán.",
    );
  }
  async function restartPending() {
    if (!auth || busy) return;
    setBusy(true);
    const { data, error } = await auth.auth.mfa.listFactors();
    if (error) {
      setBusy(false);
      setMessage("Chưa đọc được thiết lập MFA. Vui lòng thử lại.");
      return;
    }
    // Only this app's unfinished enrollment. Never remove a verified factor.
    for (const pending of data.all.filter(
      (f) =>
        f.factor_type === "totp" &&
        f.status === "unverified" &&
        f.friendly_name === "Huyền Cảnh quản trị",
    )) {
      const { error: removeError } = await auth.auth.mfa.unenroll({
        factorId: pending.id,
      });
      if (removeError) {
        setBusy(false);
        setMessage(
          "Không thể làm lại thiết lập. Phương thức đã xác minh được giữ nguyên.",
        );
        return;
      }
    }
    setQr("");
    setFactor("");
    setCode("");
    setBusy(false);
    setMessage(
      "Đã bỏ thiết lập chưa hoàn tất. Bấm Thiết lập TOTP lần đầu để tạo QR mới.",
    );
  }
  async function verify() {
    if (!auth) return;
    let id = factor;
    if (!id) {
      const { data, error } = await auth.auth.mfa.listFactors();
      if (error) {
        setMessage("Chưa đọc được phương thức MFA.");
        return;
      }
      id = data.totp.find((f) => f.status === "verified")?.id ?? "";
    }
    if (!id) {
      setMessage("Cần thiết lập TOTP trước.");
      return;
    }
    const { error } = await auth.auth.mfa.challengeAndVerify({
      factorId: id,
      code,
    });
    setMessage(
      error ? "Mã xác thực chưa hợp lệ." : "Phiên MFA AAL2 đã xác minh.",
    );
    if (!error) {
      setQr("");
      setCode("");
    }
  }
  return (
    <details>
      <summary>Bảo vệ phiên quản trị bằng TOTP</summary>
      <p>MFA chỉ tăng mức xác thực; không tự cấp role quản trị.</p>
      <button
        disabled={!auth || busy || Boolean(qr)}
        className="button secondary"
        onClick={() => void enroll()}
      >
        Thiết lập TOTP lần đầu
      </button>
      <button
        className="button secondary"
        disabled={!auth || busy}
        onClick={() => void restartPending()}
      >
        Làm lại thiết lập chưa hoàn tất
      </button>
      {qr && (
        <img
          alt="Mã thiết lập TOTP của chính bạn, không chia sẻ"
          width="220"
          height="220"
          src={mfaQrSource(qr)}
        />
      )}
      <label>
        Mã 6 chữ số từ ứng dụng xác thực
        <input
          autoComplete="one-time-code"
          inputMode="numeric"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />
      </label>
      <button
        className="button secondary"
        disabled={!auth || code.length !== 6}
        onClick={() => void verify()}
      >
        Xác minh phiên MFA
      </button>
      <p role="status">{message}</p>
    </details>
  );
}
