import { useState } from "react";
import { api } from "../../lib/auth";
export function UpgradeAccess({ csrf }: { csrf: string }) {
  const [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <details>
      <summary>Đổi trải nghiệm đơn cũ sang tra cứu một mã</summary>
      <p>
        Chỉ thực hiện sau khi xác minh đủ thông tin cũ. Quyền và dữ liệu đơn
        không thay đổi.
      </p>
      <button
        className="button secondary"
        disabled={busy || Boolean(code)}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await api("orders/upgrade-access", {}, csrf);
            setCode(String(r.access_code));
            setMessage(String(r.message));
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Tạo mã bảo mật cho đơn đã xác minh
      </button>
      {code && (
        <>
          <label>
            Mã bảo mật mới · lưu ngay
            <input readOnly value={code} />
          </label>
          <button
            className="button secondary"
            onClick={() =>
              void navigator.clipboard
                .writeText(code)
                .then(() => setMessage("Đã chép mã bảo mật mới."))
            }
          >
            Chép mã bảo mật mới
          </button>
          <button className="button secondary" onClick={() => setCode("")}>
            Đã lưu · ẩn mã
          </button>
        </>
      )}
      <p role="status">{message}</p>
    </details>
  );
}
