import { useState } from "react";
import { api } from "../../lib/auth";
type Asset = {
  id: string;
  mime: string;
  checksum: string;
  asset_version: number;
};
const scopes = [
  ["website_public_gallery", "Thư viện website"],
  ["youtube_publication", "YouTube"],
  ["tiktok_publication", "TikTok"],
] as const;
export function ConsentPanel({ csrf }: { csrf: string }) {
  const [assets, setAssets] = useState<Asset[]>([]),
    [selected, setSelected] = useState<Asset | null>(null),
    [url, setUrl] = useState(""),
    [message, setMessage] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  async function run(path: string, body: unknown) {
    try {
      const r = await api("consents/" + path, body, csrf);
      setMessage(String(r.message ?? ""));
      return r;
    } catch (e) {
      setMessage((e as Error).message);
      return null;
    }
  }
  return (
    <details>
      <summary>Quản lý quyền dùng ảnh và công khai</summary>
      <p>
        Các quyền độc lập, mặc định tắt. Giá và giao riêng không đổi nếu bạn từ
        chối. Dưới 18 tuổi không cấp quyền dùng ảnh nhận diện hoặc công khai
        video cá nhân.
      </p>
      <button
        className="button secondary"
        onClick={() => void run("photo-permission", { granted: true })}
      >
        Cho phép dùng ảnh để dựng riêng
      </button>
      <button
        className="button secondary"
        onClick={() => void run("photo-permission", { granted: false })}
      >
        Thu hồi quyền dùng ảnh
      </button>
      <button
        className="button secondary"
        onClick={() =>
          void run("assets", {}).then((r) => {
            if (r) setAssets(r.assets as Asset[]);
          })
        }
      >
        Xem các bản cuối có thể cấp quyền
      </button>
      {assets.map((a) => (
        <button
          className="button secondary"
          key={a.id}
          onClick={() =>
            void run("preview", { asset_id: a.id }).then((r) => {
              if (r) {
                setSelected(a);
                setConfirmed(false);
                setUrl(String(r.url));
              }
            })
          }
        >
          Xem bản {a.asset_version} · {a.mime}
        </button>
      ))}
      {selected && (
        <>
          <p className="small-note">
            Bản {selected.asset_version} · mã tệp{" "}
            {selected.checksum.slice(0, 12)} · liên kết preview hết hạn sau 60
            giây.
          </p>
          {selected.mime.startsWith("video/") ? (
            <video src={url} controls playsInline />
          ) : (
            <img
              src={url}
              alt="Bản cuối riêng của bạn để xét quyền công khai"
              width="400"
            />
          )}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Tôi đã xem bản cuối này và hiểu bản công khai không chứa dữ liệu
            nhận diện ngoài phạm vi tôi chấp thuận.
          </label>
          {scopes.map(([scope, label]) => (
            <div key={scope}>
              <button
                className="button secondary"
                disabled={!confirmed}
                onClick={() =>
                  void run("change", {
                    asset_id: selected.id,
                    asset_hash: selected.checksum,
                    asset_version: selected.asset_version,
                    scope,
                    granted: true,
                  })
                }
              >
                Cho phép {label}
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  void run("change", {
                    asset_id: selected.id,
                    asset_hash: selected.checksum,
                    asset_version: selected.asset_version,
                    scope,
                    granted: false,
                  })
                }
              >
                Thu hồi {label}
              </button>
            </div>
          ))}
        </>
      )}
      <p>
        Thu hồi sẽ gỡ bản website và đưa việc gỡ bản nền tảng ngoài vào hàng đợi
        thủ công. Không thể bảo đảm xóa bản người khác đã tải.
      </p>
      <p role="status">{message}</p>
    </details>
  );
}
