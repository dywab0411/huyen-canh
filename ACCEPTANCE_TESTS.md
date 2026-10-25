# Tiêu chí nghiệm thu và kế hoạch kiểm thử

Mỗi ID ghi pass/fail/blocked, môi trường, bằng chứng và ngày trong IMPLEMENTATION_STATUS.md. Mock pass không thay thế test staging thật. Dùng dữ liệu giả, không gửi Zalo/email hoặc đăng video thật trong test.

| ID | Kịch bản | Kết quả phải đạt |
|---|---|---|
| DOC01 | Đọc bộ tài liệu | 8 file gốc yêu cầu + prompts 01–10; 110 đáp án đầy đủ; lựa chọn U/N tách A; không có website triển khai trong bước soạn tài liệu |
| UI01 | Home mobile/desktop 360–1440 | Tiếng Việt, sáng dịu, sen/mây/thần thoại Việt, search/categories/12 thẻ, 3 gói, guide; không tràn ngang |
| UI02 | Keyboard, zoom 200%, reader | Focus visible, thứ tự hợp lý, label/error đọc được, dialog không kẹt; contrast đúng DESIGN_SYSTEM |
| UI03 | Full animation/reduced motion | Có 12 reveal phù hợp; toggle + prefers-reduced-motion loại bỏ chuyển động dài; bỏ qua không mất kết quả |
| UI04 | Nhạc và chuyển trang | Mặc định im lặng, chỉ bật sau click; có mute; transition không chặn điều hướng |
| F01 | Tất cả 12 công cụ | Form riêng, score đúng 0–100, nội dung chính ≥501 từ không lặp nhồi, disclaimer và mô phỏng đúng chỗ |
| F02 | Gọi lại cùng canonical input 100 lần trên 2 runtime | Output/score/version byte-stable; reload/ngày khác không đổi; không Date.now/random mạng trong engine |
| F03 | Unicode, Đ/đ, khoảng trắng, ngày nhuận, ngày tương lai, thiếu giờ | Canonicalization theo spec; invalid bị chặn; tên hiển thị không hỏng; không tự bịa giờ |
| F04 | Hợp tuổi/tên A+B vs B+A | Điểm/nội dung chung đối xứng theo quy tắc; labels tên ánh xạ đúng |
| F05 | Giấc mơ từ không có trong dictionary + XSS | Fallback có ý nghĩa, không bịa nguồn; text an toàn, giới hạn 2.000 ký tự |
| F06 | Offline sau tải dataset | 12 readings không gọi API trả phí/LLM; được xem không login và không quota lượt bán hàng |
| F07 | Dataset publish v2 | Kết quả mới dùng v2, lịch sử v1 giữ snapshot; draft không public, published không sửa tại chỗ |
| F08 | Share ảnh/link | Tải được PNG, chữ Việt đúng; mặc định ẩn PII; Web Share có fallback; URL không chứa kết quả riêng |
| AUTH01 | Google local/staging/prod + logout/cancel | Redirect allowlist, session thật, lỗi dễ hiểu; không tự cấp admin qua email/localStorage |
| AUTH02 | Lịch sử khách A/B và guest | Chỉ lưu khi chọn; A không đọc/sửa B; guest không tự được đồng bộ; xóa lịch sử hoạt động |
| ORD01 | Tạo G10/G20/G50, sửa payload giá | Server giữ đúng 10k/20k/50k và snapshot; idempotency retry chỉ một đơn; secret hiện một lần |
| ORD02 | Thiếu ngân hàng/chính sách hoàn tiền | Production checkout bị khóa có thông báo; local demo rõ nhãn; không QR ở UI/network |
| ORD03 | Claim thanh toán không biên lai | Tạo claim, chưa paid; biên lai tùy chọn; admin xác nhận sau đối chiếu thật |
| ORD04 | 2 admin confirm cùng lúc/retry | Một verified event, một state transition; giá/tham chiếu/actor audit đúng; invalid state bị từ chối |
| ORD05 | Unpaid 48h và chuyển tiền muộn | Expired theo UTC chính xác; paid không expired; late payment chỉ admin reconcile |
| LOOK01 | Code + phone đúng, secret sai/thiếu | Không dữ liệu; thông báo giống code/phone không tồn tại; không oracle rõ ràng |
| LOOK02 | Cả ba đúng | Chỉ published result đúng đơn; trước giao có thông báo tối thiểu, không timeline; phiên 15 phút hết hạn đúng |
| LOOK03 | Đoán mã/đổi worker instance/restart | Limiter persistent atomic vẫn chặn theo cửa sổ; không bypass qua isolate mới; challenge validate server |
| LOOK04 | URL/log/referrer/cache/browser storage | Không code+phone+secret trong URL; không secret/token/signed URL/PII trong log/cache/localStorage; response no-store |
| LOOK05 | Mất secret/reset | Không reset chỉ code+phone; quy trình hỗ trợ có audit; session và mã cũ vô hiệu sau cấp mới |
| SEC01 | anon direct REST/Storage/RPC | Không list/read orders, credential, draft, private files; public chỉ DTO đã cho phép |
| SEC02 | A đoán UUID B và attachment B | 403/404 tương đương an toàn, không signed URL; policy chặn cross-tenant cả SELECT/UPDATE/DELETE |
| SEC03 | JWT giả/expired, role revoke, editor đổi ngân hàng/admin | Bị chặn server; role revoke request kế tiếp; sensitive admin action yêu cầu MFA phù hợp |
| SEC04 | XSS body/name/review/dataset + CSRF | Sanitizer/text render an toàn; Origin/CSRF kiểm tra; CSP/headers; không raw HTML |
| SEC05 | Upload executable đổi đuôi, MIME sai, SVG/ZIP, quá size | Bị chặn server/quarantine; không public path; ảnh EXIF bị strip; signed URL 60s hết hạn |
| SEC06 | Bundle/repo/CI log scan | Không service key/pepper/Google secret/PII; .env bị ignore, .env.example placeholders |
| ADM01 | Editor tìm/lọc/draft/template/publish | Làm được trong quyền, draft không lộ; publish đòi paid + valid result/file; không dashboard doanh thu/export |
| ADM02 | Dataset draft invalid/publish | Schema/license/hash validate; owner publish, version immutable và audit |
| CON01 | Checkout không tick consent optional | Vẫn mua/giao riêng bình thường; không công khai, không dùng ảnh khi chưa cho phép |
| CON02 | Chỉ đồng ý website, chưa YouTube/TikTok | Chỉ website đúng asset/version được duyệt; đổi video buộc cấp quyền mới; owner không bypass |
| CON03 | Khách 16–17 | Không thu ảnh nhận diện/công khai video cá nhân theo A12; demo hư cấu vẫn xem được |
| CON04 | Thu hồi đồng thời với publish | Không republish trái consent; gallery gỡ, checklist gỡ nền tảng ngoài có audit; không hứa xóa mọi bản sao |
| VID01 | Tệp video mẫu | MP4 phát được, 30–60s, anime template, phụ đề Việt đọc được, không watermark/PII; license/source đi kèm |
| VID02 | G50 giao riêng | Có bài + video private, khách đúng quyền tải được; public/unlisted YouTube không thay private storage |
| REV01 | Review delivered/spam/XSS | Một/đơn, sao 1–5, pending moderation, không giả đánh giá/PII; đơn khác không sửa được |
| OPS01 | Quota gần hết/Supabase pause/lỗi mạng | Thông báo thật, không fake success; chặn đơn/upload cần thiết, local free vẫn chạy khi dataset sẵn |
| OPS02 | Backup + restore staging | DB/storage/roles/consent khôi phục được; deletion tombstone tái áp; không lộ secret |
| OPS03 | Retention dry run | Chỉ dữ liệu đúng hạn bị chọn; paid còn cam kết không mất; có log tối thiểu |
| OPS04 | Windows từ clone sạch | Theo HANDOVER chạy được dev/build/tests; scripts không phụ thuộc shell Unix; external config thiếu ghi blocked |

## Cách kiểm tra và cổng phát hành
Unit: normalizers, 12 engines, word count, version/hash, phone, state machine. Integration: SQL constraints, transactions/idempotency, RLS + Storage/RPC roles, API auth, rate limit persistent, consent race. E2E: guest → miễn phí → order → claim → admin verify → deliver → lookup; Google flow thật ở staging; screenshot các viewport và reduced motion.

Scripts dự kiến `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:integration`, `npm run test:e2e`, `npm run build`; Codex phải tạo scripts thực sự và ghi phiên bản môi trường. Không tuyên bố chạy test nếu chỉ viết test.

Không phát hành nhận tiền nếu có lỗi SEC/LOOK/ORD/CON trọng yếu, thiếu ngân hàng/hoàn tiền/privacy/support, secret scan thất bại hoặc restore chưa thử. Nếu thiếu credentials: hoàn thành code/local và ghi blocked cho AUTH01/remote OPS, không gán pass. Hiệu năng mục tiêu A: UI tương tác nhanh, bundle JS initial gzip ≤250 KB chưa tính asset lazy; LCP ≤3s trên cấu hình mobile test đã ghi, accessibility ≥95; đo rồi tối ưu, không bỏ đồ họa hoặc accessibility để lấy điểm.
