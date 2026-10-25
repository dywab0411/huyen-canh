export const engineVersion = "1.1.0";
export const datasetVersion = "2026.10.25-v2";
export const notice =
  "Nội dung mô phỏng dành cho giải trí và tự suy ngẫm; không phải dự báo chính xác hay tư vấn y tế, pháp lý, tài chính.";
export const tools = [
  ["ngay-sinh", "Tử vi ngày sinh", "Vòng sáng bản mệnh", "◉", "name,date"],
  ["gio-sinh", "Tử vi giờ sinh", "Nhịp thời thần", "◷", "name,date,hour"],
  [
    "hop-tuoi",
    "Hợp tuổi hai người",
    "Dải lụa tương giao",
    "∞",
    "name,date,name2,date2",
  ],
  ["tinh-duyen", "Tình duyên theo tên", "Một đóa sen chung", "❀", "name,name2"],
  ["than-so-hoc", "Thần số học", "Những con số kể chuyện", "⑨", "name,date"],
  ["chi-tay", "Chỉ tay mô phỏng", "Nét tay, nhịp sống", "✧", "hand"],
  ["nhan-tuong", "Nhân tướng mô phỏng", "Gương soi dịu dàng", "◡", "face"],
  [
    "phu-the",
    "Tướng phu thê mô phỏng",
    "Hai nhịp cùng bước",
    "☯",
    "trait,trait2",
  ],
  ["giac-mo", "Giải mã giấc mơ", "Mở trang sương mỏng", "☾", "dream"],
  ["phong-thuy", "Phong thủy tuổi/mệnh", "Góc nhỏ an nhiên", "⌂", "date,space"],
  [
    "cong-danh",
    "Công danh, tài lộc",
    "Gieo mầm ngày mai",
    "♧",
    "name,date,topic",
  ],
  ["ten-may-man", "Tên, số may mắn", "Một tín hiệu nho nhỏ", "✺", "name,date"],
] as const;
export type ToolId = (typeof tools)[number][0];
export type Input = Record<string, string>;
export const normalize = (s: string) =>
  s.normalize("NFC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("vi");
export const transliterate = (s: string) =>
  normalize(s).normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
export function phone(s: string) {
  const value = s.replace(/[\s().-]/g, "").replace(/^0/, "+84");
  if (!/^\+84[35789]\d{8}$/.test(value))
    throw Error("Số điện thoại Việt Nam chưa hợp lệ.");
  return value;
}
export function validDate(value: string, asOf: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value ||
    value > asOf ||
    value < "1900-01-01"
  )
    throw Error("Nhập ngày thật từ năm 1900, không ở tương lai.");
  return value;
}
export function canonicalize(id: ToolId, input: Input, asOf: string): Input {
  const tool = tools.find((t) => t[0] === id)!;
  const out: Input = {};
  for (const key of tool[4].split(",")) {
    const value = normalize(input[key] ?? "");
    if (!value) throw Error("Vui lòng điền đầy đủ thông tin.");
    if (key.startsWith("date")) validDate(value, asOf);
    if (
      key.startsWith("name") &&
      (!/^[\p{L} ]{3,100}$/u.test(value) || !value.includes(" "))
    )
      throw Error("Vui lòng nhập họ tên thật, gồm họ và tên.");
    if (key === "dream" && value.length > 2000)
      throw Error("Giấc mơ tối đa 2.000 ký tự.");
    if (
      key === "hour" &&
      value !== "không rõ" &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    )
      throw Error("Giờ sinh chưa hợp lệ.");
    if (value.length > 2000) throw Error("Nội dung quá dài.");
    out[key] = value;
  }
  if (id === "hop-tuoi" || id === "tinh-duyen") {
    const pair = [
      { name: out.name, date: out.date ?? "" },
      { name: out.name2, date: out.date2 ?? "" },
    ].sort((a, b) =>
      JSON.stringify(a) < JSON.stringify(b)
        ? -1
        : JSON.stringify(a) > JSON.stringify(b)
          ? 1
          : 0,
    );
    return {
      name: pair[0].name,
      ...(out.date ? { date: pair[0].date } : {}),
      name2: pair[1].name,
      ...(out.date ? { date2: pair[1].date } : {}),
    };
  }
  if (id === "phu-the") {
    const pair = [out.trait, out.trait2].sort();
    return { trait: pair[0], trait2: pair[1] };
  }
  return out;
}
export async function sha256(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
export function lifePath(date: string) {
  let n = [...date.replace(/-/g, "")].reduce((a, x) => a + Number(x), 0);
  while (n > 9 && ![11, 22, 33].includes(n))
    n = [...String(n)].reduce((a, x) => a + Number(x), 0);
  return n;
}
import { reflectionPrompts } from "../content/reflections";
import { corpus } from "../content/corpus";
import type { Dataset } from "../content/dataset";
export async function reading(
  id: ToolId,
  input: Input,
  asOf: string,
  dataset?: Dataset,
) {
  const canonicalInput = canonicalize(id, input, asOf);
  const version = dataset?.version ?? datasetVersion;
  const hash = await sha256(
    JSON.stringify({
      toolId: id,
      engineVersion,
      datasetVersion: version,
      canonicalInput,
    }),
  );
  const seed = parseInt(hash.slice(0, 8), 16);
  const entry = corpus[id];
  const custom = dataset?.content[id];
  const prompt = reflectionPrompts[id][seed % 4];
  const reflection = `${prompt}. Đây là một đề bài tự quan sát được chọn từ dữ liệu đầu vào đã chuẩn hóa, không phải thông tin mà ngày sinh, tên hay đường tay chứng minh về bạn. Hãy ghi lại một tình huống thực sự xảy ra trong tuần vừa rồi liên quan đến đề bài này. Tách điều bạn trực tiếp quan sát được khỏi suy đoán về nguyên nhân. Nếu đề bài không phù hợp hoàn cảnh, bạn có thể bỏ qua hoặc thay bằng câu hỏi của riêng mình. Chọn một hành động nhỏ có thời điểm và giới hạn rõ ràng, rồi sau vài ngày xem nó có giúp ích không. Việc thử và điều chỉnh dựa trên trải nghiệm thực tế đáng tin hơn việc cố khớp cuộc sống vào một lời luận giải.`;
  const sections = custom
    ? custom.sections.map((body, index) => ({
        title: index === 0 ? custom.title : "Lời gửi " + (index + 1),
        body,
      }))
    : [
        { title: entry.title, body: entry.intro },
        { title: "Điều bạn có thể nuôi dưỡng", body: entry.strength },
        { title: "Khoảng lặng để lắng nghe", body: entry.pause },
        {
          title: "Một thực hành cho tuần tới",
          body: entry.practice + "\n\n" + reflection,
        },
      ];
  return {
    toolId: id,
    canonicalInput,
    engineVersion,
    datasetVersion: version,
    score: seed % 101,
    sections,
    symbol: entry.symbols[seed % entry.symbols.length],
    ...(id === "than-so-hoc"
      ? { lifePath: lifePath(canonicalInput.date) }
      : {}),
    entertainmentNotice: notice,
  };
}
export type Reading = Awaited<ReturnType<typeof reading>>;
