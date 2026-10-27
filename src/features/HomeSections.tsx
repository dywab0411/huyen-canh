import { Link } from "react-router-dom";
export function HomeSections() {
  return (
    <>
      <section className="section benefits">
        <p className="eyebrow">BẮT ĐẦU TỪ ĐIỀU BẠN TÒ MÒ</p>
        <h2>Vì sao chọn Huyền Cảnh?</h2>
        <div className="three">
          {[
            [
              "✧",
              "Đa dạng, dễ khám phá",
              "12 công cụ từ ngày sinh, thần số học đến tình duyên và phong thủy. Chọn chủ đề gần với điều bạn đang quan tâm.",
            ],
            [
              "☾",
              "Lời gửi dễ hiểu",
              "Diễn giải bằng tiếng Việt, có những gợi ý thực hành để bạn chậm lại, suy ngẫm và tự chọn bước tiếp theo.",
            ],
            [
              "⌂",
              "Một khoảng riêng của bạn",
              "Xem miễn phí không cần tài khoản. Giữ riêng mã tra cứu để bảo vệ nội dung dành cho bạn.",
            ],
          ].map(([icon, title, text]) => (
            <article className="panel" key={title}>
              <span className="feature-symbol" aria-hidden="true">
                {icon}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section community">
        <div>
          <p className="eyebrow">CỘNG ĐỒNG TRẢI NGHIỆM</p>
          <h2>Mỗi lời gửi lại đều đáng được lắng nghe</h2>
          <p>
            Sau khi nhận bài đọc riêng, bạn có thể gửi nhận xét qua trang tra
            cứu. Hãy chia sẻ điều hữu ích với mình, dùng tên hiển thị và giữ
            riêng các thông tin cá nhân.
          </p>
          <Link className="button secondary" to="/tra-cuu">
            Gửi lời nhận xét sau trải nghiệm
          </Link>
        </div>
        <div className="community-art" aria-hidden="true">
          <span>✦</span>
          <strong>
            Gặp nhau
            <br />ở một góc nhìn.
          </strong>
          <span>✧</span>
        </div>
      </section>
      <section className="section differences">
        <p className="eyebrow">NHỮNG LỐI KHÁM PHÁ RIÊNG</p>
        <h2>Điểm khác biệt của Huyền Cảnh</h2>
        <div className="difference-grid">
          {[
            [
              "Nét tay, nhịp sống",
              "Chọn đặc điểm bàn tay để mở bài đọc mô phỏng. Không yêu cầu ảnh hoặc nhận diện sinh trắc.",
              "/boi/chi-tay",
            ],
            [
              "Gương soi dịu dàng",
              "Nhân tướng mô phỏng từ lựa chọn của bạn, không phán xét con người qua ngoại hình.",
              "/boi/nhan-tuong",
            ],
            [
              "Hai nhịp cùng bước",
              "Tương hợp tình yêu và cách giao tiếp, với câu hỏi gợi mở cho cả hai.",
              "/boi/tinh-duyen",
            ],
            [
              "Những con số kể chuyện",
              "Khám phá thần số học từ tên và ngày sinh, kèm diễn giải để tự suy ngẫm.",
              "/boi/than-so-hoc",
            ],
            [
              "Góc nhỏ an nhiên",
              "Những gợi ý quan sát không gian và thói quen hằng ngày qua phong thủy tuổi/mệnh.",
              "/boi/phong-thuy",
            ],
            [
              "Lời gửi thành thước phim",
              "Hai lựa chọn video hoạt hình cá nhân hóa theo nội dung tích cực hoặc tích cực, khó khăn và lời khuyên.",
              "/dich-vu",
            ],
          ].map(([title, text, to]) => (
            <article className="panel" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link className="text-link" to={to}>
                Khám phá →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
