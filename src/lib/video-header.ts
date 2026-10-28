export function videoHeaderValid(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 12) return false;
  return mime === "video/mp4"
    ? String.fromCharCode(...bytes.slice(4, 8)) === "ftyp"
    : mime === "video/webm" &&
        bytes[0] === 0x1a &&
        bytes[1] === 0x45 &&
        bytes[2] === 0xdf &&
        bytes[3] === 0xa3;
}
