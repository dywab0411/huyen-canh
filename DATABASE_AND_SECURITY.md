# Dữ liệu và bảo mật

## Mô hình dữ liệu đề xuất
Mọi bảng có UUID khóa chính, created_at/updated_at UTC, FK và index phù hợp. Enum/state check trong DB; validation client chỉ hỗ trợ UX.

| Bảng | Trường chính / ràng buộc |
|---|---|
| profiles | user_id FK auth.users unique, display_name, age_band tùy nhu cầu; không public email/SĐT |
| admin_members | user_id unique, role owner/editor, active; chỉ owner thay đổi; không cho tự phong role |
| service_packages | code G10/G20/G50, price_vnd integer, active, delivery_hours, version; public chỉ đọc cột an toàn |
| orders | internal UUID, order_code unique random, user_id nullable, package/price/delivery snapshot, name, phone_e164, phone_lookup_hmac, encrypted contact nếu áp dụng, email nullable, inputs JSON validated, internal_state, paid_at, expires_at, delivered_at, version integer |
| order_credentials | order_id unique, secret_digest, pepper_version, revoked_at; không client SELECT |
| payment_events | order_id, claimed/verified/rejected/reconciled, amount integer, reference, actor, reason, timestamp; unique reference theo cấu hình tránh dùng lại |
| reading_results | order_id, revision, sanitized content JSON/Markdown, draft/published, published_by/at; chỉ 1 published revision active |
| attachments | order_id, storage_key opaque, mime, size, checksum, classification source/private_result/public_derivative, uploader, release_state |
| reading_history | user_id, tool/version, input tối thiểu, snapshot JSON, saved_at; không tự lưu guest |
| content_templates | title, body validated, version, author; admin dùng soạn bài |
| dataset_versions | version unique, schema/hash, draft/published, source/license metadata; published immutable |
| consent_events | order_id, subject proof, scope, granted/revoked, asset_id + asset_hash/version, notice_version, age_band, actor/time; append-only |
| public_media | derivative asset, consent snapshot refs, platform target/id, draft/approved/published/withdrawn; không join lộ order/contact |
| reviews | order_id unique, rating 1–5 check, text length limit, nickname công khai riêng, moderation_state |
| audit_events | actor/role, action, resource ID, changed field names, timestamp, request ID; không secret/full contact/content |
| abuse_counters | hashed key/route/window, count, expires_at; atomic update, TTL cleanup |
| lookup_sessions | opaque token digest, order_id, expiry, revoked_at, minimal scope; không dùng token rõ trong DB |

PII chỉ thu theo tính năng cần dùng, HTTPS khi truyền, bảo vệ at-rest từ provider; mã hóa trường nhạy cảm server nếu chọn và quản lý key riêng, không tự coi hash SĐT là ẩn danh (không gian số dễ đoán). Phone lookup dùng HMAC có secret server. Pepper rotation có phiên bản và kế hoạch reissue/rehash; không đổi khóa rồi làm mất quyền tra cứu đơn cũ.

## Quyền và RLS
Enable RLS tất cả bảng, private bucket policies tương ứng. Mặc định deny, không policy `true` cho dữ liệu khách. View phải tránh bypass RLS (security_invoker khi phù hợp). RPC SECURITY DEFINER khóa search_path, revoke EXECUTE public/anon khi không cần, không nhận tùy ý user_id/role.

| Vai trò | Được phép | Không được phép |
|---|---|---|
| anon | Đọc gói/content/dataset công khai được duyệt; gọi API tạo đơn/lookup được bảo vệ | SELECT orders/results/credentials/contact/storage |
| khách đăng nhập | Hồ sơ/lịch sử của chính mình; kết quả đã phát hành của order gắn user_id do server xác lập | Sửa giá, paid, role, đọc order người khác, đọc draft |
| guest có lookup session | Kết quả/file đúng order đã xác minh trong thời gian ngắn, thao tác consent/review hạn chế | List/search đơn, lấy draft, duyệt storage, thay payment state |
| editor | Đơn phục vụ vận hành, xác nhận tiền, draft/publish kết quả, mẫu; có audit | Thêm admin, đổi ngân hàng, public asset thiếu consent, export |
| owner | Quản trị thành viên/cấu hình/dataset publish/publication theo rule | Bypass consent chỉ vì có role owner |

Đừng gán service role cho trình duyệt. Backend dùng user JWT/RLS khi có thể; nếu service role cần cho guest lookup, mọi route phải kiểm tra quyền server trước truy vấn. Tách module service client, trả DTO allowlist không serialize cả row. Admin 2–3 người bật MFA (TOTP qua Auth khi khả dụng), yêu cầu assurance phù hợp ở action nhạy cảm; role revoke có hiệu lực request kế tiếp, không giữ quyền trong token dài hạn. Hướng dẫn tạo owner bootstrap thủ công qua migration/script an toàn, không endpoint đăng ký owner công khai.

## Tra cứu đơn ba lớp
1. Client POST body order_code + phone + secret qua HTTPS; không query params/path, không log body. Chuẩn hóa +84 và 0 về E.164 cùng quy tắc tạo đơn; code uppercase, validate độ dài.
2. Rate limit server dùng bộ đếm persistent atomic trong DB/RPC: đề xuất 5 lần sai/15 phút cho tổ hợp IP hash + mã đơn, 30 request/15 phút mỗi IP và giới hạn toàn cục theo quota. Không chỉ Map RAM trong worker, không tin X-Forwarded-For do client tùy đặt. Không khóa vĩnh viễn theo riêng mã đơn gây DoS.
3. Sau ngưỡng thấp yêu cầu challenge như Turnstile xác thực server; challenge không thay thế rate limit. Lỗi DB limiter: fail closed cho lookup/đơn mới, có thông báo hỗ trợ; free reading local vẫn dùng được.
4. Tra order theo public code, HMAC phone để so, kiểm tra secret digest constant-time. Mã 128 bit entropy, ví dụ base64url 22 ký tự; SHA-256/HMAC với pepper server đủ cho token entropy cao; không dùng SHA nhanh cho mật khẩu người dùng. Dummy hash khi không có order, thông báo và status giống nhau cho code/phone/secret sai; test không có oracle đáng kể về timing.
5. Thành công cấp token phiên lookup opaque 256 bit, HttpOnly Secure SameSite=Strict cookie, TTL 15 phút (A). Lưu digest, scope đúng order; không đặt session vào localStorage. POST đổi dữ liệu kiểm tra Origin và CSRF token; không tin CORS như cơ chế auth.
6. Chỉ trả published result/files, mã đơn và dữ liệu tối thiểu cần thiết, không full phone/email/input nếu không cần. Chưa có kết quả dùng câu trung tính; không public timeline/trạng thái thanh toán. Sai trả “Thông tin tra cứu chưa đúng hoặc chưa thể truy cập”. `no-store`, `noindex`, Referrer-Policy no-referrer.
7. Mất mã bí mật: không khôi phục chỉ bằng mã đơn + SĐT. Owner xác minh ngoài hệ thống qua kênh đã đăng ký + bằng chứng giao dịch tối thiểu, không đòi giấy tờ quá mức; reset thủ công có audit, thu hồi credential/session cũ, cấp mã mới một lần. Không hiện mã gốc cho admin.

## Trạng thái và giao dịch
`awaiting_payment → payment_claimed → paid → in_progress → ready → delivered`.
`awaiting_payment/payment_claimed → expired/cancelled`; `paid/in_progress/ready/delivered → refund_pending → refunded` chỉ khi chính sách được chốt. `expired` có tiền đến muộn → payment event reconciled → paid bởi admin với lý do. Khách chỉ được claim; không endpoint client-set-state. Không mark delivered khi còn draft hoặc chưa có file bắt buộc G50.

Payment confirm phải transaction atomic, kiểm tra expected version/row lock, role, số tiền đúng snapshot và tham chiếu không dùng trùng. Retry idempotent; hai admin confirm đồng thời tạo một sự kiện verified và một chuyển trạng thái. Publish result transaction kiểm tra paid, nội dung, attachments sẵn sàng và role; sửa sau phát hành tạo revision/audit, không âm thầm ghi đè.

## Tệp và nội dung nhập
Private buckets tách ảnh nguồn và kết quả. Client không chọn path tùy ý; server cấp UUID prefix gắn order. Kiểm tra MIME thực/magic bytes, extension, size, decode ảnh rồi re-encode, strip EXIF; reject mismatch, polyglot và định dạng thực thi. Không render HTML hoặc SVG do khách tải. PDF download attachment, không nhúng active content. File chưa kiểm tra ở quarantine; chỉ release loại có validator đáng tin, không tuyên bố đã antivirus nếu không có scanner. Video MP4 20 MB, ảnh 5 MB, PDF/MP3 10 MB, TXT 1 MB, tổng 30 MB/đơn; validate cả server và storage policy, không chỉ input accept.

Signed download URL TTL 60 giây, chỉ sinh sau xác minh quyền đúng attachment/order, không public bucket, không ghi vào lịch sử/log/mail. URL hết hạn không thu hồi bytes đã tải; thông báo điều này trong privacy. File response attachment, nosniff. Không để ảnh riêng trong public/assets, GitHub, screenshot hoặc video mẫu.

Sanitize rich text bằng allowlist, không raw HTML/script/iframe/event handler; cấm javascript: links. Render comments/giấc mơ/name như text. CSP chặt, chỉ cho media/frame domain cần dùng và sau consent; CORS same-origin allowlist, security headers, chống clickjacking admin. Validate tất cả endpoint, giới hạn input/body, không SSRF fetch URL tùy ý, query parameterized.

## Consent và xuất bản
Scopes độc lập: service_processing, customer_photo_for_private_video, website_public_gallery, youtube_publication, tiktok_publication. Acceptance điều khoản không thay consent tùy chọn. Trước public kiểm tra tuổi theo A12, grants active đúng asset hash/version + platform, no withdrawal; yêu cầu owner preview. Public derivative không có order code/contact/private URL; stripped metadata. Grant/revoke append-only và audit, tự gỡ gallery ngay sau revoke; ngăn republish race bằng transaction/row lock. Tác vụ ngoài nền tảng là checklist thủ công có owner/time/result, không giả API.

## Lưu/xóa, backup và sự cố
TTL theo A15 trong PRODUCT_REQUIREMENTS, hiển thị trong privacy trước thu dữ liệu. Scheduled cleanup có dry-run và test, không xóa financial record cần giữ theo chính sách chưa chốt; trước live owner xác nhận retention/hoàn tiền và nghĩa vụ liên quan với người có chuyên môn nếu cần. Xóa profile không được để order orphan lộ thông tin; pseudonymize hoặc giữ record tối thiểu theo chính sách đã công bố. Xóa nguồn/kết quả và public derivative theo scope; lưu tombstone tối thiểu, backup 30 ngày đề xuất và quy trình tái áp deletion khi restore.

Backup mã hóa tách secrets, owner kiểm soát, test khôi phục cả DB/storage/consent. Không log access token, secret, ảnh, bài bói, input đầy đủ, signed URL. Sự cố: tắt route liên quan/thu hồi session và khóa bị lộ, giữ audit tối thiểu, điều tra phạm vi, sửa và chạy test trước mở lại; không lặng lẽ bỏ auth để hệ thống chạy.
