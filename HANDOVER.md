# Huyền Cảnh — bàn giao bản local

Đọc `IMPLEMENTATION_STATUS.md` trước khi dùng. Đây là mã nguồn và bản chạy local; chưa được triển khai công khai, chưa đạt nghiệm thu remote hoặc được phép nhận tiền. Không đưa dữ liệu khách thật vào bản chưa nghiệm thu.

## Chạy Windows

Node đã kiểm thử: 24.21.0; npm 11.19.0; Python 3.12 cho media. Tại PowerShell:

```powershell
Set-Location -LiteralPath 'D:\boi'
npm ci
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
npm run check:secrets
npm run dev
```

Mở http://127.0.0.1:5173. `npm run worker:preview` phục vụ build + Pages Functions tại http://localhost:8788. E2E dùng Edge và Vite cổng 5187, không cần cloud. Nếu Edge không cài, đổi `channel` trong playwright.config.ts sang browser được cài và ghi lại môi trường. Không sửa ExecutionPolicy toàn máy. CI Windows chạy check không secret, nhưng chưa có bằng chứng CI GitHub chạy thật.

Ảnh và report ở `docs/screenshots`, `playwright-report`, `docs/RESTORE_LOCAL_REPORT.json`. Báo cáo restore chỉ PGlite dữ liệu giả; không thay diễn tập Supabase staging.

## Environment và triển khai

`.env.example` là mẫu, không có key thật. Frontend chỉ `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Các khóa đặc quyền đặt ở `.dev.vars` local/Cloudflare secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LOOKUP_PEPPER_V1`, `TURNSTILE_SECRET_KEY`; cấu hình public-origin chính xác và `TURNSTILE_SITE_KEY`. Không đặt service-role/pepper/Google secret vào VITE_ hoặc GitHub bundle.

Phiên lookup dùng token opaque 256 bit và digest DB, không ký JWT; `SESSION_SIGNING_SECRET` trong mẫu ban đầu không dùng và không cần. Pepper v1 phải sao lưu trong kho secrets riêng; không xoay bằng cách xóa v1. Khi thay pepper, bổ sung version mới và quy trình reissue đã audit trước khi loại v1; code hiện chỉ triển khai v1, chưa hỗ trợ tự động đa khóa.

1. Tạo Supabase staging riêng. Backup trước thay đổi; áp dụng migrations 001→008 tuần tự, không reset/drop production. `pgcrypto` cần extension có sẵn hoặc quyền bật. Test PGlite dùng `gen_random_uuid` tích hợp và bỏ riêng lệnh create extension trong fixture; schema `auth/storage` test là fixture.
2. Supabase Google provider: nhập Google Client ID/secret vào dashboard Auth, không frontend. Google authorized redirect là `https://PROJECT.supabase.co/auth/v1/callback`. Supabase redirect allowlist chính xác: `http://127.0.0.1:5173/auth/callback`, staging HTTPS và production HTTPS tương ứng; không wildcard. Luồng PKCE chỉ trở về `/tai-khoan`, không nhận returnTo tùy ý.
3. Đăng nhập Google của owner để tạo auth user. Lấy UUID đã đối chiếu bằng dashboard. Trong SQL editor đáng tin, insert `admin_members(user_id,role)` bằng UUID đó với role owner. Không dùng email/role client để bootstrap. Tối đa 3 thành viên; sau đó quản lý trong admin. Không có endpoint tạo owner công khai.
4. Mỗi admin thiết lập TOTP ở tài khoản, xác minh mã để lên AAL2; thử revoke editor và request kế tiếp. `getUser(jwt)` xác minh trên Auth mỗi request, membership query lại và RPC đặc quyền kiểm tra role.
5. Tạo Cloudflare Pages staging, build `npm ci && npm run build`, output `dist`, functions cùng repo; đặt secrets theo môi trường, `PUBLIC_ORIGIN` khớp origin không có slash cuối. `CHECKOUT_ENABLED=false` cho tới khi checklist nghiệm thu đạt. Không có deploy nào được thực hiện trong lượt này.
6. Turnstile: allowlist hostname và action `order`/`lookup`, cung cấp site key + secret. Request API qua Cloudflare để có `CF-Connecting-IP` đáng tin; không dùng X-Forwarded-For. Limiter DB lỗi thì fail closed. Local không được coi request tự thêm CF header là bằng chứng chống spam production.
7. Owner điền bank/refund/support/retention trong admin. Mọi lần đổi cấu hình tự khóa `release_verified`. Sau khi staging audit thực sự đạt, operator có quyền mới đánh dấu cờ đó bằng SQL đã review; không có nút tự bỏ qua kiểm thử trong UI. Chưa có script tự chứng nhận phát hành.
8. Chạy toàn bộ matrix anon/A/B/editor/owner trên REST, Storage, RPC, endpoints, real OAuth/logout/cancel, MFA, multi-isolate limiter, concurrent confirm/revoke, upload/signed URL. Ghi report cụ thể. Chỉ khi pass mới chuyển cờ CHECKOUT_ENABLED và release_verified.

Tham khảo chính thức đã dùng: [Vite](https://vite.dev/guide/), [Supabase PKCE OAuth](https://supabase.com/docs/reference/javascript/auth-signinwithoauth). Quota [Supabase](https://supabase.com/pricing), [Pages](https://developers.cloudflare.com/pages/platform/limits/), [Workers](https://developers.cloudflare.com/workers/platform/limits/) phải xác minh lại trước deploy; chưa có tài khoản để đo quota vận hành thực.

## Đối soát và giao kết quả

- Khách chọn gói, đồng ý xử lý dịch vụ; optional consent riêng ở portal, mặc định không cấp. Đơn tạo lấy giá/expiry/snapshot trong DB. Key idempotency ở bộ nhớ phiên gửi; retry không trả lại secret plaintext đã phát một lần. Nếu response mất trước khi khách lưu mã, dùng quy trình reset có xác minh; không khôi phục bằng code+phone.
- Mã bí mật 128 bit chỉ hiển thị khi tạo, không lưu browser storage hoặc URL. Chuyển khoản chỉ ghi code HC, không phone/secret. Claim không đánh dấu paid.
- Admin đối chiếu tiền thực, nhập tham chiếu, xác nhận đủ số tiền. RPC row-lock/version + unique reference chống double-confirm. Đơn quá48h cần lý do reconciliation; mở mục Tiền đến muộn trong admin để ghi lý do và tham chiếu. Luồng remote vẫn cần test staging.
- Soạn từ template, preview, draft hoặc publish revision mới; không render HTML. Publish cần paid và ≥501 từ; G50 cần MP4 private đã release. Tin nhắn copy chỉ có mã đơn và link tra cứu; người vận hành tự gửi Zalo/email, không có bot.
- Upload ở admin: reserve UUID/path server, signed upload vào private bucket; finish kiểm size/magic và giữ quarantine. Không có client SELECT storage và không có nút bypass release. Không coi magic-check là antivirus.
- Operator kiểm định: cài `video-template/requirements.txt`; PDF cần pypdf và `CLAMSCAN_PATH` trỏ scanner có cập nhật. Đặt `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ACCESS_TOKEN` qua secret manager/session environment, không command args/history. `python scripts/validate_attachment.py ATTACHMENT_UUID`. Công cụ xác minh Auth user, AAL2, membership; tải tệp vào temp, decode/re-encode ảnh và strip EXIF, transcode MP4/MP3 bỏ metadata; PDF scan + rebuild và scan lại; TXT strict. Chỉ sau đó upload sanitized path và RPC release. Thiếu scanner PDF vẫn quarantine. Quy trình cloud của CLI chưa chạy thật; cần test staging trước dùng khách thật. Không phân phối service key cho editor thường; operator giữ vai trò kỹ thuật tin cậy.
- File private URL 60s, lookup cookie Secure/HttpOnly/Strict 15 phút và CSRF token trong bộ nhớ. File URL chỉ trả đúng attachment/order, result phải published. Signed URL tải xuống dùng attachment; không đặt vào log/mail/history. Link không thu hồi bytes đã tải và có thể còn sống tối đa TTL sau revoke.
- Reset mã: owner xác minh qua kênh đăng ký + bằng chứng giao dịch tối thiểu, gọi endpoint admin/reset-secret với reason đã xác minh. Không có UI xem lại mã gốc. Mã mới hiện một lần, credential/session cũ bị thu hồi. Có màn hình cấp mã mới trong mục khôi phục của owner; chưa chạy xác minh khách thật.

## Consent và xuất bản

Portal lookup xác minh ba trường; quyền dùng ảnh dựng riêng, website, YouTube, TikTok tách biệt. Người 16–17 không thể cấp photo/public grant. Public derivative phải được kiểm định và xem preview đúng checksum/version. Quyền công khai ghi append-only; owner publish phải kiểm lại grant. Thu hồi dùng cùng lock order với publish, gỡ gallery và tạo external_removal_tasks cho nền tảng ngoài. Owner thực hiện gỡ ngoài hệ thống và lưu biên nhận; Có màn hình hàng đợi owner và biên nhận gỡ thủ công.

Không tự đăng YouTube/TikTok. Phê duyệt nền tảng ngoài chỉ là bản ghi approved, không khẳng định video đã đăng. Tệp riêng không dùng YouTube unlisted thay Storage. Ảnh nguồn, private result và derivative ở ba bucket riêng. Tệp released bất biến; thay đổi tạo asset mới và consent mới. Review chỉ sau delivered, một/đơn, pending moderation; duyệt không làm lộ PII, không tự tạo đánh giá.

## Video mẫu và dữ liệu

`public/assets/ho-sen-demo.mp4`: 36 giây, H.264 720p. Nguồn `video-template/render.py`, phụ đề VTT, WAV tự tạo; xem video thật sau render vì metadata không xác nhận đủ glyph. Hướng dẫn ở `video-template/README.md`, quyền tài sản ở ASSET_LICENSES. Nội dung bói tự viết ở corpus; các hệ lịch chưa có nguồn đã ghi mô phỏng. Dataset có API public chỉ published, draft private và published immutable; thay version không sửa snapshot lịch sử. Admin JSON cần đúng 12 slug và ≥501 từ/công cụ, source/license.

## Quota, backup, retention và rollback

- Kiểm tra DB/storage/egress/request thủ công hàng tuần. 70%: đánh giá dung lượng; 85%: dừng upload mới/khóa G50 hoặc khóa CHECKOUT_ENABLED tùy phạm vi; không xóa paid còn cam kết. Chưa có quota monitor tự động. Khi pause/lỗi mạng, API báo lỗi thật, không báo paid giả; engine local đã tải vẫn hoạt động.
- Daily kỹ thuật: backup DB (schema, data, roles theo công cụ được provider cho phép), private storage từng object + checksum, consent/audit/tombstone manifest; mã hóa AES-256-GCM hoặc công cụ mã hóa được owner kiểm soát, tách keys. Giữ vòng đời đề xuất30 ngày phải được owner chốt. Không có chức năng export khách trong admin.
- Restore staging: dừng ghi, restore DB/roles và objects, kiểm checksum, tái áp deletion tombstones phát sinh sau mốc backup, kiểm revoke consent/roles và RLS A/B, chạy API tests; ghi thời gian và kết quả. Chưa thực hiện restore Supabase thật. `docs/RESTORE_LOCAL_REPORT.json` chỉ chứng minh bài diễn tập synthetic PGlite/AES, không khôi phục identity/object provider.
- `retention_dry_run()` chỉ liệt kê ứng viên, không xóa. Mốc A15: paid delivered180 ngày, nguồn30 ngày, unpaid30 ngày sau expiry, audit180 ngày, consent đến180 ngày sau revoke. Code hiện có candidate dry-run đơn/ảnh nguồn/audit/consent thu hồi và cleanup technical TTL, chưa có tác vụ xóa toàn bộ storage/consent theo policy đã chốt; không tự chạy xóa. Trước live phải hoàn thiện và diễn tập cleanup với log tối thiểu/tombstone, giữ dữ liệu đang cam kết và retention liên quan.
- `expire_orders()` chỉ expired unpaid48h, không chạm paid. Cần scheduler do owner cấu hình sau staging; chưa có scheduler cloud chạy thật.
- Rollback bundle về artifact trước, giữ DB forward-compatible; không chạy migration down bằng drop/xóa dữ liệu. Migration mới cần backup và review. Khi nghi lộ key: khóa route liên quan, revoke sessions/key, giữ audit tối thiểu, xác định phạm vi, sửa và test trước mở lại.

## Điều kiện trước nhận tiền

Chưa được đánh dấu đạt nếu chưa có bằng chứng: cloud accounts/origin/SSL, real Google OAuth/MFA, bank đã xác minh, refund/support/retention đã chốt, full REST/Storage/RPC roles matrix, lookup challenge/timing/session/URL tests, concurrent multi-worker confirm/limiter/consent, sanitizer + scanner + private G50 download, quota operations, complete cleanup dry-run, encrypted backup/restore staging + rollback diễn tập, không lỗi security critical, owner xác nhận release checklist. Phần chưa triển khai UI/ops được ghi riêng trong IMPLEMENTATION_STATUS; không gán chúng cho lỗi thiếu credentials.
