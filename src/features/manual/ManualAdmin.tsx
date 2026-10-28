import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShowcaseAdmin } from "./ShowcaseAdmin";
import { uploadPrivateVideo } from "../../lib/video-upload";
import { api, auth } from "../../lib/auth";
type Order = {
  id: string;
  access_code: string;
  body: string;
  video_key: string | null;
  published: boolean;
  version: number;
  created_at: string;
};
export function ManualAdmin() {
  const [orders, setOrders] = useState<Order[]>([]),
    [selected, setSelected] = useState<Order | null>(null),
    [body, setBody] = useState(""),
    [video, setVideo] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [deleteConfirmed, setDeleteConfirmed] = useState(false),
    [progress, setProgress] = useState<number | null>(null),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState("");
  const working = useRef(false),
    createKey = useRef(crypto.randomUUID());
  const navigate = useNavigate();
  async function load(before?: string) {
    const r = await api("delivery", {
      action: "list",
      ...(before ? { before } : {}),
    });
    const rows = r.orders as Order[];
    setOrders((old) => (before ? [...old, ...rows] : rows));
    setReady(true);
    return rows;
  }
  useEffect(() => {
    void load().catch(() =>
      setMessage(
        "Chưa mở được trang quản trị. Vui lòng đăng nhập lại hoặc thử sau.",
      ),
    );
  }, []);
  function select(order: Order) {
    setDeleteConfirmed(false);
    setSelected(order);
    setProgress(null);
    setBody(order.body);
    setVideo(order.video_key);
    setMessage("");
  }
  async function run(work: () => Promise<void>) {
    if (working.current) return;
    working.current = true;
    setDeleteConfirmed(false);
    setBusy(true);
    setMessage("");
    try {
      await work();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  function update(order: Order) {
    setDeleteConfirmed(false);
    setSelected(order);
    setOrders((old) => [order, ...old.filter((o) => o.id !== order.id)]);
    setBody(order.body);
    setVideo(order.video_key);
  }
  return (
    <section className="section narrow">
      <h1>Quản trị Huyền Cảnh</h1>
      <nav aria-label="Khu vực quản trị">
        <a href="#quan-ly-don">Quản lý đơn hàng</a> ·{" "}
        <a href="#quan-ly-thu-vien">Quản lý thư viện video</a>
      </nav>
      <h2 id="quan-ly-don">Quản lý đơn hàng</h2>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() =>
          void auth?.auth.signOut().then(() => navigate("/tai-khoan"))
        }
      >
        Đăng xuất
      </button>
      {!ready ? (
        <p>
          <Link to="/tai-khoan">Đăng nhập quản trị</Link>
        </p>
      ) : (
        <>
          <p>
            Tạo mã mới hoặc nhấn vào một đơn bên dưới để mở phần nhập chữ và tải
            video riêng tư.
          </p>
          <div className="panel">
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const r = await api("delivery", {
                    action: "create",
                    request_id: createKey.current,
                  });
                  update(r.order as Order);
                  createKey.current = crypto.randomUUID();
                })
              }
            >
              Tạo mã đơn hàng tự động
            </button>
          </div>
          {selected && (
            <form
              className="panel"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  const r = await api("delivery", {
                    action: "save",
                    id: selected.id,
                    version: selected.version,
                    body,
                    video_key: video,
                  });
                  update(r.order as Order);
                  setMessage(
                    "Đã lưu đơn hàng. Khách có thể tra cứu bằng mã này.",
                  );
                });
              }}
            >
              <label>
                Mã đơn hàng
                <input value={selected.access_code} readOnly />
              </label>
              <label>
                Nội dung bài xem bói
                <textarea
                  value={body}
                  maxLength={50000}
                  rows={14}
                  disabled={busy}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
              <label>
                Video MP4 (tối đa 20 MB)
                <input
                  type="file"
                  accept="video/mp4,.mp4"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    void run(async () => {
                      if (file.size > 20971520 || file.size < 12)
                        throw Error("Video cần nhỏ hơn 20 MB.");
                      const head = new Uint8Array(
                        await file.slice(0, 12).arrayBuffer(),
                      );
                      if (String.fromCharCode(...head.slice(4, 8)) !== "ftyp")
                        throw Error("Hãy chọn video MP4 hợp lệ.");
                      if (!auth) throw Error("Vui lòng đăng nhập lại.");
                      const r = await api("delivery", {
                        action: "upload",
                        id: selected.id,
                        size: file.size,
                        mime: "video/mp4",
                      });
                      setProgress(0);
                      await uploadPrivateVideo(
                        "manual-results",
                        String(r.key),
                        String(r.token),
                        file,
                        setProgress,
                      );
                      setVideo(String(r.key));
                      setMessage("Đã tải video. Bấm Lưu đơn hàng để cập nhật.");
                    });
                  }}
                />
              </label>
              {progress !== null && (
                <div>
                  <p>Tải video: {progress}%</p>
                  <progress
                    aria-label="Tiến độ tải video đơn hàng"
                    max={100}
                    value={progress}
                  />
                </div>
              )}
              {video && (
                <p>
                  Đã có video cho đơn này.{" "}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setVideo(null)}
                  >
                    Bỏ video khỏi đơn
                  </button>
                </p>
              )}
              <button className="button" disabled={busy}>
                Lưu đơn hàng
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => setDeleteConfirmed(true)}
              >
                Xóa đơn hàng
              </button>
              {deleteConfirmed && (
                <div role="group" aria-label="Xác nhận xóa đơn">
                  <p>Xóa đơn này khỏi danh sách và ngừng tra cứu?</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await api("delivery", {
                          action: "delete",
                          id: selected.id,
                          version: selected.version,
                        });
                        setOrders((old) =>
                          old.filter((o) => o.id !== selected.id),
                        );
                        setSelected(null);
                        setBody("");
                        setVideo(null);
                        setProgress(null);
                        setMessage(
                          "Đã xóa đơn khỏi danh sách và ngừng tra cứu.",
                        );
                      })
                    }
                  >
                    Xác nhận xóa đơn
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setDeleteConfirmed(false)}
                  >
                    Hủy xóa đơn
                  </button>
                </div>
              )}
            </form>
          )}
          <div className="panel">
            <h2>Đơn hàng đã tạo</h2>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const rows = await load();
                  if (selected) {
                    const current = rows.find((o) => o.id === selected.id);
                    if (current) select(current);
                    else setSelected(null);
                  }
                })
              }
            >
              Tải lại danh sách
            </button>
            {!orders.length && <p>Chưa có đơn hàng.</p>}
            {orders.map((o) => (
              <article key={o.id}>
                <button disabled={busy} onClick={() => select(o)}>
                  {o.access_code}
                </button>
                <p>
                  {o.published ? "Đã lưu" : "Bản nháp"} ·{" "}
                  {new Date(o.created_at).toLocaleDateString("vi-VN")}
                </p>
              </article>
            ))}
            {orders.length >= 50 && (
              <button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await load(orders.at(-1)!.created_at);
                  })
                }
              >
                Xem thêm
              </button>
            )}
          </div>
        </>
      )}
      <p role="status" aria-label="Trạng thái đơn hàng">
        {message}
      </p>
      {ready && <ShowcaseAdmin />}
    </section>
  );
}
