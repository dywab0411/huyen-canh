import { bank, bankQr, support } from "../../lib/site-info";
export function SupportContacts() {
  return (
    <div className="support-contacts">
      <h2>Cần một lời hướng dẫn?</h2>
      {support.map((s) => (
        <p key={s.phone}>
          {s.name} · <a href={"tel:" + s.phone}>{s.phone}</a>
        </p>
      ))}
    </div>
  );
}
export function PaymentInfo({
  orderCode,
  amount,
}: {
  orderCode?: string;
  amount?: number;
}) {
  return (
    <section
      className="panel payment-info"
      aria-label="Hướng dẫn chuyển khoản Sacombank"
    >
      <div>
        <p className="eyebrow">CHUYỂN KHOẢN · ĐỐI SOÁT THỦ CÔNG</p>
        <h2>Thông tin thanh toán</h2>
        <dl>
          <dt>Ngân hàng</dt>
          <dd>{bank.bank_name}</dd>
          <dt>Chủ tài khoản</dt>
          <dd>{bank.beneficiary}</dd>
          <dt>Số tài khoản</dt>
          <dd>{bank.account_number}</dd>
          {amount !== undefined && (
            <>
              <dt>Số tiền</dt>
              <dd>{amount.toLocaleString("vi-VN")}đ</dd>
            </>
          )}
          {orderCode && (
            <>
              <dt>Nội dung chuyển khoản</dt>
              <dd>
                <strong>{orderCode}</strong>
              </dd>
            </>
          )}
        </dl>
        <p>
          {orderCode
            ? "Khi quét QR, kiểm tra lại người nhận, sửa số tiền đúng đơn và ghi mã đơn ở nội dung chuyển khoản. Không ghi mã bảo mật."
            : "Chỉ chuyển khoản sau khi đơn được tiếp nhận và có mã đơn, số tiền cụ thể. Không chuyển tiền chỉ dựa trên bảng giá hoặc biểu mẫu xem trước."}
        </p>
        <p>
          Chủ website kiểm tra tiền vào tài khoản trước khi xác nhận. Nút “Tôi
          đã chuyển khoản” chỉ ghi nhận thông báo của bạn.
        </p>
        <SupportContacts />
      </div>
      <figure>
        <img
          className="bank-qr"
          src={bankQr}
          alt="QR chuyển khoản Sacombank gốc do chủ website cung cấp, tài khoản kết thúc 1194"
        />
        <figcaption>
          QR do chủ website cung cấp. Luôn kiểm tra thông tin trên ứng dụng ngân
          hàng trước khi chuyển.
        </figcaption>
      </figure>
    </section>
  );
}
