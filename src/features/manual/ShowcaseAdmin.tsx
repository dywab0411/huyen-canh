import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/auth";
import { uploadVideo } from "../../lib/video-upload";
import { videoHeaderValid } from "../../lib/video-header";
type Video = {
  id: string;
  title: string;
  description: string;
  visibility: "hidden" | "public";
  version: number;
  rights_confirmed: boolean;
  validated: boolean;
  created_at: string;
};
export function ShowcaseAdmin() {
  const [videos, setVideos] = useState<Video[]>([]),
    [selected, setSelected] = useState<Video | null>(null),
    [files, setFiles] = useState<File[]>([]),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [visibility, setVisibility] = useState<"hidden" | "public">("hidden"),
    [rights, setRights] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [progress, setProgress] = useState(0),
    [uploadName, setUploadName] = useState("");
  const lock = useRef(false);
  async function load(before?: string) {
    const r = await api("showcase", {
      action: "list",
      ...(before ? { before } : {}),
    });
    const rows = r.videos as Video[];
    setVideos((old) => (before ? [...old, ...rows] : rows));
    return rows;
  }
  useEffect(() => {
    void load().catch(() =>
      setMessage("Chưa tải được thư viện. Bấm Tải lại danh sách để thử lại."),
    );
  }, []);
  function select(v: Video | null) {
    setSelected(v);
    setFiles([]);
    setTitle(v?.title ?? "");
    setDescription(v?.description ?? "");
    setVisibility(v?.visibility ?? "hidden");
    setRights(v?.rights_confirmed ?? false);
    setMessage("");
    setUploadName("");
  }
  async function run(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await work();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Chưa thực hiện được.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save() {
    if (visibility === "public" && !rights)
      throw Error("Cần xác nhận quyền sử dụng trước khi công khai.");
    if (selected) {
      const r = await api("showcase", {
        action: "save",
        id: selected.id,
        version: selected.version,
        title,
        description,
        visibility,
        rights_confirmed: rights,
      });
      await load();
      select(r.video as Video);
      setMessage("Đã lưu video.");
      return;
    }
    if (!files.length) throw Error("Hãy chọn video MP4 hoặc WebM.");
    for (const [index, file] of files.entries()) {
      const mime =
        file.type || (/\.webm$/i.test(file.name) ? "video/webm" : "video/mp4");
      if (
        file.size > 20971520 ||
        file.size < 12 ||
        !videoHeaderValid(
          new Uint8Array(await file.slice(0, 12).arrayBuffer()),
          mime,
        )
      )
        throw Error("Mỗi video phải là MP4/WebM hợp lệ, tối đa 20 MB.");
      setUploadName(`${index + 1}/${files.length} · ${file.name}`);
      setProgress(0);
      const r = await api("showcase", {
        action: "reserve",
        request_id: crypto.randomUUID(),
        mime,
        size: file.size,
      });
      try {
        await uploadVideo(String(r.upload_url), file, setProgress);
        await api("showcase", {
          action: "save",
          id: r.id,
          version: 1,
          title:
            files.length > 1 ? `${title} · ${index + 1}`.slice(0, 160) : title,
          description,
          visibility,
          rights_confirmed: rights,
        });
      } catch (e) {
        await load();
        throw e;
      }
    }
    await load();
    setFiles([]);
    setMessage(
      `Đã đăng ${files.length} video${visibility === "public" ? " công khai" : " ở trạng thái ẩn"}.`,
    );
  }
  return (
    <section id="quan-ly-thu-vien" aria-label="Quản lý thư viện video">
      <h2>Quản lý thư viện video</h2>
      <p>
        Video giới thiệu do bạn biên tập, tách riêng video của khách trong đơn
        hàng.
      </p>
      <button
        type="button"
        className="button secondary"
        disabled={busy}
        onClick={() => select(null)}
      >
        Thêm video mới
      </button>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          void run(save);
        }}
      >
        <fieldset disabled={busy}>
          <h3>{selected ? "Chỉnh sửa video" : "Đăng video"}</h3>
          {!selected && (
            <label>
              Chọn video MP4/WebM (mỗi tệp tối đa 20 MB)
              <input
                type="file"
                accept="video/mp4,video/webm,.mp4,.webm"
                multiple
                onChange={(e) => {
                  setFiles(Array.from(e.target.files ?? []));
                  setRights(false);
                  e.target.value = "";
                  setMessage("");
                }}
              />
            </label>
          )}
          {files.length > 0 && <p>{files.map((f) => f.name).join(", ")}</p>}
          <label>
            Tiêu đề
            <input
              required
              maxLength={160}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setRights(false);
              }}
            />
          </label>
          <label>
            Mô tả
            <textarea
              rows={5}
              maxLength={20000}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setRights(false);
              }}
            />
          </label>
          <label>
            Hiển thị
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "hidden" | "public")
              }
            >
              <option value="hidden">Ẩn</option>
              <option value="public">Công khai</option>
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={rights}
              onChange={(e) => setRights(e.target.checked)}
            />
            Tôi có quyền sử dụng video và nội dung này; không chứa hình ảnh,
            thông tin hoặc câu chuyện riêng của khách hàng.
          </label>
          <button className="button" disabled={busy}>
            {selected ? "Lưu chỉnh sửa" : "Đăng video"}
          </button>
        </fieldset>
        {uploadName && (
          <div>
            <p>
              {uploadName} · {progress}%
              {progress === 100 ? " · Đã tải tệp, đang xác minh/lưu" : ""}
            </p>
            <progress
              aria-label="Tiến độ tải video thư viện"
              max={100}
              value={progress}
            />
          </div>
        )}
      </form>
      <p role="status">{message}</p>
      <div className="panel">
        <h3>Video đã tải lên</h3>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await load();
            })
          }
        >
          Tải lại danh sách video
        </button>
        {!videos.length && <p>Chưa có video.</p>}
        {videos.map((v) => (
          <article key={v.id}>
            <button disabled={busy} onClick={() => select(v)}>
              {v.title || "Video chưa hoàn tất"}
            </button>
            <p>
              {v.visibility === "public" ? "Công khai" : "Ẩn"} ·{" "}
              {new Date(v.created_at).toLocaleDateString("vi-VN")}
            </p>
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const r = await api("showcase", {
                    action: "hide",
                    id: v.id,
                    version: v.version,
                  });
                  await load();
                  if (selected?.id === v.id) select(r.video as Video);
                  setMessage("Đã ẩn video.");
                })
              }
            >
              Ẩn video
            </button>
            <button
              disabled={busy}
              onClick={() => {
                if (!window.confirm("Xóa video này khỏi thư viện?")) return;
                void run(async () => {
                  await api("showcase", {
                    action: "delete",
                    id: v.id,
                    version: v.version,
                  });
                  await load();
                  if (selected?.id === v.id) select(null);
                  setMessage("Đã xóa video khỏi thư viện.");
                });
              }}
            >
              Xóa video
            </button>
          </article>
        ))}
        {videos.length >= 50 && (
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await load(videos.at(-1)!.created_at);
              })
            }
          >
            Xem thêm video
          </button>
        )}
      </div>
    </section>
  );
}
