# Giai đoạn 06 — Đơn, chuyển khoản và tra cứu an toàn

## Bối cảnh chung
Đang triển khai Huyền Cảnh trong D:\boi. Tuân thủ AGENTS.md và README_START_HERE.md, đọc PRODUCT_REQUIREMENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, DATABASE_AND_SECURITY.md, ACCEPTANCE_TESTS.md và trạng thái hiện có. Không ghi đè thay đổi người dùng, không API trả phí, không thay lựa chọn U/N bằng giả định mới.

## Công việc phải làm
Tạo API order idempotent, giá/expiry/snapshot server, code ngẫu nhiên và mã bí mật 128 bit hiện một lần, hash/pepper version. Checkout không QR, biên lai tùy chọn, claim không paid. Admin confirm atomic và audit chống double-confirm; expired/late reconciliation. Lookup POST đủ code+phone+secret, limiter persistent atomic nhiều worker, challenge server, thông báo sai đồng nhất, no-store/noindex, phiên cookie 15 phút, signed URL 60 giây. Reset secret thủ công an toàn. Không làm timeline/tracking khách.

## Cổng hoàn thành
ORD01–05, LOOK01–05 đạt, SEC04/06 liên quan đạt; payload sửa giá bị bỏ, code+phone không đủ, log/URL không có secrets; thiếu ngân hàng/refund policy production checkout bị khóa.

## Báo cáo và tiếp tục
Ghi file đã thay đổi, requirement/test IDs, lệnh kiểm tra và kết quả thật, screenshot/artifact liên quan vào IMPLEMENTATION_STATUS.md. Ghi quyết định mới vào DECISIONS.md, tách rõ giả định khỏi lựa chọn người dùng. Thiếu cấu hình ngoài thì ghi blocked đúng phần, hoàn thành phần độc lập. Không tự gửi tin/công khai nội dung khách. Khi gate đạt, tiếp tục giai đoạn kế tiếp mà không xin duyệt demo; nếu đây là 10 thì bàn giao báo cáo cuối đầy đủ.
