# Giai đoạn 10 — Chuẩn bị phát hành và bàn giao

## Bối cảnh chung
Đang triển khai Huyền Cảnh trong D:\boi. Tuân thủ AGENTS.md và README_START_HERE.md, đọc PRODUCT_REQUIREMENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, DATABASE_AND_SECURITY.md, ACCEPTANCE_TESTS.md và trạng thái hiện có. Không ghi đè thay đổi người dùng, không API trả phí, không thay lựa chọn U/N bằng giả định mới.

## Công việc phải làm
Hoàn thiện HANDOVER: từ clone sạch trên Windows, biến public/server, migrations, Google redirect, owner/MFA, Cloudflare pages.dev/Supabase staging/prod, cấu hình bank/refund/support, thao tác đối soát/giao đơn/reset secret/thu hồi consent, quota 70/85%, retention cleanup dry-run. Backup mã hóa DB/storage/consent, restore staging và rollback tương thích. Đóng gói video/template/licenses/screenshots/test reports. Tạo checklist điều kiện nhận tiền thật. Chỉ thực hiện deploy ngoài khi có quyền/cấu hình phù hợp; không tự đăng video hay gửi Zalo/email. Không dừng việc local chỉ vì thiếu tài khoản cloud.

## Cổng hoàn thành
OPS01–04 đạt trong phạm vi cấu hình thực, có báo cáo restore; owner đọc được hướng dẫn. Báo phần hoàn thành, bài test thật, link/tệp chạy, mọi phần blocked và bước cấu hình cuối; không kết luận xong live nếu chưa deploy/kiểm thử remote.

## Báo cáo và tiếp tục
Ghi file đã thay đổi, requirement/test IDs, lệnh kiểm tra và kết quả thật, screenshot/artifact liên quan vào IMPLEMENTATION_STATUS.md. Ghi quyết định mới vào DECISIONS.md, tách rõ giả định khỏi lựa chọn người dùng. Thiếu cấu hình ngoài thì ghi blocked đúng phần, hoàn thành phần độc lập. Không tự gửi tin/công khai nội dung khách. Khi gate đạt, tiếp tục giai đoạn kế tiếp mà không xin duyệt demo; nếu đây là 10 thì bàn giao báo cáo cuối đầy đủ.
