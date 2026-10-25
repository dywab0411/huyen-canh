import { useState } from "react";
import { api } from "../../lib/auth";
import type { LibraryPost } from "./model";
export function PublicationConsent({ csrf }: { csrf: string }) {
  const [posts, setPosts] = useState<LibraryPost[]>([]),
    [preview, setPreview] = useState<{
      post: LibraryPost;
      video_url: string;
      cover_url: string;
    } | null>(null),
    [confirmed, setConfirmed] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(path: string, body: unknown) {
    if (busy) return null;
    setBusy(true);
    try {
      return await api("consents/library-" + path, body, csrf);
    } catch (e) {
      setMessage((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Quyền công khai bài đăng thư viện</summary>
      <p>
        Bạn tự chọn việc công khai. Quyền này tách riêng với dùng ảnh để soạn
        video và quyền của từng tệp. Bạn có thể thu hồi tại đây.
      </p>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() =>
          void run("posts", {}).then((r) => {
            if (r) setPosts(r.posts as LibraryPost[]);
          })
        }
      >
        Xem các bài đăng liên quan đến đơn
      </button>
      {posts.map((p) => (
        <article key={p.id}>
          <h3>{p.payload.title}</h3>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              setConfirmed(false);
              setPreview(null);
              void run("preview", { id: p.id }).then((r) => {
                if (r) setPreview(r as unknown as typeof preview);
              });
            }}
          >
            Xem toàn bộ bản {p.content_revision}
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() =>
              void run("grant", {
                id: p.id,
                revision: p.content_revision,
                granted: false,
              }).then((r) => {
                if (r) {
                  setConfirmed(false);
                  setPreview(null);
                  setMessage(String(r.message));
                }
              })
            }
          >
            Thu hồi quyền của bài đăng này
          </button>
        </article>
      ))}
      {preview && (
        <article className="panel">
          <h3>{preview.post.payload.title}</h3>
          <p>
            {preview.post.payload.category} · Bản nội dung{" "}
            {preview.post.content_revision}
          </p>
          <img
            className="public-image"
            src={preview.cover_url}
            alt="Ảnh bìa của bài đăng đang xem để quyết định công khai"
          />
          <video
            controls
            playsInline
            preload="metadata"
            src={preview.video_url}
            poster={preview.cover_url}
          />
          <p className="library-body">{preview.post.payload.body}</p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Tôi đã xem và cho phép công khai trên website đúng video, ảnh bìa,
            tiêu đề, danh mục và nội dung của bản này. Tôi có thể thu hồi quyền;
            bản đã được người khác tải có thể không thu hồi được.
          </label>
          <button
            className="button"
            disabled={!confirmed || busy}
            onClick={() => {
              setConfirmed(false);
              void run("grant", {
                id: preview.post.id,
                revision: preview.post.content_revision,
                granted: true,
              }).then((r) => {
                if (r) setMessage(String(r.message));
              });
            }}
          >
            Cho phép công khai đúng bản đã xem
          </button>
        </article>
      )}
      <p role="status">{message}</p>
    </details>
  );
}
