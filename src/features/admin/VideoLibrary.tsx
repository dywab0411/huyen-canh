import { useRef, useState } from "react";
import { api, auth } from "../../lib/auth";
import { ApiError } from "../../lib/api-error";
import {
  categories,
  postPayload,
  type LibraryPost,
  type PostPayload,
} from "../library/model";
import { filePolicy } from "../../file-policy";
type Asset = { id: string; mime: string; release_state: string };
const empty: PostPayload = {
  title: "",
  body: "",
  category: "Câu chuyện",
  kind: "editorial",
  order_id: null,
  video_id: "",
  cover_id: "",
  rights_confirmed: false,
};
export function VideoLibrary() {
  const [posts, setPosts] = useState<LibraryPost[]>([]),
    [assets, setAssets] = useState<Asset[]>([]),
    [selected, setSelected] = useState<LibraryPost | null>(null),
    [form, setForm] = useState<PostPayload>(empty),
    [dirty, setDirty] = useState(true),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const flight = useRef(false);
  async function load() {
    const r = await api("admin/library-list", {});
    setPosts(r.posts as LibraryPost[]);
    setAssets(r.assets as Asset[]);
    return r.posts as LibraryPost[];
  }
  function change(patch: Partial<PostPayload>) {
    setForm((f) => ({
      ...f,
      ...patch,
      rights_confirmed: patch.rights_confirmed ?? false,
    }));
    setDirty(true);
    setDeleteConfirmed(false);
  }
  async function run(action: "save" | "publish" | "hide" | "delete") {
    if (flight.current) return;
    flight.current = true;
    setBusy(true);
    setDeleteConfirmed(false);
    try {
      const r =
        action === "save"
          ? await api("admin/library-save", {
              id: selected?.id ?? null,
              version: selected?.version ?? null,
              payload: postPayload.parse(form),
            })
          : await api("admin/library-transition", {
              id: selected!.id,
              version: selected!.version,
              action,
            });
      const post = r.post as LibraryPost;
      await load();
      if (action === "delete") {
        setSelected(null);
        setForm(empty);
        setDirty(true);
      } else {
        setSelected(post);
        setForm(post.payload);
        setDirty(false);
      }
      setMessage(String(r.message));
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        try {
          const list = await load();
          setSelected(list.find((p) => p.id === selected?.id) ?? null);
          setDirty(true);
          setMessage(
            "Bài đăng đã thay đổi. Đã tải phiên bản mới; phần đang soạn được giữ lại. Xem lại trước khi lưu, không tự gửi lại.",
          );
        } catch {
          setSelected(null);
          setMessage(
            "Chưa tải được bản mới. Tải lại thư viện trước khi tiếp tục.",
          );
        }
      } else
        setMessage(e instanceof Error ? e.message : "Chưa lưu được bài đăng.");
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  async function upload() {
    if (!file || !auth || flight.current) return;
    flight.current = true;
    setBusy(true);
    try {
      filePolicy(file.name, file.type, file.size);
      const r = await api("admin/library-upload", {
        filename: file.name,
        mime: file.type,
        size: file.size,
      });
      const { error } = await auth.storage
        .from(String(r.bucket))
        .uploadToSignedUrl(String(r.path), String(r.token), file, {
          contentType: file.type,
        });
      if (error) throw error;
      const done = await api("admin/library-upload-finish", { id: r.id });
      setMessage(String(done.message) + " ID: " + r.id);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  return (
    <details className="library-admin">
      <summary>Quản lý thư viện video</summary>
      <p>
        Video hoạt hình, ảnh bìa và lời gửi được biên tập thành từng bài đăng.
        Bản sửa luôn trở về nháp.
      </p>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() => void load().catch((e) => setMessage(e.message))}
      >
        Tải bài đăng và tệp
      </button>
      <fieldset disabled={busy}>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setSelected(null);
            setForm(empty);
            setDirty(true);
            setDeleteConfirmed(false);
          }}
        >
          Thêm bài đăng
        </button>
        <ul>
          {posts.map((p) => (
            <li key={p.id}>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setSelected(p);
                  setForm(p.payload);
                  setDirty(false);
                  setDeleteConfirmed(false);
                }}
              >
                {p.payload.title} ·{" "}
                {p.state === "public" ? "Công khai" : "Nháp"} · v{p.version}
              </button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run("save");
          }}
        >
          <h3>{selected ? "Chỉnh sửa bài đăng" : "Bài đăng mới"}</h3>
          {selected && (
            <p>
              Phiên bản {selected.version} · Nội dung{" "}
              {selected.content_revision}
              {selected.published_at
                ? " · Ngày đăng " +
                  new Date(selected.published_at).toLocaleDateString("vi-VN")
                : ""}
            </p>
          )}
          <label>
            Tiêu đề video
            <input
              value={form.title}
              onChange={(e) => change({ title: e.target.value })}
              required
              maxLength={160}
            />
          </label>
          <label>
            Nội dung lời bói
            <textarea
              rows={10}
              value={form.body}
              onChange={(e) => change({ body: e.target.value })}
              required
              maxLength={20000}
            />
          </label>
          <label>
            Danh mục video
            <select
              value={form.category}
              onChange={(e) =>
                change({ category: e.target.value as PostPayload["category"] })
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Nguồn nội dung
            <select
              value={form.kind}
              onChange={(e) =>
                change({
                  kind: e.target.value as PostPayload["kind"],
                  order_id: null,
                  video_id: "",
                  cover_id: "",
                })
              }
            >
              <option value="editorial">
                Website tự biên tập, không có dữ liệu khách
              </option>
              <option value="customer">
                Nội dung liên quan đến khách hàng
              </option>
            </select>
          </label>
          {form.kind === "customer" ? (
            <>
              <label>
                UUID đơn liên quan
                <input
                  value={form.order_id ?? ""}
                  onChange={(e) => change({ order_id: e.target.value })}
                  required
                />
              </label>
              <label>
                UUID video public_derivative đã kiểm định
                <input
                  value={form.video_id}
                  onChange={(e) => change({ video_id: e.target.value })}
                  required
                />
              </label>
              <label>
                UUID ảnh bìa public_derivative đã kiểm định
                <input
                  value={form.cover_id}
                  onChange={(e) => change({ cover_id: e.target.value })}
                  required
                />
              </label>
              <p>
                Khách xem và cho phép riêng cả hai tệp trong tra cứu, sau đó xem
                và cho phép đúng bài đăng này. Không được đưa thông tin riêng
                vào bài trước khi khách đồng ý.
              </p>
            </>
          ) : (
            <>
              {(["video", "cover"] as const).map((kind) => (
                <label key={kind}>
                  {kind === "video"
                    ? "Video MP4 đã kiểm định"
                    : "Ảnh bìa đã kiểm định"}
                  <select
                    required
                    value={form[(kind + "_id") as "video_id" | "cover_id"]}
                    onChange={(e) => change({ [kind + "_id"]: e.target.value })}
                  >
                    <option value="">Chọn tệp</option>
                    {assets
                      .filter(
                        (a) =>
                          a.release_state === "released" &&
                          (kind === "video"
                            ? a.mime === "video/mp4"
                            : a.mime.startsWith("image/")),
                      )
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.mime} · {a.id}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </>
          )}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.rights_confirmed}
              onChange={(e) => change({ rights_confirmed: e.target.checked })}
            />{" "}
            {form.kind === "editorial"
              ? "Tôi có quyền sử dụng các tệp và nội dung này; bài không chứa dữ liệu, hình ảnh hay câu chuyện riêng của khách hàng."
              : "Tôi đã rà soát quyền sử dụng và thông tin riêng; việc công khai vẫn cần khách cho phép đúng tệp và nội dung."}
          </label>
          <button className="button" type="submit">
            Lưu bài thành nháp
          </button>
        </form>
        {selected && (
          <div className="actions">
            <button
              className="button"
              disabled={dirty || !form.rights_confirmed}
              onClick={() => void run("publish")}
            >
              Công khai bài đăng
            </button>
            <button
              className="button secondary"
              disabled={dirty || selected.state !== "public"}
              onClick={() => void run("hide")}
            >
              Ẩn bài đăng
            </button>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
              />
              Xác nhận xóa bài đã chọn khỏi thư viện
            </label>
            <button
              className="button secondary"
              disabled={!deleteConfirmed}
              onClick={() => void run("delete")}
            >
              Xóa bài đăng
            </button>
          </div>
        )}
        <details>
          <summary>Tải video và ảnh bìa của website</summary>
          <p>
            Chỉ dùng cho nội dung website sở hữu, không có dữ liệu khách. MP4
            30–60 giây, tối đa20MB; ảnh JPEG/PNG/WebP tối đa5MB. Tệp ở kho riêng
            và phải qua kiểm định trước khi xuất bản.
          </p>
          <label>
            Tệp thư viện
            <input
              type="file"
              accept=".mp4,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            className="button secondary"
            disabled={!file || !auth}
            onClick={() => void upload()}
          >
            Tải tệp thư viện
          </button>
          <p>
            Kiểm định trên máy vận hành: python scripts/validate_attachment.py
            --library UUID_TEP. Không có nút bỏ qua kiểm định.
          </p>
          <ul>
            {assets
              .filter((a) => a.release_state !== "released")
              .map((a) => (
                <li key={a.id}>
                  {a.id} · {a.mime} · {a.release_state}
                </li>
              ))}
          </ul>
        </details>
      </fieldset>
      <p role="status">{message}</p>
    </details>
  );
}
