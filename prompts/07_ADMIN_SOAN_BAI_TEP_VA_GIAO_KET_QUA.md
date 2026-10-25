# Giai đoạn 07 — Admin và giao kết quả thủ công

## Bối cảnh chung
Đang triển khai Huyền Cảnh trong D:\boi. Tuân thủ AGENTS.md và README_START_HERE.md, đọc PRODUCT_REQUIREMENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, DATABASE_AND_SECURITY.md, ACCEPTANCE_TESTS.md và trạng thái hiện có. Không ghi đè thay đổi người dùng, không API trả phí, không thay lựa chọn U/N bằng giả định mới.

## Công việc phải làm
Xây admin cho owner/editor: tìm/lọc đơn, đối soát, soạn từ mẫu, preview, draft/publish revision, upload tệp an toàn/quarantine/private buckets, giao G10/G20/G50 đúng nội dung. Quyền checked server mỗi action, MFA nhạy cảm, audit không PII. Owner chỉnh config/member và dataset draft/validate/publish immutable. Nội dung copy Zalo/email thủ công không chứa secret. Không dashboard doanh thu/export hoặc bot gửi tin.

## Cổng hoàn thành
ADM01/02, SEC03–06, F07 đạt; chưa paid không publish; G50 thiếu video không delivered; editor không đổi bank/member; file executable giả đuôi/HTML/SVG/oversize bị chặn server.

## Báo cáo và tiếp tục
Ghi file đã thay đổi, requirement/test IDs, lệnh kiểm tra và kết quả thật, screenshot/artifact liên quan vào IMPLEMENTATION_STATUS.md. Ghi quyết định mới vào DECISIONS.md, tách rõ giả định khỏi lựa chọn người dùng. Thiếu cấu hình ngoài thì ghi blocked đúng phần, hoàn thành phần độc lập. Không tự gửi tin/công khai nội dung khách. Khi gate đạt, tiếp tục giai đoạn kế tiếp mà không xin duyệt demo; nếu đây là 10 thì bàn giao báo cáo cuối đầy đủ.
