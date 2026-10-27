import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { login } from "../../lib/auth";
// Kept for existing saved-profile validation; customer account UI is retired.
export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((s) => !/[<>]/u.test(s)),
  age_band: z.enum(["16-17", "18+"]),
});
export function Account() {
  const username = "admin";
  const [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const navigate = useNavigate();
  return (
    <section className="section narrow">
      <h1>Đăng nhập quản trị</h1>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setMessage("");
          try {
            await login(username, password);
            navigate("/admin");
          } catch {
            setMessage(
              "Đăng nhập chưa thành công. Kiểm tra tài khoản và mật khẩu.",
            );
          } finally {
            setPassword("");
            setBusy(false);
          }
        }}
      >
        <label>
          Tài khoản
          <input
            autoComplete="username"
            value={username}
            required
            maxLength={80}
            readOnly
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            required
            maxLength={256}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="button" disabled={busy}>
          Đăng nhập
        </button>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
