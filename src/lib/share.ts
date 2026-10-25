import type { Reading } from "../engine";
export async function shareLink(id: string) {
  const url = location.origin + "/boi/" + id;
  const text = "Một khoảng lặng cùng Huyền Cảnh · Nội dung giải trí";
  if (navigator.share) {
    try {
      await navigator.share({ title: "Huyền Cảnh", text, url });
      return "Đã mở bảng chia sẻ.";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError")
        return "Đã hủy chia sẻ.";
    }
  }
  await navigator.clipboard.writeText(text + " " + url);
  return "Đã chép liên kết công cụ, không kèm dữ liệu riêng.";
}
export async function saveImage(r: Reading, showPrivate: boolean) {
  try {
    await Promise.all([
      document.fonts.load('58px "Noto Serif", Arial'),
      document.fonts.load('28px "Be Vietnam Pro", Arial'),
    ]);
  } catch {
    /* Offline: use system fonts with Vietnamese glyphs. */
  }
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#faf7f2";
  c.fillRect(0, 0, 1080, 1080);
  c.fillStyle = "#2d2440";
  c.font = '58px "Noto Serif", Arial';
  c.fillText("Huyền Cảnh", 80, 120);
  c.font = '32px "Be Vietnam Pro", Arial';
  c.fillText(r.sections[0].title, 80, 220);
  c.fillText("Điểm biểu tượng: " + r.score + "/100 · " + r.symbol, 80, 300);
  if (showPrivate) {
    c.font = '24px "Be Vietnam Pro", Arial';
    c.fillText(
      Object.values(r.canonicalInput).join(" · ").slice(0, 65),
      80,
      365,
    );
  }
  const words = r.sections[0].body.split(" ");
  let line = "",
    y = 440;
  c.font = '28px "Be Vietnam Pro", Arial';
  for (const word of words) {
    if (c.measureText(line + word).width > 910) {
      c.fillText(line, 80, y);
      y += 44;
      line = "";
    }
    line += word + " ";
    if (y > 890) break;
  }
  c.fillText(line, 80, y);
  c.font = '22px "Be Vietnam Pro", Arial';
  c.fillText("Mô phỏng để giải trí · Không phải dự báo tương lai", 80, 1000);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw Error("Không thể tạo ảnh.");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "huyen-canh.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
