## Mở module quản trị thủ công — 2026-10-28 +07

Nguyên nhân /admin không mở: MANUAL_DELIVERY_ENABLED=false trong wrangler.toml; production /api/delivery POST list trả403 thông báo preview. Browser đã tới /admin nhưng không tải được danh sách; không phải bằng chứng sai password. Thay duy nhất flag manual=true; PUBLIC_PREVIEW_ONLY=true, CHECKOUT_ENABLED=false giữ nguyên. Endpoint vẫn kiểm JWT/password AMR, owner backend, Origin, rate limit và private storage. Không mở paid API hoặc cấp thêm role.

Regression tests/integration/manual-release.test.ts: trước đổi flag FAIL exit1; sau sửa PASS. Format/lint/typecheck/build/check:secrets exit0; unit52 PASS, integration80 PASS; playwright tests/e2e/manual-delivery.spec.ts 5 PASS exit0 (fixture local). Full E2E chưa chạy lại. Source wrangler.toml và test mới; log ngoàiGit .admin-open-20261028.

Trạng thái PARTIAL: đang chuẩn bị push/rebuild để kiểm tra cloud /admin, tạo/lưu/sửa và tra cứu dữ liệu giả. Chưa đánh dấu cloud CRUD/video PASS trước thao tác thực tế. Cloud migration014/private bucket/RLS đã được kiểm tra vòng trước; không chạy lại migration. Mật khẩu do chủ tài khoản tự đặt, không đọc/ghi credential. Tiếp theo xác minh deployment và browser phiên password hiện tại, kiểm thử tạo bài giả rồi tra cứu; rollback manual=false nếu bảo vệ sai. Không đổi ACL, payment, RLS hoặc xóa đơn cũ.

---

## Sửa lỗi đổi mật khẩu bị MFA cũ chặn — 2026-10-28 +07

Nguyên nhân đã xác minh trong Supabase Auth logs: PUT /user trả 401, AAL2 required khi tài khoản còn MFA. Frontend trước đây ném Error rỗng nên che nguyên nhân. Không phải bằng chứng mật khẩu nhập sai. HC-AUTH-PASSWORD: PARTIAL; đổi mật khẩu và đăng nhập thật chưa được xác minh.

Đã sửa src/features/manual/SetAdminPassword.tsx để giữ mã lỗi; thêm src/lib/password-error.ts ánh xạ whitelist thông báo ngắn, không in raw provider message/token. tests/unit/password-error.test.ts có 4 regression: MFA, phiên hết hạn/reauth, mật khẩu yếu/trùng, không lộ thông báo tùy ý. Trước sửa 3 FAIL/1 PASS exit1; sau sửa toàn bộ 52 unit PASS, 78 integration PASS exit0. Format, lint, typecheck, build, check:secrets exit0. Lint lần đầu exit1 do helper import chưa dùng, đã sửa và chạy lại PASS. Chưa chạy lại E2E vòng này; test local không chứng minh cloud đổi mật khẩu thành công.

Chủ tài khoản xác nhận gỡ MFA cũ CHỈ tài khoản quản trị trong câu trả lời trực tiếp; đã thực hiện Remove MFA factors trong Supabase Dashboard. Không thay MFA policy toàn cục, RLS, quyền owner, dữ liệu đơn hoặc guards. Cần kiểm tra số factor còn lại và chủ tài khoản tự nhập/submit mật khẩu mới; không ghi credential vào source/Git/reports. Không mở nhận tiền hoặc manual delivery.

Tiếp theo: xác minh gỡ MFA, chủ tài khoản lưu password mới trên /admin/dat-mat-khau, thử login admin và refresh session; sau đó QA cloud CRUD/video/lookup trước mở module. Không tự thay mật khẩu, DROP dữ liệu, đổi ACL hoặc bật thanh toán. Source đã chuẩn bị commit/push; trạng thái deployment cần kiểm chứng sau push. Log local ngoàiGit tại .password-aal-20261028. Chạy Windows npm run dev; build/test theo package.json. Không tái chạy migration001–014 trên cloud.

---

## Sửa nhập nhầm tên tài khoản — 2026-10-28T01:58:48+07:00

Browser production cho thấy usernameIsAdmin=false và ngay cả trim/lowercase vẫn không phải admin. Không đọc/ghi giá trị tên người dùng đã nhập hoặc mật khẩu. Đã điền lại alias admin trên form, không submit credential, không đổi password. Chưa xác minh đăng nhập thành công. Trang /admin/dat-mat-khau vẫn có phiên xác minh và form để chính chủ tài khoản tự nhập/lưu mật khẩu; agent không thực hiện bước thay credential.

src/features/account/Account.tsx: cố định alias admin bằng hằng số và readonly input; submit luôn dùng alias server, tránh lỗi nhập nhầm/autofill. Không thay backend Auth, role, MFA legacy hoặc feature/payment guards. User yêu cầu đơn giản và tự chọn mật khẩu; không nhúng hoặc lưu giá trị mật khẩu vào source/Git/reports. Bước lưu password phải do người dùng tự nhập và bấm lưu trên website; không tuyên bố đã cài password.

Regression mới tests/e2e/admin-login.spec.ts: trước sửa FAIL vì input editable(exit1); sau sửa một assertion fixture mong có API payload thất bại vì local auth null đóng an toàn, đã sửa test theo phạm vi UI readonly và xóa password sau lỗi, không bỏ guard Auth. Cuối cùng 3/3 targeted E2E PASS(exit0). Format/lint/typecheck/build/check:secrets exit0, 48 unit PASS, 78 integration PASS. Không chạy lại full53 E2E; vòng trước full52 PASS là lịch sử. Log .login-alias-20261028 trênC ngoàiGit.

Cập nhật source/test và đủ bốn báo cáo, giữ lịch sử. Không thay database/Storage, không mở MANUAL_DELIVERY_ENABLED hoặc thanh toán, không reset người dùng. HC-SIMPLE001/002 vẫn PARTIAL/NOT_TESTED cloud password→CRUD→lookup. Tiếp theo: chủ tài khoản tự lưu mật khẩu và đăng nhập bằng admin, rồi kiểm chứng phiên thực trước bật riêng module và QA cloud. Không đoán/đọc password mới hoặc tái sử dụng credential chat trong code.


---

# Huyền Cảnh tối giản — 2026-10-28T01:30:59+07:00

## A. Tổng quan
IN_PROGRESS; local READY_FOR_QA, cloud PARTIAL. Source dựa trên 74426eb; chưa tuyên bố đầy đủ production VERIFIED hoặc tăng tỷ lệ hoàn thành. Chủ dự án bỏ đăng ký khách/Google UI, chỉ cần admin → mã + chữ/video → tra cứu. Thanh toán giữ khóa. Migration014 đã được duyệt và áp dụng cloud; feature mới vẫn MANUAL_DELIVERY_ENABLED=false chờ mật khẩu mới và nghiệm thu thực tế. Không cần chốt hoàn tiền để dùng workflow thủ công miễn thanh toán này; blocker hoàn tiền cũ chỉ thuộc checkout cũ.

## B. Đã thực hiện
- src/features/account/Account.tsx: chỉ admin/mật khẩu/nút Đăng nhập/lỗi ngắn; không hồ sơ/Google/TOTP/hướng dẫn kỹ thuật. Bỏ CTA lưu lịch sử khách và đổi link điều hướng thành Quản trị. Không xóa dữ liệu khách cũ.
- src/features/manual/ManualAdmin.tsx: tạo mã server, danh sách 50 mục/trang, soạn/sửa chữ, chọn/tải MP4≤20MB, lưu với version, xóa mềm. Bản nháp không lookup; request_id tránh tạo trùng khi retry.
- src/features/manual/ManualLookup.tsx: một mã, không login; text escaped, video riêng tư, xóa nội dung cũ khi đổi mã, chống response cũ ghi vào mã mới.
- functions/api/delivery.ts: Origin/JSON/body limit, getUser xác minh JWT + password AMR + owner active, không dựa role client; capability256bit/HMAC/lookup rate limit, Storage PRIVATE và file size check, reservation theo đơn/magic MP4, signed read60s, version409, lookup không trả row IDs/codehash/paths. Workflow mới không yêu cầu TOTP; API paid cũ vẫn giữ MFA/guards.
- supabase/migrations/202610280014_manual_delivery.sql: hai bảng RLS, revoke anon/authenticated, service_role server-only, private bucket manual-results20MB. Chủ dự án đã cho phép apply riêng014 bằng BEGIN/COMMIT; không run lại001–013, không sửa/xóa orders/Auth users cũ. Cloud metadata xác minh cả hai bảng RLS=true, anon_any_access=false, authenticated_any_access=false, policies0; bucket public=false/20971520 bytes.
- Supabase Dashboard: đã tắt Allow new users to sign up, giữ Email enabled. Google provider còn bật tạm thời để không khóa đường phục hồi trước mật khẩu mới; không còn Google button hoặc customer signup UI. Không xóa identities/MFA factors.
- Trang riêng /admin/dat-mat-khau cho chủ tài khoản tự đổi mật khẩu trong phiên đã xác minh/recovery; xóa fragment token trước xác minh, không prefill/ghi secret. SIMPLE_ADMIN_SETUP.md hướng dẫn Dashboard, migrations/activation/rollback. Mật khẩu từng chia sẻ phải thay; agent chưa tự đặt credential.
- README_START_HERE, AGENTS, DECISIONS, IMPLEMENTATION_STATUS, ADMIN_LOGIN_SETUP, export-migrations, wrangler và các tests cập nhật tương ứng. Old lookup giữ /tra-cuu-cu; DEMO cũ chỉ DEV. Không thêm dịch vụ trả phí.

## C. Kiểm tra chức năng
| Hạng mục | Local | Cloud |
|---|---|---|
| Form login tối giản, lỗi ngắn, không customer UI | PASS E2E | Chờ deploy mới |
| Owner/password backend, anon/non-owner/OAuth bị chặn | PASS integration fixture | NOT_TESTED password session thật |
| Tạo mã/retry/list/nháp | PASS integration+E2E mock | NOT_TESTED |
| Lưu/sửa/xóa mềm/version409 | PASS integration+E2E mock | NOT_TESTED |
| Upload MP4/private path/magic/public-bucket refusal | PASS integration fixture; UI input PASS | NOT_TESTED upload Storage thật |
| Tra cứu đúng/sai/nháp/xóa/text an toàn | PASS integration+E2E mock | NOT_TESTED endpoint live |
| Phát video | PASS browser sample MP436s trong test | NOT_TESTED video private cloud |
| RLS bảng mới và private bucket | PASS PGlite | PASS metadata cloud, không phải full API permission matrix |
| Khách không đăng ký | Không UI signup | PASS Dashboard switch saved off |
| Thanh toán | Guards cũ regression PASS | Không mở checkout |
| Đổi mật khẩu qua email hồi phục | Chặn form khi không session PASS E2E | NOT_TESTED, cần chủ tài khoản |

## D. Kiểm thử
48 unit PASS, 78 integration PASS, full52 E2E PASS(exit0); trước đó full51 và targeted5 cũng đạt. 8 test mới integration:7 API fixture+1 PGlite RLS/migration;5 E2E mới cho form/admin/lookup/denied/recovery. Regression G20 đã kiểm từ vòng trước được đưa kèm để bảo vệ đơn paid cũ. Không bịa fixture thành cloud upload/sign-in PASS.

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run test` | 0 |
| `npm run test:integration` | 0 |
| `npm run build` | 0 |
| `npm run check:secrets` | 0 |
| `npm run prepare:database` | 0 |
| `npm run test:e2e` (full cuối) | 0 |
| `npm run test:e2e -- --grep minimal/account/admin/lookup/password` (targeted5) | 0 |

Các lỗi trong lúc triển khai đã sửa: lint hàm Admin cũ không dùng/prefer-const; lỗi cú pháp ghép effect trang đặt mật khẩu khiến format/type/build fail trước khi sửa. Sau sửa đã chạy lại toàn bộ format/lint/type/unit/integration/build/scan và full E2E. Cảnh báo chunk build/NO_COLOR còn; không phải test failure. Lần đọc git diff ở thư mục cha không phải repo đã sửa sang checkout; không phải lỗi app. Logs/screenshots ngoài Git C:/Users/User/Downloads/boi/.manual-simple-20261028. Ảnh admin/lookup mang fixture, không phải đơn khách thật.

## E. Lỗi/blocker
HC-SIMPLE001 P1 BLOCKED: chưa có mật khẩu mới được chủ tài khoản tự đặt/nghiệm thu; MANUAL_DELIVERY_ENABLED=false. Không dùng lại mật khẩu chat. HC-SIMPLE002 P1 NOT_TESTED: cloud login→create→upload→save→lookup→edit→delete, signed URL expiry và permission matrix HTTP. HC-SIMPLE003 P2: upload dở/video cũ còn PRIVATE; chưa dọn tự động, cần theo dõi quota Free. Xóa mềm không thu hồi link đã ký ngay, tối đa60s. Magic ftyp không xác minh mọi codec/virus; chưa có scanner, không gọi scannerPASS.

## F. Còn thiếu
Thử mật khẩu mới, recovery email, private upload/playback thực tế và nghiệm thu endpoint cloud sau activation có kiểm soát; Google provider cloud cần tắt sau khi password ổn. Quota Supabase Free hữu hạn, không bảo đảm lưu vô hạn. Không thay các tính năng ngoài phạm vi để đóng blocker cũ giả tạo. Feature flag hiện tắt, không coi UI triển khai là dịch vụ sử dụng được đầy đủ.

## G. Chủ dự án thực hiện
Chủ tài khoản tự đặt mật khẩu mới qua Dashboard Send password recovery hoặc phiên đã xác minh tại /admin/dat-mat-khau; không gửi mật khẩu/OTP/link recovery vào chat. Migration014 đã apply, KHÔNG chạy lại. Không cần cấp lại owner hoặc ngân hàng. Hướng dẫn từng bước SIMPLE_ADMIN_SETUP.md. Sau xác nhận password mới có thể bật riêng workflow thủ công để QA, giữ paid checkout khóa.

## H. Tiếp theo
Đồng bộ source D, commit/push có chọn lọc, kiểm artifact public. Chủ tài khoản đặt mật khẩu mới, đăng nhập; bật MANUAL_DELIVERY_ENABLED riêng và kiểm cloud với dữ liệu giả/permission đầy đủ trước tuyên bố hoàn tất. Không nới RLS, không xóa Auth user, không run lại migrations001–014, không thay secrets/pepper/ACL. SQL Editor chưa reconcile CLI ledger.

## I. Kiểm tra
D:/boi: npm run dev -- --port5187; build rồi npm exec wrangler -- pages dev dist --port8788 --ip127.0.0.1 cho API local; test chạy qua Playwright config. /tai-khoan login, /admin workspace, /tra-cuu một mã. Không có credential mặc định trong source. Cloud mới vẫn flagfalse; sourceguide mô tả cách activate/rollback bằng Git để tương thích Wrangler-managed Pages.


---

## Kiểm tra đăng nhập thật — 2026-10-28T00:37:58+07:00

Trạng thái HC-ADMIN001/002: PARTIAL/BLOCKED mật khẩu thật, KHÔNG PASS đăng nhập. Browser production Chrome /tai-khoan nhập alias admin thành công, form không crash; thử đúng thông tin do chủ dự án cung cấp một lần, nhận thông báo Tài khoản hoặc mật khẩu không đúng, vẫn ở form login và không có link quản trị. Không lưu mật khẩu vào file/log/report. Không nhận được session thành công. Phản hồi này chưa phân biệt sai mật khẩu, password chưa được đặt hay cấu hình Email/password provider; không bịa nguyên nhân provider cụ thể.

Bản sửa trước chỉ tạo form/endpoint; agent CHƯA thiết lập mật khẩu thật trên Supabase. Vì thế không thể coi alias admin là credential đã sẵn sàng. Phiên IAB đang đăng nhập từ trước vẫn còn, có form Đặt mật khẩu cho tài khoản của bạn; đã giữ phiên này, không đăng xuất, không xóa user/factor, không đổi mật khẩu bằng agent. Chủ tài khoản cần tự nhập và lưu mật khẩu trong phiên đó rồi thử lại; đây là bước thay credential cần người dùng trực tiếp thao tác. MFA và checkout guards giữ nguyên.

PASS browser nhập username không lỗi; FAIL đăng nhập bằng thông tin được cung cấp trong lần thử này; NOT_TESTED đăng nhập thành công/refresh/AAL2. Bằng chứng screenshot login-rejected.png ngoài Git tại C:/Users/User/Downloads/boi/.admin-retest-20261028. Không sửa app hoặc deploy trong vòng kiểm tra này. Không chạy lại format/lint/typecheck/build/unit/integration/E2E vì không thay mã nguồn; số test vòng trước là lịch sử, không tính PASS mới.

Đã cập nhật bốn báo cáo, giữ lịch sử. Tiếp theo: chủ tài khoản tự Lưu mật khẩu tại https://huyencanh.pages.dev/tai-khoan (không đăng xuất trước), rồi kiểm tra lại đăng nhập/session bằng phiên riêng. Nếu Supabase báo lỗi khi lưu, ghi đúng thông báo để xử lý; không bypass Auth/RLS/MFA hoặc dùng mật khẩu nhúng.


---

# Đăng nhập riêng cho admin — 2026-10-28T00:27:00+07:00

## A. Tổng quan
IN_PROGRESS. Source dựa trên commit 1f8750f, chưa nghiệm thu đăng nhập mật khẩu production. Bỏ khởi tạo Google login trên giao diện theo yêu cầu mới. Chưa mở nhận tiền, không thay đổi RLS/MFA hoặc dữ liệu đơn. Không tăng tỷ lệ hoàn thành vì còn gate cloud.

## B. Công việc
- src/features/account/Account.tsx: form tài khoản/mật khẩu, không prefill password; người đã đăng nhập tự đặt mật khẩu và mở /admin. MFA chỉ hiện sau đăng nhập. Giữ hồ sơ/lịch sử cũ, không xóa user.
- src/lib/auth.ts: gọi POST /api/admin-login, setSession qua Supabase SDK; không signInWithOAuth.
- functions/api/admin-login.ts: Origin/JSON/body limit/no-store, consume_limit, alias admin ánh xạ tới duy nhất một owner active từ DB server, xác thực mật khẩu bằng Supabase, kiểm UUID session trả về. Không chứa mật khẩu thật, không trả email/service key. Trường hợp nhiều owner đóng an toàn.
- functions/_middleware.ts: chỉ ngoại lệ tuyến xác thực mới; guard admin/đơn/lookup giữ nguyên. src/main.tsx bỏ thông báo yêu cầu đăng nhập Google, giữ callback cũ tương thích phiên đang dở. Không tự tắt Google provider cloud trước nghiệm thu password.
- ADMIN_LOGIN_SETUP.md, DECISIONS.md: cách chủ tài khoản tự đặt mật khẩu và quyết định mới. Không thêm backend thứ hai, không cần biến môi trường mới.

## C. Chức năng
| Hạng mục | Trạng thái thực tế |
|---|---|
| Form admin, không nút Google, password rỗng/ẩn | PASS E2E local |
| Origin, giới hạn thử, membership, owner mơ hồ, token khác UUID, payload lớn | PASS integration mock |
| Supabase mật khẩu thật/refresh session | NOT_TESTED cloud |
| MFA AAL2, quyền admin và dữ liệu khách | Giữ cơ chế cũ; NOT_TESTED cloud vòng này |
| Tạo đơn, tiền, trả bài và lookup production | BLOCKED/không mở checkout |
| Dữ liệu hồ sơ/lịch sử/đơn cũ | Không migration/xóa; không tuyên bố cloud regression PASS |

## D. Kiểm thử
Format/lint/typecheck/unit/build/scan đều exit 0; unit 48/48, integration 70/70. Thêm 7 integration tests admin-login và 1 E2E form admin. Full E2E lần đầu trong sandbox không khởi động server, bị dừng (exit 1); retry đủ 47 bài có 46 PASS/1 FAIL do API proxy 127.0.0.1:8788 chưa chạy, JSON rỗng ở /api/config. Khởi động wrangler pages dev local với preview=true/checkout=false, chạy lại bài lỗi và bài admin mới: 2/2 PASS, exit 0. Không gọi full suite 47/47 một lượt PASS. Không giảm bảo mật hoặc sửa bài test cũ để che lỗi.

Trong lúc đổi alias sang chọn một owner DB, fixture có 1 FAIL do vẫn mong 401 thay vì 503 khi không có owner; sửa kỳ vọng đúng fail-closed, sau đó toàn integration 70 PASS. Logs .admin-login-20261028 ngoài Git trên C. Cảnh báo chunk build và Vite proxy khi API chưa mở được ghi nhận. Kết nối browser CUA bị đóng nên chưa kiểm tra DOM production vòng này.

## E. Lỗi/blocker
HC-ADMIN001 P1 PARTIAL: người dùng phải tự đặt mật khẩu trong phiên Auth hiện có; agent chưa đặt hoặc kiểm tra mật khẩu thật. HC-ADMIN002 P1 NOT_TESTED: Email/password provider và sign-in/refresh/MFA thực tế trên Supabase. Nếu không còn phiên, dùng Dashboard recovery của đúng owner; không tự cấp admin mới.

## F. Còn thiếu
Cloud password QA, MFA, permission matrix đầy đủ, order/lookup/backup-restore và các blocker release cũ. Google provider cloud chưa tắt, UI không cung cấp Google login; chỉ tắt provider sau khi xác minh đường đăng nhập mật khẩu để tránh khóa owner. Không coi alias admin là đã có password.

## G. Chủ dự án thực hiện
Tự nhập mật khẩu vào mục Đặt mật khẩu cho tài khoản của bạn rồi Lưu mật khẩu. Không gửi lại mật khẩu/OTP. Giữ phiên cũ, thử đăng nhập admin trong cửa sổ riêng tư. Nếu Supabase tắt Email provider thì bật password sign-in; không cần bật đăng ký công khai. Không đổi ngân hàng, ACL hoặc khóa khác.

## H. Tiếp theo
Đồng bộ source D và GitHub theo phạm vi sửa; xác minh artifact public sau deploy, rồi chủ tài khoản tự đặt mật khẩu. Kiểm thử phiên/quyền cloud trước mở checkout. Không tự tắt MFA.

## I. Kiểm tra
D:/boi: npm run dev -- --port 5187; npm exec wrangler -- pages dev dist --port 8788 --ip 127.0.0.1 cho API local, không thêm cloud secrets vào fixture. /tai-khoan là form admin, /admin vẫn cần membership+AAL2. Hướng dẫn ADMIN_LOGIN_SETUP.md. Không có mật khẩu admin mặc định nhúng trong source.


---

## Sửa QR MFA — 2026-10-27T23:53:53+07:00

Nguyên nhân đã xác định trong SDK cài đặt: Supabase auth-js thêm tiền tố data:image/svg+xml;utf-8 vào qr_code, trong khi Mfa.tsx bọc thêm tiền tố data URI và encode toàn bộ lần nữa. Trình duyệt nhận nội dung không phải SVG nên ảnh hỏng. Bấm thiết lập lại gặp friendly name trùng vì lần enroll đầu đã tạo factor chưa xác minh.

Đã sửa src/features/account/Mfa.tsx và thêm src/lib/mfa-qr.ts: chuẩn hóa raw SVG/data URI, không bọc lồng; khóa nút khi đang tạo/đã có QR. Thêm nút Làm lại thiết lập chưa hoàn tất để chính người dùng bỏ factor TOTP unverified mang đúng tên ứng dụng; không xóa verified factor, không tự thực hiện trên tài khoản người dùng. Không giảm MFA/RLS hoặc thay checkout.

Regression tests/unit/mfa-qr.test.ts: 3 test tái hiện trước sửa đều FAIL (exit 1), sau sửa toàn bộ unit 48/48 PASS, integration 63/63 PASS. Format/lint/typecheck/build/check:secrets đều exit 0. Chưa chạy E2E QR tương tác trong vòng này; chưa xác minh QR mới hoặc mã TOTP thật trên production. Không lưu QR, OTP hoặc secret thật trong test/report. Bằng chứng lệnh/log ngoài Git .mfa-qr-fix-20261027 trên C.

Trạng thái local PASS; production QR/AAL2 NOT_TESTED chờ deployment và chủ tài khoản tự thao tác. Chưa mở nhận đơn thật. Owner/backend đã cấu hình theo báo cáo vòng trước. Không tự thay chính sách hủy/hoàn hoặc retention trong bản sửa QR.


---

## Chuẩn bị backend nhận đơn — 2026-10-27T11:40:35+07:00

Trạng thái IN_PROGRESS/BLOCKED nhận đơn thật. Đã lưu sáu Secret trên Cloudflare Production: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_ORIGIN, LOOKUP_PEPPER_V1, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY. Không ghi giá trị khóa vào source hoặc báo cáo. Turnstile Managed cho huyencanh.pages.dev, pre-clearance tắt. Chưa nghiệm thu deployment mới nhận các runtime Secret này.

Sau xác nhận trực tiếp của chủ dự án, đã cấp owner cho UUID tài khoản đã đối chiếu với Auth và ghi audit. Không cấp quyền từ email do trình duyệt gửi. MFA AAL2 vẫn bắt buộc; chờ chủ tài khoản tự thiết lập TOTP và xác minh phiên trên trang tài khoản. Không lưu OTP hoặc QR TOTP.

PASS kiểm tra cloud RLS hồ sơ bằng SET LOCAL ROLE authenticated với claims thử và ROLLBACK: người B không đọc/sửa hồ sơ owner; owner đọc được hồ sơ chính mình. Đây là kiểm tra SQL, KHÔNG thay cho hai phiên Google thực hoặc kiểm thử toàn bộ API/admin/Storage.

Chủ dự án chốt hủy trong 15 phút từ khi đăng ký; còn thiếu tỷ lệ hoàn, thời gian xử lý và trường hợp hủy sau 15 phút khi chưa làm. Chưa tự đặt chính sách không hoàn tiền. Chủ dự án chọn không có thời hạn lưu; chưa sửa migration hoặc áp dụng chính sách mới lên cloud. Các RPC dry-run hiện vẫn liệt kê ứng viên 30/180 ngày, chưa có xác minh quy trình xóa/backup. TTL bảo mật, phiên tra cứu và thời hạn thanh toán phải giữ nguyên.

PUBLIC_PREVIEW_ONLY=true, CHECKOUT_ENABLED=false; chưa mở nhận tiền. Tạo đơn thật → xác nhận thanh toán → trả bài → tra cứu trên cloud: NOT_TESTED. Backup/restore, MFA API, signed URL và quyền truy cập chéo đơn cần nghiệm thu trước release_verified. Không có test/build mới trong vòng chỉ cấu hình này; kết quả 45 unit/63 integration/2 E2E của vòng G20 trước giữ phạm vi cũ, không tính là kiểm thử mới.

File cập nhật vòng này: bốn CODEX_*.md. Bằng chứng tên cấu hình và kết quả SQL nằm ngoài Git tại C:/Users/User/Downloads/boi/.checkout-ready-20261027/preparation.json, không có giá trị secrets. Không sửa mã ứng dụng, không push hoặc triển khai source mới trong vòng cấu hình này.

Tiếp theo: người dùng hoàn tất MFA và chốt chi tiết hoàn tiền; triển khai lựa chọn retention bằng migration bổ sung và test, giữ TTL kỹ thuật; kiểm thử backend/deployment với cấu hình mới, kiểm thử đầy đủ quyền/đơn/lookup và diễn tập khôi phục. Không chạy lại migration 001–013; không đổi ngân hàng, ACL, khóa hay mở release để bỏ qua gate.


---

## G20 test — 2026-10-27T11:19:37+07:00

LocalPASS:45unit/63integration/2E2E,format/lint/type/build/scan. Testmới g20-lifecycle.test.ts (PGlitedisposable) điđủquote/idempotency/claim/notpaid/confirmretry/drafthidden/staleversion/publish/secretlookup20k; khôngcloudmutation. BrowserDEMOđúng/saimãvàreloadPASS. Productiongói20khiểnthị,checkoutfalse/publicpreviewtrue,orders+lookupPOST403:no-store;realcloudendtoendBLOCKED, khôngmởkhóa. XemG20_TEST_REPORT.md; testdataDEMOkhôngphảiđơnthật. Cácblockertrướcgiữnguyên, testscreenshot/logC .g20-test-20261027ngoàiGit. KhôngđổiACL/secret/ngânhàng/Admin/Supabase; khôngchạylạimigrationcloud.

---

## Production profile — 2026-10-26T22:24:07+07:00

Production now deploymentba575c3a-fb13-4867-a9a4-bc33b3b0fbbd/commitcfab3b8, buildcommand publicURL/key đãrebuild success. UserGoogleđãlogin thực quaIAB; saveprofile/readback vàsessionreloadPASS. Khôngđọctoken hoặcghiPII. NguyênnhânsavefailPGRST205/publicschemaempty. SAUxácnhậnrõcủaownerđãapplytransaction001–013lênprojectwutxklvvimwopckfjmga: Success,25tables,schema13,RLStrue,4privatebuckets,releasefalse,noadmin. Khôngrunlạifileghép; SQL Editor khôngtựCLIledger.

Backend PUBLIC_PREVIEW_ONLYtrue/CHECKOUTfalse; orders/auth APIs riêngkhóa, profile/historyquaRLSbrowser. Anon4tableslimit0denied401/42501; A/B/MFA/admin/lookup/signedURL/consent/restoreNOT_TESTED. Bằngchứng/screenshotprofileprivateC .oauth-production-20261026, khôngcommitPII. Giữ4reportvàlịchsử; khôngđổisecret/ACL/pepper/ngânhàng/cấpadmin/mởrelease hoặcxóaAuthuser. Sourcekhôngsửa nênkhôngcommitmới trongvòngnày.

---

## OAuth — 2026-10-26T02:30:32+07:00

OAUTH_DIAGNOSIS.md là hướng dẫn mới nhất. Production bundle authnull, CF envVITE Secret chưa vào artifact; deployment3cd559c đúng snapshot dù repo tênhuyencanh. Không reveal key. AliasVITE_SUPABASE_PUBLISHABLE_KEY mới ưu tiên ANON, SDK hỗ trợ sb_publishable_; auth-config rejectserverkeys và giữpublicPreview. Callback vẫnPKCE /auth/callback exchange→/tai-khoan. Publicbuild xóa cảalias. Test8mới, toàn45unit/62integrationPASS cùngbuild/type/lint/format/scan. C sourcecopyhashD; backups/logs .oauth-evidence-20261026 trênC. Chưa push/deploy, productionloginNOT_TESTED. Không tự bỏAuthgate/đổiMFA/RLS/checkout/secret/ACL; cầnownercloudsetup và QA. Cậpnhật4reportsauphiên.

---

## GitHub sync — 2026-10-26T00:10:36+07:00

Repository https://github.com/dywab0411/huyen-canh nhánh main; source commit 881e7a812dad2337609bf73eb8ca91cba40341f4 push thường đã xác minh. Checkout push C:/Users/User/Downloads/boi/.github-sync-20261026; source chuẩn D:/boi. 179 files, source manifest và checks/ZIP trong .github-sync-evidence-20261026 ở C; full-history bundle huyen-canh-main-before-20261026.bundle đã verify. Git local D không reset/rebase hoặc thay remote.

Unit37/integration62 và format/lint/typecheck/publicbuild/artifact/secrets mới PASS; E2E không chạy lại. Chỉ đồng bộ source, không thay logic. Bốn báo cáo thêm trong commit tài liệu tiếp theo. Auth/RLS/Storage/checkout cloud chưa nghiệm thu; public-onlytrue/checkoutfalse. Không force push/xóa repository/chạy migration cloud/đổiACL/secret/ngân hàng hoặc xóa đơn. Hướng dẫn kết nối Supabase/Free deploy giữ nguyên. Tiếp tục kiểm remote CI/cloud trước khi tuyên bố deploy.

---

## Supabase setup — 2026-10-25T23:29:50+07:00

Đọc SUPABASE_SETUP_GUIDE.md trước khi thao tác cloud. Kiến trúc React/Vite + Pages Functions server-only service_role + Supabase Auth/Postgres/Storage. Migration001–013 nguyên vẹn; marker13. Public-only guard bật mặc định trong bộ chuẩn bị, checkout=false. RLS riêng profile/history; đơn/credential/RPC qua backend; bốn bucket PRIVATE; admin membership+AAL2; signed URLs60s; quyền công khai exact revision không lấy từ hai câu video.

Đã kiểm local unit37/integration62/E2E46, không thay thế cloud. SQL export chỉ file local, VERIFY_STAGING chỉ metadata. Chưa run migration/owner bootstrap/cloud OAuth/MFA/Storage/restore. SQL Editor không ghi CLI ledger tự động. Tiếp theo owner xác nhận project rỗng và SQL riêng rồi staging QA anon/A/B/editor/owner. Env matrix trong guide. Không tự chạy cloud SQL, mở checkout/release, đổi ACL/secrets/pepper/ngân hàng, xóa đơn hoặc sửa snapshot. Giữ bốn báo cáo và lịch sử.

---

# CODEX_HANDOFF.md

## MỚI NHẤT — 20261025-deploy-free-v8 — 2026-10-25T23:29:26+07:00

D:\boi làsourcechính, app0.1.0; Gitmainstage178file, chưa commit/remote/privatevisibility. Đọc DEPLOY_FREE_GUIDE vàbáocáomới trước lịch sử. ChưaURLpublic, chưa deploy; authstatus ởdocs/deploy-free/20261025/cloud-access.json khôngghi keys/accountID.

Kiếntrúc: React/Vite→Pagesstatic, Functions /api/*→Supabase khi đủQA. `public/_routes.json` giữstaticngoàiFunctions. `functions/_middleware.ts` khiPUBLIC_PREVIEW_ONLY=true trảreadonlyDTOconfig/packages/library/public vàchặnwrite/privateAPI trướcnext/DB. Khônggiảmguardlive; normalbackendpathfalsevẫnquaOrigin/Auth/MFA/CSRF/limiter/version/consentcũ.

`npm run build:public-preview` buộcVITE_PUBLIC_PREVIEW_ONLY=true,blankSupabasefrontendenv,bỏQRpaymenttrongdist,tạorelease-profile.json. Routes datdon/lookup/account/admin/callback chỉPublicPreviewNotice,authclientnull. Normaldev khôngcờVITEvẫngiữDEMO/formpreview/DDMMYYYY/HH:mm. Đừngdeploynormalbuildthaypublicprofile. `check:deploy` size/count/no credentials/noDEMO/routes +artifacthash; đây khôngphảiđãdeploy.

Wranglerdefault `[vars]`PUBLIC_PREVIEW_ONLY=true/CHECKOUT_ENABLED=falsean toànchoGitbuild. Khôngđổisangfalseđểgiảnghiệmthu. Browserproductionlocal http://127.0.0.1:8796 đãchạy12tools/video/privatepagesnoinput/API403/no-store/0UIpost/CSP0. Localdev5173khôngthaybằngproductionprofile. CópublicWorker8796,khôngdừngtiếntrìnhkháckhichưaxácminh.

DB:13migrationkhôngsửa; `prepare:database` ghéprelease/supabase-new-staging.sqltrongtransactionchoNEWprojectonly,chưa thực thi. SQLEditor khôngtựledgerCLI; cảnhbáoreapplytrongguide. VERIFY_STAGING chỉmetadataRLS/bucketprivate/schema13/deniedgrants; khôngthayrealA/B/editor/ownerHTTP/Storage/OAuth/MFA/restore. FreepreviewkhôngcầnsecretsSupabase.

Repo:prepare-repository --init stageallowlist source/prompts/migrations/tests giả/assetslicensed/docsMD; logs/backups/envs/screenshots/release/node_moduleskhôngstage. Khôngcommit/push/autoremote. KhôngGitglobalconfig; safe.directorychỉpercommandđúngroot. CIUbuntu/Chromium/Node24/read-onlypermissions/concurrencytimeout cấu hìnhnhưngremoteNOT_TESTED. BudgetActions0doownerkiểm; khôngtựpaid.

ChecksD:unit37,integration62,E2E46,media4+2,Functionsbuild/publicbuild/artifactcheck/databaseexport/audit(0vulns)đạt. Npmci292packagesCđãchạy. Logs/manifests/backupzip docs/deploy-free/20261025; khônggiảinénbackuptests vào repo. SourceGitstagekiểmlạisau4report; auditjsonngoàiGit.

Ưutiên: chủaccountloginGitHub/Cloudflare/Supabase→Private+Freeproject→Gitbuildpublicprofile→verifyURLHTTPSthật→staging13/OAuth/MFA/RLS/privatefiles/consent/restore→ownerduyệtpaidriêng. HC-DEPLOY001–004 vàcácblockerORD/BIRTH/RPT/LIBkhôngmấtđi. Khôngđoáncredentials/dùngtemporaryaccount/nângplan/thêmthẻ/đổiACL/rotatepepper/xóaorder/snapshot. Mỗi phiênsourcevẫncậpnhật4report.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## MỚI NHẤT — 20261025-preview-v7 — 2026-10-25T18:08:42+07:00

Source D:\boi PID35444,revision2026-10-25-preview-v7; Vite5173/Worker8788. OrderPreview.tsx là summary local khi checkoutfalse, không phải tạođơn. OrderPage lưuwhitelist trongReactstate,focus/scrollsummary vàclear khi formonChange; khôngstorage/API/autoảnh. Textchưa tạođơn/không chuyển tiền rõ; bỏbuttondisabledgây nhầm, CTADEMOchỉdevloopback+gói, khôngPII.

Regression mới order-preview.spec.ts đỏtrướcsửa→pass; cuốiD unit37,integration58,E2E46,format/lint/typecheck/build/mediađạt. Real5173khôngmock0POST summary/focus/clearOnEdit/mobile/DEMOLink,ảnh vàmanifest/backup/logs docs/preview-round/20261025. Khônggiải nénbackuptests vàorepo.

Schema13/DOB/DDMMYYYY/HH:mm vàconsent/guards khôngđổi. Cloud013/Auth/RLS/MFA/payment/lookup/privatefilesvẫnNOT_TESTED/BLOCKED. Chạy cd D:\boi; npm run build; npm run worker:preview -- --ip 127.0.0.1 --port 8788; npm run dev -- --port 5173 --strictPort. Hiệnserverchạy, khôngstarttrùng/stopkháckhichưa xácminh. /dat-don?goi=G60 xemtrước; /dat-don?demo=1&goi=G60 thửquytrìnhgiả. Khôngdeploy/đổiACL/secret/snapshotcũ hoặc mởcheckout. Tiếptục4reportsauphiênsource.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## MỚI NHẤT — 20261025-demo-v6 — 2026-10-25T17:53:04+07:00

Source D:\boi, PID35444, revision2026-10-25-demo-v6; Vite5173/Worker8788. DemoOrder nútclaimkhôngdisable khi đãclaimed: đổi nhãn Xem lại thông báo, noticeBước2/3 trongcard và linktra cứu primary. Bấm lạichỉthôngbáo, khôngadvancebackwards hoặc paid thật; errorshếthạn yêu cầu tạoDEMOmới. KhôngđổiAPI/schema/flags/consent.

Regression mới tests/e2e/demo-transfer.spec.ts đãđỏtrướcsửa, sau sửa toànD:unit37,integration58,E2E45,format/lint/typecheck/build/mediađạt. Real5173khôngmock0POST→claimreclick→lookup→sample. Logs/manifest/backupzip docs/claim-round/20261025,ảnhdocs/screenshots/claim-round. GiữnguyênDOBDD/MM/YYYY,HH:mm vàschema13; cloud13chưaapply.

LệnhWindows cd D:\boi; npm run build; npm run worker:preview -- --ip 127.0.0.1 --port 8788; npm run dev -- --port 5173 --strictPort. Hiệnserverchạy, khôngstarttrùng/stopkháckhichưaxácminh. DEMO /dat-don?demo=1&goi=G20. Tiếptụccloudgates theoTODOlịchsử; khôngdeploy/đổiACL/secret/ngânhàng/snapshotordercũ hoặc mởcheckout. Mỗi phiênsource cậpnhật4reports.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## MỚI NHẤT — 20261025-birth-v5 — 2026-10-25T17:47:56+07:00

D:\boi tại5173, PID35444, revision2026-10-25-birth-v5; Worker8788. Đọc BIRTH_INPUT_VERIFICATION trước tài liệu cũ cóHH/schema12.

BirthFields dùng inputtext cómaskDD/MM/YYYY vàHH:mm24h; mặc địnhunknownfalse đểgõngay. NgàychuyểnISO bằng birth-format.ts, APIvẫnnhậnISO; giờmới giữphút chínhxác. Rỗng/unknownnull,00:00 cónghĩanửađêm. Admin dateForDisplay/timeForDisplay dùngDD/MM/YYYY; HHlegacyhiểnthịchưacóphút,khôngsuyđoán.

Migration013 additive thayvalidate_order_birth đểnhậnHH:mm vàschema marker13,khóarelease; khôngupdateorders hoặc sửa001–012. Cloudchưaapply. Config cần13; checklist trước dùng12 phải cập nhật khi nghiệm thu. Guards/quyềnảnh/côngkhai khôngđổi.

KếtquảD:unit37,integration58,E2E44,media4+2; browser5173khôngmock0POST choformthật/DEMO2người/midnight/unknown/mobile. Manifest/backupzip/logs docs/birth-round/20261025,ảnhdocs/screenshots/birth-round. Đừnggiảinénbackuptests vàorepo.

Lệnh: cd D:\boi; npm run build; npm run worker:preview -- --ip 127.0.0.1 --port 8788; npm run dev -- --port 5173 --strictPort. Hiệnserverchạy,kiểmPIDtrướcstop. DEMO /dat-don?demo=1&goi=G20. Khôngdeploy/đổiACL/secret/snapshotcũ hoặc mởcheckout trướcQAcloud001–013. Cácblockercũ theoTODO,tiếptục4báocáosauphiênsource.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## MỚI NHẤT — 20261025-order-v4 — 2026-10-25T17:38:24+07:00

- D:\boi chạy5173 PID35444,revision2026-10-25-order-v4; Worker8788api quaViteproxy. Đọc ORDER_FLOW_VERIFICATION trước lịch sử. Chưadeploy/nhậnđơnthật.
- OrderPage/LookupPage wrappers chỉ lazyimport DEMO khi import.meta.env.DEV vàhostname loopback+?demo=1. DemoOrder/demo-model dùng sessionStoragekeyhc-local-demo-v1,namespaceDEMO,TTL1h/max20,không lưuPII/ảnh,không gọiapi,khôngQRnhậntiền. Kếtquảmẫu/video cónhãnkhôngcánhânhóa. BuildJSloạiDEMO vàpreview8788đãkiểm.
- BirthFields ngàybắtbuộc/HH00–23tùychọn,unknowncheckbox xóagiờ=>null;người2 thêm thìDOBbắtbuộc. order-model/APIvalidate,nhậpngàykhôngtươnglaiVN. APIcreate_order_v2inputs chứaDOB/HHvànoticeorder-v3-submit. Khônglog/URLPII.
- Migration012 additive thayRPCv2 gọiSQLvalidate_order_birth,khôngupdateorderscũ/khôngsuyđoánngàygiờ. MarkerRPCorder_birth_schema_version=12 chỉservice_role,configđòi12 trướcready;release_verified=false. 001–011 giữnguyên. Chưaapplycloud.
- AdminDOB chỉadmin/order-details sauauth+membership+AAL2,DTOwhitelist,không list public hoặc lookup. OrderBirthDetails keyedorderid/activeguardtránhresponseđơncũghiđè. Đơncũ hiểnthịchưacungcấp/khôngrõ.
- VideoTerms đúng2câuowner,G60/G70,khôngcheckboxtrongkhung. Không ghi consent,khôngđổi public gates exactrevision/hash. Quyềnảnhupload riênggiữcheckbox. HomeFAQcôngkhaiđãbỏ.
- Configcheckout_blockers mãan toàn; hiện BACKEND_NOT_CONFIGURED, CHECKOUT_FLAG_OFF, CHALLENGE_NOT_CONFIGURED, SECURITY_NOT_CONFIGURED. Không tuyênbố đãtruyvấnDBcloudkhi credentials thiếu. release flag vẫnkhóa.
- Checks tạiD:unit35,integration57 PGlite12migrations/API mocks,E2E42,media4+2; browser5173khôngmock4DEMOflows0POST/birthterms/mobile,preview8788khôngDEMO. Logs/manifest/backupzip/stagingfailgiữdocs/order-round/20261025; khônggiảinénbackup tests vàorepo.
- ChạyWindows: cd D:\boi; npm run build; npm run worker:preview -- --ip 127.0.0.1 --port 8788; npm run dev -- --port 5173 --strictPort. Hiệnserverchạy,đừngstarttrùng. /dat-don?demo=1&goi=G70 và/tra-cuu?demo=1 thửtrongsametab. /adminkhôngdemoaccount.
- Ưutiênstaging001–012+Auth/RLS/MFA/Turnstile/lookup/idempotency/conflict/ảnhvideo/consent/restore/chínhsáchrồimớiownerduyệtrelease/bậtcheckout. Cácblockercũ cònTODO. Khôngtựdeploy,đổiACL/secret/ngânhàng,snapshotcũ,hoặcxóadữliệuđơnthật. Cậpnhật4reportsauphiênsource.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## BÀN GIAO MỚI NHẤT — 2026-10-25T16:43:58+07:00

- D:\boi là source đang phục vụ5173, PID35444 Vite dev; `/__hc/dev-info` cho cwd/root/revision. Backend Worker8788 được proxy bởi Vite. C copies chỉ staging. Không chạy nhầm C hoặc preview dist cũ. Xem process-after.json và VISIBLE_UI_VERIFICATION.md.
- UI main import HomeSections/OrderPage/LookupPage mới. lib/packages4gói nullSLA. site-info bank/hỗ trợ/revision; QR JPG nguyên byte chủ website. Thư viện/CMS010 giữ nguyên. Không tạo lời chứng thực hay seedvideo khách.
- Migration011 additive chưa apply cloud, không sửa001–010: catalogG50inactive/4gói hiện hành/nullSLA, giữ ordersnapshot; HMAC capability256bit order_credentials.access_digest; API lookup-code HttpOnlysession/CSRF; upgradelegacy chỉ sau xác thực cũ; ownerresetverifiedthu hồi session. Không log mã hoặc dùngURL/localStorage.
- Form2người tùy chọn/phone/ảnh. API schema strict bỏ email/channel/age/clientcommonconsent; serviceprocessingnotice được ghi lúc submit, tuổi unknown khi chưa xác nhận; photo là quyền riêng rõ18+, MIME/size/quota/private source-photos quarantine. customer-photos.ts bind order từ session, offlinevalidator mới release. Public consent riêng không bị gộp vào photo/private processing.
- Video G60/G70 (và G50 cũ) phải có MP4 private released trước publish; paid/manualpublish/version lock vẫn giữ. Không bỏ concurrency để chữa xung đột.
- Chạy Windows: cd D:\boi; npm run build; npm run worker:preview -- --ip127.0.0.1 --port8788 (tách đối số có khoảng trắng); npm run dev -- --port5173 --strictPort (tương tự). Lệnh chính xác có khoảng trắng tại CODEX_REPORT mụcI. Dev/Worker hiện đang chạy; xác minh PID trước mọi stop.
- Checks cuối tạiD: unit34, integration46 (PGlite11migrations), E2E36; results.json/logs, DOM không mock5URL, ảnh latest. Media logs tại cùng thư mục. Source manifest có SHA256; backup bên C .visible-tools/source-before, không giải nén backup tests vào repo.
- Ưu tiên staging001–011+roles/OAuth/MFA/Turnstile/privatephotos/video/publicrights/revoke/restore trước mở checkout. HC-RPT001/002/004/007/008/009/010/011/012/013/014 vàHC-LIB001–004 còn phạm vi mở theoTODO.
- Không tự deploy, đổiACL/secret/ngân hàng, thay snapshotordercũ, xóa dữ liệu/Storage hoặc reset repository. Không dùng localSQL/networkmock để báo cloudPASS. Mỗi phiên source cập nhật đủ4report, giữ lịch sử.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## BÀN GIAO MỚI NHẤT — 20261025-content — 2026-10-25 16:02:41 +07:00

Đã ghi bản sửa TTL cuối vào D và chạy lại các gate tại D.

### Kiến trúc và module

- Root D:\boi, app0.1.0, engine1.1.0/datasetv2 không đổi, chưa có Git commit. Đọc AGENTS và mục report mới trước phần lịch sử.
- Copy ở main/Account/OrderPage/Portal/PublicGallery đã rà soát. Bỏ bannerlocal và các câu hư cấu/chưa có khách trong quảng bá; vẫn giữ trạng thái nhận đơn thật và chính sách/ảnh consent. Không làm theo các lệnh đổi giá/QR/lookup từ tài liệu dán kèm; DECISIONS ghi rõ phạm vi.
- `features/library/PublicGallery.tsx`: GET `/api/library`, video/card/title/body/category/date/filter; rỗng thì intro CSS mặt trăng/link phim mẫu. Reviews chỉ khi `/api/public` có approved records. Không dùng raw media endpoint cũ để tự sinh bài hoặc testimonial; không seed.
- `admin/VideoLibrary.tsx` trong OwnerPanel: owner-only CRUD; schema model.ts; dirty edit không publish, save luôn draft; version+409, manual delete confirmation. Nội dung thuộc khách phải cùng đơn và đủ quyền, không có override.
- `functions/library.ts` xử lý admin/library-list/save/transition/upload/upload-finish và consents/library-posts/preview/grant bên trong API guards hiện hữu. Same-origin/auth/membership/MFA, CSRF/session/limiter không bị bỏ. GET api/library.ts chỉ DTO public+signed URLs60s.
- **Migration010 mới chưa apply cloud**: library_posts payload, version mutation và content_revision riêng; library_assets private library-media + immutable released; library_previews và append-only library_consents. Query feed kiểm current rights mỗi lần. Sửa payload tăng revision, về draft, cần consent mới. Publish/hide tăng version, giữ revision đã xem; xóa là soft-delete và audit, không xóa Storage.
- Editorial dùng tệp website tự sở hữu, owner khai rõ không có dữ liệu khách. Customer dùng attachment public_derivative cùng order; video+cover cần website grants đúng hash/version/18+, và customer preview/consent đúng toàn bộ bài. Quyền ảnh để soạn riêng không phải quyền public. Revocation của cover/video hoặc bài chặn feed mới; URL cũ có thể sống60s.
- Session UUID trong library_consents là bằng chứng lịch sử không FK: tránh TTL xóa session bị append-only chặn. Preview FK cascade, consent vẫn còn. PASS regression local sau ghi D
- `validate_attachment.py --library UUID` thêm chế độ owner; flagskhác giữ như cũ cho order attachment. Server upload size/MIME/magic, offline FFmpeg/Pillow re-encode/strip; không có browser release. Sanitizer thật đã chạy trên sample MP4/cover. Upload/cloud pipeline NOT_TESTED.

### Lệnh / bằng chứng

D hiện chỉ writable khi UAC theo ACL, không đổi quyền. `cd D:\boi`; npm run dev→5173, build+worker:preview→8788. `/admin` membership+AAL2 owner, không demo. Thao tác CMS chi tiết trong docs/VIDEO_LIBRARY.md. Secrets chỉ env/dashboard, không dán vào file/log/chat.

Kết quả cuối sau bản sửa TTL tại D: format/lint/typecheck/build exit0; unit31/31, integration38/38 (PGlite10 migrations,10 SQL library cases), Edge32/32 (4 ca mới+mobileassert), media4 và library-media2. Worker: 7 HTTP smoke +GET packages +GET library default/empty/no-store đạt local.

Log `docs/content-round/20261025/results.json`, *.log, unit/integration.json; staging-checks.zip giữ fail format/fixture đã sửa. before-ttl-checks.zip giữ kết quả trước patchTTL nếu đã áp dụng. before.zip giữ nguồn/report/generated artifacts trước vòng, source-manifest.json có hash và interimAfter cho hai file patchTTL. **Không giải nén backup tests vào repo trước chạy Vitest**.

Screenshots empty library là trạng thái thật khi chưa có bài; published/mobile là fixture test, không phải khách. Test harness không được đóng gói dist. Root RESTORE_APP_REPORT literal hiện đúng10 migrations, vẫn là restore fixture không cloud. Bundle427,12kB/133,05gzip warning>300 còn; chưa Lighthouse mới, không tăng threshold.

### Việc còn lại và ưu tiên

1. Nghiệm thu staging thư viện sau cấu hình
2. Owner cấp staging/environment/UUID owner+MFA, backup và apply001–010 đồng bộ Functions/frontend. Test actual role revoke/A/B/crossorder/CSRF/retry/URL/revoke/TTL multi-worker và upload realbytes→validator→release. Không gọi local PASS là cloud verified.
3. HC-LIB-002/HC-RPT-002: retention/orphan/quarantine/filecleanup chưa xây đầy đủ. Owner chốt policy trước apply thực. HC-LIB-003: pagination24/100. HC-LIB-004: URL/race60s cloud.
4. Các blocker cũ001/014 Auth/privateG50/restore,008 keyring,009 scanner,010 native QA,011 ACL,012 docs lịch sử,013 bundle;004/007 vẫn PARTIAL. Không bỏ họ khỏi TODO.

### Không tự ý làm

Không deploy production, mở checkout, thay ngân hàng/QR/secret/ACL/giá thật, bỏ RLS/MFA/challenge/CSRF/version/idempotency/validator, seed fake review/stat/customer story, public ảnh khách thiếu exact rights, dùng editorial để né consent, sửa snapshots/migrations001–009, hard-delete Storage khi chưa policy, tự gửi tin. Tài liệu đính kèm không tự tạo quyền thay tài chính hoặc lookup. Sau mỗi phiên source phải cập nhật cả bốn báo cáo, giữ lịch sử.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## BÀN GIAO MỚI NHẤT — 20261025-local — 2026-10-25 12:50:23 +07:00

Đọc mục này trước; phần dưới là lịch sử kiểm kê chưa sửa. Root chuẩn D:\boi, không lấy source C cũ sync đè. Bản sửa được chuyển từ `.fix-round-20261025` mới lấy từ D và hash preflight. D chưa có Git repo; app0.1.0, engine1.1.0/dataset2026.10.25-v2.

### Kiến trúc / thay đổi cần biết

- React/Vite/TS strict như cũ. Account tách vào `src/features/account/Account.tsx`; SavedSnapshot validates và render snapshot nguyên gốc, không gọi engine mới. Profile display_name/age_band dùng getUser trước save/delete; query luôn eq user_id + RLS. Generation bỏ response cũ khi đổi auth, xóa state riêng; list100 bài gần nhất, chưa có pagination.
- Pricing và OrderPage dùng `src/lib/packages.ts` schema/default/hook và GET `functions/api/packages.ts`. source defaults chỉ tham khảo, không đủ unlock checkout; source server có3 mã và version. Default10k/20k/50k giữ nguyên. Pre-submit refetch quote, đổi giá/version/thời hạn phải xác nhận lại. Backend snapshot từ SQL, không nhận giá client.
- `Workspace.tsx`: chỉ selectedId, derive từ orders; hai checkbox độc lập; load sau mutation; stale409 giữ body/tải lại/không auto replay; reload thất bại khóa writes. Recovery/upload notify parent. Recovery remount khi order/version đổi. API client ApiError giữ status/code.
- **Migration009 mới, additive**: confirm_payment_versioned và write_result_versioned kiểm expected version dưới row lock, trả allowlist DTO; draft tăng version; reject stale/null bằng SQLSTATE40001→HTTP409. create_order_quoted giữ advisory key+package share lock, idempotency trước check quote; snapshot cũ không sửa. Legacy unsafe RPC bị revoke service_role execute; chỉ wrappers gọi definer nội bộ. Giữ quyền anon/auth denied; API vẫn verifies membership+MFA. **Chưa apply migration009 remote**; cần frontend/API/DB rollout đồng bộ ở staging khi được phép.
- Turnstile Challenge remount theo resetKey, bỏ callback cũ/expired/error, token latch consumed ở OrderPage và Lookup. Consume ngay trước API attempt, lỗi cũng không reuse; retry giữ idempotency key. Không auto đổi key khi timeout; không bỏ limiter/Siteverify hostname/action.
- `reflections.ts`:48 câu hỏi tự biên soạn,4 nhánh/tool theo hash; thêm đoạn thực hành, vẫn có phần chung corpus v1. CC BY4.0 cho câu hỏi mới (ghi công Huyền Cảnh), không khẳng định giấy phép này áp cho corpus cũ. Không có dữ liệu tử vi truyền thống đã thẩm định. Giữ corpus.ts và fixture reading-v1.json; result/history không tính lại sau upgrade.

### Trạng thái module / kiểm chứng

- UI/free reading/responsive local PASS; content diversification PARTIAL; production IN_PROGRESS, không ready.
- HC-RPT-003/005/006/015/016: regression local PASS. HC-RPT-004 phần profile/full snapshot/RLS local đạt nhưng tổng thể PARTIAL do Auth thật và pagination. 007 PARTIAL do corpus nhỏ/chung, thiếu bảng lịch truyền thống kiểm chứng.
- Các module order/payment/admin/lookup/private G50/consent chỉ PARTIAL; Auth/MFA/Storage/Turnstile thật và multi-worker/restore cloud NOT_TESTED/BLOCKED. Checkout gate không mở; không có tiền thật/deploy.
- Video renderer không đổi: audit trước đã render36s720p, vòng này chỉ media4 và E2E phát video có sẵn, không render mới.

### Lệnh và bằng chứng

Tại D cần PowerShell quản trị theo ACL hiện hữu; không đổi ACL. `cd D:\boi`; `npm run dev`→127.0.0.1:5173 chỉ frontend; `npm run build` rồi `npm run worker:preview`→127.0.0.1:8788 có Functions. `/admin` chỉ nhận membership server+AAL2, không có tài khoản demo.

Checks đã chạy tại D: format:check/lint/typecheck/build exit0; unit30/30, integration26/26, Edge E2E28/28; secrets scan0; media4; Worker7 smoke +quote default/no-store. Chạy lại bằng npm test /npm run test:integration /npm run test:e2e, test:media, check:secrets, test:worker (Worker đang chạy).

- `docs/fixes/20261025-local/results.json`, unit.json/integration.json và *.log là cuối. first-results.json và *-backup-discovery-failure.* giữ lần D đầu bị Vitest quét backup trùng (không phải mã sản phẩm fail). **Không giải nén before.zip vào thư mục dự án trước khi chạy Vitest**: filter tests/unit sẽ tìm cả bản sao test. Giải nén ra ngoài repo nếu cần so sánh/phục hồi.
- before.zip giữ source/báo cáo/selected generated artifacts trước sửa. source-manifest.json có before/after hash từng file. Red unit/E2E traces ở docs/fixes/red-*.zip, staging-checks.zip có format fail trung gian đã xử lý. green-unit.json là output trung gian có lỗi, không dùng làm bằng chứng đạt.
- Cảnh báo bundle422,20kB/131,85gzip vẫn còn, chưa đo lại Lighthouse. Generated RESTORE_APP_REPORT environment còn literal8 nhưng test thực nạp9 migrations; đây là HC-RPT-012 mở, không diễn giải thành test cloud.

### Ưu tiên và điều kiện tiếp tục

1. Owner cấp staging/env/origin/redirect/Google/Supabase/Turnstile; secrets nhập dashboard, không chép vào docs/chat. Review/apply009 ở staging sau backup rồi test A/B own-profile/history, MFA/role revoke, stale409, quote change, challenge retry/race thật.
2. Chạy private G50 pipeline thật: reserve/quarantine/sanitize/scan/release/signedURL/download, consent exact hash/version/revoke, backup DB/Auth/Storage+tombstone restore. Chưa có scanner PDF và cloud restore.
3. Owner chốt bank/refund/support/retention. HC002 lifecycle cleanup chưa đủ; HC008 keyring chưa có. Không bật checkout trước release checklist.
4. Pagination lịch sử>100, corpus có nguồn/giấy phép/thẩm định, native device QA và performance mới.

### Không được tự ý thực hiện

Không thay ACL, secret/pepper/bank/giá thật; không deploy production/nhận tiền; không bypass RLS/MFA/Origin/CSRF/challenge/validator/version lock/idempotency. Không sửa published snapshots/migrations001–008, không tự gửi Zalo/email hoặc public video, không giải nén backup tests vào repo. Không chạy scripts/final-report.py hoặc verify:delivery mù vì có thể ghi lại trạng thái lịch sử. Mọi phiên thay source phải cập nhật đủ CODEX_REPORT/TODO/CHANGELOG/HANDOFF, giữ lịch sử và không gán mock/PGlite PASS cho cloud.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_HANDOFF.md

## Phiên kiểm kê 20261025T051523Z

Cập nhật: 2026-10-25 12:20:16 +07:00 (Asia/Bangkok). Phạm vi: kiểm kê, kiểm thử local và báo cáo; không sửa logic ứng dụng, database, giá hoặc cấu hình live.

## Đọc trước khi tiếp tục

1. AGENTS.md (đã thêm quy định cập nhật đủ bốn báo cáo), CODEX_REPORT.md phần mới nhất và CODEX_TODO.md.
2. README_START_HERE, PRD110U, DESIGN_SYSTEM, ARCHITECTURE, DATABASE_AND_SECURITY, ACCEPTANCE_TESTS, CODEX_MASTER_PROMPT và prompts01–10.
3. DECISIONS, DATA_SOURCES/ASSET_LICENSES (có thông tin cũ lệch code, HC-RPT-012), HANDOVER và docs/RELEASE_CHECKLIST.

## Kiến trúc và điểm vào

- Root chuẩn: `D:\boi`; v0.1.0; chưa có Git repo/commit. Có bản workspace C từ phiên xây dựng cũ nhưng **không tự sync đè D**.
- React19/Vite8/TypeScript strict/React Router; CSS + hero SVG tự tạo; `src/main.tsx` routes và account/lookup; feature components tại src/features.
- Engine local registry12 tool, NFC/date/phone/pair canonicalization, SHA256 + engine1.0.0 + dataset2026.10.25-v1. Dataset public bất biến, lịch sử snapshot. Content giải trí/mô phỏng, không LLM/paid API; corpus có phần chung.
- Cloudflare Pages static dist + Pages Functions `functions/api/[[path]].ts`; public config/dataset/gallery ở config.ts/dataset.ts/public.ts. Same-origin POST, DTO allowlist, request auth user+membership+MFA, no-store, Origin/CSRF, persistent DB limiter.
- Supabase dự kiến Auth Google PKCE, PostgreSQL/RLS, 3 private buckets; migrations001–008. Service role/pepper chỉ server; không cấp admin qua email/client role. Opaque lookup256bit + DBdigest, không session-signing JWT secret.
- Order publiccode HC+CSPRNG, secret128bit, HMACphone/secret; giá/expiry/snapshot server; claim≠paid, confirm atomic/version/unique, publish cần paid/G50MP4. Cookie lookup15phút và fileURL60giây theo code; cloud chưa test.
- Consent scopes riêng photo/website/YouTube/TikTok, asset/hash/version/preview, 18+; SQL append-only/lock/revoke; platform ngoài thao tác thủ công. Upload quarantine + validator Python/Pillow/FFmpeg; PDF cần scanner.
- Video template36s720p trong video-template/render.py; tài sản tự tạo/OFL. Không đưa source ảnh/video riêng vào public/Git. Không có deploy hoặc automation gửi tin.

## Module và trạng thái

| Nhóm chức năng | Trạng thái | Bằng chứng và giới hạn |
|---|---|---|
| Giao diện và hoạt ảnh | PASS | E2E local: routes, 12 reveal/skip, reduced motion, nhạc bật tay; chưa review thiết bị thật. |
| Responsive | PASS | 360/390/768/1024/1440; không tràn ngang. 640px là reflow mô phỏng, không browser zoom200% thật. |
| 12 nhóm bói miễn phí | PASS | Engine và input fixtures, ≥501 từ, offline, Node/Edge100 lần; mô phỏng, corpus có phần chung. |
| Google OAuth | NOT_TESTED | Có code PKCE/callback; chưa có cấu hình và phiên Google/Supabase thật. |
| Hồ sơ và lịch sử | PARTIAL | Own-user RLS local đã test; tài khoản thật chưa test; chưa có UI chỉnh profile và đọc lại toàn bộ snapshot. |
| Gói 10k / 20k / 50k | PARTIAL | Giá gốc UI/SQL local đúng; UI hardcode, chưa theo thay đổi API set_package; giao G50 cloud chưa test. |
| Tạo đơn hàng | PARTIAL | RPC giá/snapshot/idempotency đã test local; frontend thật qua Turnstile/Cloudflare/Supabase chưa chạy. |
| Chuyển khoản thủ công | PARTIAL | Checkout khóa, có claim không tương đương paid; chưa có ngân hàng và giao dịch đối soát thật. |
| Xác nhận thanh toán | PARTIAL | SQL row-lock/version/unique/retry local; chưa chạy hai admin HTTP concurrent hoặc tiền thật. |
| Admin và phân quyền | PARTIAL | UI/API/owner-editor/MFA guards và SQL local; chưa có JWT/MFA/admin thật, còn các lỗi UI ghi ở E. |
| Tra cứu đơn hàng an toàn | PARTIAL | Ba trường, digest, limiter/session SQL và fail-closed local; timing, challenge, cookie/cloud/multi-worker chưa test thật. |
| Trả kết quả qua website | PARTIAL | Draft/publish/published DTO + gate G50 local; signedURL/private download end-to-end chưa test thật. |
| Zalo thủ công / email | PARTIAL | Có chép nội dung tin nhắn; chưa test clipboard trong phiên admin thật hoặc gửi tin. Không có bot/email tự gửi theo phạm vi đã loại. |
| Tạo và xuất video | PASS | Xuất lại vào fixture audit biệt lập, không ghi đè video giao; E2E phát MP4 có sẵn. Video cá nhân theo đơn chưa chạy cloud. |
| Quyền đồng ý công khai video | PARTIAL | Scopes/18+/preview/hash/version/revoke/immutable SQL đã test local; race nhiều worker, actual Storage/platform gỡ chưa test. |
| Bảo mật và database | PARTIAL | Typecheck/SQL RLS A/B/anon và guards local; fixture Auth/Storage, không thể kết luận thanh toán/production an toàn. |
| Khả năng triển khai miễn phí | NOT_TESTED | Có cấu hình Pages/Supabase; chưa deploy hoặc xác minh quota/chi phí hiện hành và SLA thực tế. |

## Bằng chứng mới nhất

- Phiên 20261025T051523Z, 2026-10-25 12:20:16 +07:00 (Asia/Bangkok); `docs/audits/20261025T051523Z/results.json`, source-integrity.json và inventory.json.
- Unit 26, integration 19, E2E 24; dùng bảng D CODEX_REPORT để biết exit code thực tế. SQL tests PGlite có fixture auth/storage, không remote.
- Output cũ đã lưu `docs/audits/20261025T051523Z/before`. Lighthouse trong docs/lighthouse.json là đo cũ, không được gọi mới.
- Logic source không đổi trong audit; chỉ docs/report/AGENTS và generated artifacts. Không coi các bản CODEX_REPORT lịch sử là trạng thái hiện tại.

## Lệnh và môi trường Windows

PowerShell quản trị cho D hiện read-only với tài khoản thường. `cd D:\boi`, `npm run dev` →127.0.0.1:5173. `npm run build` + `npm run worker:preview` →localhost8788. `/admin` cần server verified membership+AAL2, không có user demo. Cấu hình OAuth/Storage thật còn thiếu; Vite dev không chạy Pages Functions.

Checks: typecheck, lint, format:check, test, test:integration, test:e2e (Edge), test:media (Python), build, check:secrets; `test:worker` cần Worker không cấu hình chạy8788. Backup report/artifact trước rerun. `verify:delivery` và `scripts/final-report.py` là script bàn giao cũ có thể ghi lại IMPLEMENTATION_STATUS theo logic cũ; **không chạy mù để tạo bằng chứng/báo cáo mới**.

## Lỗi và ưu tiên

Theo dõi HC-RPT-001–016 trong CODEX_TODO. HC-RPT-016 là format:check FAIL đã tái hiện ở src/main.tsx; các check local khác exit0. Ưu tiên independent UI: pricing nguồn server, history/profile, checkbox xác nhận tách biệt, selected version, Turnstile retry. Tiếp theo lifecycle cleanup/pepper keyring; sau khi được cấp staging mới test OAuth/MFA/RLS/private G50/scanner/concurrency/backup. Mọi nhận định tĩnh phải có ca tái hiện, không tự ghi runtime FAIL/PASS cloud.

## Những gì owner cần cung cấp

Quyền dashboard staging Google/Supabase/Cloudflare, exact redirect/origin, owner/editor UUID+MFA; bank/refund/support/retention; Turnstile và keys đặt trong secrets. Không lưu giá trị password/token/key vào báo cáo hoặc yêu cầu dán vào chat. Không cần PII khách thật để test.

## Không tự ý thực hiện

- Không deploy production, mở CHECKOUT_ENABLED/release_verified hoặc nhận tiền khi gate chưa đạt; lệnh hiện tại chỉ kiểm kê.
- Không sửa lỗi lớn, refactor source hoặc apply migration cloud theo lệnh kiểm kê này. Phiên sau cần mục tiêu sửa rõ ràng và giữ quyết định U/N/A.
- Không drop/reset DB, thay ACL/ExecutionPolicy toàn máy, ghi đè thay đổi người dùng hoặc sync C→D mù.
- Không nới RLS/MFA/Origin/CSRF/limiter để tests pass; không dùng service role ở frontend, không demo-login giả admin.
- Không tự gửi Zalo/email, đăng YouTube/TikTok, tải PII/ảnh khách lên AI/CDN; không tự đăng ký dịch vụ trả phí.
- Không tự thêm tính năng đã loại, không khẳng định tử vi chuẩn hoặc độ chính xác tâm linh.
- Không ghi đè lịch sử báo cáo; sau mỗi phiên thay đổi mã/config/tests/deploy phải cập nhật CODEX_REPORT, CODEX_CHANGELOG, CODEX_TODO, CODEX_HANDOFF trước final.


### Xác minh sau push — 2026-10-27 23:58 +07
Commit 1f8750f đã push main thành công (normal push, không force). Production HTTP 200 nhận bundle /assets/index-Ceyh27Jl.js có UI khôi phục mới; trình duyệt thực /tai-khoan sau reload hiển thị hai nút thiết lập/làm lại. Ảnh production-mfa-controls.png ngoài Git trong .mfa-qr-fix-20261027. Git integration đã đưa mã mới ra website; chưa đọc được deployment ID/build logs vì Dashboard tải chậm sau đăng nhập. QR enroll mới, reset factor thật và verify AAL2 vẫn NOT_TESTED: chủ tài khoản phải tự thao tác, không agent tạo/đọc OTP hoặc QR. Nhận đơn thật vẫn khóa. Không coi DOM mới là MFA hoàn tất.


### Sau push/deploy — 2026-10-28T00:28:47.1681752+07:00
Commit 74426ebf53fd0bc869e7f36e2e53dd75236fdff5 push main thành công, không force. HTTP production /tai-khoan nhận bundle /assets/index-DtmJACGI.js: có form admin/đặt mật khẩu, không còn chuỗi nút Google. /api/admin-login thử username giả trả 401, no-store; không gửi mật khẩu thật, không tạo session thành công. /api/config vẫn checkout=false/public_preview=true. Không xác minh DOM production vì CUA mất kết nối; HTTP/bundle không thay cho kiểm thử đăng nhập/session/MFA thật. Chưa đặt mật khẩu người dùng. Người dùng giữ phiên cũ, tự nhập mật khẩu và bấm Lưu mật khẩu; không đăng xuất trước bước này. Bốn báo cáo đã cập nhật, giữ lịch sử. Logs/bằng chứng ngoài Git .admin-login-20261028.


### Sau commit/deploy và kiểm tra cloud — 2026-10-28T01:36:35+07:00
Commit d0ae8434bc2340ed89a57c47cc360e8700c6bc84 push main thành công (không force). Public artifact /assets/index-BP6pH_Vj.js đã có login tối giản/workspace mới, không Google button; GETconfig checkout=false/publicpreview=true. Browser production /tai-khoan xác nhận chỉ Tài khoản/Mật khẩu/Đăng nhập, chụp account-production.png. /admin/dat-mat-khau trong phiên owner hiện có đã xác minh hiển thị hai ô password mới và nút lưu; đã bàn giao cho chủ tài khoản, agent không nhập credential.

Cloud SQL chỉ đọc boolean xác nhận đúng một owner active và password_is_set=false; KHÔNG đọc hoặc lưu password/hash. Vì thế chưa thể login mật khẩu thành công, không đoán credentials hoặc dùng mật khẩu chat. Auth signup đã tắt; Email enabled, Google provider vẫn tạm bật cho phục hồi đến khi password mới nghiệm thu. Feature MANUAL_DELIVERY_ENABLED=false; chưa tạo/upload/result theo code thật qua endpoint mới, chưa khai báo app production hoàn tất.

Migration014 đã apply với sự cho phép trực tiếp của chủ dự án, trong transaction; hai bảng RLS=true, anon/authenticated direct access=false, policies0, bucketprivate20MB. SQL Editor không tự ghi CLIledger, không run lại014/001–013. Ảnh/log/cloud-schema.json ngoàiGit tại .manual-simple-20261028 trênC. Bốn báo cáo giữ lịch sử và cập nhật thực tế; cần người dùng tự lưu mật khẩu mới rồi đăng nhập để tiếp tục bật riêng module thủ công và QA cloud, thanh toán luôn khóa.


Lệnh local chính xác (sửa cách ghi liền tham số trong mục I): `npm run dev -- --port 5187`; `npm exec wrangler -- pages dev dist --port 8788 --ip 127.0.0.1`. Worker kiểm thử của vòng này đã được dừng, không dừng tiến trình khác.
