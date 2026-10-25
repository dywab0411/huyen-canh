import { UpgradeAccess } from "./UpgradeAccess";
import { PublicationConsent } from "../library/PublicationConsent";
import { useState } from "react";
import { api } from "../../lib/auth";
import { ConsentPanel } from "../consent/ConsentPanel";
export type LookupResponse = {
  csrf: string;
  legacy?: boolean;
  order_code: string;
  result?: { body: string; revision: number } | null;
  attachments?: { id: string; mime: string; size: number }[];
};
export function LookupPortal({ value }: { value: LookupResponse }) {
  const [message, setMessage] = useState("");
  async function run(path: string, body: unknown) {
    try {
      const r = await api(path, body, value.csrf);
      setMessage(String(r.message ?? "Đã thực hiện."));
      return r;
    } catch (e) {
      setMessage((e as Error).message);
      return null;
    }
  }
  return (
    <article className="panel">
      <p className="eyebrow">LỜI GỬI RIÊNG · {value.order_code}</p>
      {value.result ? (
        <>
          <h2>Kết quả đã phát hành</h2>
          <p>Bản {value.result.revision}</p>
          {value.result.body.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {value.attachments?.map((a) => (
            <button
              key={a.id}
              className="button secondary"
              onClick={() =>
                void run("results/file-url", { attachment_id: a.id }).then(
                  (r) => {
                    if (r?.url) {
                      const url = new URL(String(r.url));
                      if (url.protocol === "https:") location.assign(url.href);
                    }
                  },
                )
              }
            >
              Tải tệp {a.mime} · {(a.size / 1024 / 1024).toFixed(1)} MB
            </button>
          ))}
          <details>
            <summary>Gửi đánh giá sau giao</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void run("reviews", {
                  rating: Number(form.get("rating")),
                  nickname: form.get("nickname"),
                  text: form.get("text"),
                });
              }}
            >
              <label>
                Tên hiển thị (không dùng họ tên thật)
                <input name="nickname" required minLength={2} maxLength={40} />
              </label>
              <label>
                Số sao
                <select name="rating">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Nhận xét (không ghi SĐT, email hoặc thông tin riêng)
                <textarea name="text" maxLength={1000} />
              </label>
              <button className="button">Gửi đánh giá chờ duyệt</button>
            </form>
          </details>
        </>
      ) : (
        <>
          <h2>Chưa có kết quả</h2>
          <p>
            Lời gửi sẽ xuất hiện tại đây khi được phát hành. Thông tin của bạn
            được giữ riêng tư.
          </p>
          <button
            className="button secondary"
            onClick={() => void run("orders/claim-transfer", {})}
          >
            Tôi đã chuyển khoản
          </button>
          <p className="small-note">
            Nút này chỉ ghi nhận thông báo, không xác nhận đã nhận tiền. Không
            bắt buộc biên lai.
          </p>
        </>
      )}
      {value.legacy && <UpgradeAccess csrf={value.csrf} />}
      <ConsentPanel csrf={value.csrf} />
      <PublicationConsent key={value.csrf} csrf={value.csrf} />
      <p className="small-note">
        Phiên tra cứu hết hạn sau 15 phút. Đường dẫn tải tệp có hiệu lực 60
        giây, không thu hồi dữ liệu bạn đã tải.
      </p>
      <p role="status">{message}</p>
    </article>
  );
}
