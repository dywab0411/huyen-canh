# Giai đoạn 05 — Supabase, Google OAuth và quyền dữ liệu

## Bối cảnh chung
Đang triển khai Huyền Cảnh trong D:\boi. Tuân thủ AGENTS.md và README_START_HERE.md, đọc PRODUCT_REQUIREMENTS.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, DATABASE_AND_SECURITY.md, ACCEPTANCE_TESTS.md và trạng thái hiện có. Không ghi đè thay đổi người dùng, không API trả phí, không thay lựa chọn U/N bằng giả định mới.

## Công việc phải làm
Tạo migrations đủ các bảng trong DATABASE_AND_SECURITY, constraints/index, RLS default deny, private storage policies, RPC search_path/revoke đúng. Google OAuth PKCE local/staging/prod, session verify server, returnTo allowlist, logout. Hồ sơ/lịch sử chỉ của chủ tài khoản, không tự tải guest history lên. Bootstrap owner an toàn, editor role, MFA cho admin. Nếu thiếu credentials dùng demo adapter rõ ràng và để migration/tests sẵn, không bịa login.

## Cổng hoàn thành
AUTH01/02 và SEC01/02/03 có bằng chứng thật ở môi trường có cấu hình; thiếu remote ghi blocked. Direct anon REST/storage/RPC bị chặn; A không đọc/sửa B; client không tự cấp role. Không tiếp tục live nếu RLS thất bại.

## Báo cáo và tiếp tục
Ghi file đã thay đổi, requirement/test IDs, lệnh kiểm tra và kết quả thật, screenshot/artifact liên quan vào IMPLEMENTATION_STATUS.md. Ghi quyết định mới vào DECISIONS.md, tách rõ giả định khỏi lựa chọn người dùng. Thiếu cấu hình ngoài thì ghi blocked đúng phần, hoàn thành phần độc lập. Không tự gửi tin/công khai nội dung khách. Khi gate đạt, tiếp tục giai đoạn kế tiếp mà không xin duyệt demo; nếu đây là 10 thì bàn giao báo cáo cuối đầy đủ.
