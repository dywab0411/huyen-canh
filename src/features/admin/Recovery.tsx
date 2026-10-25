import { useState } from "react";
import { api } from "../../lib/auth";
export function Recovery({
  orderId,
  version,
  amount,
  owner,
  onDone,
}: {
  orderId: string;
  version: number;
  amount: number;
  owner: boolean;
  onDone: () => Promise<void>;
}) {
  const [message, setMessage] = useState(""),
    [secret, setSecret] = useState("");
  return (
    <details>
      <summary>Tiền đến muộn & khôi phục mã đã xác minh</summary>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            const r = await api("admin/confirm", {
              order_id: orderId,
              version,
              amount,
              reference: f.get("reference"),
              reason: f.get("reason"),
            });
            setMessage(String(r.message));
            await onDone();
          } catch (e) {
            await onDone();
            setMessage((e as Error).message);
          }
        }}
      >
        <p>
          Chỉ dùng sau khi kiểm tra giao dịch thực. Tiền đến sau expiry cần lý
          do đối soát; không mất đơn hoặc tự đánh dấu paid.
        </p>
        <label>
          Mã tham chiếu đã kiểm tra
          <input name="reference" minLength={4} maxLength={100} required />
        </label>
        <label>
          Lý do và kết quả xác minh (không nhập PII)
          <textarea name="reason" minLength={20} maxLength={500} required />
        </label>
        <button className="button secondary">Xác nhận đối soát đến muộn</button>
      </form>
      {owner && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              const r = await api("admin/reset-secret", {
                order_id: orderId,
                reason: f.get("reason"),
              });
              setSecret(String(r.secret));
              setMessage(String(r.message));
              await onDone();
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
        >
          <h3>Cấp mã mới một lần</h3>
          <p>
            Không cấp mã chỉ từ code+phone. Xác minh qua kênh đăng ký và bằng
            chứng giao dịch tối thiểu trước thao tác.
          </p>
          <label>
            Ghi nhận đã xác minh (không ghi thông tin cá nhân)
            <textarea name="reason" minLength={20} maxLength={500} required />
          </label>
          <label className="checkbox">
            <input type="checkbox" required />
            Tôi đã xác minh ngoài hệ thống, hiểu mọi mã và phiên cũ sẽ mất hiệu
            lực.
          </label>
          <button className="button secondary">
            Thu hồi mã cũ và cấp mã mới
          </button>
          {secret && (
            <>
              <label>
                Mã mới, không được log hoặc gửi công khai
                <input readOnly value={secret} />
              </label>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setSecret("");
                  setMessage("Đã xóa mã khỏi màn hình. Không thể xem lại.");
                }}
              >
                Đã giao an toàn · ẩn mã
              </button>
            </>
          )}
        </form>
      )}
      <p role="status">{message}</p>
    </details>
  );
}
