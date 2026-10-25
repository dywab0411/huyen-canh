import { VideoTerms } from "./VideoTerms";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BirthFields } from "./BirthFields";
import { orderRequest } from "./order-model";
import { defaults, packageDescriptions, saleCodes } from "../../lib/packages";
import {
  createDemo,
  advanceDemo,
  lookupDemo,
  clearDemo,
  type DemoEntry,
} from "./demo-model";
export function DemoBanner() {
  return (
    <aside className="notice" role="note">
      <b>DEMO LOCAL · dữ liệu giả lập · không phải đơn thật</b>
      <p>
        Không chuyển tiền. Không nhập thông tin cá nhân thật. Mã chỉ dùng trong
        tab này, hết hạn sau 1 giờ; không gửi tới API đặt đơn hoặc kho ảnh.
      </p>
    </aside>
  );
}
export default function DemoOrder() {
  const l = useLocation();
  const requested = new URLSearchParams(l.search).get("goi");
  const [pkg, setPkg] = useState<(typeof saleCodes)[number]>(
    saleCodes.includes(requested as (typeof saleCodes)[number])
      ? (requested as (typeof saleCodes)[number])
      : "G10",
  );
  const [second, setSecond] = useState(false),
    [order, setOrder] = useState<DemoEntry | null>(null),
    [message, setMessage] = useState("");
  return (
    <section className="section narrow">
      <h1>Thử đặt đơn DEMO</h1>
      <DemoBanner />
      {!order ? (
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const f = Object.fromEntries(new FormData(e.currentTarget));
              orderRequest.parse({
                package_code: pkg,
                package_version: 1,
                name: f.name,
                gender: f.gender,
                birth_date: f.birth_date,
                birth_hour: f.birth_hour || null,
                ...(second
                  ? {
                      name2: f.name2,
                      gender2: f.gender2,
                      birth_date2: f.birth_date2,
                      birth_hour2: f.birth_hour2 || null,
                    }
                  : {}),
                phone: "0912345678",
                idempotency_key: crypto.randomUUID(),
              });
              setOrder(createDemo(pkg));
              setMessage(
                "Đã tạo bản ghi DEMO trên tab này, chưa đặt hàng thật.",
              );
            } catch {
              setMessage(
                "Kiểm tra ngày sinh, giờ HH từ 00 đến 23 và thông tin bắt buộc.",
              );
            }
          }}
        >
          <label>
            Gói DEMO
            <select
              value={pkg}
              onChange={(e) => setPkg(e.target.value as typeof pkg)}
            >
              {defaults.packages.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.price_vnd.toLocaleString("vi-VN")}đ ·{" "}
                  {packageDescriptions[p.code].text}
                </option>
              ))}
            </select>
          </label>
          <label>
            Họ và tên người thứ nhất
            <input
              name="name"
              defaultValue="Người Thử Nghiệm"
              required
              minLength={3}
            />
          </label>
          <label>
            Giới tính người thứ nhất
            <select name="gender" defaultValue="Nam">
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </label>
          <BirthFields />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={second}
              onChange={(e) => setSecond(e.target.checked)}
            />
            Thêm người thứ hai (tùy chọn)
          </label>
          {second && (
            <div className="second-person">
              <label>
                Họ và tên người thứ hai
                <input name="name2" defaultValue="Người Mẫu Thứ Hai" required />
              </label>
              <label>
                Giới tính người thứ hai
                <select name="gender2">
                  <option>Nữ</option>
                  <option>Nam</option>
                </select>
              </label>
              <BirthFields second />
            </div>
          )}
          <p className="small-note">
            Liên hệ giả: 0912345678. Không tải ảnh hoặc lưu họ tên, ngày sinh,
            giờ sinh trong DEMO; chỉ kiểm tra biểu mẫu rồi bỏ các giá trị này.
          </p>
          <VideoTerms code={pkg} />
          <button className="button">Tạo đơn DEMO · không gửi đơn thật</button>
        </form>
      ) : (
        <article className="panel">
          <h2>Bản ghi DEMO · không phải đơn hàng</h2>
          <p>
            {order.price.toLocaleString("vi-VN")}đ ·{" "}
            {packageDescriptions[order.pkg].text}
          </p>
          <label>
            Mã đơn DEMO
            <input readOnly value={order.code} />
          </label>
          <label>
            Mã tra cứu DEMO
            <input readOnly value={order.access} />
          </label>
          <h3>Hướng dẫn chuyển khoản giả lập</h3>
          <p>
            Trong quy trình thật, kiểm tra đúng ngân hàng, người nhận, số tiền
            và mã đơn trước khi chuyển. Tại đây không có tài khoản hoặc QR nhận
            tiền; tuyệt đối không chuyển tiền.
          </p>
          <div className="notice" aria-live="polite">
            <b>
              {order.stage === "created"
                ? "Bước 1/3 · Báo chuyển khoản giả lập"
                : "Bước 2/3 · Tiếp tục tra cứu DEMO"}
            </b>
            {order.stage !== "created" && (
              <>
                <p>Đã ghi nhận thông báo chuyển khoản DEMO.</p>
                <p>
                  Không có thanh toán thật. Lưu mã tra cứu phía trên, rồi mở tra
                  cứu DEMO để thử bước trả kết quả mẫu.
                </p>
              </>
            )}
          </div>
          <button
            className="button secondary"
            onClick={() => {
              try {
                if (order.stage === "created") {
                  setOrder(advanceDemo(order.access, "claimed"));
                  setMessage(
                    "Đã mô phỏng thông báo chuyển khoản; không xác nhận đã nhận tiền thật.",
                  );
                } else
                  setMessage(
                    "Thông báo chuyển khoản DEMO đã được ghi nhận. Tiếp tục qua Tra cứu DEMO; không có thanh toán thật.",
                  );
              } catch {
                setMessage(
                  "Bản ghi DEMO không còn trong tab hoặc đã hết hạn. Bấm Thử gói khác để tạo lại, không chuyển tiền.",
                );
              }
            }}
          >
            {order.stage === "created"
              ? "Giả lập báo chuyển khoản · không thanh toán"
              : "Xem lại thông báo chuyển khoản DEMO"}
          </button>
          <p>
            <Link
              className={order.stage === "created" ? "text-link" : "button"}
              to="/tra-cuu?demo=1"
            >
              Tra cứu DEMO bằng mã vừa nhận →
            </Link>
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setOrder(null);
              setMessage("");
            }}
          >
            Thử gói khác
          </button>
        </article>
      )}
      <p role="status">{message}</p>
      <Link to="/dat-don">Trở về biểu mẫu thật đang được bảo vệ</Link>
    </section>
  );
}
export function DemoLookup() {
  const [item, setItem] = useState<DemoEntry | null>(null),
    [message, setMessage] = useState("");
  return (
    <section className="section narrow">
      <h1>Tra cứu DEMO</h1>
      <DemoBanner />
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const result = lookupDemo(
              String(new FormData(e.currentTarget).get("access")),
            );
            setItem(result);
            setMessage(
              result
                ? "Đã mở bản ghi DEMO."
                : "Mã DEMO không tồn tại, khác tab hoặc đã hết hạn.",
            );
          } catch {
            setMessage("Không đọc được dữ liệu DEMO trên tab này.");
          }
        }}
      >
        <label>
          Mã tra cứu DEMO
          <input name="access" required autoComplete="off" />
        </label>
        <button className="button">Mở bản ghi DEMO</button>
      </form>
      {item && (
        <article className="panel">
          <h2>Trạng thái DEMO: {item.stage}</h2>
          <p>
            {item.price.toLocaleString("vi-VN")}đ ·{" "}
            {packageDescriptions[item.pkg].text}
          </p>
          {item.stage === "claimed" && (
            <button
              className="button secondary"
              onClick={() => setItem(advanceDemo(item.access, "sample"))}
            >
              Giả lập trả kết quả mẫu
            </button>
          )}
          {item.stage === "sample" && (
            <>
              <h3>Kết quả mẫu DEMO · không phải bài dành riêng</h3>
              <p>
                Một bước nhỏ bạn có thể thử hôm nay: chọn một việc dễ hoàn thành
                và dành thời gian nghỉ ngơi sau đó.
              </p>
              {["G20", "G70"].includes(item.pkg) && (
                <p>
                  Khó khăn minh họa: ôm quá nhiều việc cùng lúc. Lời khuyên mẫu:
                  chia việc thành từng bước và tự chọn nhịp phù hợp.
                </p>
              )}
              {["G60", "G70"].includes(item.pkg) && (
                <>
                  <p>
                    Video mẫu có sẵn, không phải video cá nhân hóa hoặc kết quả
                    khách hàng.
                  </p>
                  <video
                    controls
                    preload="metadata"
                    poster="/assets/ho-sen-poster.png"
                    src="/assets/ho-sen-demo.mp4"
                  />
                </>
              )}
            </>
          )}
        </article>
      )}
      <p role="status">{message}</p>
      <div className="actions">
        <Link to="/dat-don?demo=1">Tạo DEMO khác</Link>
        <button
          className="button secondary"
          onClick={() => {
            clearDemo();
            setItem(null);
            setMessage("Đã xóa dữ liệu DEMO của tab.");
          }}
        >
          Xóa dữ liệu DEMO
        </button>
        <Link to="/tra-cuu">Tra cứu đơn thật</Link>
      </div>
    </section>
  );
}
