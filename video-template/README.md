# Dựng video trên Windows

Từ thư mục dự án, Python 3.12: `python -m pip install -r video-template/requirements.txt`, sau đó `npm run video`.
Hai font OFL ở `public/assets/fonts` đã kèm. Script tự tạo toàn bộ frame, dùng FFmpeg libx264 từ imageio-ffmpeg. Không có mạng trong render, ảnh khách, giọng đọc hoặc API trả phí. Video 36 giây, 1280×720, 24fps, H.264/yuv420p/faststart, phụ đề burn-in và VTT riêng. Nhạc website tổng hợp riêng, mặc định tắt.

Sửa `captions` và các hình trong `render.py` để tạo biến thể hư cấu. Dùng ảnh khách thật cần consent dùng ảnh trước khi dựng; không đặt ảnh hoặc đầu ra riêng vào public/Git. Lưu source/private result/public derivative tách biệt. Mỗi thay đổi asset phải tạo hash/version mới và xin quyền công khai mới sau preview. Website/YouTube/TikTok là ba scope riêng. Không xuất bản cho người dưới 18 trong bản đầu.

Sau render xem video, kiểm tra dấu tiếng Việt, duration, hình và tệp `video-verification.json`. Không chỉ dùng metadata để kết luận chất lượng. FFmpeg là công cụ local ngoài Worker; không chạy transcoding trong request Cloudflare.
