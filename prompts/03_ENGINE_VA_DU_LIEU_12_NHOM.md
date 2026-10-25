# Giai đoạn 03 — Engine deterministic và nội dung

## Bối cảnh chung
Đang triển khai Huyền Cảnh trong D:\boi. Tuân thủ AGENTS.md và README_START_HERE.md, đọc PRODUCT_REQUIREMENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, DATABASE_AND_SECURITY.md, ACCEPTANCE_TESTS.md và trạng thái hiện có. Không ghi đè thay đổi người dùng, không API trả phí, không thay lựa chọn U/N bằng giả định mới.

## Công việc phải làm
Làm 12 pure engines + registry/form schemas, canonicalization NFC/phone/date/name/cặp đối xứng, stable hash/version; không API paid, không random không seed hoặc thời gian hệ thống. Biên soạn corpus gốc đa dạng, mỗi kết quả chính ≥501 từ không nhồi lặp; points/disclaimer/nhãn mô phỏng. Nguồn lịch/Can Chi phải kiểm chứng giấy phép và boundary; nếu chưa có thì ghi mô phỏng, không giả thuật toán chuẩn. Dùng nguồn tự viết khi chưa xác minh nguồn mở; hoàn thiện DATA_SOURCES và license. Giấc mơ fallback an toàn. Dataset public version immutable.

## Cổng hoàn thành
F01–F06 đạt bằng unit/property fixtures, chạy cùng input 100 lần/2 runtime; tất cả 12 nhóm có content thật, ngày nhuận/Đ/Unicode/cặp đối xứng đúng; không gọi AI/network cho nội dung.

## Báo cáo và tiếp tục
Ghi file đã thay đổi, requirement/test IDs, lệnh kiểm tra và kết quả thật, screenshot/artifact liên quan vào IMPLEMENTATION_STATUS.md. Ghi quyết định mới vào DECISIONS.md, tách rõ giả định khỏi lựa chọn người dùng. Thiếu cấu hình ngoài thì ghi blocked đúng phần, hoàn thành phần độc lập. Không tự gửi tin/công khai nội dung khách. Khi gate đạt, tiếp tục giai đoạn kế tiếp mà không xin duyệt demo; nếu đây là 10 thì bàn giao báo cáo cuối đầy đủ.
