import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";
export function RecoveryRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const h = new URLSearchParams(location.hash.slice(1));
    if (
      h.get("type") === "recovery" &&
      location.pathname !== "/admin/dat-mat-khau"
    )
      navigate("/admin/dat-mat-khau" + location.hash, { replace: true });
  }, [navigate]);
  return null;
}
export function SetAdminPassword() {
  const [ready, setReady] = useState(false),
    [password, setPassword] = useState(""),
    [repeat, setRepeat] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const navigate = useNavigate();
  const preparation = useRef<Promise<boolean> | null>(null);
  useEffect(() => {
    let active = true;
    if (!preparation.current)
      preparation.current = (async () => {
        const client = auth;
        const hash = new URLSearchParams(location.hash.slice(1));
        const access = hash.get("access_token"),
          refresh = hash.get("refresh_token");
        const recovery = hash.get("type") === "recovery";
        history.replaceState({}, "", "/admin/dat-mat-khau");
        if (!client) return false;
        if (recovery && access && refresh) {
          const { error } = await client.auth.setSession({
            access_token: access,
            refresh_token: refresh,
          });
          if (error) return false;
        }
        const { data, error } = await client.auth.getUser();
        return !error && Boolean(data.user);
      })();
    void preparation.current
      .then((valid) => {
        if (!active) return;
        setReady(valid);
        if (!valid)
          setMessage("Liên kết đã hết hạn hoặc bạn chưa xác minh tài khoản.");
      })
      .catch(() => {
        if (active)
          setMessage("Chưa xác minh được tài khoản. Vui lòng thử lại.");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="section narrow">
      <h1>Đặt mật khẩu quản trị</h1>
      {ready && (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            if (password !== repeat) {
              setMessage("Hai mật khẩu chưa khớp.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await auth!.auth.updateUser({ password });
              if (error) throw Error();
              setMessage(
                "Đã đổi mật khẩu. Hãy đăng nhập lại bằng tài khoản admin.",
              );
              await auth!.auth.signOut();
              navigate("/tai-khoan", { replace: true });
            } catch {
              setMessage("Chưa đổi được mật khẩu. Vui lòng thử lại.");
            } finally {
              setPassword("");
              setRepeat("");
              setBusy(false);
            }
          }}
        >
          <p>Dùng mật khẩu mới, chưa từng chia sẻ.</p>
          <label>
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Nhập lại mật khẩu
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />
          </label>
          <button className="button" disabled={busy}>
            Lưu mật khẩu mới
          </button>
        </form>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
