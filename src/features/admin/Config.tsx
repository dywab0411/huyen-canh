import { useState } from "react";
import { api } from "../../lib/auth";
export function Config() {
  const [message, setMessage] = useState("");
  return (
    <details>
      <summary>Ngân hàng, chính sách và hỗ trợ</summary>
      <p>
        Chỉ điền dữ liệu owner đã chốt. Mỗi lần sửa sẽ khóa nghiệm thu phát
        hành; không tự mở nhận tiền.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            const r = await api("admin/config", {
              bank: {
                bank_name: f.get("bank_name"),
                account_number: f.get("account_number"),
                beneficiary: f.get("beneficiary"),
              },
              refund_policy: f.get("refund_policy"),
              support: f.get("support"),
              retention_approved: f.get("retention") === "on",
            });
            setMessage(String(r.message));
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
      >
        <label>
          Ngân hàng
          <input name="bank_name" required />
        </label>
        <label>
          Số tài khoản
          <input name="account_number" inputMode="numeric" required />
        </label>
        <label>
          Tên người nhận
          <input name="beneficiary" required />
        </label>
        <label>
          Chính sách hoàn tiền đã chốt
          <textarea
            name="refund_policy"
            required
            minLength={20}
            maxLength={10000}
          />
        </label>
        <label>
          Liên hệ hỗ trợ và giờ làm việc
          <textarea name="support" required minLength={5} maxLength={500} />
        </label>
        <label className="checkbox">
          <input name="retention" type="checkbox" />
          Tôi đã xem và chốt thời hạn lưu A15 trong chính sách riêng tư.
        </label>
        <button className="button secondary">Lưu cấu hình đã xác minh</button>
      </form>
      <p role="status">{message}</p>
    </details>
  );
}
