import { VideoLibrary } from "./VideoLibrary";
import { useState } from "react";
import { api } from "../../lib/auth";
import { Config } from "./Config";
import { Operations } from "./Operations";
export function OwnerPanel() {
  const [message, setMessage] = useState("");
  async function run(path: string, body: unknown) {
    try {
      const r = await api("admin/" + path, body);
      setMessage(String(r.message ?? "Đã thực hiện."));
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <section>
      <VideoLibrary />
      <Config />
      <Operations />
      <details>
        <summary>Thành viên (owner, tối đa 3)</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run("members", {
              user_id: f.get("user_id"),
              role: f.get("role"),
              active: f.get("active") === "on",
            });
          }}
        >
          <label>
            User UUID đã xác minh trong Supabase
            <input name="user_id" required />
          </label>
          <label>
            Vai trò
            <select name="role">
              <option>editor</option>
              <option>owner</option>
            </select>
          </label>
          <label className="checkbox">
            <input name="active" type="checkbox" />
            Kích hoạt thành viên
          </label>
          <p>
            Không cấp quyền dựa trên email. Không thể đổi quyền của chính mình.
          </p>
          <button className="button secondary">Lưu vai trò đã kiểm tra</button>
        </form>
      </details>
      <details>
        <summary>Dataset draft → validate → publish bất biến</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              void run("datasets", {
                version: f.get("version"),
                content: JSON.parse(String(f.get("content"))),
                source: f.get("source"),
                license: f.get("license"),
                publish: f.get("publish") === "on",
              });
            } catch {
              setMessage("JSON chưa hợp lệ.");
            }
          }}
        >
          <label>
            Version mới
            <input name="version" required maxLength={60} />
          </label>
          <label>
            JSON 12 slug → title, sections
            <textarea name="content" rows={10} required maxLength={400000} />
          </label>
          <label>
            Nguồn/quyền sử dụng
            <input name="source" required minLength={10} />
          </label>
          <label>
            Giấy phép
            <input name="license" required minLength={3} />
          </label>
          <label className="checkbox">
            <input type="checkbox" name="publish" />
            Tôi đã xem nội dung, xác minh nguồn và muốn publish version bất
            biến.
          </label>
          <p>
            Không ghi đè version đã publish; lịch sử cũ giữ snapshot. Mỗi công
            cụ cần ít nhất 501 từ.
          </p>
          <button className="button secondary">Validate và lưu dataset</button>
        </form>
      </details>
      <details>
        <summary>Phê duyệt bản công khai đã được khách cho phép</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run("publish-media", {
              asset_id: f.get("asset_id"),
              scope: f.get("scope"),
            });
          }}
        >
          <label>
            Asset UUID đã xem và kiểm định
            <input name="asset_id" required />
          </label>
          <label>
            Nền tảng
            <select name="scope">
              <option value="website_public_gallery">Website</option>
              <option value="youtube_publication">
                YouTube (ghi nhận duyệt, tự đăng)
              </option>
              <option value="tiktok_publication">
                TikTok (ghi nhận duyệt, tự đăng)
              </option>
            </select>
          </label>
          <p>
            Server bắt buộc grant còn hiệu lực đúng hash/version; role owner
            không bỏ qua được.
          </p>
          <button className="button secondary">
            Xác nhận phê duyệt bản này
          </button>
        </form>
      </details>
      <p role="status">{message}</p>
    </section>
  );
}
