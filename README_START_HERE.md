# Cập nhật phát hành miễn phí — 25/10/2026

Mã local đã có. Hướng dẫn mới nhất là [DEPLOY_FREE_GUIDE.md](DEPLOY_FREE_GUIDE.md); xem CODEX_REPORT/CODEX_TODO/CODEX_HANDOFF trước tài liệu lịch sử bên dưới. Chỉ profile public-preview được chuẩn bị cho Internet: không Auth/đơn/ảnh khách, checkout vẫn khóa. Chưa có URL công khai được xác minh. Dùng `npm run build:public-preview` và `npm run check:deploy` cho bản này; `npm run dev` vẫn giữ local DEMO.

---

## Tài liệu lịch sử giữ nguyên

# Huyền Cảnh — bắt đầu tại đây

Bộ đặc tả triển khai trên Windows. Ngày soạn: 25/10/2026. **Bộ bàn giao hiện tại chỉ có tài liệu, chưa có website hoặc hệ thống thanh toán đang chạy.**

## Thứ tự đọc
1. `AGENTS.md`: luật làm việc cho Codex.
2. `PRODUCT_REQUIREMENTS.md`: phạm vi, 110 đáp án gốc và các giả định đã công khai.
3. `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `DATABASE_AND_SECURITY.md`.
4. `ACCEPTANCE_TESTS.md`, `CODEX_MASTER_PROMPT.md`.
5. Chạy lần lượt `prompts/01_...md` đến `prompts/10_...md`.

## Giao việc cho Codex
Mở thư mục `D:\boi` trong Codex, rồi dán nguyên câu này:

> Đọc AGENTS.md và README_START_HERE.md trong D:\boi, sau đó đọc toàn bộ tài liệu được chỉ dẫn. Thực hiện CODEX_MASTER_PROMPT.md và lần lượt prompts/01 đến 10 để xây dựng Huyền Cảnh. Tự tiếp tục qua các giai đoạn, không chờ duyệt demo giao diện. Ghi tiến độ, kiểm thử, điều kiện còn thiếu; không tuyên bố hoàn tất phần chưa chạy thật. Chưa công khai website hoặc nhận tiền thật khi các điều kiện phát hành trong tài liệu chưa đủ.

PowerShell để vào đúng thư mục và đọc hai file (đây là lệnh đọc, không tự gọi Codex):
```powershell
Set-Location -LiteralPath 'D:\boi'
Get-Content -LiteralPath '.\AGENTS.md' -Encoding UTF8
Get-Content -LiteralPath '.\README_START_HERE.md' -Encoding UTF8
```

## Cấu hình chủ website cần cung cấp sau
- Tài khoản GitHub, Cloudflare, Supabase và dự án Google OAuth; không gửi mật khẩu trong chat hoặc commit khóa.
- Ngân hàng, số tài khoản, tên người nhận; nếu chưa có, checkout thật bị khóa và dùng dữ liệu demo có nhãn rõ.
- Google user UUID của owner và 1–2 admin; danh sách email chỉ để hỗ trợ đối chiếu, không tự cấp quyền từ email do client gửi.
- Zalo liên hệ, email hỗ trợ, khung giờ làm việc; chính sách hoàn tiền và thời hạn lưu dữ liệu cần owner chốt trước khi nhận đơn thật.
- Logo/ảnh/nhạc có quyền sử dụng nếu có; Codex dùng hình SVG/CSS tự tạo và âm thanh có giấy phép rõ khi chưa có tài sản.

Không thiếu các mục này vẫn làm xong ứng dụng local với adapter demo và tài liệu cấu hình. Không giả lập thành tích hợp thật. Không tự đăng YouTube/TikTok hoặc tự nhắn Zalo/email.

## Kết quả phải có sau khi triển khai
Mã nguồn, 12 nhóm bói, dữ liệu có nguồn/giấy phép, Google OAuth, đơn và thanh toán thủ công, tra cứu riêng tư, admin, thư viện video có consent, video anime mẫu 30–60 giây, migrations/RLS, tests, `.env.example`, hướng dẫn Windows/deploy/backup/khôi phục. Mẫu video phải là tệp xem được, không chỉ một poster hoặc lời hứa tích hợp AI.

## Trạng thái và tiến độ
Codex triển khai tạo `IMPLEMENTATION_STATUS.md`: giai đoạn, tệp đã sửa, test đã chạy/kết quả, cấu hình thiếu, rủi ro, việc kế tiếp. Tạo `DECISIONS.md` cho thay đổi giả định. Tài liệu này không tự cho phép ghi đè mã nguồn sẵn có hoặc thay đổi ngân hàng/giá gói.

## Giới hạn thực tế
Miễn phí là mục tiêu vận hành ban đầu, không phải bảo đảm vô hạn. Free reading chạy local không quota sản phẩm; API đơn hàng vẫn có chống spam. Hosting có quota, có thể tạm ngưng. Video sản xuất thủ công bằng template miễn phí, không API tạo video trả phí. Xem ngân sách và nguồn chính thức trong ARCHITECTURE.md.
