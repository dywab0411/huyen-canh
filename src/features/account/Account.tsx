import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { auth, login } from "../../lib/auth";
import { SavedSnapshot } from "./SavedSnapshot";
import { Mfa } from "./Mfa";
export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((s) => !/[<>]/u.test(s)),
  age_band: z.enum(["16-17", "18+"]),
});
type Item = { id: string; snapshot: unknown };
export function Account() {
  const [message, setMessage] = useState(""),
    [items, setItems] = useState<Item[]>([]),
    [user, setUser] = useState<string | null>(null),
    [name, setName] = useState(""),
    [age, setAge] = useState<"16-17" | "18+">("18+"),
    [busy, setBusy] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    if (!auth) return;
    const db = auth;
    let active = true;
    const load = async () => {
      const epoch = ++generation.current;
      setUser(null);
      setItems([]);
      setName("");
      setAge("18+");
      const { data, error } = await db.auth.getUser();
      if (!active || epoch !== generation.current) return;
      if (error || !data.user) return;
      const id = data.user.id;
      const [profile, history] = await Promise.all([
        db
          .from("profiles")
          .select("display_name,age_band")
          .eq("user_id", id)
          .maybeSingle(),
        db
          .from("reading_history")
          .select("id,snapshot")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (!active || epoch !== generation.current) return;
      setUser(id);
      if (profile.error || history.error)
        setMessage("Chưa tải được đầy đủ dữ liệu tài khoản.");
      setName(profile.data?.display_name ?? "");
      setAge(profile.data?.age_band === "16-17" ? "16-17" : "18+");
      setItems(history.data ?? []);
    };
    void load();
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(() => {
      generation.current++;
      setUser(null);
      setItems([]);
      setName("");
      setAge("18+");
      setTimeout(() => {
        if (active) void load();
      }, 0);
    });
    return () => {
      active = false;
      generation.current++;
      subscription.unsubscribe();
    };
  }, []);
  async function verified() {
    if (!auth) throw Error("Chưa cấu hình tài khoản.");
    const { data, error } = await auth.auth.getUser();
    if (error || !data.user || data.user.id !== user)
      throw Error("Phiên tài khoản đã thay đổi. Vui lòng tải lại.");
    return data.user.id;
  }
  return (
    <section className="section narrow">
      <p className="eyebrow">KHOẢNG RIÊNG CỦA BẠN</p>
      <h1>Tài khoản & lịch sử</h1>
      <Mfa />
      <p>
        Chỉ lưu bài khi bạn chủ động chọn. Mở bản lưu giữ nguyên nội dung và
        phiên bản lúc lưu.
      </p>
      <button
        className="button"
        onClick={() => void login().catch((e) => setMessage(e.message))}
      >
        Đăng nhập bằng Google
      </button>
      <button
        className="button secondary"
        disabled={!auth}
        onClick={() => {
          generation.current++;
          setItems([]);
          setUser(null);
          setName("");
          void auth?.auth
            .signOut()
            .then(({ error }) =>
              setMessage(error ? "Chưa đăng xuất được." : "Đã đăng xuất."),
            );
        }}
      >
        Đăng xuất
      </button>
      {!auth && (
        <p className="notice">
          Đăng nhập hiện tạm chưa khả dụng. Bạn vẫn có thể khám phá các công cụ
          miễn phí mà không cần tài khoản.
        </p>
      )}
      {user && (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const epoch = generation.current;
            try {
              const profile = profileSchema.parse({
                display_name: name,
                age_band: age,
              });
              const id = await verified();
              const { error } = await auth!.from("profiles").upsert(
                {
                  user_id: id,
                  ...profile,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
              );
              if (error) throw Error("Chưa lưu được hồ sơ.");
              if (epoch === generation.current)
                setMessage("Đã lưu hồ sơ của bạn.");
            } catch (e) {
              if (epoch === generation.current)
                setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Hồ sơ của bạn</h2>
          <label>
            Tên hiển thị
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label>
            Nhóm tuổi
            <select
              value={age}
              onChange={(e) => setAge(e.target.value as typeof age)}
            >
              <option value="16-17">16–17 tuổi</option>
              <option value="18+">Từ 18 tuổi</option>
            </select>
          </label>
          <button className="button" disabled={busy}>
            Lưu hồ sơ
          </button>
        </form>
      )}
      <p role="status">{message}</p>
      {!items.length && (
        <p>Chưa có bài đọc đã lưu trong phiên tài khoản này.</p>
      )}
      {items.map((item) => {
        return (
          <article className="panel" key={item.id}>
            <SavedSnapshot snapshot={item.snapshot} />
            <button
              disabled={busy}
              onClick={async () => {
                const epoch = generation.current;
                setBusy(true);
                try {
                  const id = await verified();
                  const { error } = await auth!
                    .from("reading_history")
                    .delete()
                    .eq("id", item.id)
                    .eq("user_id", id);
                  if (error) throw Error("Chưa xóa được.");
                  if (epoch === generation.current)
                    setItems((list) => list.filter((x) => x.id !== item.id));
                } catch (e) {
                  if (epoch === generation.current)
                    setMessage((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Xóa bản lưu
            </button>
          </article>
        );
      })}
    </section>
  );
}
