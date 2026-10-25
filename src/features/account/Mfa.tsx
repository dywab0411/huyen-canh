import { useState } from "react";
import { auth } from "../../lib/auth";
export function Mfa() {
  const [qr, setQr] = useState(""),
    [factor, setFactor] = useState(""),
    [code, setCode] = useState(""),
    [message, setMessage] = useState("");
  async function enroll() {
    if (!auth) return;
    const { data, error } = await auth.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Huyền Cảnh quản trị",
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setFactor(data.id);
    setQr(data.totp.qr_code);
    setMessage(
      "Quét QR trong ứng dụng xác thực của bạn; đây là QR MFA, không phải QR thanh toán.",
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
        disabled={!auth}
        className="button secondary"
        onClick={() => void enroll()}
      >
        Thiết lập TOTP lần đầu
      </button>
      {qr && (
        <img
          alt="Mã thiết lập TOTP của chính bạn, không chia sẻ"
          width="220"
          height="220"
          src={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(qr)}
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
