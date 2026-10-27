/** SDK versions may return a raw SVG or an SVG data URI. Never nest data URIs. */
export function mfaQrSource(qr: string): string {
  if (/^data:image\/svg\+xml(?:;[^,]*)?,/i.test(qr)) {
    const comma = qr.indexOf(",");
    const header = qr.slice(0, comma);
    if (/;base64$/i.test(header)) return qr;
    const body = qr.slice(comma + 1);
    return body.trimStart().startsWith("<svg")
      ? `${header},${encodeURIComponent(body)}`
      : qr;
  }
  return qr.trimStart().startsWith("<svg")
    ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(qr)
    : "";
}
