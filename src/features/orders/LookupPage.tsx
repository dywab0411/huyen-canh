import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { demoAllowed } from "./demo-model";
const DemoLookup = import.meta.env.DEV
  ? lazy(() => import("./DemoOrder").then((m) => ({ default: m.DemoLookup })))
  : null;
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/auth";
import { accessCodeSchema } from "./order-model";
import { Challenge } from "./OrderPage";
import { LookupPortal, type LookupResponse } from "./Portal";
import { SupportContacts } from "./PaymentInfo";
export function LookupPage() {
  const l = useLocation();
  return demoAllowed() &&
    new URLSearchParams(l.search).get("demo") === "1" &&
    DemoLookup ? (
    <Suspense fallback={<p>Đang mở DEMO…</p>}>
      <DemoLookup />
    </Suspense>
  ) : (
    <LiveLookupPage />
  );
}
function LiveLookupPage() {
  const [portal, setPortal] = useState<LookupResponse | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [siteKey, setSiteKey] = useState(""),
    [challenge, setChallenge] = useState(""),
    [resetKey, setResetKey] = useState(0);
  const flight = useRef(false),
    consumed = useRef(new Set<string>());
  useEffect(() => {
    void fetch("/api/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((c) => setSiteKey(c.turnstile_site_key ?? ""))
      .catch(() => {});
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>, legacy = false) {
    e.preventDefault();
    if (flight.current) return;
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setPortal(null);
    if (!legacy && !accessCodeSchema.safeParse(f.access_code).success) {
      setMessage(
        "Thông tin tra cứu chưa đúng hoặc chưa thể truy cập. Mã đơn chuyển khoản không thay thế mã bảo mật.",
      );
      return;
    }
    if (siteKey && (!challenge || consumed.current.has(challenge))) {
      setMessage("Cần xác minh chống lạm dụng mới.");
      return;
    }
    flight.current = true;
    setBusy(true);
    const token = challenge;
    if (token) consumed.current.add(token);
    setChallenge("");
    setResetKey((k) => k + 1);
    try {
      const r = await api(legacy ? "orders/lookup" : "orders/lookup-code", {
        ...f,
        ...(token ? { challenge: token } : {}),
      });
      setPortal({ ...r, legacy } as unknown as LookupResponse);
      setMessage(String(r.message ?? "Đã mở phiên tra cứu riêng."));
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="section narrow">
      <p className="eyebrow">CHỈ DÀNH CHO BẠN</p>
      <h1>Tra cứu lời gửi</h1>
      {demoAllowed() && (
        <Link className="text-link" to="/tra-cuu?demo=1">
          Tra cứu bản ghi DEMO local →
        </Link>
      )}
      <p>
        Chỉ cần một mã bảo mật đã lưu khi đặt đơn. Mã này cấp quyền xem kết quả
        riêng; không chia sẻ, không ghi vào nội dung chuyển khoản hoặc đường
        dẫn.
      </p>
      <form className="panel" onSubmit={(e) => void submit(e)}>
        <label>
          Mã bảo mật tra cứu
          <input
            name="access_code"
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={47}
            maxLength={47}
            placeholder="HCX-…"
          />
        </label>
        <button
          className="button"
          disabled={busy || Boolean(siteKey && !challenge)}
        >
          {busy ? "Đang kiểm tra…" : "Mở lời gửi"}
        </button>
        <p role="status">{message}</p>
      </form>
      {siteKey && (
        <Challenge
          siteKey={siteKey}
          action="lookup"
          resetKey={resetKey}
          onToken={(t) => setChallenge(consumed.current.has(t) ? "" : t)}
        />
      )}
      <details className="panel">
        <summary>Tra cứu đơn cũ trước khi có mã HCX</summary>
        <p>
          Thông tin của đơn cũ vẫn được giữ. Dùng đủ ba thông tin đã được cấp
          trước đây; sau khi xác minh bạn có thể tạo mã bảo mật một ô, không
          chuyển đổi chỉ từ mã đơn công khai.
        </p>
        <form onSubmit={(e) => void submit(e, true)}>
          <label>
            Mã đơn cũ
            <input
              name="order_code"
              autoComplete="off"
              required
              maxLength={14}
            />
          </label>
          <label>
            Số điện thoại của đơn cũ
            <input name="phone" type="tel" autoComplete="off" required />
          </label>
          <label>
            Mã bí mật cũ
            <input
              name="secret"
              type="password"
              autoComplete="off"
              required
              minLength={22}
              maxLength={22}
            />
          </label>
          <button
            className="button secondary"
            disabled={busy || Boolean(siteKey && !challenge)}
          >
            Mở đơn cũ đã xác minh
          </button>
        </form>
      </details>
      {portal && <LookupPortal key={portal.csrf} value={portal} />}
      <details>
        <summary>Bạn không còn mã bảo mật?</summary>
        <p>
          Liên hệ hỗ trợ qua thông tin bên dưới để xác minh qua kênh đăng ký và
          bằng chứng cần thiết. Không thể cấp lại mã chỉ từ số điện thoại hoặc
          mã chuyển khoản. Mã cũ và phiên truy cập sẽ bị thu hồi khi cấp lại.
        </p>
      </details>
      <SupportContacts />
      <Link className="text-link" to="/dat-don">
        Gửi một lời hẹn mới →
      </Link>
    </section>
  );
}
