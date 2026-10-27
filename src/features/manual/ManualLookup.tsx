import { useRef, useState } from "react";
import { api } from "../../lib/auth";
export function ManualLookup() {
  const [code, setCode] = useState(""),
    [result, setResult] = useState<{
      body: string;
      video_url: string | null;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const sequence = useRef(0);
  async function lookup() {
    if (busy) return;
    const epoch = ++sequence.current;
    setBusy(true);
    setResult(null);
    setMessage("");
    try {
      const r = await api("delivery", { action: "lookup", code: code.trim() });
      if (epoch !== sequence.current) return;
      setResult(r as unknown as { body: string; video_url: string | null });
    } catch {
      if (epoch !== sequence.current) return;
      setMessage(
        "Mã chưa đúng hoặc kết quả chưa sẵn sàng. Vui lòng thử lại sau.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section narrow">
      <h1>Tra cứu kết quả</h1>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup();
        }}
      >
        <label>
          Mã đơn hàng
          <input
            autoComplete="off"
            spellCheck={false}
            required
            maxLength={80}
            value={code}
            onChange={(e) => {
              sequence.current++;
              setCode(e.target.value);
              setResult(null);
              setMessage("");
            }}
          />
        </label>
        <button className="button" disabled={busy}>
          Xem kết quả
        </button>
      </form>
      <p role="status">{message}</p>
      {result && (
        <article className="panel">
          <h2>Kết quả dành cho bạn</h2>
          <div className="manual-reading">{result.body}</div>
          {result.video_url && (
            <>
              <video
                controls
                playsInline
                preload="metadata"
                src={result.video_url}
                aria-label="Video kết quả"
                onError={() =>
                  setMessage(
                    "Video đã hết phiên xem hoặc chưa tải được. Bấm Xem kết quả để mở lại.",
                  )
                }
              />
              <p>Giữ riêng mã đơn để bảo vệ nội dung của bạn.</p>
            </>
          )}
        </article>
      )}
    </section>
  );
}
