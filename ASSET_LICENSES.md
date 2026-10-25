# Nguồn và giấy phép tài sản

- Hero SVG Linh Sứ và họa tiết sen/mây: mã tự tạo trong `src/main.tsx`, không ảnh khách/người thật; chủ dự án được dùng, sửa và phân phối cùng ứng dụng.
- `video-template/render.py`, MP4/poster/VTT/WAV đầu ra: tự tạo dành cho Huyền Cảnh, cho phép chủ dự án dùng/sửa/phân phối thương mại cùng sản phẩm; không watermark, không dữ liệu khách. Phụ đề và câu chuyện hư cấu.
- Font Be Vietnam Pro và Noto Serif: Google Fonts, SIL OFL 1.1. Giấy phép lưu tại `public/assets/fonts/*-OFL.txt`; nguồn URL và metadata ở `docs/font-source.css`. Chỉ self-host, không request Google khi khách đọc.
- Arial/Georgia được Pillow dùng từ bản Windows cục bộ để raster video; không phân phối file font Windows. Website có font OFL và fallback hệ thống.
- Dependency giữ license tương ứng trong package npm. `imageio-ffmpeg` và FFmpeg dùng ngoài request để render local, không đóng gói executable vào website; xem license bộ cài khi phân phối công cụ dựng.

Font WOFF2 subset Latin/Vietnamese tạo bằng scripts/subset-fonts.py từ TTF gốc OFL. Tên nội bộ đổi thành HC Sans / HC Serif; vẫn giữ attribution và license gốc. TTF gốc để dựng video, WOFF2 phục vụ web.


## Thư viện video — 2026-10-25
Minh họa mặt trăng/ngôi sao và gradient mới tại src/style.css là CSS/Unicode tự biên soạn, cho phép chủ dự án dùng/sửa/phân phối cùng website. Không nhập tài sản, câu chữ hoặc lời chứng thực từ ảnh website tham khảo. Phim Hồ sen và poster giữ nguồn/giấy phép như trước. Tệp video/cover do admin tải về sau phải có quyền sử dụng riêng; không mặc định áp giấy phép của tài sản mẫu cho nội dung khách. Xem docs/VIDEO_LIBRARY.md về consent đúng phiên bản.

## 2026-10-25 — QR chủ website cung cấp
public/assets/sacombank-owner-qr.jpg là bản sao nguyên byte IMG_4862.JPG do chủ website cung cấp và chỉ định hiển thị cho chuyển khoản thủ công. Không tạo lại hoặc chỉnh sửa QR, không tuyên bố đã kiểm thử giao dịch ngân hàng. Không dùng ảnh khách hay lời chứng thực giả.
