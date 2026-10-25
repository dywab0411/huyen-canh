import { useState } from "react";
import { api } from "../../lib/auth";
type Task = {
  id: string;
  media_id: string;
  platform: string;
  created_at: string;
};
export function Operations() {
  const [tasks, setTasks] = useState<Task[]>([]),
    [message, setMessage] = useState("");
  async function load() {
    try {
      const r = await api("admin/removal-tasks", {});
      setTasks(r.tasks as Task[]);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <details>
      <summary>Thu hồi nền tảng ngoài & retention dry-run</summary>
      <button className="button secondary" onClick={() => void load()}>
        Tải việc gỡ video đang chờ
      </button>
      {tasks.map((t) => (
        <form
          key={t.id}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const r = await api("admin/complete-removal", { task_id: t.id });
              setMessage(String(r.message));
              await load();
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
        >
          <p>
            {t.platform} · media {t.media_id} · tạo{" "}
            {new Date(t.created_at).toLocaleDateString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </p>
          <label className="checkbox">
            <input required type="checkbox" />
            Tôi đã thao tác trên nền tảng ngoài và kiểm tra bản do mình quản lý
            đã gỡ.
          </label>
          <button className="button secondary">
            Ghi biên nhận đã gỡ thủ công
          </button>
        </form>
      ))}
      <button
        className="button secondary"
        onClick={() =>
          void api("admin/retention-dry-run", {})
            .then((r) =>
              setMessage(String(r.message) + " " + JSON.stringify(r.counts)),
            )
            .catch((e) => setMessage(e.message))
        }
      >
        Đếm ứng viên retention (không xóa)
      </button>
      <p role="status">{message}</p>
    </details>
  );
}
