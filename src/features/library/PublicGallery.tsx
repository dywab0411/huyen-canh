import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PublicPost } from "./model";
type Review = { id: string; rating: number; body: string; nickname: string };
export function PublicGallery() {
  const [posts, setPosts] = useState<PublicPost[]>([]),
    [reviews, setReviews] = useState<Review[]>([]),
    [category, setCategory] = useState("Tất cả"),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all(
      ["/api/library", "/api/showcase"].map((url) =>
        fetch(url, { signal: controller.signal, cache: "no-store" }).then(
          (r) => (r.ok ? r.json() : { posts: [] }),
        ),
      ),
    )
      .then((results) => setPosts(results.flatMap((r) => r.posts ?? [])))
      .catch(() => {});
    void fetch("/api/public", { signal: controller.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((r) => setReviews(r.reviews ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [retry]);
  const categories = ["Tất cả", ...new Set(posts.map((p) => p.category))];
  return (
    <>
      <section className="library-intro">
        <div>
          <p className="eyebrow">MỘT CÂU CHUYỆN, MỘT GÓC NHÌN</p>
          <h2>Để lời gửi bước vào một thước phim</h2>
          <p>
            Sắc trời, nét vẽ và những dòng tâm tình gặp nhau trong những câu
            chuyện hoạt hình. Dành một khoảng lặng để xem, lắng nghe và mang
            theo điều khiến bạn thấy gần gũi.
          </p>
          <Link className="button secondary" to="/video-mau">
            Xem Hồ sen đón bình minh <span aria-hidden="true">▷</span>
          </Link>
        </div>
        <div className="library-illustration" aria-hidden="true">
          <span>✧</span>
          <div>☾</div>
          <span>✦</span>
          <p>MỘT MIỀN TĨNH LẶNG</p>
        </div>
      </section>
      {posts.length > 0 && (
        <section aria-label="Video trong thư viện">
          <div className="section-heading">
            <h2>Những thước phim và lời gửi</h2>
            <label>
              Danh mục thư viện
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="library-grid">
            {posts
              .filter((p) => category === "Tất cả" || p.category === category)
              .map((p) => (
                <article className="panel library-card" key={p.id}>
                  <video
                    controls
                    playsInline
                    preload="none"
                    poster={p.cover_url || undefined}
                    src={p.video_url}
                    aria-label={p.title}
                    onError={(e) => {
                      e.currentTarget.dataset.retry = "true";
                    }}
                  />
                  <div>
                    <p className="eyebrow">{p.category}</p>
                    <h3>{p.title}</h3>
                    <time dateTime={p.published_at}>
                      {new Date(p.published_at).toLocaleDateString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </time>
                    <details>
                      <summary>Đọc lời gửi</summary>
                      <p className="library-body">{p.body}</p>
                    </details>
                    <button
                      className="text-link"
                      onClick={() => setRetry((n) => n + 1)}
                    >
                      Tải lại video
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      )}
      {reviews.length > 0 && (
        <section className="section" aria-label="Đánh giá được chia sẻ">
          <h2>Những lời gửi lại</h2>
          <div className="three">
            {reviews.map((r) => (
              <article className="panel" key={r.id}>
                <h3>{r.nickname}</h3>
                <p aria-label={r.rating + " trên 5 sao"}>
                  {"★".repeat(r.rating)}
                </p>
                <p>{r.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
