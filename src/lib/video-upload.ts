import { auth } from "./auth";
export function uploadVideo(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  const expected = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (
    !expected ||
    new URL(url).origin !== new URL(expected).origin ||
    !new URL(url).pathname.startsWith("/storage/v1/object/upload/sign/")
  )
    return Promise.reject(Error("Địa chỉ tải video không hợp lệ."));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.timeout = 180000;
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onerror = () =>
      reject(Error("Kết nối tải video bị gián đoạn. Vui lòng thử lại."));
    xhr.ontimeout = () =>
      reject(Error("Tải video quá lâu. Kiểm tra kết nối và thử lại."));
    xhr.onabort = () => reject(Error("Đã dừng tải video."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else
        reject(Error("Chưa tải được video. Kiểm tra dung lượng và thử lại."));
    };
    const form = new FormData();
    form.append("cacheControl", "0");
    form.append("", file);
    xhr.send(form);
  });
}
export async function uploadPrivateVideo(
  bucket: string,
  key: string,
  token: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  if (!auth) throw Error("Vui lòng đăng nhập lại.");
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  const url = new URL(
    base + "/storage/v1/object/upload/sign/" + bucket + "/" + key,
  );
  url.searchParams.set("token", token);
  await uploadVideo(url.toString(), file, onProgress);
}
