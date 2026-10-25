import { OrderPreview, type PreviewData } from "./OrderPreview";
import { VideoTerms } from "./VideoTerms";
import { lazy, Suspense } from "react";
import { BirthFields } from "./BirthFields";
import { demoAllowed } from "./demo-model";
const DemoOrder = import.meta.env.DEV
  ? lazy(() => import("./DemoOrder"))
  : null;
import { useEffect, useRef, useState } from "react";
import { filePolicy } from "../../file-policy";
import { phone } from "../../engine";
import { orderRequest } from "./order-model";
import { PaymentInfo } from "./PaymentInfo";
import { saleCodes, packageDescriptions } from "../../lib/packages";
import { Link, useLocation } from "react-router-dom";
import { fetchQuote, usePackages } from "../../lib/packages";
import { api, auth } from "../../lib/auth";
type Turnstile = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
export function Challenge({
  siteKey,
  action,
  onToken,
  resetKey = 0,
}: {
  resetKey?: number;
  siteKey: string;
  action: string;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  useEffect(() => {
    const element = container.current;
    let id: string | undefined;
    let active = true;
    const render = () => {
      if (active && container.current && window.turnstile && !id)
        id = window.turnstile.render(container.current, {
          sitekey: siteKey,
          action,
          callback: (t) => {
            if (active) callback.current(t);
          },
          "expired-callback": () => {
            if (active) callback.current("");
          },
          "error-callback": () => {
            if (active) callback.current("");
          },
        });
    };
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-hc-challenge]",
    );
    if (!script) {
      script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.dataset.hcChallenge = "true";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    render();
    return () => {
      active = false;
      script.removeEventListener("load", render);
      if (id) window.turnstile?.remove(id);
      element?.replaceChildren();
    };
  }, [siteKey, action, resetKey]);
  return <div ref={container} aria-label="Xác minh chống lạm dụng" />;
}
type Created = {
  order_code: string;
  access_code: string;
  price_vnd: number;
  expires_at: string;
  bank: Record<string, string>;
};
export function OrderPage() {
  const l = useLocation();
  return demoAllowed() &&
    new URLSearchParams(l.search).get("demo") === "1" &&
    DemoOrder ? (
    <Suspense fallback={<p>Đang mở DEMO…</p>}>
      <DemoOrder />
    </Suspense>
  ) : (
    <LiveOrderPage />
  );
}
function LiveOrderPage() {
  const location = useLocation();
  const { quote, setQuote } = usePackages();
  const [pkg, setPkg] = useState(
      saleCodes.includes(
        new URLSearchParams(location.search).get(
          "goi",
        ) as (typeof saleCodes)[number],
      )
        ? new URLSearchParams(location.search).get("goi")!
        : "G10",
    ),
    [ready, setReady] = useState(false),
    [siteKey, setSiteKey] = useState(""),
    [challenge, setChallenge] = useState(""),
    [resetKey, setResetKey] = useState(0),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [created, setCreated] = useState<Created | null>(null),
    [show, setShow] = useState(false),
    [saved, setSaved] = useState(false),
    [second, setSecond] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [photoConsent, setPhotoConsent] = useState(false),
    [photoMessage, setPhotoMessage] = useState(""),
    [preview, setPreview] = useState<PreviewData | null>(null);
  const flight = useRef(false),
    consumed = useRef(new Set<string>()),
    key = useRef(crypto.randomUUID()),
    csrf = useRef("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/config", { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((c) => {
        setReady(c.checkout_enabled === true);
        setSiteKey(c.turnstile_site_key ?? "");
      })
      .catch(() => setReady(false));
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (preview) {
      const node = document.querySelector<HTMLElement>(".order-preview");
      node?.scrollIntoView({ block: "start" });
      node?.focus({ preventScroll: true });
    }
  }, [preview]);
  async function session(code: string) {
    if (csrf.current) return csrf.current;
    const r = await api("orders/lookup-code", { access_code: code });
    csrf.current = String(r.csrf);
    return csrf.current;
  }
  async function uploadPhoto(order: Created) {
    if (!file) return;
    if (!auth)
      throw Error("Chưa kết nối được kho ảnh. Đơn đã tạo, ảnh chưa tải lên.");
    const proof = await session(order.access_code);
    const r = await api(
      "orders/photo-reserve",
      { filename: file.name, mime: file.type, size: file.size },
      proof,
    );
    const { error } = await auth.storage
      .from(String(r.bucket))
      .uploadToSignedUrl(String(r.path), String(r.token), file, {
        contentType: file.type,
      });
    if (error)
      throw Error(
        "Ảnh chưa tải lên được. Bạn có thể thử lại mà không tạo đơn mới.",
      );
    await api("orders/photo-finish", { attachment_id: r.id }, proof);
    setPhotoMessage("Ảnh đã vào kho riêng, chờ kiểm định; không công khai.");
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (flight.current) return;
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (file) {
        filePolicy(file.name, file.type, file.size);
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          !photoConsent
        )
          throw Error("Ảnh cần đúng định dạng và quyền đồng ý riêng bên dưới.");
      }
      const payload = orderRequest.parse({
        package_code: pkg,
        package_version: quote.packages.find((p) => p.code === pkg)?.version,
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
        phone: phone(String(f.phone ?? "")),
        notes: f.notes ?? "",
        photo_consent: Boolean(file && photoConsent),
        photo_adult: Boolean(file && photoConsent),
        idempotency_key: key.current,
        ...(challenge ? { challenge } : {}),
      });
      if (!ready) {
        setPreview({
          code: payload.package_code,
          price: quote.packages.find((p) => p.code === pkg)!.price_vnd,
          name: payload.name,
          gender: payload.gender,
          birth_date: payload.birth_date,
          birth_hour: payload.birth_hour,
          name2: payload.name2,
          gender2: payload.gender2,
          birth_date2: payload.birth_date2,
          birth_hour2: payload.birth_hour2,
          phone: payload.phone,
          notes: payload.notes,
          photo: file?.name ?? null,
        });
        setMessage(
          "Đã xem trước yêu cầu hợp lệ. Đơn chưa được tạo; dịch vụ đặt riêng hiện tạm ngừng tiếp nhận.",
        );
        return;
      }
      if (!challenge || consumed.current.has(challenge))
        throw Error("Cần xác minh chống lạm dụng mới.");
      flight.current = true;
      setBusy(true);
      const fresh = await fetchQuote(),
        selected = fresh.packages.find((p) => p.code === pkg),
        shown = quote.packages.find((p) => p.code === pkg);
      setQuote(fresh);
      if (fresh.source !== "server" || !selected?.active)
        throw Error("Chưa xác minh được gói đang nhận yêu cầu.");
      if (
        selected.version !== shown?.version ||
        selected.price_vnd !== shown.price_vnd
      ) {
        setMessage(
          "Giá đã thay đổi. Kiểm tra lại giá mới và bấm xác nhận lại.",
        );
        return;
      }
      consumed.current.add(challenge);
      setChallenge("");
      setResetKey((k) => k + 1);
      const r = await api("orders", {
        ...payload,
        package_version: selected.version,
      });
      if (r.access_code) {
        const order = r as unknown as Created;
        setCreated(order);
        key.current = crypto.randomUUID();
        setMessage("Đơn đã tạo. Lưu mã bảo mật tra cứu trước khi rời trang.");
        try {
          await session(order.access_code);
        } catch {
          setMessage(
            "Đơn đã tạo. Lưu mã bảo mật và mở trang tra cứu để tiếp tục.",
          );
        }
        if (file)
          try {
            await uploadPhoto(order);
          } catch (error) {
            setPhotoMessage((error as Error).message);
          }
      } else setMessage(String(r.message));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Thông tin chưa hợp lệ.",
      );
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  function download() {
    if (!created?.access_code) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          `Huyền Cảnh — lưu riêng, không công khai\nMã đơn chuyển khoản: ${created.order_code}\nMã bảo mật tra cứu: ${created.access_code}\nTra cứu tại ${locationOrigin()}/tra-cuu. Chỉ nhập mã bảo mật, không đặt mã trong URL. Không ghi mã bảo mật vào chuyển khoản.`,
        ],
        { type: "text/plain;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "huyen-canh-ma-bao-mat.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="section narrow">
      <p className="eyebrow">LỜI GỬI DÀNH RIÊNG CHO BẠN</p>
      <h1>Gửi một lời hẹn</h1>
      {!ready && (
        <div className="notice">
          <b>Dịch vụ đặt riêng tạm ngừng tiếp nhận</b>
          {demoAllowed() && (
            <Link
              className="button secondary"
              to={"/dat-don?demo=1&goi=" + pkg}
            >
              Thử quy trình DEMO · không đặt đơn thật
            </Link>
          )}
          <p>
            Bạn có thể xem trước biểu mẫu. Chỉ chuyển khoản sau khi đã có đơn
            được tiếp nhận và hướng dẫn riêng.
          </p>
        </div>
      )}
      {created ? (
        <article className="panel">
          <h2>Đơn đã tạo</h2>
          <label>
            Mã đơn dùng khi chuyển khoản
            <input readOnly value={created.order_code} />
          </label>
          <button
            className="button secondary"
            onClick={() =>
              void navigator.clipboard
                .writeText(created.order_code)
                .then(() => setMessage("Đã chép mã đơn chuyển khoản."))
            }
          >
            Chép mã đơn
          </button>
          {!saved && (
            <>
              <label>
                Mã bảo mật tra cứu · chỉ cấp một lần
                <input
                  type={show ? "text" : "password"}
                  readOnly
                  value={created.access_code}
                />
              </label>
              <div className="actions">
                <button
                  className="button secondary"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Che mã" : "Hiện mã bảo mật"}
                </button>
                <button
                  className="button secondary"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(created.access_code)
                      .then(() =>
                        setMessage("Đã chép mã bảo mật. Lưu ở nơi riêng tư."),
                      )
                  }
                >
                  Chép mã bảo mật
                </button>
                <button className="button secondary" onClick={download}>
                  Tải mã riêng về máy
                </button>
                <button
                  className="button"
                  onClick={() => {
                    setSaved(true);
                    setCreated({ ...created, access_code: "" });
                  }}
                >
                  Tôi đã lưu an toàn · ẩn mã
                </button>
              </div>
            </>
          )}
          <p>
            Vào <Link to="/tra-cuu">Tra cứu đơn hàng</Link> và nhập một mã bảo
            mật để xem kết quả sau phát hành. Mã đơn chuyển khoản không cấp
            quyền truy cập kết quả.
          </p>
          <p>
            Admin kiểm tra thanh toán thủ công. Không có thời hạn giao cố định;
            thông tin giao nhận được thống nhất khi tiếp nhận.
          </p>
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const proof = await session(created.access_code);
                const r = await api("orders/claim-transfer", {}, proof);
                setMessage(String(r.message));
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Tôi đã chuyển khoản
          </button>
          <p role="status">{photoMessage}</p>
          {file && !saved && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await uploadPhoto(created);
                } catch (e) {
                  setPhotoMessage((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Thử tải lại ảnh đã chọn
            </button>
          )}
        </article>
      ) : (
        <form
          className="panel"
          onSubmit={submit}
          onChange={() => {
            setPreview(null);
            setMessage("");
          }}
        >
          <fieldset disabled={busy}>
            <label>
              Gói dịch vụ
              <select
                name="package_code"
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
              >
                {quote.packages
                  .filter((p) => p.active)
                  .map((p) => (
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
                required
                minLength={3}
                maxLength={100}
                autoComplete="name"
              />
            </label>
            <label>
              Giới tính người thứ nhất
              <select name="gender" required defaultValue="">
                <option value="">Chọn giới tính</option>
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
                  <input
                    name="name2"
                    required
                    minLength={3}
                    maxLength={100}
                    autoComplete="off"
                  />
                </label>
                <label>
                  Giới tính người thứ hai
                  <select name="gender2" required defaultValue="">
                    <option value="">Chọn giới tính</option>
                    <option>Nam</option>
                    <option>Nữ</option>
                  </select>
                </label>
                <BirthFields second />
              </div>
            )}
            <label>
              Số điện thoại liên hệ
              <input
                name="phone"
                type="tel"
                required
                pattern="(0|\+84)[35789][0-9]{8}"
                autoComplete="tel"
              />
            </label>
            <label>
              Ghi chú thêm (tùy chọn)
              <textarea name="notes" maxLength={2000} rows={4} />
            </label>
            <label>
              Ảnh bàn tay hoặc khuôn mặt (tùy chọn)
              <input
                name="photo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setPhotoConsent(false);
                }}
              />
            </label>
            <p className="small-note">
              Không bắt buộc gửi ảnh. Ảnh JPEG/PNG/WebP tối đa 5 MB, được giữ
              trong kho riêng và kiểm định trước khi admin dùng.
            </p>
            {file && (
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={photoConsent}
                  onChange={(e) => setPhotoConsent(e.target.checked)}
                />
                Tôi xác nhận tôi và người nhận diện trong ảnh đều từ 18 tuổi, có
                quyền sử dụng ảnh và tự nguyện cho phép dùng ảnh này để soạn nội
                dung riêng. Đây không phải quyền công khai ảnh hoặc video.
              </label>
            )}
            <p className="small-note">
              Bài đọc dành cho tham khảo và suy ngẫm. Khi gửi yêu cầu, thông tin
              cần thiết được xử lý để thực hiện dịch vụ theo{" "}
              <Link to="/chinh-sach/rieng-tu">chính sách dữ liệu</Link>. Quyền
              ảnh và công khai được hỏi riêng, không tick sẵn.
            </p>
            <VideoTerms code={pkg} />
            {ready && siteKey && (
              <Challenge
                siteKey={siteKey}
                action="order"
                resetKey={resetKey}
                onToken={(t) => setChallenge(consumed.current.has(t) ? "" : t)}
              />
            )}
            <button
              className="button"
              type="submit"
              disabled={
                busy || (ready && (!challenge || quote.source !== "server"))
              }
            >
              {ready ? "Tạo đơn với giá đã hiển thị" : "Xem trước yêu cầu"}
            </button>
            {!ready && (
              <p className="small-note">
                Nhận đơn thật đang khóa cho đến khi hệ thống được cấu hình và
                kiểm thử đầy đủ.
              </p>
            )}
          </fieldset>
        </form>
      )}
      {preview && !created && (
        <OrderPreview data={preview} onClose={() => setPreview(null)} />
      )}
      <p role="status">{message}</p>
      <PaymentInfo
        orderCode={created?.order_code}
        amount={created?.price_vnd}
      />
    </section>
  );
}
function locationOrigin() {
  return window.location.origin;
}
