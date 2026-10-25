import { Link } from "react-router-dom";
export function PublicPreviewNotice() {
  return (
    <section className="section narrow">
      <p className="eyebrow">HUYỀN CẢNH</p>
      <h1>Cùng khám phá những trải nghiệm miễn phí</h1>
      <p>
        Các công cụ miễn phí hoạt động ngay trên thiết bị, không cần tài khoản.
        Dịch vụ đặt riêng, đăng nhập và tra cứu đơn chưa mở trong bản giới thiệu
        này.
      </p>
      <Link className="button" to="/kham-pha">
        Khám phá 12 công cụ
      </Link>
      <p>
        <Link to="/video-mau">Xem thước phim mẫu →</Link>
      </p>
    </section>
  );
}
