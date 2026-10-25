import { publicPreview } from "./lib/deployment";
import { PublicPreviewNotice } from "./features/PublicPreviewNotice";
import React, { useEffect, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  tools,
  reading,
  notice,
  transliterate,
  type Reading,
  type Input,
} from "./engine";
import { usePackages, packageDescriptions } from "./lib/packages";
import { HomeSections } from "./features/HomeSections";
import { LookupPage } from "./features/orders/LookupPage";
import { SupportContacts } from "./features/orders/PaymentInfo";
import { uiRevision } from "./lib/site-info";
import { Account } from "./features/account/Account";
import { auth, api } from "./lib/auth";
import { saveImage, shareLink } from "./lib/share";
import "./style.css";
import { PublicGallery } from "./features/library/PublicGallery";
import type { Dataset } from "./content/dataset";
import { OrderPage } from "./features/orders/OrderPage";

const AdminWorkspace = lazy(() =>
  import("./features/admin/Workspace").then((m) => ({
    default: m.AdminWorkspace,
  })),
);

function LotusScene() {
  return (
    <svg
      viewBox="0 0 600 560"
      role="img"
      aria-label="Linh Sứ bên hồ sen và vầng trăng, minh họa tự tạo"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#ddd4ed" />
          <stop offset="1" stopColor="#f3e6d7" />
        </linearGradient>
        <linearGradient id="robe" x2="1" y2="1">
          <stop stopColor="#f6f2fb" />
          <stop offset="1" stopColor="#9988b5" />
        </linearGradient>
      </defs>
      <circle cx="300" cy="260" r="230" fill="url(#sky)" />
      <circle cx="365" cy="140" r="73" fill="#fff9e9" />
      <path
        d="M30 388Q160 340 290 392T570 378M15 422Q170 380 330 432T590 416"
        fill="none"
        stroke="#fff"
        strokeWidth="17"
        opacity=".6"
      />
      <ellipse cx="290" cy="477" rx="230" ry="26" fill="#99b2a6" opacity=".3" />
      <path
        d="M250 246Q192 320 184 431Q299 470 409 421L347 251Z"
        fill="url(#robe)"
      />
      <path
        d="M274 242Q245 304 291 433L332 438Q310 312 325 240"
        fill="#f5ecdf"
      />
      <path
        d="M258 250Q216 283 158 337L166 352Q239 335 282 282M333 257Q389 300 453 286L461 300Q391 331 323 289"
        fill="#c3b3d7"
      />
      <path
        d="M266 183Q257 107 309 105Q366 112 341 206L324 265L278 246Z"
        fill="#302b40"
      />
      <ellipse cx="304" cy="174" rx="32" ry="43" fill="#edcbb9" />
      <path
        d="M270 159Q302 160 310 125Q330 164 342 164Q335 107 303 109Q273 110 270 159"
        fill="#302b40"
      />
      <path d="M286 181l8 1m19-1 8-1" stroke="#514355" strokeWidth="2" />
      <path d="M298 199q8 5 14-1" fill="none" stroke="#a16b76" />
      <path d="M295 112l10-32 11 32" fill="#c49b59" />
      <circle cx="306" cy="108" r="7" fill="#e4cc8f" />
      <path
        d="M278 212q-3 34-22 56m76-53q0 34 26 54"
        fill="none"
        stroke="#302b40"
        strokeWidth="15"
      />
      <g fill="#d4a6b5" stroke="#faf7f2" strokeWidth="2">
        <path d="M115 463q-52-29-43-53q30-1 43 53q-8-62 14-75q29 30-14 75q49-43 65-21q-14 31-65 21Z" />
        <path d="M466 463q-50-29-41-51q27 0 41 51q-4-58 17-69q27 28-17 69q43-34 60-13q-19 23-60 13Z" />
      </g>
      <g fill="#c49b59">
        <circle cx="114" cy="211" r="3" />
        <circle cx="469" cy="194" r="3" />
        <circle cx="193" cy="112" r="2" />
        <path d="M470 107l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" />
      </g>
      <path d="M60 495q240-28 490 0" stroke="#869c90" fill="none" />
    </svg>
  );
}
const money = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
function Pricing() {
  const { quote } = usePackages();
  const priced = quote.packages
    .filter((p) => p.active)
    .map((p) => ({ ...p, ...packageDescriptions[p.code], price: p.price_vnd }));
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THÊM MỘT CHÚT CHĂM CHÚT</p>
          <h2>Lời gửi từ Huyền Cảnh</h2>
        </div>
        <p>
          Soạn thủ công, không lời hứa đổi vận.
          <br />
          Nội dung và cách giao nhận được thống nhất khi tiếp nhận.
        </p>
      </div>
      <p className="small-note">
        {quote.source === "server"
          ? "Mức phí cho từng lời gửi."
          : "Mức phí tham khảo. Xem thông tin tiếp nhận khi gửi yêu cầu."}
      </p>
      <div className="price-grid">
        {priced.map((p, i) => (
          <article
            className={"price-card " + (i === 1 ? "featured" : "")}
            key={p.code}
          >
            {i === 1 && <span className="badge">MỘT KHOẢNG LẶNG SÂU HƠN</span>}
            <p className="eyebrow">
              {p.code.startsWith("G6") || p.code.startsWith("G7")
                ? "VIDEO HOẠT HÌNH"
                : "LỜI LUẬN GIẢI"}
            </p>
            <h3>{p.title}</h3>
            <p className="price">{money(p.price)}</p>
            <p>{p.text}</p>
            <Link className="button secondary" to={"/dat-don?goi=" + p.code}>
              Tìm hiểu gói <span>↗</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
function Explore({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const list = tools.filter((t) =>
    transliterate(t[1]).includes(transliterate(query)),
  );
  return (
    <section className="section" id="cong-cu">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MƯỜI HAI LỐI NHỎ</p>
          <h2>
            {compact ? "Bạn muốn lắng nghe điều gì?" : "Khám phá Huyền Cảnh"}
          </h2>
        </div>
        <p>
          Không cần tài khoản. Không giới hạn lượt.
          <br />
          Một trải nghiệm riêng tư, ngay trên thiết bị.
        </p>
      </div>
      <label className="search">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="Tìm công cụ"
          placeholder="Tìm một điều bạn đang quan tâm…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="search-count">{list.length} công cụ</span>
      </label>
      <div className="tool-grid">
        {list.map((t) => (
          <Link
            className={"tool-card tool-" + t[0]}
            to={"/boi/" + t[0]}
            key={t[0]}
          >
            <span className="tool-symbol" aria-hidden="true">
              {t[3]}
            </span>
            <span className="tool-meta">
              {String(tools.indexOf(t) + 1).padStart(2, "0")} / KHÁM PHÁ
            </span>
            <h3>{t[1]}</h3>
            <p>{t[2]}</p>
            <span className="card-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </div>
      {!list.length && (
        <p role="status">
          Chưa tìm thấy công cụ. Thử từ khóa “tình duyên” hoặc “ngày sinh”.
        </p>
      )}
      <p className="small-note">
        ✧ Mỗi góc nhìn là một lời gợi mở. Bạn chọn điều phù hợp với hành trình
        của mình.
      </p>
    </section>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MỘT CHÚT HUYỀN DIỆU · MỘT CHÚT BÌNH YÊN</p>
          <h1>
            Chạm vào miền
            <br />
            <em>tĩnh lặng,</em>
            <br />
            lắng nghe điều trong bạn.
          </h1>
          <p>
            Giữa hồ sen và mây sớm, có một khoảng nhỏ để bạn dừng lại. Cùng Linh
            Sứ soi chiếu bản thân qua những biểu tượng dịu dàng.
          </p>
          <div className="actions">
            <Link className="button" to="/kham-pha">
              Khám phá miễn phí <span>↗</span>
            </Link>
            <Link className="text-link" to="/dich-vu">
              Xem dịch vụ →
            </Link>
          </div>
          <p className="hero-foot">
            ✧ Không phán định tương lai. Chỉ mở một góc nhìn.
          </p>
        </div>
        <div className="hero-art">
          <LotusScene />
          <div className="art-caption">
            LINH SỨ <span>Người giữ những khoảng lặng</span>
          </div>
        </div>
      </section>
      <div className="ribbon">
        <span>12 trải nghiệm miễn phí</span>
        <span>✧</span>
        <span>Kết quả nhất quán</span>
        <span>✧</span>
        <span>Dữ liệu ở lại với bạn</span>
        <span>✧</span>
        <span>Chậm một nhịp, hiểu mình hơn</span>
      </div>
      <Explore compact />
      <section className="journey section">
        <p className="eyebrow">KHÔNG CẦN VỘI VÀNG</p>
        <h2>Một hành trình rất nhẹ</h2>
        <div className="three">
          <div>
            <b>01</b>
            <h3>Chọn một lối nhỏ</h3>
            <p>Từ ngày sinh đến những giấc mơ, bắt đầu với điều bạn tò mò.</p>
          </div>
          <div>
            <b>02</b>
            <h3>Gửi vài nét về mình</h3>
            <p>Chỉ nhập điều cần thiết. Công cụ miễn phí không yêu cầu ảnh.</p>
          </div>
          <div>
            <b>03</b>
            <h3>Đọc, ngẫm và tự chọn</h3>
            <p>
              Một bài đọc dài, một gợi ý thực hành. Không có khuôn mẫu bắt buộc.
            </p>
          </div>
        </div>
      </section>
      <HomeSections />
      <Pricing />
      <section className="video-call section">
        <div>
          <p className="eyebrow">CHUYỆN KỂ GIỮA MÂY</p>
          <h2>Một thước phim dịu dàng</h2>
          <p>
            Nét vẽ mềm mại, sắc trời trong trẻo và lời kể đầy tâm tình.
            <br />
            Một câu chuyện nhỏ để bạn chậm lại và lắng nghe.
          </p>
          <Link className="text-link" to="/thu-vien">
            Ghé thư viện →
          </Link>
        </div>
        <Link className="video-tile" to="/video-mau">
          <span>▷</span>
          <p>Hồ sen đón bình minh</p>
          <small>36 GIÂY · VIDEO MẪU</small>
        </Link>
      </section>
      <section className="section faq">
        <p className="eyebrow">CÓ THỂ BẠN ĐANG TỰ HỎI</p>
        <h2>Gỡ một chút băn khoăn</h2>
        {[
          [
            "Xem bói online có miễn phí không?",
            "Cả 12 công cụ khám phá đều miễn phí, không cần tài khoản. Bài soạn riêng và video hoạt hình có mức phí riêng ở trang Dịch vụ.",
          ],
          [
            "Có những công cụ nào?",
            "Bạn có thể chọn ngày sinh, giờ sinh, hợp tuổi, tình duyên, thần số học, chỉ tay và nhân tướng mô phỏng, phu thê mô phỏng, giấc mơ, phong thủy, công danh và tên may mắn.",
          ],
          [
            "Cần cung cấp thông tin gì?",
            "Công cụ miễn phí chỉ hỏi dữ liệu cần cho bài đọc. Đơn riêng cần tên, giới tính và số điện thoại; người thứ hai, ghi chú và ảnh là tùy chọn. Ảnh có quyền đồng ý riêng.",
          ],
          [
            "Có sử dụng được trên điện thoại không?",
            "Có. Giao diện tự thích ứng với màn hình điện thoại, bạn có thể giảm hiệu ứng và bật nhạc khi muốn.",
          ],
          [
            "Sau khi thanh toán, xem kết quả ở đâu?",
            "Lưu mã bảo mật khi tạo đơn, mở Tra cứu và nhập một mã này. Kết quả chỉ hiển thị sau khi admin đối soát tiền và phát hành. Mã chuyển khoản không cấp quyền xem bài.",
          ],
          [
            "Bài đọc có dự đoán chính xác tương lai?",
            "Bài đọc mở thêm góc nhìn để bạn tham khảo và suy ngẫm. Tương lai còn phụ thuộc vào lựa chọn và hoàn cảnh thực tế; nội dung không thay thế tư vấn chuyên môn.",
          ],
          [
            "Tôi có cần đăng nhập để xem miễn phí?",
            "Không. Cả 12 công cụ chạy trên thiết bị sau khi tải trang, không gọi API AI.",
          ],
          [
            "Hiện có thể chuyển khoản đặt bài không?",
            "Hãy xem thông tin tiếp nhận trên trang đặt đơn. Chỉ chuyển khoản khi bạn đã có đơn và hướng dẫn thanh toán cụ thể; thanh toán được đối soát thủ công.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </>
  );
}
const labels: Record<string, string> = {
  name: "Họ và tên thật",
  name2: "Họ tên người thứ hai",
  date: "Ngày sinh dương lịch",
  date2: "Ngày sinh người thứ hai",
  hour: "Giờ sinh (Asia/Ho_Chi_Minh)",
  hand: "Đặc điểm tay tự chọn",
  face: "Nét biểu cảm tự mô tả",
  trait: "Cách bạn thường giao tiếp",
  trait2: "Cách người kia thường giao tiếp",
  dream: "Giấc mơ bạn muốn suy ngẫm",
  space: "Góc học tập hiện tại",
  topic: "Chủ đề bạn quan tâm",
};
const options: Record<string, string[]> = {
  hand: ["Nét tay rõ", "Nét tay mềm", "Không chắc"],
  face: ["Điềm tĩnh", "Hay cười", "Đang suy tư"],
  trait: ["Thích lắng nghe", "Nói điều mình nghĩ", "Cần thời gian suy nghĩ"],
  trait2: ["Thích lắng nghe", "Nói điều mình nghĩ", "Cần thời gian suy nghĩ"],
  space: ["Góc nhỏ gần cửa sổ", "Bàn học dùng chung", "Góc cần sắp xếp"],
  topic: ["Học tập", "Thói quen làm việc", "Quản lý thời gian"],
};
function Tool() {
  const [dataset, setDataset] = useState<Dataset | undefined>();
  useEffect(() => {
    if (!auth) return;
    void fetch("/api/dataset")
      .then((r) => r.json())
      .then(async (data) => {
        const { datasetSchema } = await import("./content/dataset");
        const parsed = datasetSchema.safeParse(data);
        if (parsed.success) setDataset(parsed.data);
      })
      .catch(() => {});
  }, []);
  const { slug } = useParams();
  const tool = tools.find((t) => t[0] === slug);
  const [result, setResult] = useState<Reading | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [privateImage, setPrivateImage] = useState(false),
    [reveal, setReveal] = useState(false);
  useEffect(() => {
    setResult(null);
    setError("");
  }, [slug]);
  if (!tool) return <NotFound />;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget)) as Input;
      const r = await reading(
        tool![0],
        data,
        new Date().toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
        dataset,
      );
      setResult(r);
      setReveal(true);
      setTimeout(() => setReveal(false), 1600);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!auth) {
      setMessage(
        "Chưa cấu hình tài khoản. Không lưu hoặc tải lịch sử khách lên máy chủ.",
      );
      return;
    }
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      setMessage("Vui lòng đăng nhập Google trước khi chọn lưu.");
      return;
    }
    const { error } = await auth.from("reading_history").insert({
      user_id: user.id,
      tool: result!.toolId,
      snapshot: result,
      engine_version: result!.engineVersion,
      dataset_version: result!.datasetVersion,
    });
    setMessage(
      error
        ? "Chưa lưu được lịch sử. Vui lòng thử lại."
        : "Đã lưu vào tài khoản của bạn.",
    );
  }
  return (
    <section className="section tool-page">
      <Link className="text-link" to="/kham-pha">
        ← Mười hai lối nhỏ
      </Link>
      <div className="page-heading">
        <span className="large-symbol">{tool[3]}</span>
        <p className="eyebrow">TRẢI NGHIỆM MIỄN PHÍ · MÔ PHỎNG</p>
        <h1>{tool[1]}</h1>
        <p>{tool[2]}. Một góc nhìn, không phải một lời phán.</p>
      </div>
      <div className="reading-layout">
        <form onSubmit={submit} className="panel">
          <h2>Gửi một vài nét</h2>
          <p className="small-note">
            Thông tin được xử lý trên thiết bị khi bạn xem bài miễn phí.
          </p>
          {tool[4].split(",").map((key) => (
            <label key={key}>
              {labels[key]}
              {key === "dream" ? (
                <textarea name={key} required maxLength={2000} rows={6} />
              ) : options[key] ? (
                <select name={key} required>
                  {options[key].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ) : key === "hour" ? (
                <select name="hour">
                  <option>không rõ</option>
                  {Array.from(
                    { length: 24 },
                    (_, i) => String(i).padStart(2, "0") + ":00",
                  ).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={key}
                  required
                  type={key.startsWith("date") ? "date" : "text"}
                  maxLength={100}
                  autoComplete="off"
                />
              )}
            </label>
          ))}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Đang mở trang…" : "Mở lời gửi dành cho bạn"} <span>✧</span>
          </button>
          <p className="small-note">{notice}</p>
        </form>
        <div className="result-space">
          {!result ? (
            <div className="empty panel">
              <span>☾</span>
              <h2>Một khoảng lặng đang chờ</h2>
              <p>
                Điền thông tin bên cạnh để mở bài đọc.
                <br />
                Không cần đăng nhập, không giới hạn lượt.
              </p>
            </div>
          ) : (
            <article className="panel result" aria-live="polite">
              {reveal && (
                <div className={"reveal reveal-" + slug}>
                  <span>{tool[3]}</span>
                  <button type="button" onClick={() => setReveal(false)}>
                    Bỏ qua hiệu ứng
                  </button>
                </div>
              )}
              <p className="eyebrow">
                LỜI GỬI TỪ {result.symbol.toLocaleUpperCase("vi")}
              </p>
              <h2>{result.sections[0].title}</h2>
              <div className="score">
                {result.score}
                <small>/100 · điểm biểu tượng, không phải xác suất</small>
              </div>
              {result.lifePath !== undefined && (
                <p>Số đường đời: {result.lifePath} · Giữ số 11, 22, 33.</p>
              )}
              {result.sections.map((s) => (
                <section key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </section>
              ))}
              <p className="small-note">
                {notice}
                <br />
                Engine {result.engineVersion} · Dữ liệu {result.datasetVersion}
              </p>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={privateImage}
                  onChange={(e) => setPrivateImage(e.target.checked)}
                />
                Tôi muốn đưa thông tin đã nhập vào ảnh tải về (mặc định ẩn)
              </label>
              <div className="actions wrap">
                <button
                  className="button secondary"
                  onClick={() =>
                    void saveImage(result, privateImage)
                      .then(() => setMessage("Đã tạo ảnh PNG."))
                      .catch(() => setMessage("Không tạo được ảnh."))
                  }
                >
                  Tải ảnh PNG
                </button>
                <button
                  className="button secondary"
                  onClick={() =>
                    void shareLink(result.toolId)
                      .then(setMessage)
                      .catch(() =>
                        setMessage(
                          "Không thể chia sẻ. Bạn có thể chép liên kết công cụ từ thanh địa chỉ.",
                        ),
                      )
                  }
                >
                  Chia sẻ công cụ
                </button>
                <button
                  className="button secondary"
                  onClick={() => void save()}
                >
                  Lưu vào tài khoản
                </button>
              </div>
            </article>
          )}
          {message && <p role="status">{message}</p>}
        </div>
      </div>
    </section>
  );
}
function Callback() {
  const [message, setMessage] = useState("Đang xác minh phiên đăng nhập…");
  const navigate = useNavigate();
  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    history.replaceState({}, "", "/auth/callback");
    if (!auth || !code) {
      setMessage(
        "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại từ trang tài khoản.",
      );
      return;
    }
    void auth.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error)
        setMessage(
          "Đăng nhập chưa thành công. Hãy thử lại từ trang tài khoản.",
        );
      else navigate("/tai-khoan", { replace: true });
    });
  }, [navigate]);
  return (
    <section className="section narrow">
      <h1>Đăng nhập Google</h1>
      <p role="status">{message}</p>
    </section>
  );
}
function Admin() {
  const [role, setRole] = useState("");
  const [message, setMessage] = useState(
    "Chưa xác minh quyền máy chủ. Không có dữ liệu khách được tải.",
  );
  return (
    <section className="section narrow">
      <p className="eyebrow">KHÔNG GIAN VẬN HÀNH</p>
      <h1>Quản trị Huyền Cảnh</h1>
      <div className="panel">
        <p>
          Quyền owner/editor được kiểm tra tại máy chủ trong mỗi yêu cầu. Thao
          tác nhạy cảm cần MFA.
        </p>
        <button
          className="button"
          onClick={() =>
            void api("admin/session", {})
              .then((r) => {
                setRole(String(r.role));
                setMessage("Phiên đã xác minh.");
              })
              .catch((e) => setMessage(e.message))
          }
        >
          Kiểm tra quyền quản trị
        </button>
        <p role="status">{message}</p>
        {role ? (
          <Suspense fallback={<p>Đang tải không gian quản trị…</p>}>
            <AdminWorkspace role={role} />
          </Suspense>
        ) : (
          <p className="notice">
            Chưa kết nối phiên quản trị. Không nhập dữ liệu khách thật. Đối soát
            và soạn bài chỉ mở sau xác minh server + MFA. Upload và quản lý
            consent công khai đang khóa chờ bộ kiểm định tệp.
          </p>
        )}
      </div>
    </section>
  );
}
function Gallery() {
  return (
    <section className="section">
      <p className="eyebrow">CHUYỆN KỂ GIỮA MÂY</p>
      <h1>Thư viện những khoảng lặng</h1>
      <p>
        Những câu chuyện hoạt hình và lời gửi để bạn tìm thấy một góc nhìn gần
        gũi, theo nhịp của riêng mình.
      </p>
      <PublicGallery />
    </section>
  );
}
function SampleVideo() {
  return (
    <section className="section narrow">
      <p className="eyebrow">PHIM NGẮN · HỒ SEN ĐÓN BÌNH MINH</p>
      <h1>Hồ sen đón bình minh</h1>
      <video
        controls
        preload="metadata"
        playsInline
        aria-label="Video hoạt hình Hồ sen đón bình minh"
        src="/assets/ho-sen-demo.mp4"
      >
        <track
          kind="captions"
          src="/assets/ho-sen-demo.vtt"
          srcLang="vi"
          label="Tiếng Việt"
          default
        />
      </video>
      <p>
        Bình minh mở trên mặt hồ, một mầm sen vươn lên giữa những chuyển động
        nhẹ nhàng. Theo chân Linh Sứ qua 36 giây hình ảnh và lời kể, cùng phụ đề
        tiếng Việt.
      </p>
      <a className="text-link" href="/assets/ho-sen-demo.mp4" download>
        Tải video mẫu MP4 ↓
      </a>
    </section>
  );
}
const policy: Record<string, [string, string[]]> = {
  "rieng-tu": [
    "Chính sách riêng tư — bản chờ chốt",
    [
      "Công cụ miễn phí xử lý dữ liệu ngay trên thiết bị. Không có analytics, quảng cáo hoặc dịch vụ AI nhận nội dung nhập. Bạn chủ động chọn lưu vào tài khoản khi cấu hình tài khoản đã sẵn sàng.",
      "Đơn hàng thu họ tên, giới tính, ngày sinh, giờ sinh nếu biết, số điện thoại và gói dịch vụ; thông tin người thứ hai, lời nhắn và ảnh là tùy chọn. Ảnh chỉ được tải lên khi người gửi xác nhận quyền sử dụng, sự đồng ý tự nguyện và mọi người có thể nhận diện trong ảnh đủ 18 tuổi. Kết quả và tệp đặt trong kho riêng. Quyền dùng ảnh, website, YouTube và TikTok tách riêng, mặc định tắt và gắn bản cuối cụ thể. Bài đăng thư viện có video, ảnh bìa, tiêu đề và lời gửi chỉ công khai khi có quyền phù hợp cho từng tệp và đúng phiên bản nội dung đã xem; sửa bài cần đồng ý lại. Đường dẫn tệp đã cấp có thể còn hiệu lực tối đa 60 giây sau khi thu hồi.",
      "Dự kiến lưu đơn/kết quả đã trả tiền 180 ngày sau giao, ảnh nguồn 30 ngày, đơn chưa thanh toán 30 ngày sau hết hạn; owner phải chốt trước live. Bản sao lưu luân chuyển 30 ngày và áp lại yêu cầu xóa khi khôi phục.",
      "Người 16–17 không cung cấp ảnh nhận diện hoặc công khai video cá nhân trong bản đầu. Thu hồi consent gỡ thư viện do website kiểm soát; nền tảng ngoài cần thao tác thủ công. Không bảo đảm xóa bản đã được người khác tải. Kênh yêu cầu xóa/hỗ trợ đang chờ owner cung cấp.",
    ],
  ],
  "dieu-khoan": [
    "Điều khoản trải nghiệm",
    [
      "Huyền Cảnh dành cho giải trí và tự suy ngẫm. Không bảo đảm độ chính xác tâm linh, không thay tư vấn chuyên môn hoặc quyết định của bạn.",
      "Bốn lựa chọn: 10.000đ luận giải tích cực; 20.000đ tích cực, khó khăn và lời khuyên; 60.000đ video hoạt hình tích cực; 70.000đ video hoạt hình về tích cực, khó khăn và lời khuyên. Không có cam kết giao theo số giờ cố định; trao đổi khi tiếp nhận. Đơn cũ giữ nguyên thông tin và giá đã chốt.",
      "Thanh toán chuyển khoản Sacombank qua thông tin và QR gốc của chủ website. Chỉ chuyển khoản khi đã có đơn được tiếp nhận. Khách báo chuyển khoản không đồng nghĩa tiền đã về; chủ website đối chiếu và xác nhận thủ công.",
    ],
  ],
  "hoan-tien": [
    "Chính sách hoàn tiền chưa được chốt",
    [
      "Trạng thái refund_policy_pending. Không tự áp dụng chính sách không hoàn tiền. Checkout thật bị khóa đến khi owner cung cấp điều kiện, thời hạn và kênh xử lý hoàn tiền.",
    ],
  ],
  "lien-he": [
    "Liên hệ Huyền Cảnh",
    [
      "Liên hệ qua hai số điện thoại được niêm yết bên dưới. Không cung cấp mật khẩu hoặc mã bảo mật tra cứu trong nội dung công khai. Kênh Zalo, email hoặc mạng xã hội không được tự thêm.",
    ],
  ],
};
function Policy() {
  const [remote, setRemote] = useState<{
    support?: string;
    refund_policy?: string;
    retention_approved?: boolean;
  } | null>(null);
  useEffect(() => {
    void fetch("/api/config")
      .then((r) => r.json())
      .then(setRemote)
      .catch(() => {});
  }, []);
  const { slug } = useParams();
  const configured =
    slug === "hoan-tien" && remote?.refund_policy
      ? (["Chính sách hoàn tiền", [remote.refund_policy]] as [string, string[]])
      : slug === "lien-he" && remote?.support
        ? (["Liên hệ Huyền Cảnh", [remote.support]] as [string, string[]])
        : null;
  const p = configured ?? policy[slug ?? ""];
  if (!p) return <NotFound />;
  return (
    <section className="section narrow">
      <p className="eyebrow">MINH BẠCH VÀ TÔN TRỌNG</p>
      <h1>{p[0]}</h1>
      {slug === "lien-he" && <SupportContacts />}
      {p[1].map((s) => (
        <p key={s}>{s}</p>
      ))}
    </section>
  );
}
function NotFound() {
  return (
    <section className="section narrow">
      <h1>Lối nhỏ này chưa có</h1>
      <Link className="button" to="/kham-pha">
        Trở về khám phá
      </Link>
    </section>
  );
}
function App() {
  const [motion, setMotion] = useState(
      localStorage.getItem("hc-motion") ?? "system",
    ),
    [sound, setSound] = useState(false),
    [guide, setGuide] = useState(false),
    [offline, setOffline] = useState(!navigator.onLine);
  const route = useLocation();
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
    localStorage.setItem("hc-motion", motion);
  }, [motion]);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      "Huyền Cảnh · " +
      (route.pathname === "/"
        ? "Chạm miền tĩnh lặng"
        : "Một khoảng lặng cho bạn");
  }, [route.pathname]);
  useEffect(() => {
    if (!sound) return;
    const audio = new Audio("/assets/may-som.wav");
    audio.loop = true;
    audio.volume = 0.12;
    void audio.play().catch(() => setSound(false));
    const visibility = () => {
      if (document.hidden) audio.pause();
      else void audio.play();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      audio.pause();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [sound]);
  return (
    <>
      <a className="skip" href="#main">
        Đến nội dung chính
      </a>
      <header>
        <Link className="brand" to="/">
          <span>✧</span>
          <span>
            Huyền Cảnh<small>MỘT MIỀN TĨNH LẶNG</small>
          </span>
        </Link>
        <nav aria-label="Điều hướng chính">
          <NavLink to="/kham-pha">Khám phá</NavLink>
          <NavLink to="/dich-vu">Dịch vụ</NavLink>
          <NavLink to="/thu-vien">Thư viện</NavLink>
          <NavLink to="/tra-cuu">Tra cứu</NavLink>
        </nav>
        <Link className="account-link" to="/tai-khoan">
          Góc của bạn ↗
        </Link>
      </header>

      {offline && (
        <div className="notice" role="status">
          Bạn đang offline. Công cụ đã tải vẫn chạy; tài khoản và dịch vụ máy
          chủ tạm không truy cập được.
        </div>
      )}
      <main id="main" key={route.pathname} data-ui-revision={uiRevision}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kham-pha" element={<Explore />} />
          <Route path="/boi/:slug" element={<Tool />} />
          <Route path="/dich-vu" element={<Pricing />} />
          <Route
            path="/dat-don"
            element={publicPreview ? <PublicPreviewNotice /> : <OrderPage />}
          />
          <Route
            path="/tra-cuu"
            element={publicPreview ? <PublicPreviewNotice /> : <LookupPage />}
          />
          <Route
            path="/tai-khoan"
            element={publicPreview ? <PublicPreviewNotice /> : <Account />}
          />
          <Route
            path="/dang-nhap"
            element={publicPreview ? <PublicPreviewNotice /> : <Account />}
          />
          <Route
            path="/auth/callback"
            element={publicPreview ? <PublicPreviewNotice /> : <Callback />}
          />
          <Route
            path="/admin"
            element={publicPreview ? <PublicPreviewNotice /> : <Admin />}
          />
          <Route path="/thu-vien" element={<Gallery />} />
          <Route path="/video-mau" element={<SampleVideo />} />
          <Route path="/chinh-sach/:slug" element={<Policy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <aside className="preferences" aria-label="Tùy chọn trải nghiệm">
        <button aria-pressed={sound} onClick={() => setSound(!sound)}>
          {sound ? "♫ Tắt nhạc" : "♫ Bật nhạc"}
        </button>
        <label>
          Hiệu ứng
          <select
            aria-label="Chế độ hiệu ứng"
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
          >
            <option value="system">Theo hệ thống</option>
            <option value="reduce">Giảm hiệu ứng</option>
            <option value="full">Đầy đủ</option>
          </select>
        </label>
        <button aria-expanded={guide} onClick={() => setGuide(!guide)}>
          ✧ Linh Sứ
        </button>
        {guide && (
          <p className="guide">
            Chọn một công cụ để bắt đầu. Những điểm số chỉ là biểu tượng; bạn
            luôn có quyền chọn điều phù hợp với mình.
          </p>
        )}
      </aside>
      <footer>
        <div>
          <Link className="brand" to="/">
            ✧ Huyền Cảnh
          </Link>
          <p>
            Một khoảng lặng, một góc nhìn.
            <br />
            Bạn vẫn là người viết câu chuyện của mình.
          </p>
        </div>
        <div>
          <Link to="/chinh-sach/rieng-tu">Riêng tư</Link>
          <Link to="/chinh-sach/dieu-khoan">Điều khoản</Link>
          <Link to="/chinh-sach/hoan-tien">Hoàn tiền</Link>
          <Link to="/chinh-sach/lien-he">Liên hệ</Link>
        </div>
        <p className="small-note">
          Một khoảng lặng để hiểu mình hơn.
          <br />© 2026 Huyền Cảnh
        </p>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
