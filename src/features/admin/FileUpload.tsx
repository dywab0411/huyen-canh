import { useState } from "react";
import { api, auth } from "../../lib/auth";
import { filePolicy } from "../../file-policy";
export function FileUpload({
  orderId,
  onMutation,
}: {
  orderId: string;
  onMutation?: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null),
    [classification, setClassification] = useState("private_result"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function upload() {
    if (!file || !auth) return;
    setBusy(true);
    try {
      filePolicy(file.name, file.type, file.size);
      setMessage("Đang xin vị trí quarantine…");
      const reserved = await api("admin/upload-reserve", {
        order_id: orderId,
        filename: file.name,
        mime: file.type,
        size: file.size,
        classification,
      });
      setMessage("Đang tải vào kho riêng…");
      const { error } = await auth.storage
        .from(String(reserved.bucket))
        .uploadToSignedUrl(
          String(reserved.path),
          String(reserved.token),
          file,
          { contentType: file.type },
        );
      if (error) throw error;
      const done = await api("admin/upload-finish", {
        attachment_id: reserved.id,
      });
      setMessage(String(done.message) + " ID: " + String(reserved.id));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      await onMutation?.();
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Tệp riêng & quarantine</summary>
      <p>
        Tối đa 30 MB/đơn; ảnh 5 MB, MP4 20 MB, PDF/MP3 10 MB, TXT 1 MB. Không
        chấp nhận SVG/HTML/ZIP/executable. Tệp tải lên chưa được giao hoặc công
        khai.
      </p>
      <label>
        Phân loại
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
        >
          <option value="private_result">Kết quả giao riêng</option>
          <option value="public_derivative">
            Bản riêng để xem trước công khai
          </option>
          <option value="source">Ảnh nguồn (cần quyền dùng ảnh 18+)</option>
        </select>
      </label>
      <label>
        Chọn tệp
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mp3,.txt"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button
        className="button secondary"
        disabled={!file || busy}
        onClick={() => void upload()}
      >
        {busy ? "Đang tải…" : "Tải vào quarantine"}
      </button>
      <p role="status">{message}</p>
      <p className="small-note">
        Sau tải, operator chạy scripts/validate_attachment.py để
        decode/re-encode và bỏ metadata. PDF cần scanner đã cấu hình. Không có
        nút bỏ qua kiểm định.
      </p>
    </details>
  );
}
