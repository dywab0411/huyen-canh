import { useState } from "react";
import { api } from "../../lib/auth";
type Review = { id: string; rating: number; body: string; nickname: string };
export function Moderation() {
  const [reviews, setReviews] = useState<Review[]>([]),
    [message, setMessage] = useState("");
  async function load() {
    try {
      const r = await api("admin/reviews", {});
      setReviews(r.reviews as Review[]);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function moderate(id: string, approve: boolean) {
    try {
      const r = await api("admin/moderate-review", { review_id: id, approve });
      setMessage(String(r.message));
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <details>
      <summary>Đánh giá chờ duyệt</summary>
      <button className="button secondary" onClick={() => void load()}>
        Tải nhận xét chờ duyệt
      </button>
      {reviews.map((r) => (
        <article key={r.id}>
          <h3>
            {r.nickname} · {r.rating}/5
          </h3>
          <p>{r.body}</p>
          <button
            className="button secondary"
            onClick={() => void moderate(r.id, true)}
          >
            Duyệt sau kiểm tra PII
          </button>
          <button
            className="button secondary"
            onClick={() => void moderate(r.id, false)}
          >
            Từ chối
          </button>
        </article>
      ))}
      <p role="status">{message}</p>
    </details>
  );
}
