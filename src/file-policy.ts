export const fileTypes: Record<string, { mime: string; max: number }> = {
  jpg: { mime: "image/jpeg", max: 5 * 1024 ** 2 },
  jpeg: { mime: "image/jpeg", max: 5 * 1024 ** 2 },
  png: { mime: "image/png", max: 5 * 1024 ** 2 },
  webp: { mime: "image/webp", max: 5 * 1024 ** 2 },
  pdf: { mime: "application/pdf", max: 10 * 1024 ** 2 },
  mp4: { mime: "video/mp4", max: 20 * 1024 ** 2 },
  mp3: { mime: "audio/mpeg", max: 10 * 1024 ** 2 },
  txt: { mime: "text/plain", max: 1024 ** 2 },
};
export function filePolicy(filename: string, mime: string, size: number) {
  const ext = filename.split(".").at(-1)?.toLowerCase() ?? "";
  const rule = fileTypes[ext];
  if (
    !rule ||
    rule.mime !== mime ||
    size < 1 ||
    size > rule.max ||
    /[\\/\x00-\x1f]/u.test(filename)
  )
    throw Error("Loại tệp, MIME hoặc dung lượng không được chấp nhận.");
  return rule;
}
export function matchesMagic(bytes: Uint8Array, mime: string) {
  const ascii = new TextDecoder("utf-8", { fatal: false }).decode(
    bytes.slice(0, 1024),
  );
  if (
    (bytes[0] === 0x4d && bytes[1] === 0x5a) ||
    ascii.startsWith("PK") ||
    /<(?:svg|html|script|iframe)/iu.test(ascii)
  )
    return false;
  const head = (s: number[]) => s.every((n, i) => bytes[i] === n);
  switch (mime) {
    case "image/jpeg":
      return head([255, 216, 255]);
    case "image/png":
      return head([137, 80, 78, 71, 13, 10, 26, 10]);
    case "image/webp":
      return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
    case "application/pdf":
      return ascii.startsWith("%PDF-");
    case "video/mp4":
      return ascii.slice(4, 8) === "ftyp";
    case "audio/mpeg":
      return (
        ascii.startsWith("ID3") ||
        (bytes[0] === 255 && (bytes[1] & 0xe0) === 0xe0)
      );
    case "text/plain":
      try {
        const s = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return !/[<>\x00]/u.test(s);
      } catch {
        return false;
      }
    default:
      return false;
  }
}
