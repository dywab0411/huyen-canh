export function VideoTerms({ code }: { code: string }) {
  if (!["G60", "G70"].includes(code)) return null;
  return (
    <aside className="video-terms" aria-label="Điều khoản video">
      <p>
        Huyền Cảnh có thể sử dụng video hoạt hình được tạo từ đơn hàng để giới
        thiệu dịch vụ trên các nền tảng như TikTok, YouTube, Facebook
      </p>
      <p>
        Thông tin liên hệ như sdt của khách hàng sẽ được bảo mật tuyệt đối, sdt
        chỉ để gửi thông báo kết quả đến khách hàng, tuyệt đối không cung cấp
        dưới mọi hình thức.
      </p>
    </aside>
  );
}
