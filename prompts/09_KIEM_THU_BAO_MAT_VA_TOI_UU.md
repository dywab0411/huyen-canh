# Giai đoạn 09 — Nghiệm thu toàn hệ thống

## Bối cảnh chung
Đang triển khai Huyền Cảnh trong D:\boi. Tuân thủ AGENTS.md và README_START_HERE.md, đọc PRODUCT_REQUIREMENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, DATABASE_AND_SECURITY.md, ACCEPTANCE_TESTS.md và trạng thái hiện có. Không ghi đè thay đổi người dùng, không API trả phí, không thay lựa chọn U/N bằng giả định mới.

## Công việc phải làm
Chạy toàn bộ ACCEPTANCE_TESTS, unit/integration/RLS/storage/E2E, real staging OAuth nếu có cấu hình, keyboard/screen reader, responsive screenshots, reduced motion, XSS/CSRF, concurrency/idempotency, limiter nhiều isolate, consent race, bundle secret scan. Kiểm tra offline/pause/quota, nội dung đủ chữ và license. Sửa nguyên nhân lỗi, chạy lại tests liên quan; không nới policy để test pass. Ghi bằng chứng/blocked trung thực, không nhắn khách thật.

## Cổng hoàn thành
Tất cả test khả dụng pass; không còn lỗi quyền/tra cứu/thanh toán/consent trọng yếu; typecheck/lint/build đạt. Phần remote thiếu cấu hình ghi rõ, không được gán pass hoặc gọi production ready.

## Báo cáo và tiếp tục
Ghi file đã thay đổi, requirement/test IDs, lệnh kiểm tra và kết quả thật, screenshot/artifact liên quan vào IMPLEMENTATION_STATUS.md. Ghi quyết định mới vào DECISIONS.md, tách rõ giả định khỏi lựa chọn người dùng. Thiếu cấu hình ngoài thì ghi blocked đúng phần, hoàn thành phần độc lập. Không tự gửi tin/công khai nội dung khách. Khi gate đạt, tiếp tục giai đoạn kế tiếp mà không xin duyệt demo; nếu đây là 10 thì bàn giao báo cáo cuối đầy đủ.
