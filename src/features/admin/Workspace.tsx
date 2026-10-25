import { OrderBirthDetails } from "./OrderBirthDetails";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../lib/auth";
import { ApiError } from "../../lib/api-error";
import { Recovery } from "./Recovery";
import { Moderation } from "./Moderation";
import { FileUpload } from "./FileUpload";
import { OwnerPanel } from "./OwnerPanel";
export type Order = {
  id: string;
  order_code: string;
  package_code: string;
  price_vnd: number;
  internal_state: string;
  version: number;
};
const template =
  "Lời gửi dành cho bạn\n\nĐiều đang thuận lợi\n\nMột khó khăn có thể quan sát\n\nLời khuyên thực hành\n\nNội dung giải trí, không thay quyết định hoặc tư vấn chuyên môn.";
export function AdminWorkspace({ role }: { role: string }) {
  const [orders, setOrders] = useState<Order[]>([]),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [filter, setFilter] = useState(""),
    [body, setBody] = useState(template),
    [preview, setPreview] = useState(false),
    [message, setMessage] = useState(""),
    [reference, setReference] = useState(""),
    [paymentConfirmed, setPaymentConfirmed] = useState(false),
    [publishConfirmed, setPublishConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [refreshRequired, setRefreshRequired] = useState(false);
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const requestInFlight = useRef(false);
  const loadSequence = useRef(0);
  const resetAcknowledgements = useCallback(() => {
    setPaymentConfirmed(false);
    setPublishConfirmed(false);
    setPreview(false);
  }, []);
  useEffect(() => {
    resetAcknowledgements();
    setReference("");
    setBody(template);
  }, [selectedId, resetAcknowledgements]);
  useEffect(() => {
    resetAcknowledgements();
  }, [selected?.version, resetAcknowledgements]);
  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    try {
      const r = await api("admin/orders", {});
      if (sequence !== loadSequence.current) return false;
      setOrders(r.orders as Order[]);
      setRefreshRequired(false);
      return true;
    } catch (e) {
      if (sequence !== loadSequence.current) return false;
      setRefreshRequired(true);
      setMessage((e as Error).message);
      return false;
    }
  }, []);
  async function refreshAfterMutation() {
    resetAcknowledgements();
    const refreshed = await load();
    if (!refreshed)
      setMessage(
        "Thao tác có thể đã thành công nhưng chưa tải được bản mới. Hãy tải lại đơn trước thao tác tiếp theo.",
      );
  }
  async function mutation(path: string, extra: Record<string, unknown>) {
    if (!selected || refreshRequired || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    resetAcknowledgements();
    try {
      const r = await api("admin/" + path, {
        order_id: selected.id,
        version: selected.version,
        ...extra,
      });
      if (r.order) {
        const changed = r.order as Order;
        setOrders((current) =>
          current.map((o) => (o.id === changed.id ? changed : o)),
        );
      }
      const refreshed = await load();
      setMessage(
        String(r.message ?? "Đã thực hiện.") +
          (refreshed
            ? ""
            : " Chưa tải được đơn mới; các thao tác đang khóa đến khi tải lại."),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const refreshed = await load();
        setMessage(
          refreshed
            ? "Đơn đã thay đổi ở phiên khác. Đã tải bản mới; bản soạn được giữ lại. Kiểm tra lại trước khi xác nhận, không tự gửi lại thao tác."
            : "Xung đột phiên bản; chưa tải được bản mới. Hãy tải lại đơn trước khi tiếp tục.",
        );
      } else {
        const refreshed = await load();
        setMessage(
          (e as Error).message +
            (refreshed
              ? " Đã tải lại trạng thái; kiểm tra trước khi thử lại."
              : " Chưa tải được bản mới; thao tác đang khóa."),
        );
      }
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="panel">
      <h2>Không gian {role}</h2>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() => void load()}
      >
        Tải tối đa 100 đơn gần nhất
      </button>
      <label>
        Tìm mã đơn, gói hoặc trạng thái
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          maxLength={100}
        />
      </label>
      <ul>
        {orders
          .filter((o) =>
            (o.order_code + " " + o.package_code + " " + o.internal_state)
              .toLowerCase()
              .includes(filter.toLowerCase()),
          )
          .map((o) => (
            <li key={o.id}>
              <button
                disabled={busy}
                className="button secondary"
                onClick={() => setSelectedId(o.id)}
              >
                {o.order_code} · {o.package_code} · {o.internal_state}
              </button>
            </li>
          ))}
      </ul>
      {refreshRequired && (
        <p className="notice" role="alert">
          Chưa xác minh được phiên bản đơn mới nhất. Tải lại danh sách trước khi
          thay đổi.
        </p>
      )}
      {selected && (
        <section>
          <h2>Đơn {selected.order_code}</h2>
          <OrderBirthDetails key={selected.id} orderId={selected.id} />
          <p>
            {selected.price_vnd.toLocaleString("vi-VN")} VNĐ · v
            {selected.version}
          </p>
          <fieldset disabled={busy || refreshRequired}>
            <h3>Đối soát thủ công</h3>
            <label>
              Tham chiếu giao dịch (không chứa thông tin cá nhân)
              <input
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  setPaymentConfirmed(false);
                }}
                maxLength={100}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={paymentConfirmed}
                onChange={(e) => setPaymentConfirmed(e.target.checked)}
              />
              Tôi đã đối chiếu tiền vào tài khoản ngân hàng, đúng số tiền và
              đúng đơn.
            </label>
            <button
              className="button"
              disabled={!paymentConfirmed || reference.length < 4}
              onClick={() =>
                void mutation("confirm", {
                  amount: selected.price_vnd,
                  reference,
                  reason: "",
                })
              }
            >
              Xác nhận nhận tiền
            </button>
            <Recovery
              key={"recovery-" + selected.id + "-" + selected.version}
              orderId={selected.id}
              version={selected.version}
              amount={selected.price_vnd}
              owner={role === "owner"}
              onDone={refreshAfterMutation}
            />
            <FileUpload
              key={"file-" + selected.id}
              orderId={selected.id}
              onMutation={refreshAfterMutation}
            />
            <h3>Soạn lời gửi</h3>
            <label>
              Nội dung văn bản thuần
              <textarea
                rows={16}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setPublishConfirmed(false);
                  setPreview(false);
                }}
                maxLength={60000}
              />
            </label>
            <p className="small-note">
              {body.trim().split(/\s+/u).length} từ · Phát hành cần ít nhất 501
              từ và đã nhận tiền; G60/G70 (và G50 cũ) cần video riêng đã kiểm
              định.
            </p>
            <button
              className="button secondary"
              onClick={() => {
                setPreview(!preview);
                setPublishConfirmed(false);
              }}
            >
              {preview ? "Đóng bản xem" : "Xem bản khách đọc"}
            </button>
            <button
              className="button secondary"
              onClick={() => void mutation("draft", { body })}
            >
              Lưu bản nháp
            </button>
            {preview && (
              <>
                <article className="result-preview">
                  {body.split("\n").map((s, i) => (
                    <p key={i}>{s}</p>
                  ))}
                </article>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={publishConfirmed}
                    onChange={(e) => setPublishConfirmed(e.target.checked)}
                  />
                  Tôi đã xem bản cuối và xác nhận phát hành.
                </label>
                <button
                  className="button"
                  disabled={!publishConfirmed}
                  onClick={() => void mutation("publish", { body })}
                >
                  Phát hành bản mới
                </button>
              </>
            )}
          </fieldset>
          <button
            className="button secondary"
            onClick={() =>
              void navigator.clipboard
                .writeText(
                  `Huyền Cảnh gửi lời hẹn cho đơn ${selected.order_code}. Tra cứu tại ${location.origin}/tra-cuu bằng thông tin đã lưu riêng. Không gửi mã bí mật trong tin nhắn.`,
                )
                .then(() =>
                  setMessage("Đã chép lời nhắn. Bạn tự gửi qua Zalo/email."),
                )
                .catch(() => setMessage("Chưa chép được tin nhắn."))
            }
          >
            Chép tin nhắn giao kết quả
          </button>
        </section>
      )}
      <p role="status">{message}</p>
      <Moderation />
      {role === "owner" && <OwnerPanel />}
      <p className="notice">
        Quyền và trạng thái được kiểm tra lại trên server. Tệp chỉ release qua
        validator có phiên MFA; cloud vẫn cần nghiệm thu staging.
      </p>
    </div>
  );
}
