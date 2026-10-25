import { Link } from "react-router-dom";
import { dateForDisplay, timeForDisplay } from "./birth-format";
import { packageDescriptions, type saleCodes } from "../../lib/packages";
export type PreviewData = {
  code: (typeof saleCodes)[number];
  price: number;
  name: string;
  gender: string;
  birth_date: string;
  birth_hour: string | null;
  name2?: string;
  gender2?: string;
  birth_date2?: string;
  birth_hour2?: string | null;
  phone: string;
  notes: string;
  photo: string | null;
};
export function OrderPreview({
  data,
  onClose,
}: {
  data: PreviewData;
  onClose: () => void;
}) {
  return (
    <section
      className="panel order-preview"
      aria-label="Bản xem trước yêu cầu"
      tabIndex={-1}
    >
      <h2>Bản xem trước yêu cầu</h2>
      <p className="notice">
        <b>Chưa tạo đơn · chưa gửi yêu cầu lên máy chủ</b>
        <br />
        Đây là bản tóm tắt trên thiết bị. Đặt đơn thật đang tạm ngừng; không
        chuyển tiền theo bản xem trước.
      </p>
      <h3>
        {data.price.toLocaleString("vi-VN")}đ ·{" "}
        {packageDescriptions[data.code].title}
      </h3>
      <p>{packageDescriptions[data.code].text}</p>
      <h3>Người thứ nhất</h3>
      <p>
        {data.name} · {data.gender}
      </p>
      <p>
        Ngày sinh: {dateForDisplay(data.birth_date)} · Giờ sinh:{" "}
        {timeForDisplay(data.birth_hour)}
      </p>
      {data.name2 && (
        <>
          <h3>Người thứ hai</h3>
          <p>
            {data.name2} · {data.gender2}
          </p>
          <p>
            Ngày sinh: {dateForDisplay(data.birth_date2 ?? null)} · Giờ sinh:{" "}
            {timeForDisplay(data.birth_hour2 ?? null)}
          </p>
        </>
      )}
      <p>Điện thoại liên hệ: {data.phone}</p>
      {data.notes && (
        <>
          <h3>Ghi chú</h3>
          <p className="preview-notes">{data.notes}</p>
        </>
      )}
      {data.photo && (
        <p>Ảnh đã chọn trên máy: {data.photo}. Chưa tải lên máy chủ.</p>
      )}
      <div className="actions">
        <button className="button secondary" type="button" onClick={onClose}>
          Đóng bản xem trước
        </button>
        {import.meta.env.DEV &&
          ["127.0.0.1", "localhost", "[::1]"].includes(location.hostname) && (
            <Link className="button" to={"/dat-don?demo=1&goi=" + data.code}>
              Thử đặt đơn DEMO
            </Link>
          )}
      </div>
    </section>
  );
}
