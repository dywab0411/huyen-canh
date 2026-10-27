## Kết quả kiểm tra production quản trị — 2026-10-28 02:22 +07

PASS thực tế: Cloudflare deployment 1c58f911-b616-4a33-b02a-335d06f2002c status success, commit f2c076f8a35885e3a30ca8b72974f0622cbf14d4. Browser production /admin với phiên password hiện tại đã tải danh sách, tạo mã, lưu bài giả, sửa lần2; /tra-cuu trả đúng nội dung mới. Đã xóa mềm duy nhất bản ghi kiểm thử vừa tạo, xác minh tra cứu mã đó bị từ chối; không tác động đơn cũ. Không lưu mã truy cập hoặc credential trong báo cáo. HTTP anon POST list401, paid /api/orders POST403. Thanh toán vẫn khóa, chỉ manual=true; RLS/private Storage/auth owner/password guard giữ nguyên.

NOT_TESTED lượt này: cloud upload/phát MP4, login mới từ trạng thái logout, session dài hạn, full E2E toàn bộ. Tải lại /admin dùng phiên hiện tại là bước kiểm tra duy trì phiên ngắn. Không gọi toàn bộ hệ thống VERIFIED. Module chữ/code thực tế PASS, video vẫn PARTIAL theo bằng chứng cloud chưa có. Unit52/integration80/targetedE2E5 PASS; format/lint/typecheck/build/scan exit0. Source/config đã push f2c076f; bản báo cáo hậu kiểm commit riêng. Screenshot admin lưu ngoàiGit .admin-open-20261028/admin-production.png. Chủ website có thể mở /admin và bấm tạo mã; nội dung soạn thủ công, không hứa tự sinh bài/video. Không bật paid checkout, public bucket, hoặc tắt role check.

---

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

# Kiểm thử gói G20 — 2026-10-27T11:19:37+07:00

## A. Tổng quan
PASS local/DEMO; BLOCKED production end-to-end bởi PUBLIC_PREVIEW_ONLY=true vàcheckout_enabled=false. Project IN_PROGRESS; không nghiệmthu production-ready hoặc tăng tỷlệhoànthành toànbộ. Source app0.1.0/OAuthcfab3b8, checkout test C:/Users/User/Downloads/boi/.github-sync-20261026 khớp runtime D:/boi. Chỉ thêm regressiontest, không sửa runtime/migration hoặcproduction config. Khôngtạođơn/paid/admin/kếtquảkháchthật trêncloud.

## B. Công việc và kết quả thực tế
- PASS browser local http://127.0.0.1:5187/dat-don?demo=1&goi=G20: gói20.000đ, ngày29/02/2000/giờ00:00fixture, tạo bản ghiDEMO, mãđơn+ mãtra cứuriêng, báo chuyển khoản giả lập, tra cứu đúng mã, trả kết quảvănbảnpositive/difficulties/advice. Reload và nhập lại mã vẫn mở bảnmẫu; mãsai báo khôngtồntại/hếthạn. Không dùngthôngtincánhânthật. Không coi bài DEMO ngắn là bài luận giải cá nhân≥501từ đã giao thật.
- PASS regression mới tests/integration/g20-lifecycle.test.ts: PGlite disposable áp dụng13migration. TạoG20 lấyversionquote server/20k snapshot; retryidempotency khôngđơntrùng; claimrepeat mộtclaimed event vàchưa paid; unpaidpublish bịchặn; saisốtiền bịchặn; confirmđúng20k retry mộtverified event; paidchưacókếtquả; draftẩn; staleversionpublish bịchặn; publishđúngversion→delivered→secretlookup trảđúngbody. Mãđơncôngkhai/mãsai khôngmởbài; DOB/phone khôngDTO. Admin/release/payment ởđây chỉfixture trongRAM, không sửacloudguards.
- PASS kiểmproduction https://huyencanh.pages.dev/dat-don?goi=G20 hiểngói20kvàthôngbáotạmngừng, /tra-cuu dùngmộtmãbảomật. GETconfig:false/trueguard; POSTpayloadrỗng/api/orders và/api/orders/lookup đều403,no-store. Khôngtạođơncloudhoặcnhậpbiênlaithật. /api/packages trảG20=20000từdefaults, không giả đãxácminhgiábackendcloudquaendpointnày.
- BLOCKED realcloud purchase→adminpayment→draft/publish→lookup bởiguardđúngcấuhình; khôngtắtguardđểtestđạt.

## C. Ma trận chức năng
| Bước | Local/fixture | Production |
|---|---|---|
|G20 giá20.000đ/form|PASS browser+SQL|PASS hiểnthị, tạođơnBLOCKED|
|Tạođơn/quote/idempotency|PASS SQLlocal; DEMO riêng|BLOCKED403|
|Nhậnmã|PASS DEMO, secretlookupSQL|NOT_TESTED đơnthật|
|Báochuyểnkhoản|PASS khôngtựpaid/retry|NOT_TESTED|
|Adminxácnhậntiền|PASS syntheticSQL|NOT_TESTED; khôngcấpadmin|
|Nháp/paid/xuấtbản/version|PASS SQLlocal|NOT_TESTED|
|Kếtquảtheomãbảomật|PASS đúngmã/saimã/ẩnPII/DEMOreload|BLOCKED403|
|PhânquyềncloudMFA/A-B/Storage/consent|Testintegrationcũ vẫnđạtlocal|Chưanghiệmthuđầyđủ|

Giao diện/animation/responsive/12tool/OAuth/profile/history/video/email/Zalo/library/consent giữtrạngtháibáocáotrước, khôngghiPASSmới nếu khôngtest vòngnày. Profilecloudđãsave/readbacksau13migration theobằngchứngphiên26/10, khônghồiquyđầylại.

## D. Kiểm thử
Checkout C ởtrên, node/npmD, logs C:/Users/User/Downloads/boi/.g20-test-20261027. 45unit/63integration/2E2EG20 đạt; khôngchạyfull46E2Evòngnày. E2Ekiểm0POSTtrongDEMO, khôngdữliệuPIItrongsessionStorage. BrowserCUA thực tại5187cònđượcthao táctay. Dev5173banđầukhôngchạy nênmởserverkiểmthử5187, khôngdừngserverkhác.

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0 |
| `npm run test:integration` | 0 |
| `npm run build` | 0 |
| `npm run test:e2e -- --grep G20|demo transfer` | 0 |
| `npm run check:secrets` | 0 |

Lúc viết test mới có hai lỗi fixture đã sửa: awaittrongdefaultparameter làm suitekhôngload(exit1), vàquoteversionhardcode1 gâypackageversionconflict(1testfail/exit1). Sửa testđể lấyversionthựctừservice_packages; không bỏoptimistic concurrency hoặc sửaappđểtestđạt. Sauđótestmới1/1đạt, fullintegration63/63đạt. Cảnhbáochunk>300kB vàNO_COLOR/FORCE_COLORvẫncòn, khôngphảilỗichứcnăng. KhôngbịalocalPASSthànhcloudPASS.

## E. Lỗi/blocker
HC-G20-001 P1 BLOCKED realcloud: configPUBLIC_PREVIEW_ONLY vàcheckoutfalse, tạo/lookup403. TiếptụccầnstagingQAđượcphêduyệt, backendenv,Turnstile,ownerMFA/A-B,backuprestore rồiownerduyệtrelease; khôngđổicodeguard. Khôngpháthiệnlỗiruntimemớitrongphạmvilocalđãtest. HC-G20-002 P2 NOT_TESTED actual501wordcustomresult/deliverycloud; DEMOchỉsample.

## F. Còn thiếu
RealcloudG20/Turnstile/HttpOnly-CSRF-session/adminAAL2/paymentconcurrency/privatefile/result/expiry/revocation; khôngcoiSQLfixturehoặcDEMOlàđơnthật. ToànbộgatechưanghiệmthuRPT/ORD/SB/LIBcòngiữ. Khôngtạo501từkháchgiảđểgiảđãgiaobài.

## G. Chủ dự án cần cung cấp
Khôngcầnsecretsđểtestlocal. QAcloudriêngcầntàikhoảntest/ownermembershipMFA+backendenvđặttạidịchvụ,cấuhìnhTurnstile vàxácnhậnphạmvi. Khônggửikey/mậtkhẩuquadchat. Khôngyêucầungânhànglại.

## H. Tiếp theo
Giữcheckoutkhóa. Tạo/stagingQAriêngtheoguidevàtestA/B/MFA/lookup thật, ngănđơntrùng,publishsaupaid,backuprestore. Chỉbậtproductionkhiownerduyệtriêng. Reporttestnày khôngphảilệnhmởdịchvụ.

## I. Cách kiểm tra local
Devtestđangở http://127.0.0.1:5187/dat-don?demo=1&goi=G20; đi theoCTA đếntra-cứuDEMOtrongcùngtab, khôngchuyểntiền. DEMOexpire1h, namespacekhôngdùngtrênproduction. Tựchạy: cdD:/boi; npm run dev -- --port 5187 --strictPort (kiểmPIDtrướcstart). npm run test:integration; npm run test:e2e -- --grep "G20|demo transfer". /admin khôngcótàikhoảndemo. Mãđơncôngkhai khôngthaymãtra cứubảomật.


---

## Production OAuth và lưu hồ sơ — 2026-10-26T22:24:07+07:00

### A. Tổng quan
Project IN_PROGRESS. PASS thực tế cho deployment mới, chuyển Google và phiên user đã đăng nhập, lưu hồ sơ và đọc lại sau reload tại https://huyencanh.pages.dev/tai-khoan. Không gọi toàn bộ bảo mật/cloud/production-ready VERIFIED. Commit source cfab3b8412a6a60ad8fc7601b7096add77b60c93; không có source change mới trong vòng này. Không tăng tỷ lệ hoàn thành toàn bộ từ rubric cũ khi chưa đủ gate.

### B. Công việc đã thực hiện
- Rebuild production bằng Cloudflare Dashboard theo yêu cầu: deployment ba575c3a-fb13-4867-a9a4-bc33b3b0fbbd, success lúc khoảng22:10+07 ngày26/10, commitcfab3b8. Nguyên nhân OAuth trước đó: buildcommand đã lưu nhưng chưa có deployment dùng lệnh mới. Bundle index-CpErmwnA.js có ProjectURL và publishablekey; không ghi key vào báo cáo/source.
- Nhấn Google trên website thật đến Google account chooser đúng project/callback. Chủ tài khoản hoàn tất đăng nhập trong IAB. Đã kiểm UI authenticated, thao tác save và reload vẫn có profile/session. Không ghi userUUID/email/displayname/token vào báo cáo. Chưa testlogout/cancel/expiryrefresh hoặc tài khoảnB.
- Lỗi hồ sơ chính xác: REST public.profiles và reading_history trả404/PGRST205, Dashboard public trống. Sau chủ dự án xác nhận rõ, áp dụng transaction migration001–013 từ D:/boi/release/supabase-new-staging.sql qua SQL Editor projectwutxklvvimwopckfjmga. SQLSHA256 6cba672e4be670fb940848a90453bf6b2adfe8d618ae6b8513f5e174189726d2. Kết quả Success.No rows returned; 25bảng public xuất hiện. Không chạy lại migration, không reset/xóaAuthuser, không cấpadmin.
- Metadata thực tế: schema13=true; mọi bảng appRLS=true; bốn bucketprivate=true; release_locked=true; no_admin_granted=true; anonprofiledenied=true. Sau đó nút Lưu hồ sơ báo thành công; reload giữ tên và nhóm tuổi đã nhập. Không dùng service_role từ frontend.

### C. Kiểm tra chức năng
| Nhóm | Trạng thái thực tế |
|---|---|
|Giao diện/hoạt ảnh/responsive/12tool|Giữ regression local trước; không full test lại vòng này|
|Google OAuth/session|PASS luồng một user trênproduction: tớiGoogle, userhoàn tất, authenticated UI vàsessioncònsau reload; logout/cancel/expiry NOT_TESTED|
|Hồ sơ|PASS production save vàreadback sau reload|
|Lịch sử|Schema/RLS đã tạo; chưa lưu/mở bài lịch sử thật trong phiên: NOT_TESTED cloud|
|Bốn gói/đơn/chuyển khoản/xác nhận thanh toán|Giữ khóa nhận thật; cloud nghiệp vụ NOT_TESTED|
|Admin/quyền|Không cấpadmin; MFA/editor/owner thực tế NOT_TESTED|
|Tra cứu/kết quả/tệp riêng|Migration có, QA nghiệp vụ cloud NOT_TESTED|
|Zalo/email/video/consent|Không thao tác mới; cloud NOT_TESTED|
|Database/RLS/Storage|PASS migration, metadata vàanon denied; A/B JWT vàsignedURL NOT_TESTED|
|Triển khai Free|PASS deployment này vàURLproduction; quota/backup/restore chưa nghiệmthu|

### D. Kiểm thử/bằng chứng
Vòng này không đổi runtime code và không chạy lại unit/E2E local. Lần trước sourcecfab3b8 đãformat/lint/typecheck/build/unit45/integration62/E2E46; E2E đầu bịngắt devserver5187, retry đạt46. Không ghi kết quả cũ thành lượt mới.

Cloudflare Git build: npm clean-install, tsc --noEmit && vite build, Functions compile, upload và deployment success. Không có shell exitcode riêng từDashboard; trạng thái thành công không giả thành terminalexit0. Cảnh báo chunk300kB còn nguyên. Buildcommand có publicURL/publickey; không đưa rawlog chứa cấu hình/tokens vàoGit.

SQL transaction001–013: Success.No rows returned. Truy vấn metadataSELECT đọc kết quảtrue như mụcB. RESTanon limit0 kiểm4bảng profiles/reading_history/orders/order_credentials đều401/42501, không trảdữliệu. GET/api/config checkout_enabled=false vàpublic_preview=true. Browser: Lưu hồ sơ→thông báo thành công→reload→profile đúng vàsession còn. Bằng chứng private ngoàiGit C:/Users/User/Downloads/boi/.oauth-production-20261026/profile-verification.json vàprofile-reloaded.png; screenshot có profileuser nên không commit.

### E. Lỗi/blocker
- HC-AUTH001 PASS phạmvi configbuild/deploy mới đã nhậnVITE; không còn thiếuclient.
- HC-AUTH003 PARTIAL: phiên thực vàprofile sauGoogle đã kiểm; chưalogout/cancel/expiry vàA/B.
- HC-PROFILE001 PASS cloud: schema thiếu gâyPGRST205, đãapply13vàsave/readback.
- HC-SB001 PASS phầnapply001–013/schema13, không đồng nghĩa tấtcảRLS/RPC đãQA.
- HC-AUTH002/HC-SB002 vàcác ORD/RPT/LIB: PARTIAL/NOT_TESTED cácgateA/B/editor/owner/MFA/Storage/lookup/payment/consent. CầnQAriêng, khôngđónghết.
- HC-SB004 P2: backup/restore/retention scheduler/quota chưa diễn tập. SQL Editor khôngghi SupabaseCLI migrationledger, cầnreconcile trướcdbpush; khôngpush/reapplymù.

### F. Còn thiếu
QA clouduserA/B, profile/historytamper, loginlogoutcancel, JWTexpiry/MFA, admin, orders/payment/concurrency, privateStorageURLs, consentrevocation vàbackuprestore. Không bậtcheckout/release vì lưu hồ sơ đãđược. Không có secret mới trongGit, khôngđổiACL/ngânhàng/pepper. Hai public configVITE chỉởCloudflarebuildcommand.

### G. Chủ dự án cần cung cấp
Không cần gửi key/password cho lỗi hồ sơ đã sửa. Muốn nghiệmthu hết cần tài khoản testA/B/editor/owner do chủ dự án kiểm soát vàxácnhận phạmviQA; không cấpadmin tựđộng.

### H. Tiếp theo
Giữ deploymentba575c3a vàschema13; khôngrunlạifileghép. Kiểmprofile/historyA/B,logout/refresh, rồi từngcloudgate theoSUPABASE_SETUP_GUIDE. Chưa mở đặtđơn/thu tiền. Cácbáocáolịchsử nói cloudchưaapply ởdưới làtrạngtháicũ trướcxácnhậnphiênnày.

### I. Kiểm tra
Production https://huyencanh.pages.dev/tai-khoan: đãlogin→profile→Lưu→reload. Local127.0.0.1:5173 làmôitrườngriêng chưa tựnhận cloudbuildvars. /admin khôngcócredentialsdefault vàchưacấpadmin. Windows cdD:/boi; npm run dev -- --port 5173 --strictPort, kiểmPIDtrướcstart. Khôngchỉdựa vàolocaltestđểbáocloudPASS.

---

## Google OAuth production — 2026-10-26T02:30:32+07:00

### A. Tổng quan
PARTIAL / IN_PROGRESS. Chẩn đoán lỗi trước OAuth đã xác minh trực tiếp production; end-to-end đăng nhập production chưa VERIFIED. Source D:/boi có bản sửa local, chưa commit/push/deploy phiên OAuth. Project vẫn không production-ready, không tăng tỷ lệ hoàn thành cloud từ rubric cũ.

### B. Việc thực hiện
Đọc source/build/Callback và Dashboard Cloudflare/Supabase bằng Chrome. Bundle production200 index-c-3TpVsN.js không có Supabase URL/public key, login tối ưu thành throw; nút Google vẫn enabled, không gọi Google vì auth=null. Cloudflare có hai biến VITE dạng Secret, giá trị encrypted không reveal; buildlog không liệt kê chúng, artifact xác nhận cấu hình không vào build. Không biết giá trị rỗng/sai hoặc thời điểm thêm biến. Deployment4c3c481f commit3cd559c đúng snapshot, repo nay hiển thị dywab0411/huyencanh nên không kết luận sai repo. Code còn gate VITE_PUBLIC_PREVIEW_ONLY=true và public build chủ động bỏ keys; không tắt guard tự động.

Files: src/lib/auth-config.ts mới (trim/env reason/publishable+legacy anon/server-key rejection), src/lib/auth.ts (alias VITE_SUPABASE_PUBLISHABLE_KEY ưu tiên tên ANON cũ, callback helper), tests/unit/auth-config.test.ts mới8tests, scripts/build-public-preview.mjs bỏ alias khỏi public build, OAUTH_DIAGNOSIS.md hướng dẫn Cloudflare chính xác. Copy/hash khớp checkout C đã test; backup D-before tại C:/Users/User/Downloads/boi/.oauth-evidence-20261026. Không hardcode key thật.

### C. Kiểm tra chức năng
PASS local: publishable format/legacy anon/config guard/PKCE URL bằng SDK thật, fixture giả và network bị chặn trong test. PARTIAL: OAuth code path. NOT_TESTED production: Google consent/login/session/logout/profile/history A/B, MFA/cloudRLS/Storage. Các nhóm ứng dụng giữ trạng thái báo cáo trước; không nghiệm thu thêm đơn/thanh toán/admin. Checkoutfalse, server PUBLIC_PREVIEW_ONLYtrue giữ nguyên.

### D. Kiểm thử
Checkout C:/Users/User/Downloads/boi/.github-sync-20261026, source đổi đã copy hash vào D. npm run format:check/lint/typecheck đều exit0; npm test45/45; npm run test:integration62/62; npm run build:public-preview0; npm run check:deploy0; npm run check:secrets0. npm run build với env publishable fixture + previewfalse exit0; không key thật, không request Supabase. Logs/checks.json ở .oauth-evidence-20261026 ngoài Git. E2E không chạy lại phiên OAuth, không coi SDK URL test là real OAuth. Cảnh báo chunk300kB vẫn còn. Không có build/lint/type lỗi cuối. Wrangler whoami chưa authenticated; Dashboard đọc được nhưng không đổi cloud. Production URL/browser và bundle đã kiểm trực tiếp, chưa hoàn tất login.

### E. Lỗi/blocker
- HC-AUTH001 P1 PARTIAL: production auth=null do build không có cấu hình Supabase; tái hiện /tai-khoan và nhấn Google. Hướng sửa: public build variables đúng tên, build thường, redeploy đúng source; chưa thao tác cloud.
- HC-AUTH002 P1 BLOCKED: nghiệm thu Auth/profile/history RLS trước bật Auth production. Không bỏ publicPreview hoặc MFA để test đạt.
- HC-AUTH003 P2 NOT_TESTED: session callback thực tế; code đi /auth/callback exchange rồi /tai-khoan; Supabase SiteURL đúng và allowlist /** đang bao phủ callback. Google provider bật theo chủ dự án, không coi là proof login thành công.
- HC-SB/DEPLOY/RPT/ORD/BIRTH/LIB chưa nghiệm thu cloud giữ nguyên.

### F. Còn thiếu
Build env public values/redeployment và source mới trên production; chủ tài khoản tự login/consent và nghiệm thu session/A-B/logout. Không giả đã kiểm key project thật. Không đổi secret server, database hoặc policy. Script rejection chỉ ngăn dùng key quản trị tạo client, không làm key VITE trở thành secret: tuyệt đối không đặt admin key vào VITE.

### G. Chủ dự án cần thao tác
Cloudflare Production build variables: VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY chứa public/publishable key (hoặc alias mới sau khi cập nhật source), dạng Text/build environment. Không gửi key qua chat. Build npm run build, outputdist. VITE_PUBLIC_PREVIEW_ONLY=false chỉ sau nghiệm thu Auth/RLS và xác nhận mở phần Auth. Giữ PUBLIC_PREVIEW_ONLY=true/CHECKOUT_ENABLED=false cho API thật. Callbackwebsite /auth/callback; Google callback là Supabase /auth/v1/callback. Chi tiết OAUTH_DIAGNOSIS.md, không tự redeploy trong phiên.

### H. Tiếp theo
Owner cấu hình public variables đúng build scope → xác nhận Auth/RLS → triển khai source đúng → login production thật → xác minh về /tai-khoan + logout/A-B → mới đánh VERIFIED. Không mở nhận đơn/payment.

### I. Kiểm tra
Production https://huyencanh.pages.dev/tai-khoan vẫn cần xác minh lại sau deployment. Local cd D:\boi; npm run dev -- --port 5173 --strictPort, kiểm PID trước start. /tai-khoan cần env và previewfalse; /admin vẫn membership+AAL2, không demo credentials. Không đổi ACL/pepper/ngân hàng hoặc Supabase data.

---

## Đồng bộ GitHub main — 2026-10-26T00:10:36+07:00

### A. Tổng quan
PASS: đã push và đối chiếu `refs/heads/main` của dywab0411/huyen-canh với commit nguồn `881e7a812dad2337609bf73eb8ca91cba40341f4`. Đồng bộ từ D:/boi qua checkout riêng trên C, giữ parent lịch sử, không force. Project vẫn IN_PROGRESS, cloud NOT_TESTED; không xác nhận deploy hoặc production-ready. Bốn báo cáo phiên này sẽ nằm trong commit tài liệu kế tiếp. Không thay tỷ lệ hoàn thành chức năng theo rubric trước.

### B. Công việc đã thực hiện
Sao lưu lịch sử Git đầy đủ bằng bundle, verify exit0; backup tệp tracked cũ và 179 tệp nguồn được duyệt bằng ZIP. Bundle: C:/Users/User/Downloads/boi/huyen-canh-main-before-20261026.bundle, SHA256 F3A203741D6E1272268A3A6563B21B13B48FD5236548AB6B5632AF56C40160C1. Bằng chứng và ZIP: C:/Users/User/Downloads/boi/.github-sync-evidence-20261026. Không đưa backup lên GitHub.

Trước: main `4a5451c2a48e54b6a5958130ac68d1f9d87f844d`, chỉ 25 file root. Sau: 179 file nguồn; 168 file thay đổi trong commit nguồn. Rà soát file tracked cũ: không có file vắng khỏi dự án nên số xóa obsolete=0. Đã thêm src/functions/supabase/tests/prompts/public/scripts/video-template/docs và tài liệu/config mới. Không commit env thật, node_modules/dist/logs/backup/operational data. Quét working tree và staged blob không phát hiện mẫu secrets; đây là heuristic, không phải bảo đảm tuyệt đối. Không ghi credential vào báo cáo.

### C. Kiểm tra chức năng
PASS cho đồng bộ source, backup bundle, normal push và đối chiếu remote commit. Không sửa chức năng ứng dụng trong phiên này. 17 nhóm chức năng giữ trạng thái và giới hạn kiểm chứng ở báo cáo trước; OAuth/RLS/Storage/admin/lookup/thanh toán cloud vẫn NOT_TESTED/BLOCKED. Checkout giữ false, profile public-only giữ true.

### D. Kết quả kiểm thử
Checkout C:/Users/User/Downloads/boi/.github-sync-20261026 khớp tệp nguồn D, trừ bốn báo cáo cập nhật phiên này. npm ci --ignore-scripts lần sandbox đầu FAIL exit1 ENOTFOUND registry.npmjs.org và cleanup EPERM; retry có quyền network PASS exit0, 292 packages/293 audited, 0 vulnerabilities. Không đổi lockfile hoặc tắt kiểm tra bảo mật.

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0 |
| `npm run test:integration` | 0 |
| `npm run build:public-preview` | 0 |
| `npm run check:deploy` | 0 |
| `npm run check:secrets` | 0 |

Unit37/37; integration62/62. E2E không chạy lại trong phiên đồng bộ; lần trước D46/46, không gán thành lần chạy mới. Public build/artifact kiểm 19 file; cảnh báo chunk lớn hơn300kB còn nguyên. git diff --cached --check ban đầu exit2 do CRLF/khoảng trắng có sẵn; đối chiếu với core.whitespace=cr-at-eol vẫn cảnh báo EOF và khoảng trắng trong giấy phép font. Không sửa migration hoặc bản quyền chỉ để xóa cảnh báo. git bundle verify0, commit0, push0, ls-remote0 và hash trùng. Logs/checks.json/sync-manifest trong thư mục bằng chứng ngoài repo.

### E. Lỗi còn tồn tại
HC-GH001 P3: cảnh báo khoảng trắng nguồn đã có; tái hiện git diff --check khi stage snapshot. File IMPLEMENTATION_STATUS.md, public/assets/fonts/NotoSerif-OFL.txt, public/assets/ho-sen-demo.vtt, migration001. Giữ nguyên nội dung/giấy phép/lịch sử; không chặn build. Cloud blockers HC-SB/DEPLOY/RPT/ORD/BIRTH/LIB giữ nguyên, xem lịch sử.

### F. Còn thiếu
Remote GitHub Actions và Cloudflare build/deploy chưa được nghiệm thu trong phiên. Push có thể kích hoạt tích hợp chủ dự án đã cấu hình; không coi điều đó là deploy thành công. Repository visibility không được xác minh bằng API trong phiên. Không truy cập hoặc thay đổi Supabase.

### G. Chủ dự án cần cung cấp
Không cần gửi secret để hoàn tất push; Git Credential Manager hiện có quyền ghi. Các cấu hình cloud thực hiện theo SUPABASE_SETUP_GUIDE.md và DEPLOY_FREE_GUIDE.md, không gửi secret qua chat.

### H. Tiếp theo
Kiểm tra Actions/Cloudflare nếu đã kết nối; chỉ công khai public-preview đã chuẩn bị. Supabase cloud cần xác nhận riêng trước migration và QA thật trước checkout. Giữ backup ngoài Git.

### I. Hướng dẫn kiểm tra
GitHub: https://github.com/dywab0411/huyen-canh/tree/main. Local Windows cd D:\boi; npm run dev -- --port5173 cần viết đúng `--port 5173 --strictPort`; kiểm PID trước khi start. URL http://127.0.0.1:5173. /admin vẫn cần Auth/membership/MFA thật, không có mật khẩu mặc định. Không đổi remote/history của Git local D; checkout thực hiện push ở C như trên.

---

## MỚI NHẤT — SUPABASE SETUP — 2026-10-25T23:29:50+07:00

### A. Tổng quan
IN_PROGRESS. Chuẩn bị kết nối local READY_FOR_QA; Supabase thật BLOCKED/NOT_TESTED. App 0.1.0; Git local staged, chưa commit/push. Không deploy, chưa có URL công khai; checkout vẫn false. Không tăng tỷ lệ hoàn thành tổng thể 56% theo rubric lịch sử vì chưa nghiệm thu cloud.

### B. Công việc đã thực hiện
PARTIAL tổng thể: đã rà soát 13 migration, quyền bảng/RPC, Storage, OAuth PKCE, admin membership + AAL2, lookup HMAC/session và khóa release trong mã. Tạo SUPABASE_SETUP_GUIDE.md, giải thích Dashboard, thứ tự 001–013, schema marker 13, bốn bucket private, bootstrap owner có xác nhận riêng, env matrix frontend/server, staging kiểm Auth khác public-only. Không sửa migration, không thực thi SQL cloud hoặc tự cấp quyền. Thay đổi liên quan vòng chuẩn bị deploy theo source-manifest.json và DEPLOY_FREE_GUIDE.md.

### C. Kiểm tra chức năng
| Nhóm | Trạng thái / phạm vi |
|---|---|
|Giao diện/hoạt ảnh và responsive|PASS regression local; cloud NOT_TESTED|
|12 nhóm bói miễn phí|PASS local; public URL NOT_TESTED|
|Google OAuth|PARTIAL code; provider/callback cloud NOT_TESTED|
|Hồ sơ và toàn bộ lịch sử|PASS regression local; RLS user A/B cloud NOT_TESTED|
|Bốn gói 10k/20k/60k/70k, G50 lịch sử|PASS local; giá DB thật NOT_TESTED|
|Tạo đơn|PARTIAL; khóa nhận đơn thật|
|Chuyển khoản thủ công|PARTIAL; không giao dịch thật|
|Xác nhận thanh toán|PASS local regression; quyền/concurrency cloud NOT_TESTED|
|Admin và phân quyền|PARTIAL; JWT/AAL2/membership thật NOT_TESTED|
|Tra cứu an toàn|PASS local regression; limiter/cookie/Storage cloud NOT_TESTED|
|Kết quả qua website|PARTIAL; staging thật NOT_TESTED|
|Zalo thủ công/email|PARTIAL; không gửi tin/email thật|
|Tạo/xuất video|PASS mẫu local; không tạo video khách thật|
|Quyền công khai video|PASS local regression; thu hồi cloud NOT_TESTED|
|Bảo mật/database|PASS integration local PGlite/mocks; cloud NOT_TESTED|
|Triển khai miễn phí|PARTIAL local artifact; chưa deploy|

### D. Kiểm thử thực sự đã chạy
Chạy tại D:/boi. Unit 37 đạt/0 lỗi; integration 62 đạt/0 lỗi. E2E 46 đạt theo e2e.log. Các test DB dùng PGlite và API mocks, không phải Supabase cloud.

| Lệnh | Exit code |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/deploy-free/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/deploy-free/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |

Build có cảnh báo chunk vượt 300 kB; không nâng ngưỡng để che. Bằng chứng đầy đủ tại docs/deploy-free/20261025; production-results.json ghi riêng Functions build, public build, artifact scan, export SQL và audit. Public preview browser tại loopback có bằng chứng riêng, không phải URL Internet. CI remote, OAuth thật, REST/RLS/Storage thật và backup/restore chưa kiểm do thiếu cấu hình và xác nhận cloud. Không chạy migration cloud.

### E. Lỗi và blocker
- HC-SB001 P1 BLOCKED: project Healthy chưa chứng minh có schema. Tái hiện: chưa có kết quả VERIFY_STAGING từ project thật. Khu vực supabase/migrations. Tiếp tục: chủ dự án kiểm project rỗng và xác nhận áp dụng 001–013; không reset.
- HC-SB002 P1 NOT_TESTED: OAuth/MFA/owner/RLS/private Storage thực tế chưa nghiệm thu. Tiếp tục: Dashboard theo guide và QA anon/A/B/editor/owner.
- HC-SB003 P1 BLOCKED: chưa có origin HTTPS staging và credentials đặt an toàn trong môi trường. Không lấy secrets từ screenshot/chat hoặc đoán ref.
- HC-SB004 P2 NOT_TESTED: retention scheduler, backup/restore, quota vận hành Free chưa diễn tập. Không coi migration 008 là cron đã hoạt động.
- Các HC-RPT/ORD/BIRTH/LIB/DEPLOY chưa nghiệm thu cloud giữ nguyên lịch sử, không tự đóng.

### F. Còn thiếu
Cloud schema/config thực tế, Google OAuth client/provider, callback allowlist, owner UUID + MFA, env server, Turnstile đúng hostname, QA RLS/API/Storage/concurrency/consent/restore. Public-only build cố ý không bật Auth và không cần Supabase keys; dùng staging riêng để kiểm Auth. Không có secret hoặc dữ liệu khách thật trong hướng dẫn.

### G. Chủ dự án cần cung cấp/thao tác
Đăng nhập Dashboard đúng project Free; kiểm project rỗng; xác nhận riêng trước SQL; xác lập origin staging; cấu hình provider; nhập khóa trực tiếp Dashboard; đối chiếu UUID owner và xác nhận bootstrap. Không gửi mật khẩu/token/key/MFA qua chat. Đã có ngân hàng do chủ dự án cung cấp, không yêu cầu lại hoặc tự thay đổi.

### H. Tiếp theo
Đọc SUPABASE_SETUP_GUIDE.md → kiểm project → xác nhận schema → thực hiện SQL và metadata check → OAuth/env/staging → QA thật → backup/restore → xác nhận release riêng. Giữ checkout và release false trong mọi bước hiện tại.

### I. Kiểm tra Windows
cd D:\boi; npm run dev -- --port 5173 --strictPort; npm run worker:preview -- --ip 127.0.0.1 --port 8788. Kiểm PID trước khi start lại, không dừng tiến trình chưa xác minh. Local http://127.0.0.1:5173; /tai-khoan để login/MFA khi cấu hình staging; /admin không có tài khoản mặc định. DEMO chỉ dev loopback với ?demo=1, dữ liệu giả, không API đặt đơn thật. Public-only artifact không có DEMO/Auth. Chi tiết env và Dashboard xem SUPABASE_SETUP_GUIDE.md.

---

# CODEX_REPORT.md

## CHUẨN BỊ INTERNET MIỄN PHÍ — 20261025-deploy-free-v8 — 2026-10-25T23:29:26+07:00

### A. Tổng quan

- Trạng thái dự án **IN_PROGRESS**; chuẩn bị phát hành **READY_FOR_QA local**, cloud **BLOCKED** do chưa đăng nhập/quyền cấu hình. App0.1.0; Git nhánh main đã khởi tạo/stage tạiD, chưa có commit hoặc remote. Không gọi repository local là GitHub Private đã tạo.
- Mức kiểm chứng tổng thể giữ ước tính56% theo rubric17nhóm cũ (4PASS+11PARTIAL×0,5)/17; không nâng tỷ lệ nhờ mock hoặc emulator. Public-preview đã kiểm trên workerd local http://127.0.0.1:8796, **không phải URL Internet**.
- URL website công khai: **CHƯA CÓ / NOT_DEPLOYED**. remoteVerified=False. Chưa deploy, chưa apply Supabase, chưa mở Auth/đơn/ảnh khách, không nhận tiền. Không chi tiền, thêm thẻ, nâng plan hoặc đổiACL.
- Đọc DEPLOY_FREE_GUIDE.md để triển khai từng bước. Nhu cầu mới cho phép preview nếu đủ quyền thay quy định chưa deploy trong lịch sử; quyền cloud hiện chưa đủ nên dừng ở bước chủ dự án đăng nhập.

### B. Công việc đã thực hiện

| Hạng mục | File chính | Kết quả thực tế |
|---|---|---|
| Production tương thích Pages/Functions | wrangler.toml, public/_routes.json, build/check scripts | PASS compile Wrangler và workerd local; chỉ /api/* dùng Functions |
| Chế độ public-preview chỉ miễn phí | main.tsx, auth.ts, deployment.ts, PublicPreviewNotice | PASS production browser:12tool/video, không formPII/Auth/DEMO/privatepages |
| Chặn dữ liệu trướcDB | functions/_middleware.ts | PASS4regression: POST/privateAPI403/405,no-store, khôngnext/queryDB; không đổi guard live |
| Artifact sạch | build-public-preview/check-deploy | PASS 19file, lớn nhất717258byte <25MiB, khôngQRnhậntiền/localDEMO/credentialpatterns; khôngxóaassetnguồn |
| GitHubPrivate chuẩn bị | .gitignore, prepare-repository, CI | PASS local 178file stage, khôngsecrets/artifacts; remote/privatevisibilityBLOCKED, khôngcommit/push |
| Database/RLS/Storage |13migration gốc, VERIFY_STAGING, export-migrations | PASS export/hash vàSQLfixtures; chưa thực thi Supabase thật; bucketprivate/roleQAremoteNOT_TESTED |
| OAuth/environment/guide | .env.example, DEPLOY_FREE_GUIDE, README/AGENTS/DECISIONS | Hướng dẫn đầy đủ PKCE/exactcallback/ownerMFA/secretlocations/freequota/rollback; OAuthremoteNOT_TESTED |
| Chi phí và quyền | cloud-access.json | CloudflareCLIauthenticated=False; Supabaseenvconfigured=False; không cóURLthật |

File thay đổi: `src/features/PublicPreviewNotice.tsx`, `src/lib/auth.ts`, `src/lib/deployment.ts`, `src/lib/site-info.ts`, `src/main.tsx`, `functions/_middleware.ts`, `tests/integration/public-preview.test.ts`, `supabase/VERIFY_STAGING.sql`, `scripts/build-public-preview.mjs`, `scripts/check-deploy.mjs`, `scripts/export-migrations.mjs`, `scripts/prepare-repository.mjs`, `scripts/scan.mjs`, `scripts/verify-public-preview.mjs`, `.github/workflows/ci.yml`, `AGENTS.md`, `DECISIONS.md`, `DATA_SOURCES.md`, `README.md`, `README_START_HERE.md`, `DEPLOY_FREE_GUIDE.md`, `SUPABASE_SETUP_GUIDE.md`, `.env.example`, `.gitignore`, `package.json`, `playwright.config.ts`, `eslint.config.js`, `wrangler.toml`, `public/_routes.json`. Không thay nội dung001–013 hoặc snapshot đơn cũ. Source-manifest cóSHA256; backupnén ởdocs/deploy-free/20261025/before.zip. Các tài liệu lịch sử giữ nguyên dưới phần mới.

### C. Kiểm tra chức năng

| Nhóm | Trạng thái và phạm vi |
|---|---|
|Giao diện/hoạt ảnh|PASS local dev vàproductionworkerd; cloudURLNOT_TESTED|
|Responsive|PASS regression và390px public-preview|
|12 nhóm miễn phí|PASS: cả12 chạy trênproductionartifact, khôngPOST; khôngkhẳngđịnhđộchínhxáctửvi|
|GoogleOAuth|NOT_TESTED cloud; cố ýtắt trongpublic-preview|
|Hồ sơ/lịch sử|PARTIAL local; public-previewkhôngmởAuth hoặcnhậndữliệu|
|Bốn gói10k/20k/60k/70k|PASS localUI; catalogdefault côngkhai, khôngcheckout|
|Tạo đơn|PARTIAL localregression/DEMO; internetpreviewchặn, realcloudNOT_TESTED|
|Chuyển khoản thủ công|PARTIAL UI local; QRkhôngđưa vàoartifactpublic; tiềnthậtNOT_TESTED|
|Xác nhận thanh toán|PARTIAL SQL/API local; realcloudNOT_TESTED, khôngmở|
|Admin/phân quyền|PARTIAL local; public-previewchặntrướcDB, realMFA/RLSNOT_TESTED|
|Tra cứu an toàn|PARTIAL localHMAC/session; privateAPIpublic-preview403/405; cloudNOT_TESTED|
|Trả kết quảwebsite|PARTIAL local; khôngkhách/tệpriêng trênbảnpublic|
|Zalo/email|PARTIAL contact; khônggửi hoặcđăngngoài|
|Tạo/xuấtvideo|PASS sample/sanitize local4+2; video mẫu productionphátđược, khôngvideo khách mới|
|Đồng ý côngkhai|PARTIAL localexactrevision; previewkhôngcấpquyền hoặcđọcdữliệu khách|
|Bảo mật/database|PARTIAL PGlite13migration/APIguards; cloudRLS/Storage/restoreNOT_TESTED|
|Triển khai miễn phí|PARTIAL build/guide/quotađãđốichiếu; chưadeploy hoặcverifyURLcôngkhai|

### D. Kết quả kiểm thử

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/deploy-free/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/deploy-free/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |
| `npm run build:public-preview` | 0 |
| `npm run check:deploy` | 0 |
| `npm run prepare:database` | 0 |
| `wrangler pages functions build functions --outdir .artifacts/functions --compatibility-date 2026-10-25` | 0 |
| `npm audit --json` | 0 |

- Unit37/37; integration62/62 gồm4casepublicmiddleware mới; E2E46 đạt tạiD. Media4+library-media2 thực, khôngcloud.
- `npm ci` đã chạy thật trên bảnCchuẩn bị:292packages, exit0; `npm audit` tạiD exit0, tổngvulnerabilities=0. Códeprecation/installscriptwarnings tronglầncàiC, không tự phê duyệt/chạy script ngoài quy trình. Khôngđổi dependencyđểchewarning.
- Public artifact thực sau productionbuild trênworkerd local:12tools +video, private formsclosed, APIPOST403/no-store, UIpost=0, pageerror=0, CSPerror=0, remoteVerified=false. Chi tiếtảnh/JSON tại docs/deploy-free/20261025/public.
- Functionsbuild bằngWrangler thànhcông, khôngdùngNode server/API ngoàiCloudflare. Normaldev/DEMO vàcloudprofile kiểm tách biệt. Buildwarningbundle>300KB giữ tronglog, khôngtăngthreshold.
- Trongchuẩn bị có lỗi lintquét .artifacts/functions generated vàformatpackage; đãignoređúnggeneratedartifact, giữtoàn bộrulesourcevàchạylại. Một lệnh khởi độngC dùngsainode_modulesrelativepath đãsửa; khôngphảiclouddeployfail. Cácgatecuối dùnglệnh/exitcode bêntrên.
- Chưa chạyGitHubCI, Supabase/OAuth/Storage/DBHTTP, restorecloud hoặcURLInternet vì thiếu quyền; khônggánPASS.

### E. Lỗi còn tồn tại

- HC-DEPLOY001 P1 BLOCKED: WranglerCLI chưa đăng nhập; không cóCloudflareaccount/projectFree đã xácminh. Tái hiệnwhoami khôngauthenticated. Chủdựánchạywranglerlogin hoặc đăngnhậpdashboard, kiểmFree; khôngdùngtemporaryaccount.
- HC-DEPLOY002 P1 BLOCKED: GitHubremotePrivate chưa tạo/xácminh; CLIghkhôngcóPATH. LocalGit staged, khôngpush/commit. Cầnchủaccount đăngnhập, tạoPrivate vàcấpCloudflarequyềnrepođó.
- HC-DEPLOY003 P1 BLOCKED: thiếuSupabaseFreeproject/ref/keys/OAuth/ownerMFA;13migration vàRLS/Storage cloudchưachạy. Public-previewkhông cần vàkhôngnhậncácsecretđó.
- HC-DEPLOY004 P2 NOT_TESTED: CIUbuntu/Chromium đãcấu hìnhnhưngchưa chạyGitHub, CPUquota/cloudheaders/realnetwork chưađo.
- CácHC-ORD/HC-BIRTH/HC-RPT/HC-LIB trướcđó vẫn còn phầncloud/retention/keyrotation/scanner/pagination/nativeQA/performance; khôngđóngbằngpublicpreview.

### F. Những gì còn thiếu

Không cóURLpublic/remoteGit/commit/GitHubCI/Supabasemigration/Auth/Storage/realpayment/restorecloud. Freequota đượcđốichiếutheonguồnchínhthức, khôngphảiđãxácminhplantàikhoản hoặcSLA. Gói public-previewkhông cóAuth/đơn/lookup/tảiảnh/QRpayment vàkhôngDEMO; đâylàgiớihạncốýđểkhôngnhậndữliệu khách trướcQA.

### G. Việc cần chủ dự án cung cấp

ĐăngnhậpGitHub/Cloudflare/Supabase, chọn/tạoFreeproject vàPrivate repo; cungcấptênrepository/project vàURL/refcôngkhai qua kênh phùhợp, không gửi token/mậtkhẩu/keytrongchat. Cácsecretchỉđặt ởdashboard/CLIriêng khiđếnstaging. Chốthoàntiền/retention/hỗtrợ trướcpaid; ngân hàng/QR/sốđiệnthoại đãcó, không yêu cầu lại.

### H. Công việc tiếp theo

1. Chủdựánđăngnhập vàtạoPrivateGitHub, kiểmstagedfiles/danh tínhGit, commit/pushkhôngtokenURL.
2. CloudflarePagesFreeGitintegration build `npm run build:public-preview`,dist; giữPUBLIC_PREVIEW_ONLY=true/CHECKOUT_ENABLED=false. Nếu tênprojectkhácwranglername thìđốichiếusửađúng.
3. Saudeploymới mởURLHTTPSthật vàchạyverify:public-preview,ghiHTTP/DOM/ảnh/timestamp. Chỉkhiđó ghiURLpublicPASS.
4. SupabaseFree mới:backupnếucódata,applybootstrap001–013mộtlần, VERIFY_STAGING, OAuth/ownerMFA vàma trậnHTTPquyền. Khôngmởlive bằngchỉđổiflag.

### I. Hướng dẫn kiểm tra

Hướngdẫnchủwebsite: [DEPLOY_FREE_GUIDE.md](DEPLOY_FREE_GUIDE.md). Bảnpublic-previewlocal đượckiểm ở http://127.0.0.1:8796 (khôngphảiInternet); localdev vẫn5173 vớiDEMO. Windows `cd D:\boi`; `npm run build:public-preview`; `npm run check:deploy`; `npm run worker:preview -- --ip 127.0.0.1 --port 8796`; `npm run verify:public-preview -- http://127.0.0.1:8796 docs/deploy-free/public-check`. Hiệncácserverđangchạy,kiểmPIDtrướcstart/stop.

Localrepochuẩnbịbằng `npm run prepare:repository -- --init`, khôngcommit/push. Không nhầm việc stage file hoặc Git init với việc đã tạo GitHub Private. Public/APIprofilechặnadmin,khôngcódemoAdmin. Khôngnânggói/thêmthẻ/đổiACL/rotatepepper hoặcxóadữliệuđơn.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## BÁO CÁO SAU VÒNG SỬA LỖI — 20261025-preview-v7 — 2026-10-25T18:08:42+07:00

### A. Tổng quan

Dự án IN_PROGRESS; bản xem trước VERIFIED local. App0.1.0, Git N/A. Source D:\boi, PID35444, revision2026-10-25-preview-v7. Local chạy được; không production-ready hoặc deploy. Ước tính tổng thể giữ56% theo rubric17nhóm báo cáo trước; bản sửa UI không nghiệm thu thêm cloud.

### B. Công việc đã thực hiện

Nguyên nhân: nút Xem trước chỉ gọi validation và hiện một câu hợp lệ, chưa render dữ liệu. Đặt thật là chức năng khác, đang cố ý khóa bởi thiếu backend/flag/Turnstile/security.

- src/features/orders/OrderPreview.tsx mới: tóm tắt gói/giá/người1–2/ngàyDD/MM/YYYY/giờHH:mm/contact/ghi chú/tệp đã chọn, kèm Chưa tạo đơn, không chuyển tiền. Chỉ state trong tab, không ghi storage/API và không tự tải ảnh.
- OrderPage.tsx: validation thành công khi checkout khóa hiển thị summary, cuộn và focus tới đó; sửa form xóa snapshot cũ. Bỏ nút đặt thật disabled gây nhầm, thay bằng thông tin trạng thái; giữ nguyên guard server và form. DEMO CTA chỉ dev/loopback, link chỉ mang mãgói, không chuyển PII sangDEMO.
- style.css/site-info.ts revisionv7; test mới tests/e2e/order-preview.spec.ts.
- PASS local; không sửa API/DB/secret/flags/ACL hoặc dữ liệu đơn thật.

### C. Kiểm tra chức năng

| Phạm vi | Trạng thái |
|---|---|
|Xem trước local có nội dung|PASS browser5173 khôngmock; dữ liệu giả khớp ngày/giờ/gói/giá/ghi chú|
|Chỉnh form/đóng summary/focus|PASS regression; snapshot cũ xóa khi sửa, focus summary sau submit|
|CTA DEMO riêng|PASS chỉ mang góiG60, không PII, không giả đã tạo đơn|
|Responsive/12tool/bốn gói/DEMO/video mẫu|PASS regression local|
|Nhận đơn/thanh toán/lookup/privatefiles/admin/OAuth cloud|PARTIAL/NOT_TESTED như bảng17nhóm trước; checkout vẫn khóa|
|Consent ảnh/public video|Không đổi; regression localPASS, cloudNOT_TESTED|
|Production/khả năng miễn phí|NOT_TESTED; khôngdeploy|

### D. Kết quả kiểm thử

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/preview-round/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/preview-round/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |

Unit37/37, integration58/58, E2E46 đạt; media4+library-media2. Regression mới đã chạy đỏ trước sửa: không tìm thấy regionBản xem trước yêu cầu. Sau sửa kiểm summary vàclearOnEdit/noPOST đạt. Browser5173 thật riêng khôngmock: focus/clearOnEdit/mobile/DEMOLink đúng, POST=0, pageerror=0, checkout_enabled=false. Logs/manifest/browser.json tại docs/preview-round/20261025, ảnh docs/screenshots/preview-round. Trong lần chạy D đầu,45/46E2Eđạt: một test cũ vẫn tìm nút disabled đã thay bằng trạng thái. Đã đổi kiểm tra sang thông báo khóa, không có nút tạo thật và APIcheckoutfalse, giữ kiểm thử guard; chạy lại toànbộ. Buildwarning bundle nếu có giữ trongbuild.log; mock không chứng minhcloud.

### E. Lỗi còn tồn tại

HC-PREVIEW001 P2 đã sửa local. HC-BIRTH001/HC-ORD001/002 và cácHC-RPT/HC-LIB đang mở giữ nguyên: cloud001–013/Auth/MFA/RLS/Storage/Turnstile/manualpayment/lookup cần nghiệm thu; không bỏ guard để làm nút đặt thật hoạt động.

### F. Những gì còn thiếu

Chưa nhận đơn hoặc giao dịch thật. Bản xem trước không lưu, không mã đơn, khôngupload, không quyền công khai. DEMO khác bản xem trước và khác đơn thật. Các hạn chế retention/cleanup/keyring/scanner/pagination/nativeQA/performance còn theo lịch sử.

### G. Chủ dự án cần cung cấp

Không cần thêm cho bản xem trước local. Nhận thật vẫn cần môi trường staging, credentials qua kênh cấu hình an toàn, owner/MFA và policy đã chốt như checklist cũ; không ghi secret vào báo cáo.

### H. Công việc tiếp theo

Nghiệm thu staging001–013 cùng Auth/RLS/MFA/Turnstile/lookup/idempotency/paymentmanual/rights/privatefiles/restore, sau đó owner mới duyệt release vàbậtflag. Khôngdeploy trong phiên này.

### I. Hướng dẫn kiểm tra

Mở http://127.0.0.1:5173/dat-don?goi=G60, nhập dữ liệu giả hợp lệ rồi bấm Xem trước yêu cầu: tự cuộn tới bản tóm tắt. Sửa form thì summary cũ đóng; bấm lại để xem mới. Muốn thử tạo mã và tra cứu, dùng nút Thử đặt đơn DEMO. Không chuyển tiền hoặc coi preview là đơn đã được nhận.

Windows: cd D:\boi; npm run build; npm run worker:preview -- --ip 127.0.0.1 --port 8788; npm run dev -- --port 5173 --strictPort. Server đang chạy; kiểmPIDtrướcstart/stop. /admin cầnmembership+MFA thật, khôngdemoaccount. KhôngđổiACL/secret hoặc xóa dữ liệu.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## BÁO CÁO SAU VÒNG SỬA LỖI — 20261025-demo-v6 — 2026-10-25T17:53:04+07:00

### A. Tổng quan

Dự án IN_PROGRESS; sửa giao diện chuyển khoản DEMO VERIFIED local. App0.1.0, Git N/A. Source D:\boi, PID35444, revision2026-10-25-demo-v6. Local chạy được; không production-ready và không deploy. Ước tính kiểm chứng toàn dự án giữ56% theo rubric17nhóm ở báo cáo trước, không tăng nhờ bản sửa DEMO.

### B. Công việc đã thực hiện

Nguyên nhân tái hiện: nút bịdisabled sau lần bấm đầu tiên bởiorder.stage kháccreated nhưng vẫn giữ nhãn cũ; thông báo ở dưới card khiến trạng thái khó nhận biết. Không phải tiền thật bị khóa hay chưa bật thanh toán.

- src/features/orders/DemoOrder.tsx: trạng thái Bước2/3 và Đã ghi nhận ngay trong card; nút đổi thành Xem lại thông báo và vẫn bấm được, không chuyển trạng thái ngược; link tra cứu thành nút chính. Bắt lỗi bản ghi hết hạn/thất lạc, không tự tạo lại hoặc giả nhận tiền.
- src/lib/site-info.ts: revisiondemo-v6.
- tests/e2e/demo-transfer.spec.ts: regression tái hiện trước sửa thất bại, sau sửa kiểm bấm lại/notice/claimed/tra cứu/kết quả/0POST.
- PASS local theo DOM thực tế; không sửa API, database, secret, flag hoặc đơn hàng thật.

### C. Kiểm tra chức năng

| Phạm vi | Trạng thái |
|---|---|
|Tạo DEMO→báo chuyển khoản→tra cứu→mẫu|PASS trình duyệt thật5173, khôngmock và0POST|
|Bấm lại sau báo chuyển khoản|PASS nút enabled, trạng thái giữclaimed; thông báo ngay trongcard|
|NgàyDD/MM/YYYY và giờHH:mm|PASS regression, giữ nguyên|
|Giao diện/responsive/12công cụ/bốn gói/video mẫu|PASS regression local|
|Thanh toán/đơn/tra cứu/privatefiles/admin/Auth/MFA cloud|PARTIAL hoặcNOT_TESTED như bảng17nhóm ở báo cáo trước; không mở các blocker|
|Quyền công khai video và quyền ảnh|Không thay đổi; regression localPASS, cloudNOT_TESTED|
|Triển khai miễn phí/production|NOT_TESTED; khôngdeploy|

### D. Kết quả kiểm thử

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/claim-round/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/claim-round/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |

Unit37/37; integration58/58; E2E45 đạt tạiD; media4+library-media2. Test mới đã chạy đỏ trước sửa với lỗi không tìm thấy nút xem lại sau lầnclickđầu. Browser5173 sau sửa khôngmock: repeatedClick/notice/lookupAndSample đềutrue, POST=0, pageerror=0. Log/manifest/browser.json tại docs/claim-round/20261025, ảnh docs/screenshots/claim-round/claimed-clear-next-step.png. Buildwarning nếu có giữ trongbuild.log.

### E. Lỗi còn tồn tại

HC-DEMO-TRANSFER P2: đã sửa và kiểm local. HC-BIRTH001/HC-ORD001/002 và cácHC-RPT/HC-LIB còn mở theo TODO trước: migration013/Auth/RLS/MFA/Turnstile/lookup/payment/Storage cloud chưa nghiệm thu. Không đóng cácblocker đó bằng testDEMO.

### F. Những gì còn thiếu

Không có giao dịch ngân hàng hoặc đơn thật trong phiên. DEMO vẫn TTL1h/trongtab và không lưuPII/ảnh; không phải đơn thành công thật. Cloud/retention/cleanup/keyring/scanner/nativeQA/pagination còn phạm vi chưa kiểm/chưa làm theo lịch sử.

### G. Chủ dự án cần cung cấp

Không cần bổ sung cho lỗi DEMO. Nhận đơn thật vẫn cần cấu hình staging, quyềnowner/MFA và chính sách đã chốt như trước; không ghi secret vào report.

### H. Công việc tiếp theo

Nghiệm thu staging001–013 theo ORDER_FLOW_VERIFICATION dùng schema13, sau đó owner mớiduyệt release vàflag. Không thay quyền hệ thống hoặc deploy trong phiên này.

### I. Hướng dẫn kiểm tra

Mở http://127.0.0.1:5173/dat-don?demo=1&goi=G20, dùng dữ liệu giả, tạoDEMO→bấm Giả lập báo chuyển khoản. Sau đó thấy Đã ghi nhận và có nút Xem lại thông báo vẫn bấm được. Lưu mã DEMO→bấm Tra cứu DEMO→nhập mã→Giả lập trả kết quả mẫu. Không chuyển tiền.

Windows: cd D:\boi; npm run build; npm run worker:preview -- --ip 127.0.0.1 --port 8788; npm run dev -- --port 5173 --strictPort. Server hiện đang chạy, kiểmPID trướcstart/stop; /admin cầnmembership+MFA thật. Không deploy/đổiACL/secret hoặc xóa dữ liệu.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## BÁO CÁO SAU VÒNG SỬA LỖI — 20261025-birth-v5 — 2026-10-25T17:47:56+07:00

### A. Tổng quan

Trạng thái toàn dự án **IN_PROGRESS**; bản sửa định dạng nhập **VERIFIED local**. App0.1.0, Git N/A. Chạy tại5173, source D:\boi, PID35444, revision 2026-10-25-birth-v5. Chưa production-ready, không deploy, không mở nhận tiền thật. Mức kiểm chứng tổng thể giữ ước tính56% theo rubric17nhóm cũ (4PASS+11PARTIAL×0,5)/17; không nâng tỷ lệ nhờ kiểm local.

### B. Công việc đã thực hiện

| Công việc | File chính | Kết quả |
|---|---|---|
| Sửa ô giờ bị khóa mặc định | BirthFields.tsx | PASS: nhập ngay, hiển thị HH:mm24h như09:37; không suy đoán00:00 |
| Ngày/tháng/năm rõ ràng | BirthFields,birth-format.ts | PASS: DD/MM/YYYY độc lập locale; dữ liệu gửi ISOYYYY-MM-DD |
| Đồng bộ API và SQL | order-model, migration013, api/config | PASS local: HH:mm, phút00–59; marker13 và khóa release; cloud NOT_TESTED |
| Giữ dữ liệu đơn cũ | migration013, OrderBirthDetails | PASS SQL snapshot: giờ09 cũ giữ nguyên; admin ghi chưa có phút, ngày hiển thịDD/MM/YYYY |
| Không rõ giờ và hai người | BirthFields, tests | PASS: bỏ trống/Không rõ→null; chọn Không rõ xóa giờ cũ; nửa đêm00:00 là giá trị hợp lệ riêng |

Các file theo manifest: `src/features/admin/OrderBirthDetails.tsx`, `src/features/orders/birth-format.ts`, `src/features/orders/BirthFields.tsx`, `src/features/orders/order-model.ts`, `src/lib/site-info.ts`, `src/style.css`, `functions/api/config.ts`, `tests/e2e/birth-format.spec.ts`, `tests/e2e/local-fixes.spec.ts`, `tests/e2e/order-demo.spec.ts`, `tests/e2e/visible-v3.spec.ts`, `tests/integration/config-readiness.test.ts`, `tests/integration/database.test.ts`, `tests/integration/orders-v2.test.ts`, `tests/unit/birth-format.test.ts`, `tests/unit/orders-v2.test.ts`, `supabase/migrations/202610250013_birth_minutes.sql`, `DECISIONS.md`. Backup trước sửa nằm docs/birth-round/20261025/before.zip, không giải nén các bản test backup vào repo.

### C. Kiểm tra chức năng

| Nhóm | Trạng thái / phạm vi |
|---|---|
|Giao diện và hoạt ảnh|PASS local regression + DOM giờ/ngày mới|
|Responsive|PASS390px form mới và regression desktop/mobile|
|12 nhóm bói miễn phí|PASS regression local|
|Google OAuth|NOT_TESTED cloud|
|Hồ sơ và lịch sử|PARTIAL; quyền/snapshot local đạt, Auth thật chưa nghiệm thu|
|Bốn gói10k/20k/60k/70k|PASS UI/regression local; G50 chỉ đơn cũ|
|Tạo đơn hàng|PARTIAL backend thật; DEMO PASS riêng, không tạo đơn thật|
|Chuyển khoản thủ công|PARTIAL UI; giao dịch ngân hàng NOT_TESTED|
|Xác nhận thanh toán|PARTIAL regression local; tiền thật NOT_TESTED|
|Admin và phân quyền|PARTIAL local SQL/API; Auth/MFA cloud NOT_TESTED|
|Tra cứu an toàn|PARTIAL HCX local; cloud NOT_TESTED|
|Trả kết quả website|PARTIAL private cloud; DEMO mẫu PASS|
|Zalo thủ công/email|PARTIAL contact; không gửi tự động|
|Tạo/xuất video|PASS media/sanitize local4+2; không tạo video khách mới|
|Đồng ý công khai video|PARTIAL local; không đổi gate consent riêng|
|Bảo mật/database|PARTIAL13migrationsPGlite; cloud chưa apply013|
|Triển khai miễn phí|NOT_TESTED quota; không deploy|

### D. Kết quả kiểm thử

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/birth-round/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/birth-round/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |

Unit37/37; integration58/58; Edge E2E44 đạt. Media4 +library-media2. Logs/JSON tại docs/birth-round/20261025. Test mới:2unit birth-format,1SQL HH:mm/legacy,2E2E live/DEMO; E2E gửi API fixture giữ09:37 không mất phút. Các E2E backend có mock không được coi là cloud PASS.

Kiểm riêng trên trình duyệt5173 **không mock**: form thật và DEMO,2người, hiển thị29/02/2000 và09:37, canonical2000-02-29, midnight00:00, Không rõ xóa giờ, mobile390px; POST=0, pageerror=0. Ảnh trong docs/screenshots/birth-round và BIRTH_INPUT_VERIFICATION.md.

Trong staging có1assertion thất bại do fixture thêm giờ09 vào cả đơn mới khi chỉ định thêm cho legacy; đã thu hẹp fixture đúng đơn cũ rồi chạy integration58 đạt. Không sửa guard để test qua. Build warning bundle nếu có giữ trong build.log.

### E. Lỗi còn tồn tại

- HC-BIRTH-001 P1 BLOCKED: migration013 chưa apply Supabase thật. Sau apply012 nhưng chưa013, schema marker không khớp nên checkout giữ khóa. Cần backup/apply001–013 và QA staging trước release.
- HC-ORD001/002 và các HC-RPT/HC-LIB đang mở theo TODO trước vẫn giữ: backend/challenge/security/cloud, retention/cleanup, key rotation, scanner/nativeQA, pagination/performance.

### F. Những gì còn thiếu

Không nghiệm thu cloud, không mở checkout. HH:mm mới cần migration013; đơn cũ HH không suy đoán phút. DEMO vẫn không PII lưu trữ/ảnh/API/tiền thật; kết quả mẫu không cá nhân hóa. Không có tích hợp gửi thông báo thật được kiểm chứng trong phiên này.

### G. Chủ dự án cần cung cấp

Không cần thêm thông tin cho bản sửa nhập local. Để nhận thật vẫn cần staging/Auth/OAuth/Turnstile/ownerMFA, cấu hình bảo mật và chính sách hoàn tiền/retention đã chốt; không ghi secret vào báo cáo.

### H. Công việc tiếp theo

Apply001–013 lên staging sau backup, kiểm quyền A/B/admin/MFA và DOB/HH:mm không lộ qua lookup; chạy checklist nhận đơn thật trong ORDER_FLOW_VERIFICATION, dùng schema13 thay12. Chỉ owner mở release/flag sau nghiệm thu; không deploy phiên này.

### I. Hướng dẫn kiểm tra

Mở http://127.0.0.1:5173/dat-don?demo=1&goi=G20. Nhập ngày29/02/2000 hoặc gõ29022000; giờ09:37 hoặc gõ0937. Ô giờ mở ngay; để trống hoặc chọn Không rõ sẽ lưunull. Hai người có cùng định dạng. Tạo DEMO thử, không chuyển tiền.

Windows: `cd D:\boi`; `D:\npm.cmd run build`; Worker `D:\npm.cmd run worker:preview -- --ip 127.0.0.1 --port 8788`; Vite `D:\npm.cmd run dev -- --port 5173 --strictPort`. Server hiện chạy, kiểmPID trước start/stop. /admin cần membership+MFA thật, không có tài khoản demo. Không đổi ACL/secret hoặc dữ liệu đơn thật.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## BÁO CÁO SAU VÒNG SỬA LỖI — 20261025-order-v4 — 2026-10-25T17:38:24+07:00

### A. Tổng quan

Dự án **IN_PROGRESS**; đặt đơn/DEMO/ngày sinh/điều khoản **VERIFIED local**, cloud chưa nghiệm thu. App0.1.0, Git N/A. Local chạy ở5173 sourceD PID35444; không production-ready, không deploy. Mức kiểm chứng toàn dự án giữ ước tính56% theo17nhóm trước (4PASS+11PARTIAL×0,5)/17; không phải tỷ lệ an toàn. Không nâng tỷ lệ cloud vì DEMO đạt.

### B. Công việc đã thực hiện

| Hạng mục | File chính | Kết quả |
|---|---|---|
| Chẩn đoán checkout | functions/api/config.ts, readiness-presence.json | PASS local: BACKEND_NOT_CONFIGURED, CHECKOUT_FLAG_OFF, CHALLENGE_NOT_CONFIGURED, SECURITY_NOT_CONFIGURED; không kết nối cloud để đánh giá DB |
| DEMO riêng | DemoOrder.tsx,demo-model.ts,OrderPage/LookupPage | PASS4gói browser: tạo mã/báo chuyển khoản giả/tra cứu/kết quả mẫu;0POST |
| Ngày/giờ sinh | BirthFields,order-model,API,migration012 | PASS local: ngày đúng/không tương lai, HH00–23/null, người2conditional; không backfill |
| Admin chi tiết sinh | OrderBirthDetails,admin/order-details | PASS API auth+MFA/DTO hẹp và SQL quyền; cloudNOT_TESTED |
| Hai câu video | VideoTerms,style.css,main FAQ | PASS nguyên văn2câu choG60/G70, khôngcheckbox trong khung, bỏ FAQ public; quyền ảnh/public riêng giữ nguyên |
| Giữ guard/order snapshots | migration012,existingRLS/API/regressions | PASS local; schema12/releasefalse; không đổi flag/secret/ACL hoặc dữ liệu thật |

File thay đổi: `src/features/admin/OrderBirthDetails.tsx`, `src/features/admin/Workspace.tsx`, `src/features/orders/BirthFields.tsx`, `src/features/orders/demo-model.ts`, `src/features/orders/DemoOrder.tsx`, `src/features/orders/LookupPage.tsx`, `src/features/orders/order-model.ts`, `src/features/orders/OrderPage.tsx`, `src/features/orders/VideoTerms.tsx`, `src/lib/site-info.ts`, `src/main.tsx`, `src/style.css`, `functions/api/config.ts`, `functions/api/[[path]].ts`, `tests/e2e/local-fixes.spec.ts`, `tests/e2e/order-demo.spec.ts`, `tests/e2e/visible-v3.spec.ts`, `tests/integration/api.test.ts`, `tests/integration/config-readiness.test.ts`, `tests/integration/database.test.ts`, `tests/integration/orders-v2.test.ts`, `tests/integration/version-api.test.ts`, `tests/unit/orders-v2.test.ts`, `supabase/migrations/202610250012_order_birth.sql`, `DECISIONS.md`. Source-manifest có SHA256; backup nén trước vòng và kết quả staging nằm docs/order-round/20261025. Không giải nén backup test vào repository trước chạy Vitest.

### C. Kiểm tra chức năng

| Nhóm | Trạng thái |
|---|---|
|Giao diện và hoạt ảnh|PASS local DOM/ảnh thật; UI DEMO gắn nhãn rõ|
|Responsive|PASS390px đặt đơn và regression360/390/768/1024/1440|
|12 nhóm bói miễn phí|PASS regression; không tuyên bố chính xác tâm linh|
|Google OAuth|NOT_TESTED cloud|
|Hồ sơ và lịch sử|PARTIAL, regression local; Auth thậtNOT_TESTED|
|Gói10k/20k/60k/70k|PASS local; G50chỉ đơn cũ|
|Tạo đơn hàng|PARTIAL real backend; PASS DEMO riêng, không đơn thật|
|Chuyển khoản thủ công|PARTIAL UI/hướng dẫn; giao dịchNOT_TESTED|
|Xác nhận thanh toán|PARTIAL, localpermissions/versionregression; tiền thậtNOT_TESTED|
|Admin và phân quyền|PARTIAL SQL/API/E2E fixtures, cloudNOT_TESTED|
|Tra cứu an toàn|PARTIAL realHCX; DEMOlocalPASSkhác namespace|
|Trả kết quả website|PARTIAL privatecloud; DEMOtext/video mẫuPASS|
|Zalo thủ công/email|PARTIAL contacttel; không gửi tự động|
|Tạo/xuất video|PASS media/sanitize local4+2; không tạovideo khách mới|
|Đồng ý công khai video|PARTIAL localregression; hai câu không cấp quyền; cloudNOT_TESTED|
|Bảo mật/database|PARTIAL12migrationPGlite/auth/CSRF/MFAguards; cloudNOT_TESTED|
|Triển khai miễn phí|NOT_TESTEDquota; không deploy|

### D. Kết quả kiểm thử

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/order-round/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/order-round/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |
| `npm run test:worker` | 0 |

Unit35/35, integration57/57, E2E42 đạt; media4+library-media2. Test mới6E2E trong order-demo.spec.ts, unitngày/giờ,2SQLvalidation/privacy, APIadminDTO/authMFA vàconfigblockers. Regressioncasecũ bổ sungDOB và bỏ đọc chi tiết khỏi mutationfixture, không giảm kiểm concurrency. Kiểm5URL/12tool/regressioncũ giữ phạm vi cũ, cloud không được tínhPASS.

Trong staging có13/14E2E đạt, ca adminfixture nhận endpointđọc mới nhưmutation; đã sửa mock đọc rồi chạy lại. Một full staging có41/42đạt, ca offlinecong-danh timeout trong lúc đang cập nhật source; giữ log thất bại, không coi lần đóPASS. Có lệnhintegration chạy nhầm Croot quét các backup thiếu migrations và thất bại; kết quả đó không dùng báo D. Bảng trên là lần cuối tạiD; không che các lần thất bại. Buildwarning bundle còn trong build.log.

### E. Lỗi còn tồn tại

- HC-ORD-001 P1 BLOCKED: môi trường hiện thiếu backend/challenge/security/flag; xem configblockers. Tái hiện /api/config trảfalse. Chỉ cấu hình staging và nghiệm thu checklist ORDER_FLOW_VERIFICATION mới mở.
- HC-ORD-002 P1 NOT_TESTED: migration012/DOB/privatephoto/adminvàRLS chưa chạy Supabase thật; cần backup/apply001–012 vàma trận quyền.
- HC-RPT-001/014,HC-LIB-001/004 cloudBLOCKED;002retentioncleanup,008rotation,009scanner,010nativeQA,012docs,013bundle vàHC-LIB003pagination còn mở như lịch sử. HC-RPT004/007 vẫnPARTIAL.

### F. Những gì còn thiếu

Không có kết nối DB cloud/checkout thật/siteverify thật/ownerMFA thật/privateupload vàdelivery/revoke thực. Migration012 chưa apply cloud. DEMO cố ý không ảnh/cá nhân hóa/liên hệ/QR nhận tiền/paid thật và không mang dữ liệu sangtab. Không có consent công khai từ2câu hợp đồng. Hạn chếfreequota chưa kiểm hiện hành.

### G. Chủ dự án cần cung cấp

Quyền staging và cấu hình Supabase/Auth/OAuth/Turnstile/backendpepper+origin, ownerUUID/MFA; chính sách hoàn tiền/retention và giờ hỗ trợ đã chốt. Ngân hàng/QR/hai số/hai câu đã có, không yêu cầu lại. Không đưa secret vào report.

### H. Công việc tiếp theo

Nghiệm thu staging001–012→roles/lookup/challenge/paymentmanual/version→privatephotos/video/rights/revoke/restore→ownerduyệt release rồi mớibậtflag. Retention/keyring/pagination/QA/performance theoTODO. Không deployproduction phiên này.

### I. Hướng dẫn kiểm tra

Mở http://127.0.0.1:5173/dat-don?demo=1&goi=G20. Dùng tên giả có sẵn, ngày2000-02-29; giờkhôngrõ giữnull. TạoDEMO→chép mã DEMO→báo chuyển khoản giả→Tra cứuDEMO→nhậpmã→kết quả mẫu. Không chuyển tiền. TTL1h/tab, có nútxóadữliệuDEMO.

Formthật http://127.0.0.1:5173/dat-don?goi=G70 vẫnkhóa. /admin cần membership+MFA thật, khôngdemoaccount. Windows: `cd D:\boi`; `D:\npm.cmd run build`; cửa sổ1 `D:\npm.cmd run worker:preview -- --ip 127.0.0.1 --port 8788`; cửa sổ2 `D:\npm.cmd run dev -- --port 5173 --strictPort`. Serverhiệnđangchạy, kiểmPIDtrướcstart/stop. Không đổiACL hoặc dừngtiếntrìnhkhác.

Chi tiết/bằng chứng: [ORDER_FLOW_VERIFICATION.md](ORDER_FLOW_VERIFICATION.md), browser.json, results.json và ảnh docs/screenshots/order-round.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## BÁO CÁO SAU VÒNG SỬA LỖI — 20261025-visible-v3 — 2026-10-25T16:43:58+07:00

### A. Tổng quan

- Trạng thái **IN_PROGRESS** toàn dự án; phần giao diện mới **VERIFIED local** bằng trình duyệt5173. App0.1.0, Git N/A. Chạy local được; không production-ready, không deploy.
- Mức kiểm chứng tổng thể ước tính vẫn56% theo17 nhóm báo cáo cũ (4PASS +11PARTIAL×0,5 =9,5/17); không phải phần trăm an toàn hoặc code đã viết. Các điều kiện cloud chưa đóng.
- PID mới 35444, source/cwd D:\boi, Vite dev revision2026-10-25-visible-v3. [Bằng chứng giao diện](VISIBLE_UI_VERIFICATION.md) và ảnh thực tế tại docs/screenshots/latest. Đã áp dụng yêu cầu trực tiếp mới cho bốn giá/form/QR/lookup, thay quyết định chỉ tham khảo của vòng trước.

### B. Công việc đã thực hiện

| Công việc | File chính | Kết quả thực tế |
|---|---|---|
| Chẩn đoán server và đúng source | vite.config.ts, docs/visible-ui/20261025/process-after.json | PASS local: PID/source/mode/revision và5DOM thật |
| Bốn gói, bỏ SLA mới | lib/packages.ts, api/packages.ts, migration011 | PASS UI/SQL fixture; cloud NOT_TESTED; không đổi snapshot cũ |
| Trang chủ dài hơn/nội dung thật | main.tsx, HomeSections.tsx, styles.css | PASS DOM benefits/community/differences/FAQ, không fake reviews |
| Form mới/QR/hỗ trợ | OrderPage,PaymentInfo,order-model,site-info,QR JPG | PASS DOM form/copy/QRbytes/tellinks; upload thật NOT_TESTED |
| Tra cứu mã bí mật | LookupPage,UpgradeAccess,API catchall,migration011 | PASS defaultDOM+regression SQL; cloud NOT_TESTED |
| Ảnh riêng/consent/khóa xuất bản | customer-photos.ts,migration011 | PASS local quyền/đủ tuổi/quarantine/video gate; cloud NOT_TESTED |
| Thư viện/video CMS hiện hữu | PublicGallery,VideoLibrary,migration010 | Giữ nguyên và regression local PASS; cloud PARTIAL |

File đã thay đổi (manifest SHA256): `src/domain.ts`, `src/features/admin/Workspace.tsx`, `src/features/HomeSections.tsx`, `src/features/orders/LookupPage.tsx`, `src/features/orders/order-model.ts`, `src/features/orders/OrderPage.tsx`, `src/features/orders/PaymentInfo.tsx`, `src/features/orders/Portal.tsx`, `src/features/orders/UpgradeAccess.tsx`, `src/lib/packages.ts`, `src/lib/site-info.ts`, `src/main.tsx`, `src/style.css`, `functions/api/config.ts`, `functions/api/packages.ts`, `functions/api/[[path]].ts`, `functions/customer-photos.ts`, `tests/e2e/local-fixes.spec.ts`, `tests/e2e/site.spec.ts`, `tests/e2e/visible-v3.spec.ts`, `tests/integration/api.test.ts`, `tests/integration/database.test.ts`, `tests/integration/orders-v2.test.ts`, `tests/unit/orders-v2.test.ts`, `tests/unit/packages.test.ts`, `supabase/migrations/202610250011_visible_orders_v2.sql`, `AGENTS.md`, `ASSET_LICENSES.md`, `DECISIONS.md`, `vite.config.ts`, `public/assets/sacombank-owner-qr.jpg`.

### C. Kiểm tra chức năng

| Nhóm | Trạng thái / phạm vi |
|---|---|
| Giao diện và hoạt ảnh | PASS local DOM+browser, không thay nội dung bằng fixture trong5URL |
| Responsive | PASS local E2E và390px ba trang mới; native device NOT_TESTED |
|12 nhóm bói miễn phí|PASS regression local, không chứng minh tử vi truyền thống chính xác|
|Google OAuth|NOT_TESTED cloud|
|Hồ sơ và lịch sử|PARTIAL: own-user SQL/UI có regression, Auth thật NOT_TESTED|
|Gói10k/20k/50k cũ →10k/20k/60k/70k mới|PASS DOM/API default/SQL snapshot; cloud NOT_TESTED|
|Tạo đơn hàng|PARTIAL: model/API/SQL/E2E fixture, nhận đơn thật khóa|
|Chuyển khoản thủ công|PARTIAL: ngân hàng/QR/tel PASS hiển thị; giao dịch NOT_TESTED|
|Xác nhận thanh toán|PARTIAL: regression phân quyền/version, ngân hàng thật NOT_TESTED|
|Admin và phân quyền|PARTIAL: local SQL/E2E đạt; Auth+MFA thật NOT_TESTED|
|Tra cứu an toàn|PARTIAL: mã HMAC256bit, legacyupgrade/session/reset local đạt; cloud NOT_TESTED|
|Trả kết quả website|PARTIAL: published-only+video gates local đạt; Storage thật NOT_TESTED|
|Zalo thủ công/email|PARTIAL: hai số tel hiện đúng; không gửi tin/email tự động|
|Tạo và xuất video|PASS local render/sample/sanitize test; video cá nhân cloud NOT_TESTED|
|Đồng ý công khai video|PARTIAL: exactrevision/filehash local đạt; cloud NOT_TESTED|
|Bảo mật/database|PARTIAL:11migration PGlite, origin/CSRF/MFA giữ nguyên; cloud NOT_TESTED|
|Triển khai miễn phí|NOT_TESTED; không deploy hoặc xác minh quota cloud hiện hành|

### D. Kết quả kiểm thử

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/visible-ui/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/visible-ui/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |
| `npm run test:worker` | 0 |

- Unit 34/34; integration 46/46; Edge E2E 36 đạt. media và library-media xem log chính xác; không quy đổi mock thành cloudPASS.
- Test mới: tests/unit/orders-v2.test.ts (3), tests/integration/orders-v2.test.ts (8), tests/e2e/visible-v3.spec.ts (4). Tái hiện DOM trước sửa ở dom-before.json; cả5URL sau sửa được kiểm không mock bằng Playwright Edge.
- Trong quá trình sửa có lỗi fixture age unknown/đếm gói cũ3 và selector thông báo E2E chọn nhầm vùng ảnh; đã sửa và chạy lại. Đợt staging trong sandbox vướng cổng5187/tiến trình kiểm thử; giữ log và không coi là PASS. Kết quả bảng là lần chạy cuối tại D, không báo dự đoán.
- Build warning nếu có giữ build.log. Cloud/quyền native/browser thật với account/signed URLs chưa cấu hình không thể kiểm chứng.

### E. Lỗi còn tồn tại

- HC-VIS-001 P1 BLOCKED: dùng Supabase chưa apply011 hoặc sai cấu hình →API không trả catalog mới/checkout đóng. File migration011/config.ts. Khắc phục: backup, apply staging001–011, nghiệm thu quyền trước mở release; không tự apply production.
- HC-LIB-001/004,HC-RPT-001/014 P1/P2 BLOCKED: Auth/Storage/revoke/race thật chưa có môi trường. Tái hiện bằng cloud flow chưa cấu hình. Cần staging.
- HC-LIB-002/HC-RPT-002 P1/P2 BLOCKED: cleanup Storage/PII chưa hoàn chỉnh; cần retention owner chốt.
- HC-RPT-008/009/010/012/013,HC-LIB-003 giữ mở: key rotation/scanner/nativeQA/docs lịch sử/bundle/pagination; xem TODO/handoff.

### F. Những gì còn thiếu

Migration011 mới chưa apply cloud. Checkout, real OAuth/MFA/Turnstile, private upload/release, actual video customer delivery, signed URLs/revocation/multiworker chưa kiểm thật. Thư viện chưa có customer seed; không tạo giả. Giới hạn public24/admin100 chưa pagination. Không khẳng định dịch vụ miễn phí đủ quota hoặc production an toàn.

### G. Chủ dự án cần cung cấp

Quyền staging Supabase/Cloudflare, cấu hình OAuth và Turnstile, owner UUID/MFA; chính sách hoàn tiền/retention và giờ hỗ trợ đã chốt. Ngân hàng/QR/hai số đã có, không yêu cầu lại. Không ghi secret vào báo cáo.

### H. Công việc tiếp theo

1. Nghiệm thu staging migration011 cùng010; kiểm anon/A/B/editor/owner, reset/legacyupgrade/CSRF/idempotency/version/ảnh+video consent.
2. Chạy upload thật→sanitize→release→private/public signedURL→revoke/TTL và backup/restore.
3. Hoàn thiện retention/cleanup/pagination/keyring/QA trước production. Không mở checkout chỉ vì UI đạt.

### I. Hướng dẫn kiểm tra

Windows: `cd D:\boi`; `D:\npm.cmd run build`; cửa sổ1 `D:\npm.cmd run worker:preview -- --ip 127.0.0.1 --port 8788`; cửa sổ2 `D:\npm.cmd run dev -- --port 5173 --strictPort`. Nếu đã chạy, kiểm PID và /__hc/dev-info trước khi dừng/khởi động; không dừng tiến trình chưa xác minh.

Mở http://127.0.0.1:5173/dich-vu và4URL trong VISIBLE_UI_VERIFICATION. `/admin` cần account thật membership+AAL2; không có mật khẩu demo. Form local có xem trước, không tạo đơn/thu tiền khi checkout đóng. Mã HCX chỉ lưu một lần, không đưa vào URL/screenshot/báo cáo. Fixture test dùng dữ liệu giả và không seed vào đơn thật.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## CẬP NHẬT NỘI DUNG VÀ THƯ VIỆN VIDEO — 20261025-content

Cập nhật **2026-10-25 16:02:41 +07:00** (Asia/Bangkok). Đây là trạng thái mới nhất, giữ nguyên báo cáo trước bên dưới.

### A. Tổng quan

- Trạng thái toàn dự án **IN_PROGRESS**, v0.1.0, Git N/A. Engine1.1.0/dataset2026.10.25-v2 không đổi. Chạy local được; **không production-ready, không deploy**.
- Đã ghi bản sửa TTL cuối vào D và chạy lại các gate tại D.
- Ước tính mức kiểm chứng vẫn56% theo17 nhóm cũ (4PASS,11PARTIAL,2NOT_TESTED →9,5/17), không phải % độ an toàn hoặc khối lượng code. CMS được kiểm local nhưng cloud/Storage/Auth vẫn chưa nghiệm thu.
- Thực hiện yêu cầu trực tiếp tám mục về nội dung/CMS. Tài liệu dán kèm và ba ảnh chỉ tham khảo; không áp dụng đổi giá60k70k, QR/ngân hàng, số hỗ trợ hoặc tra cứu một ô từ tài liệu đó. Không sao chép nội dung/tài sản/lời chứng thực của website tham khảo.

### B. Công việc đã thực hiện

| Công việc | File chính | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| Rà soát/viết lại nội dung công khai | src/main.tsx, features/library/PublicGallery.tsx, orders/OrderPage.tsx, Portal.tsx, account/Account.tsx, SavedSnapshot.tsx | Trang chủ/khám phá/bảng giá/video mẫu/thư viện/footer bỏ banner local và lời giới thiệu tiêu cực, dùng giọng kể tự nhiên. Thông báo nhận đơn tạm ngừng vẫn đúng thực tế; không giả mở thanh toán. | PASS local UI |
| Thiết kế thư viện khi trống | PublicGallery.tsx; style.css | Khu giới thiệu phim với mặt trăng/ngôi sao CSS, liên kết phim gốc. Không placeholder thiếu video/review; review section chỉ có khi có review được duyệt. Không seed bài/đánh giá/nguời dùng giả. | PASS local UI |
| CMS bài video | admin/VideoLibrary.tsx, OwnerPanel.tsx; library/model.ts; functions/library.ts; api/library.ts; API catch-all; migration010 | Owner có MFA thêm/sửa/lưu nháp/công khai/ẩn/xóa. MP4+cover+title+body+category+published_at; version check409. Sửa luôn về nháp, publish cần quyền và tệp đã kiểm định. | PARTIAL tổng thể; UI/SQL local PASS, cloud NOT_TESTED |
| Tệp biên tập của website | library_assets, private bucket library-media, validator.py --library | Upload URL riêng, size/MIME/extension/magic; decode/re-encode trước release, released bất biến. MP4≤20MB/30–60s; cover JPEG/PNG/WebP≤5MB. Không cho browser tự release. | PARTIAL; sanitize thật/SQL gate đã chạy, upload cloud NOT_TESTED |
| Quyền nội dung khách | PublicationConsent.tsx; Portal; library_previews/library_consents; RPC | Cần video và cover public_derivative cùng đơn, grant website đúng hash/version/18+, thêm preview/consent đúng title/body/category/cover/video revision. Checkbox không tick sẵn; sửa bài vô hiệu chấp thuận cũ. Revoke làm feed mới không còn bài. | PASS local SQL/UI; cloud/race NOT_TESTED |
| TTL và bằng chứng đồng ý | migration010; tests/integration/library.test.ts | Session UUID của consent là bằng chứng lịch sử không có FK; cleanup phiên hết hạn không bị append-only log chặn hoặc xóa mất consent. Preview cascade theo session; test count consent giữ nguyên sau cleanup. | PASS regression local sau ghi D |
| Chính sách và bàn giao | main.tsx policy, docs/VIDEO_LIBRARY.md, ASSET_LICENSES.md, DECISIONS.md; bốn CODEX file | Giữ pháp lý/riêng tư, quyền ảnh cá nhân và scope riêng; thêm quyền bài chính xác và URL60s. Giữ lịch sử báo cáo, backup/hash các file thay đổi. | PASS tài liệu |

### C. Kiểm tra chức năng

| Nhóm | Trạng thái | Phạm vi và giới hạn |
|---|---|---|
| Giao diện/hoạt ảnh | PASS | Edge E2E, ảnh chụp desktop/mobile thư viện, không banner nội bộ quảng bá. |
| Responsive | PASS | E2E360/390/768/1024/1440; library360 không tràn ngang. Chưa thiết bị thật. |
| 12 nhóm bói miễn phí | PASS | Regression deterministic/offline/≥501 từ giữ nguyên; không hứa chính xác tâm linh. |
| Google OAuth | NOT_TESTED | Chưa cấu hình/đăng nhập Google thật. |
| Hồ sơ/lịch sử | PARTIAL | Regression local giữ; Auth thật và phân trang>100 chưa xong. |
| Gói10k20k50k | PARTIAL | Default/snapshot/version regression local; không đổi giá và gói từ tài liệu đính kèm. Cloud NOT_TESTED. |
| Tạo đơn | PARTIAL | Quote/idempotency/challenge mock+SQL đạt; flow thật chưa test. |
| Chuyển khoản thủ công | PARTIAL | Giữ claim≠paid, không QR/bank update, chưa tiền thật. |
| Xác nhận thanh toán | PARTIAL | Regression checkbox/version/lock local; multi-admin cloud chưa chạy. |
| Admin/phân quyền | PARTIAL | CMS owner-only+MFA guards mock/SQL; không có admin giả sản phẩm; JWT/MFA thật chưa test. |
| Tra cứu an toàn | PARTIAL | Giữ3 trường/session/CSRF/limiter. Quyền bài chỉ đúng đơn; expiry/cross-order/minor test local. |
| Trả kết quả website | PARTIAL | Regression không đổi; private delivery và signedURL cloud chưa test. |
| Zalo/email thủ công | PARTIAL | Không gửi tin, không bot mới. |
| Tạo/xuất video | PASS | Video mẫu trước đã render36s720p; vòng này thực chạy re-encode MP4 mẫu và cover để test validator, không tạo video khách mới. |
| Quyền công khai video | PARTIAL | Post/asset grant/revision/revoke local đạt, đầy đủ CMS local; cloud chưa nghiệm thu. |
| Bảo mật/database | PARTIAL | PGlite10 migrations, anon/auth/editor/owner và stale/TTL tested; không thay cloud audit. |
| Triển khai miễn phí | NOT_TESTED | Không deploy, quota/giá provider hiện hành chưa xác minh. |

### D. Kết quả kiểm thử

Kết quả cuối sau bản sửa TTL tại D. Logs/exit code tại `docs/content-round/20261025/results.json` và *.log. SQL là PGlite với Auth/Storage fixture; E2E CMS/giá/consent dùng network mock. Không lấy mock PASS gán cho cloud.

| Lệnh | Exit cuối | Số đạt/thất bại |
|---|---:|---|
| npm run format:check |0|Prettier toàn bộ phạm vi đạt |
| npm run lint |0|0 lỗi |
| npm run typecheck |0|0 lỗi |
| npm run build |0|dist tạo được, còn warning chunk>300kB |
| npm test -- --reporter=default --reporter=json --outputFile=docs/content-round/20261025/unit.json |0|31/0 |
| npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/content-round/20261025/integration.json |0|38/0 |
| npm run test:e2e |0|32/0 Edge |
| npm run check:secrets |0|Không thấy mẫu theo scanner, không phải security audit toàn diện |
| npm run test:media |0|4 local checks đạt |
| python tests/library_media_test.py |0|2 checks đạt: MP4 thật re-encode, ảnh bìa decode/strip metadata |
| npm run test:worker, sau npm run worker:preview |0|7 HTTP smoke +GET packages +GET library default/empty/no-store đạt local |

- Test mới:10 ca SQL thư viện (CRUD/version, owner-only/direct role denied, quarantine/release, exact asset+revision consent, cross-order, minor, expiry+TTL); unit payload schema; API no-store/default empty/MFA/owner;4 E2E về CRUD, consent, copy/empty state, full metadata/body +mobile.
- Lỗi trung gian không giấu: stage format báo functions/library.ts, đã format; stage integration34pass/1fail do negative fixture dùng ID vừa release trong test trước, đã tách ID và kiểm quarantine thật, không bỏ guard. FFmpeg bị sandbox chặn ghi tempfile ban đầu; dùng thư mục test trong workspace và chạy với quyền thực thi thích hợp, re-encode sau đó đạt. Log staging ở staging-checks.zip, lần kiểm trước patch TTL ở before-ttl-checks.zip nếu đã ghi D.
- Bản mới sửa FK consent/TTL bằng regression, không đổi migrations001–009 đã tồn tại. Metadata RESTORE_APP_REPORT hiện ghi đúng10 migrations (đã sửa literal8 trong test); không coi restore PGlite là cloud restore.
- Bundle chính427,12kB minified/133,05kB gzip; giữ warning>300kB (HC-RPT-013), chưa đo Lighthouse mới.
- NOT_TESTED: Google/MFA thật, upload→Storage→validator→release→signed URL thật, race nhiều Worker, cloud role revoke/recovery, giao dịch/ngân hàng/privateG50/restore Auth+Storage, screen reader/zoom/share thiết bị thật. Thiếu staging/credentials hoặc thiết bị, không tự deploy để kiểm.

### E. Lỗi / giới hạn còn tồn tại

| Mã/mức | Tái hiện/khu vực | Tiếp tục |
|---|---|---|
| HC-LIB-001 P1 BLOCKED/NOT_TESTED | Chưa apply010 hoặc cấu hình cloud: admin library API không có bảng/RPC, upload thật chưa chạy. Functions/migration010/private bucket. | Staging có migration/env/Auth/MFA, kiểm đầy đủ upload và matrix quyền trước phát hành. |
| HC-LIB-002 P2 BLOCKED | Xóa bài chỉ soft-delete; orphan/quarantine/Storage không tự cleanup. library_assets/posts và HC-RPT-002. | Owner chốt retention, triển khai cleanup có dry-run/audit và restore. Không tự xóa file khách. |
| HC-LIB-003 P3 PARTIAL | Feed>24 bài/admin>100 bài chưa phân trang. API/library, VideoLibrary. | Thêm pagination/cursor nếu nội dung tăng; category hiện lọc dữ liệu đã tải. |
| HC-LIB-004 P2 NOT_TESTED | Signed URL đã cấp có thể dùng tới60s sau hide/revoke; dữ liệu đã tải không thu hồi được. | Kiểm race/cache/TTL staging, không hứa thu hồi tức thời byte đã cấp. |
| HC-RPT-001/014 P1 | Auth/MFA/Storage/private delivery/restore cloud chưa test. | Owner cấp staging, matrix A/B/editor/owner, restore và race. |
| HC-RPT-002/008/009 P1/P2 | Lifecycle cleanup/keyring rotation/scanner PDF chưa hoàn tất. | Policy owner + triển khai/test độc lập. |
| HC-RPT-004/007 P2 | Profile cloud/pagination và corpus chuyên biệt còn giới hạn. | Giữ nhãn mô phỏng đúng chức năng, bổ sung nguồn có phép và thẩm định. |
| HC-RPT-010/011/012/013 | Manual QA, quyền ghi D, docs lịch sử, bundle warning vẫn mở. | Không đổi ACL; đọc report mới, đo performance và QA thật. |

Các HC-RPT-003/005/006/015/016 giữ regression local đạt; không mở lại lỗi cũ chỉ vì thiếu cloud. Giá/lookup/confirmation/ảnh-consent cũ được giữ nguyên và test lại.

### F. Những gì còn thiếu

- Không có bài video/đánh giá khách thật được tạo hoặc nhập trong vòng này. Thư viện mặc định là phần giới thiệu; fixtures chỉ ở test, không seed vào sản phẩm.
- Library cloud pipeline và migration010 chưa apply remote. Owner quản lý CMS; editor không được công khai hoặc sửa library theo thiết kế quyền hiện tại.
- Soft-delete giữ audit, không tự xóa bytes Storage; quota free tier chưa kiểm; feed24/admin100 chưa pagination. Consent không làm hệ thống tự nhận diện ảnh có khách: editorial cần owner khai đúng quyền, không được dùng nhãn này để né consent.
- Legal/privacy và đồng ý riêng ảnh, scope website/YouTube/TikTok, age gate vẫn giữ. Không thêm giá/ngân hàng/support từ tài liệu đính kèm.

### G. Chủ dự án cần cung cấp

Quyền staging/env Supabase/Google/Cloudflare, origin/redirect và owner MFA; tệp video/cover có quyền sử dụng và nội dung để biên tập; policy retention và kế hoạch scanner/restore. Không gửi secret vào chat/report. Những bank/refund/support cần cho nhận đơn thật vẫn theo blocker cũ, không tự dùng ảnh QR như cấu hình được duyệt.

### H. Công việc tiếp theo

1. Nghiệm thu staging thư viện sau cấu hình
2. Cấu hình staging, backup rồi apply001–010 cùng Functions/frontend đồng bộ khi được phép; chạy toàn bộ matrix quyền và pipeline file thực.
3. Owner thử CMS bằng tài sản tự sở hữu, customer exact consent/revision/revoke và TTL; không seed lời chứng thực giả hoặc tự công khai video khách.
4. Retention/orphan cleanup, pagination, QA thiết bị/performance; chỉ mở nhận đơn sau toàn bộ gate phát hành cũ đạt.

### I. Hướng dẫn kiểm tra Windows

Hiện D cần PowerShell quản trị theo ACL có sẵn; Codex không đổi quyền. `cd D:\boi`; `npm run dev` →127.0.0.1:5173 (chỉ frontend). `npm run build` rồi `npm run worker:preview` →127.0.0.1:8788 có Functions. Các lệnh bảng D chạy tại root; test:worker ở terminal khác khi Worker đang chạy.

- `/thu-vien`: khi chưa cấu hình dùng phần giới thiệu, không có fake customer card. `/video-mau`: phim mẫu có sẵn.
- `/admin`: xác minh membership+MFA AAL2 rồi OwnerPanel→Quản lý thư viện video. Không có demo login. Tải tệp, chạy `python scripts/validate_attachment.py --library UUID_TEP` với env riêng, tải lại danh sách và tạo bài. Tệp khách dùng luồng attachment hiện hữu, không --library.
- Tra cứu của khách→quyền từng asset rồi quyền bài đăng. Không gộp quyền ảnh để soạn vào quyền công khai; không tick sẵn.
- Cách vận hành đầy đủ: docs/VIDEO_LIBRARY.md. Backup gốc before.zip, manifest hash source-manifest.json, screenshot library-empty-editorial.png/library-published-fixture.png/library-mobile-fixture.png. Các ảnh fixture có nhãn tên file, không phải dữ liệu khách thật.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## BÁO CÁO SAU VÒNG SỬA LỖI — 20261025-local

Cập nhật: **2026-10-25 12:50:23 +07:00 (Asia/Bangkok)**. Đây là hiện trạng mới nhất; phần kiểm kê cũ bên dưới là lịch sử giữ nguyên.

### A. Tổng quan

- Dự án **IN_PROGRESS**, phiên bản ứng dụng 0.1.0, Git commit N/A (D chưa có repository). Engine mới **1.1.0**, dataset **2026.10.25-v2**; snapshot đã lưu không bị tính lại.
- Bản local chạy được: build và Edge E2E tại `D:\boi` đã chạy thành công. Server test đã dừng. Production-ready: **KHÔNG**, chưa deploy, chưa bật nhận tiền thật.
- Ước tính toàn dự án vẫn **56%**, theo bảng 17 nhóm: PASS=1, PARTIAL=0,5, NOT_TESTED=0 →9,5/17. Đây là mức kiểm chứng chức năng, không phải xác suất an toàn hay phần trăm khối lượng code. Các lỗi local đã giảm nhưng gate cloud chưa thay đổi.
- 33 file đã chuyển từ bản làm việc mới lấy từ D, có preflight hash, backup và hash xác minh sau chép. Chi tiết `docs/fixes/20261025-local/source-manifest.json`. Không sync mù bản C cũ, không đổi ACL/secret/ngân hàng, không sửa migrations001–008.

### B. Công việc đã thực hiện / trạng thái từng mã HC-RPT

PASS dưới đây chỉ áp dụng phạm vi local đã chạy; không suy ra tích hợp cloud PASS.

| Mã | Kết quả / trạng thái | File thay đổi chính | Test mới và bằng chứng |
|---|---|---|---|
| HC-RPT-005 | **PASS local**: hai state paymentConfirmed/publishConfirmed độc lập; đổi đơn/version reset cả hai, đổi tham chiếu reset xác nhận tiền, đổi body/preview reset xác nhận phát hành. | src/features/admin/Workspace.tsx | local-fixes.spec.ts: tích tiền không cho phép phát hành; sửa body phải duyệt lại; đổi đơn không giữ checkbox. Test đỏ trước sửa, xanh sau sửa. |
| HC-RPT-006 | **PASS local**: selected suy ra từ selectedId+orders; refresh sau mutation của Workspace/Recovery/upload; trả DTO mới; bản nháp cũng tăng version. API draft/publish bắt buộc version. Xung đột409 tải lại, giữ bản soạn, không tự gửi lại; refresh thất bại khóa thao tác. | Workspace.tsx, Recovery.tsx, FileUpload.tsx; src/lib/auth.ts, api-error.ts; functions/api/[[path]].ts; migration009 | UI confirm→v2→draft(v2)→v3→conflict tải v4; SQL stale/null version bị40001, không ghi đè; exact-reference confirm retry chỉ một sự kiện; RPC cũ không còn được service_role gọi trực tiếp. version-api.test.ts kiểm DTO,400/409 và giữ MFA/membership guards. Race nhiều admin thật NOT_TESTED. |
| HC-RPT-003 | **PASS local**: Pricing/OrderPage lấy DTO `/api/packages`; default vẫn10.000/20.000/50.000đ. Không lấy được giá xác minh thì khóa đơn thật. Trước submit kiểm lại quote, có thay đổi phải xác nhận lại. RPC giữ khóa package và kiểm version, idempotency trước kiểm quote. | src/lib/packages.ts; functions/api/packages.ts; main.tsx; OrderPage.tsx; API catch-all; migration009 | UI mock server đổi12k/22k/52k; SQL snapshot đơn cũ10k/version1 giữ nguyên khi bảng giá fixture đổi; quote cũ bị từ chối, retry key cũ không tạo thêm đơn. Unit default/schema và Worker GET default/no-store. Không đổi bảng giá thật; Supabase pricing thật NOT_TESTED. |
| HC-RPT-004 | **PARTIAL tổng thể / phần local đã kiểm đạt**: form profile tên/nhóm tuổi; mở đủ sections/score/symbol/lifePath/version/disclaimer của snapshot gốc, không chạy engine mới. Đọc/xóa có user_id từ getUser; lưu profile không nhận userId ngoài; xóa state khi auth đổi, bỏ response cũ theo generation. | src/features/account/Account.tsx, SavedSnapshot.tsx; main.tsx | account.test.ts validation; PGlite profile A chỉ thấy A, không sửa/upsert B; anon bị chặn; history A/B cũ tiếp tục đạt. E2E mở đủ bốn phần bản v1. Google login, UI save profile qua Supabase thật và chuyển A→B thật **NOT_TESTED**. Lịch sử tải100 bản gần nhất, chưa có phân trang cho số lượng lớn. |
| HC-RPT-015 | **PASS regression local**: token bị đánh dấu dùng ngay trước attempt API, xóa và dựng lại widget; token cũ/lặp không được nhận lại. Sau lỗi cần token mới; key chống trùng giữ nguyên qua retry. Lookup cũng tiêu thụ token một lần. | OrderPage.tsx Challenge/submit; main.tsx Lookup | E2E mock Turnstile+503: nút khóa sau attempt, token lần2 khác lần1, idempotency_key bằng nhau. SQL chứng minh retry key cũ không tạo đơn trùng cả khi giá đã đổi. Token/hostname/action Siteverify và limiter server giữ nguyên. Turnstile thật/multi-worker **NOT_TESTED**. |
| HC-RPT-016 | **PASS**: src/main.tsx và toàn bộ source/tests được format theo cấu hình hiện hữu. | src/main.tsx và file mới/sửa nêu trên | npm run format:check tại D exit0; lint/typecheck/build exit0. |
| HC-RPT-007 | **PARTIAL**: thêm48 câu hỏi gốc, bốn nhánh theo hash cho từng nhóm; có đoạn thực hành theo câu hỏi, tăng đa dạng nội dung ngoài score/symbol; bump engine/dataset. Phần lớn corpus vẫn dùng chung; chưa có kho tri thức truyền thống thẩm định. | src/content/reflections.ts; src/engine/index.ts; DATA_SOURCES.md | content-regression.test.ts:20 input/nhóm, ≥4 narrative khác nhau/nhóm, mỗi bài≥501 từ; fixture v1 giữ nguyên. Test narrative đỏ trước sửa. Câu hỏi mới CC BY4.0, ghi công Huyền Cảnh; không nhập nguồn ngoài chưa rõ phép, không gọi mô phỏng là lá số chuẩn. |

### C. Kiểm tra chức năng

| Nhóm | Trạng thái | Phạm vi thực sự đã kiểm / giới hạn |
|---|---|---|
| Giao diện và hoạt ảnh | PASS | Edge E2E local28 ca, reveal/skip/reduced-motion/keyboard/axe; thiết bị thật chưa QA. |
| Responsive | PASS | 360/390/768/1024/1440 và reflow640px; không thay thế zoom200%/screen reader thật. |
| 12 nhóm bói miễn phí | PASS | Node+Edge tính lặp100 lần/tool, offline, validation, ≥501 từ, đa dạng4 nhánh; nội dung mô phỏng. |
| Google OAuth | NOT_TESTED | Chưa có cấu hình/phiên Google+Supabase thật. |
| Hồ sơ và lịch sử | PARTIAL | UI/profile validation/snapshot/RLS local đạt; profile save Auth thật chưa chạy; tối đa100 bản gần nhất. |
| Gói10k/20k/50k | PARTIAL | Default/UI server quote/SQL snapshot đạt local; cloud chưa nghiệm thu. |
| Tạo đơn | PARTIAL | Quote version+idempotency SQL và UI mock đạt; Turnstile/Auth/cloud thật chưa chạy. |
| Chuyển khoản thủ công | PARTIAL | Claim không tương đương paid; chưa có ngân hàng/tiền thật/đối soát thật. |
| Xác nhận thanh toán | PARTIAL | Checkbox độc lập, lock/version/retry local đạt; concurrent HTTP admin và giao dịch thật chưa chạy. |
| Admin và phân quyền | PARTIAL | SQL owner/editor, API MFA/membership mock, UI version kiểm đạt; JWT/MFA thật chưa chạy. |
| Tra cứu đơn hàng an toàn | PARTIAL | SQL ba trường/limiter/session, Origin fail-closed, Worker local; timing/cookie/multi-worker/challenge thật chưa test. |
| Trả kết quả qua website | PARTIAL | Draft/publish version/gate G50 SQL đạt; private signedURL/download cloud chưa chạy. |
| Zalo thủ công / email | PARTIAL | Có chép tin nhắn; chưa gửi từ admin thật, không có bot tự gửi trong phạm vi. |
| Tạo và xuất video | PASS | Renderer không đổi; xuất36s720p đã kiểm ở audit20261025T051523Z; vòng này chỉ E2E phát MP4 sẵn và4 media checks, **không xuất lại video mới**. Video đơn cá nhân cloud chưa test. |
| Quyền đồng ý công khai video | PARTIAL | Local SQL preview/hash/version/18+/revoke đạt; Storage/platform/race cloud chưa test. |
| Bảo mật và database | PARTIAL |9 migrations trong PGlite fixture Auth/Storage; guard và secret-pattern scan local đạt. Không suy ra an toàn production. |
| Khả năng triển khai miễn phí | NOT_TESTED | Không deploy, không xác minh quota/chi phí/SLA hiện hành. |

### D. Kết quả kiểm thử

Môi trường Windows/Node tại `D:\boi`; log/exit code thật ở `docs/fixes/20261025-local/results.json`. PGlite là PostgreSQL WASM với Auth/Storage fixture, E2E mới dùng mock network ở các ca admin/pricing/challenge. Không coi đó là test Supabase/Cloudflare staging thật.

| Lệnh đã chạy tại D | Exit code cuối | Kết quả |
|---|---:|---|
| npm run format:check |0|All matched files use Prettier code style |
| npm run lint |0|0 lỗi |
| npm run typecheck |0|0 lỗi TypeScript |
| npm run build |0|dist đã tạo; có warning chunk>300kB, giữ nguyên threshold |
| npm test -- --reporter=default --reporter=json --outputFile=docs/fixes/20261025-local/unit.json |0|**30 đạt /0 thất bại**,6 files |
| npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/fixes/20261025-local/integration.json |0|**26 đạt /0 thất bại**,5 files |
| npm run test:e2e |0|**28 đạt /0 thất bại**, Edge,45,1 giây |
| npm run check:secrets |0|Không thấy mẫu secret theo scanner; không phải audit bảo mật toàn diện |
| npm run test:media |0|**4 local checks đạt**, không phải xuất video mới |
| npm run test:worker (sau npm run worker:preview) |0|**7 HTTP local checks đạt** |
| GET localhost8788/api/packages + assertions |0|200/defaults/10k20k50k/no-store đạt, Worker thực chạy |

- Trước sửa: ba E2E regression đều thất bại (checkbox, hardcoded price, token reuse), unit narrative27 đạt/1 thất bại; lưu red-unit.json và red-*.zip trong docs/fixes. Không từng test tất cả lỗi trên cloud trước sửa.
- Trong quá trình: test dataset cũ còn assert v1 sau bump nên thất bại; đã đổi sang datasetVersion hiện hành và giữ test fixture v1 riêng. `green-unit.json` là output trung gian có1 test thất bại, **không phải bằng chứng cuối**.
- Bản staging đầu tiên format còn fail Account.tsx; đã format lại. Lint từng quét JavaScript do copy HTML Playwright report vào docs; đã lưu report ZIP, không tắt lint rule. Bằng chứng staging trong staging-checks.zip.
- Lần đầu tại D: unit30 test đạt nhưng1 suite lỗi, integration41 test đạt (gồm test backup trùng) nhưng1 suite lỗi, exit1. Nguyên nhân Vitest quét bản nguồn trong `before/tests`; đã nén backup thành before.zip, không đổi test discovery/security để che lỗi. Log và JSON thất bại được giữ `*-backup-discovery-failure.*`, first-results.json. Rerun chỉ hai bộ bị ảnh hưởng đã đạt30/26; không dùng41 làm số test cuối.
- Build chính422,20kB minified,131,85kB gzip; vẫn warning>300kB (HC-RPT-013). Chưa đo lại Lighthouse, không dùng metric cũ để tuyên bố performance mới.
- NOT_TESTED: OAuth/MFA thật, profile save thật, cloud RLS/REST/Storage, Siteverify token thật, hai admin HTTP concurrent/multi-worker, ngân hàng/đối soát thật, delivery G50 theo đơn, backup/restore Auth+Storage cloud, screen reader/zoom/share thiết bị thật. Thiếu môi trường/credentials hoặc QA thiết bị; không tự deploy để thử.

### E. Các lỗi còn tồn tại

Chi tiết tái hiện/file/hướng xử lý của các mã chưa làm tiếp tục giữ trong CODEX_TODO lịch sử. Trạng thái mới:

| Mã / mức | Cách tái hiện / khu vực | Cách tiếp tục |
|---|---|---|
| HC-RPT-001/014 P1 BLOCKED | Thử flow Google/MFA/Storage/đối soát/giao riêng/restore thật: chưa có staging được cấu hình. src/lib/auth, Functions, Supabase. | Owner cấu hình staging; chạy matrix anon/A/B/editor/owner, private G50, race và restore. |
| HC-RPT-002 P1 BLOCKED | Đến retention, hiện chỉ candidate dry-run, không cleanup PII+Storage toàn vòng đời. migration008/scripts. | Owner chốt policy, xây apply/tombstone/restore test trước nhận dữ liệu thật. |
| HC-RPT-004 P2 PARTIAL | >100 bản lịch sử không có phân trang; UI save/chuyển tài khoản thật chưa chạy. Account.tsx. | Thêm phân trang nếu cần lịch sử lớn; test Auth thật A→B và save/xóa khi mất mạng/đổi phiên. |
| HC-RPT-007 P2 PARTIAL | Các bài vẫn có ba đoạn chung dù nay có4 nhánh câu hỏi; thiếu lịch Can Chi/mệnh có nguồn thẩm định. corpus/reflections/engine. | Biên tập thêm nhánh nội dung chuyên biệt; chỉ nhập dữ liệu có giấy phép và kiểm chứng, giữ version/snapshot. |
| HC-RPT-008 P2 | Pepper keyring chỉv1, chưa có rotation an toàn. API/order_credentials. | Thiết kế keyring/version migration, kiểm mã/phiên cũ trước xoay; không tự xoay khóa. |
| HC-RPT-009 P2 BLOCKED | Upload→scanner→release→signedURL cloud chưa kiểm, PDF scanner chưa cấu hình. validator/Storage. | Cấu hình scanner và chạy fixture staging, giữ fail-closed. |
| HC-RPT-010 P2 NOT_TESTED | Native share/screen reader/zoom200% thiết bị thật chưa chạy. | QA thủ công và lưu bằng chứng. |
| HC-RPT-011 P2 BLOCKED | Tài khoản thường không ghi D, npm/cache/log có thể AccessDenied. | Owner chọn writable checkout hoặc quyền phù hợp; vòng này dùng UAC, không sửa ACL. |
| HC-RPT-012 P3 | Một số tài liệu lịch sử lệch code; RESTORE_APP_REPORT environment còn literal “8 migrations” dù database.test hiện nạp9. | Dùng report/log mới nhất và danh sách migration trong test làm bằng chứng; cập nhật tài liệu/script report cũ trong phiên bảo trì. |
| HC-RPT-013 P3 | Build warning initial chunk422,20kB/131,85gzip. vite/main/lib/packages. | Đo lại performance rồi cân nhắc lazy-loading/schema nhẹ; không tăng threshold che warning. |

HC-RPT-003/005/006/015/016 đã đạt regression local nêu ở B; các tích hợp thật liên quan vẫn NOT_TESTED, không coi đã production-verified.

### F. Những gì còn thiếu

- Cloud/Auth/MFA/RLS/Storage/Turnstile cấu hình và nghiệm thu; nhận đơn thật vẫn khóa theo config/release gate.
- Ngân hàng, refund/support/retention được owner chốt; lifecycle cleanup đầy đủ, keyring rotation, scanner PDF và restore cloud.
- Lịch sử hiện tải100 bài gần nhất; corpus4 câu hỏi/nhóm còn nhỏ và dùng chung phần hướng dẫn. Không có lá số Can Chi chuẩn.
- Mock chỉ trong test local: UI harness/fixtures không đóng gói vào dist; role owner ở harness không phải đăng nhập sản phẩm. Không thêm nút bypass guard/validator.
- Quota miễn phí provider chưa xác minh; không hứa miễn phí vô hạn. Không có deploy, không dựng thêm automation gửi tin.

### G. Việc cần chủ dự án cung cấp

- Staging Supabase/Google/Cloudflare và quyền cấu hình hợp lệ; exact origins/redirects, thành viên owner/editor UUID và MFA; secrets đặt trong dashboard, không gửi giá trị vào báo cáo/chat.
- Thông tin ngân hàng được kiểm chứng, chính sách hoàn tiền, kênh hỗ trợ, retention và phạm vi cleanup được duyệt.
- Turnstile site/secret đúng hostname/action và scanner nếu dùng PDF. Không cần dữ liệu khách thật để test.
- Quyết định môi trường writable cho D và dữ liệu tử vi truyền thống/giấy phép nếu muốn mở rộng nội dung chuyên sâu.

### H. Công việc tiếp theo

1. Chạy staging với migrations001–009 sau backup và review, deploy frontend+Functions đồng bộ; **chưa thực hiện thao tác cloud này**.
2. Chạy profile/history A/B, OAuth/MFA/admin role revoke, stale conflict thật, price change mid-submit và Turnstile retry thật; giữ key idempotency, không bỏ lock/version.
3. Nghiệm thu private G50 upload/validator/signedURL/consent/revoke và backup DB/Auth/Storage + deletion replay; không bật CHECKOUT_ENABLED trước gate phát hành.
4. Chốt retention/rotation; thêm pagination lịch sử, biên tập corpus có nguồn, QA thiết bị và đo lại bundle/Lighthouse.

### I. Hướng dẫn kiểm tra Windows

PowerShell **Run as administrator** cho D theo ACL hiện có (hoặc owner chọn checkout writable). Không tự đổi quyền:

```powershell
cd D:\boi
npm run dev
# http://127.0.0.1:5173 — Vite chỉ frontend
npm run format:check
npm run lint
npm run typecheck
npm run build
npm test
npm run test:integration
npm run test:e2e
npm run check:secrets
npm run test:media
npm run worker:preview
# http://127.0.0.1:8788; terminal khác: npm run test:worker
```

`/admin` cần membership server + MFA AAL2, không có admin/demo credential. `/tai-khoan` chưa có phiên Google thật khi thiếu env. `/dat-don` chỉ kiểm form local nếu chưa cấu hình; không dùng giá default như quote đã xác minh để thu tiền. Regression dùng tên/số/chủ đề giả, không giao dịch thật. Migrations009 chưa apply remote. Backup nguồn/báo cáo gốc: `docs/fixes/20261025-local/before.zip`; log cuối: results.json/unit.json/integration.json/*.log; red evidence ở docs/fixes.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_REPORT.md

## Phiên kiểm kê 20261025T051523Z

Cập nhật: 2026-10-25 12:20:16 +07:00 (Asia/Bangkok). Phạm vi: kiểm kê, kiểm thử local và báo cáo; không sửa logic ứng dụng, database, giá hoặc cấu hình live.

### A. Tổng quan

- Ngày giờ: **2026-10-25 12:20:16 +07:00 (Asia/Bangkok)**.
- Trạng thái dự án: **IN_PROGRESS**. Bản local khả dụng; các gate cloud/phát hành còn bị chặn. Không dùng VERIFIED cho toàn dự án.
- Phiên bản: **0.1.0** theo package.json. Git commit: **N/A**, `git rev-parse HEAD` không tìm được repository.
- Dấu vân tay source kiểm kê: `c43e5a1dd0d08b76e241862f8ba7d1804409c611ba567166bdf8a8f2daf5223d`; `docs/audits/20261025T051523Z/inventory.json`.
- Ước tính: **56%** theo bảng C: PASS=1, PARTIAL=0,5, FAIL/NOT_TESTED/NOT_IMPLEMENTED=0, tổng 9.5/17 nhóm. Đây là chỉ số kiểm kê khả năng đã xây/đã kiểm chứng, không phải % an toàn production hay % khối lượng công việc.
- Có chạy được: **Có, trong phạm vi local đã chạy E2E/build thành công**. Server thử nghiệm chỉ chạy trong kiểm thử và được dừng sau đó.
- Production-ready: **KHÔNG**; chưa deploy và không có bằng chứng nhận tiền/giao riêng/restore cloud đạt.
- Source logic được hash trước/sau kiểm kê: **không thay đổi**. Chỉ thêm báo cáo, quy định AGENTS và artifact/log kiểm thử. Báo cáo cũ được giữ nguyên; artifact test cũ nằm trong `docs/audits/20261025T051523Z/before`.

### B. Công việc đã thực hiện

| Công việc | File tạo/sửa hoặc đọc/kiểm | Chức năng liên quan | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| Kiểm kê tài liệu và first-party source/config/tests/migrations/scripts | inventory.json; AGENTS/README/PRD/architecture/security/design/acceptance/prompts; src/functions/supabase/tests/scripts | Toàn dự án | Có danh mục/hash; không tính node_modules/dist là mã do dự án tự viết | PASS |
| Chạy kiểm thử khả dụng tại D | docs/audits/20261025T051523Z/results.json và *.log | Local frontend, engine, SQL fixture, media, Worker | Kết quả chính xác ở D; không lấy kết quả cũ gán cho lần này | PARTIAL |
| Xuất lại video vào môi trường fixture biệt lập | docs/audits/20261025T051523Z/media-project/video-template/render.py và public/assets đầu ra | Video anime mẫu | Không thay video mẫu đã giao trong public/assets | PASS |
| Tạo quy trình báo cáo | CODEX_REPORT.md; CODEX_CHANGELOG.md; CODEX_TODO.md; CODEX_HANDOFF.md; AGENTS.md | Quản lý công việc | Bốn file và quy định phải được writer xác minh tồn tại sau ghi; lịch sử chỉ thêm/giữ lại | PASS |
| Xác minh cloud/thanh toán/Storage thật | Chỉ đọc code và checklist, không gọi dịch vụ khách | Auth, đơn, quyền, consent, G50 | Chưa có môi trường/credentials và không được deploy trong audit; không gán PASS | PARTIAL |

### C. Kiểm tra chức năng

Quy ước: **PASS** đã thực sự chạy thành công trong phạm vi ghi ở hàng; **PARTIAL** có phần triển khai/kiểm chứng nhưng còn thiếu; **FAIL** kiểm tra thực sự thất bại; **NOT_TESTED** chưa kiểm tra; **NOT_IMPLEMENTED** chưa xây dựng. PASS local không suy ra production an toàn.

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

### D. Kết quả kiểm thử

Môi trường: Windows, Node `v24.21.0`, cwd `D:\boi`; Edge theo playwright.config.ts. Integration dùng PostgreSQL WASM PGlite cùng fixture auth/storage, **không phải Supabase thật**. Không chạy `verify:delivery`/sync script trong lần này vì chúng có thể ghi lại báo cáo lịch sử hoặc tái cài dependency ngoài nhu cầu kiểm kê.

| Lệnh thực sự chạy | Exit code | Kết quả lần này | Log |
|---|---|---|---|
| `git rev-parse HEAD` | 128 | N/A — không có Git repository, không có commit để ghi | `docs/audits/20261025T051523Z/01-git-rev-parse-HEAD.log` |
| `npm run typecheck` | 0 | PASS — lệnh thành công; xem log chi tiết | `docs/audits/20261025T051523Z/02-npm-run-typecheck.log` |
| `npm run lint` | 0 | PASS — lệnh thành công; xem log chi tiết | `docs/audits/20261025T051523Z/03-npm-run-lint.log` |
| `npm run format:check` | 1 | FAIL — xem log; không sửa lỗi lớn trong lần kiểm kê | `docs/audits/20261025T051523Z/04-npm-run-format-check.log` |
| `npm test` | 0 | PASS — 26 đạt / 0 thất bại | `docs/audits/20261025T051523Z/05-npm-test.log` |
| `npm run test:integration` | 0 | PASS — 19 đạt / 0 thất bại | `docs/audits/20261025T051523Z/06-npm-run-test-integration.log` |
| `npm run build` | 0 | PASS — lệnh thành công; xem log chi tiết | `docs/audits/20261025T051523Z/07-npm-run-build.log` |
| `npm run check:secrets` | 0 | PASS — lệnh thành công; xem log chi tiết | `docs/audits/20261025T051523Z/08-npm-run-check-secrets.log` |
| `npm run test:e2e` | 0 | PASS — 24 đạt / 0 thất bại | `docs/audits/20261025T051523Z/09-npm-run-test-e2e.log` |
| `npm run test:media` | 0 | PASS — 4 nhóm check local đạt theo stdout; không antivirus thật | `docs/audits/20261025T051523Z/10-npm-run-test-media.log` |
| `npm audit --json` | 0 | PASS — lệnh thành công; xem log chi tiết | `docs/audits/20261025T051523Z/11-npm-audit---json.log` |
| `python isolated video render` | 0 | PASS — Render fixture MP4 thành công; xem metadata trong media-project | `docs/audits/20261025T051523Z/12-python-isolated-video-render.log` |
| `npm run test:worker` | 0 | PASS — 7 HTTP smoke local đạt; thiếu credentials fail-closed | `docs/audits/20261025T051523Z/13-npm-run-test-worker.log` |

- Unit: 26 đạt nếu lệnh exit0; integration: 19; E2E: 24. Các con số là từ log phiên này, không bịa từ số test file.
- Build/lint/typecheck: lần lượt **PASS / PASS / PASS**. Cảnh báo bundle >300KB không gzip vẫn phải đọc trong build log; không che bằng tăng threshold.
- **Format:check FAIL (exit1)**: Prettier báo `src/main.tsx`; đây là lỗi có thật HC-RPT-016, không được viết “mọi check đều đạt”. Không sửa source trong audit.
- **Npm audit lần này exit0, 0 vulnerabilities** theo JSON trong log; không chỉ dựa vào bản audit cũ.
- Bootstrap kiểm kê đầu tiên không sinh kết quả test và kết thúc exit1 sau khi dừng tiến trình bị kẹt; lần chạy Node trực tiếp đã hoàn tất, kết quả ở bảng trên. Không dùng bootstrap thất bại làm test PASS hoặc lỗi runtime của website.
- Secret scan là heuristic, npm audit chỉ tập advisory truy vấn được; không phải chứng minh không có lỗ hổng hay secret tuyệt đối.
- Lighthouse 99/100/LCP≈1,99s trong docs/lighthouse.json là **bằng chứng phiên trước**, không đo lại lần kiểm kê này. Không gán metric đó là phép đo mới.
- NOT_TESTED: OAuth thật, JWT/MFA/role revoke qua Supabase, direct Storage/REST/RPC trên cloud, file signedURL60s thật, tiền/đối soát thực, concurrent nhiều worker/timing/challenge, native WebShare, screen reader/zoom thật, actual deploy/CI/quota/pause/backup-restore DB+Auth+Storage. Lý do: môi trường ngoài chưa cấu hình hoặc cần QA thủ công; lần này chỉ được kiểm kê.
- Source-integrity: `docs/audits/20261025T051523Z/source-integrity.json`. Bản sao output kiểm thử cũ: `docs/audits/20261025T051523Z/before`; không xóa lịch sử.

### E. Các lỗi còn tồn tại

Các mục ghi “xác nhận tĩnh/rủi ro” chưa được tái hiện trên hệ thống cloud; không đổi chúng thành FAIL runtime hoặc lỗ hổng đã chứng minh. Không sửa lỗi lớn trong phiên này. Chưa xác nhận P0 trong phạm vi local, nhưng không kết luận remote không có P0.

| Mã | Mức | Vấn đề | Cách tái hiện / bằng chứng | File/khu vực | Hướng xử lý |
|---|---|---|---|---|---|
| HC-RPT-001 | P1 | Chưa nghiệm thu Auth/RLS/Storage cloud | Chạy Google login và matrix anon/A/B/editor/owner trên staging: chưa có môi trường/credentials. Đây là blocker kiểm thử, không phải lỗ hổng đã khai thác. | src/lib/auth.ts; functions/api; supabase/migrations | Cấu hình staging và test Auth/MFA/REST/RPC/Storage trước live. |
| HC-RPT-002 | P1 | Chưa có cleanup vòng đời dữ liệu đầy đủ | Đến mốc retention: hiện chỉ candidate dry-run/technical TTL; không có tác vụ xóa/pseudonymize PII và Storage toàn vòng đời. NOT_IMPLEMENTED phần này. | 202610250008_retention_tasks.sql; HANDOVER.md | Owner chốt retention, dựng dry-run/apply/audit/tombstone và diễn tập restore trước chạy dữ liệu thật. |
| HC-RPT-003 | P2 | Giá UI không lấy từ cấu hình server | Sau owner thay giá bằng API admin/packages, Pricing và OrderPage vẫn dùng mảng giá gốc. Xác nhận từ code; chưa gọi API đổi giá trong audit. | src/main.tsx Pricing; src/features/orders/OrderPage.tsx; functions/api/[[path]].ts | Dùng một DTO gói từ server, kiểm version; giữ snapshot đơn cũ; test thay giá. |
| HC-RPT-004 | P2 | Hồ sơ/lịch sử chưa đủ trải nghiệm đọc lại | Account chỉ hiện title, datasetVersion và xóa; không mở toàn bộ body snapshot, không form profile. Xác nhận tĩnh; remote account NOT_TESTED. | src/main.tsx Account | Thêm xem snapshot/profile opt-in với RLS A/B và test tài khoản thật. |
| HC-RPT-005 | P2 | Dùng chung xác nhận tiền và phát hành | AdminWorkspace dùng cùng state confirm cho checkbox đã đối soát và đã xem bản cuối. Tích ô tiền rồi mở preview sẽ dùng chung trạng thái. Xác nhận từ code, chưa tái hiện với admin cloud. | src/features/admin/Workspace.tsx | Tách paymentConfirmed/publishConfirmed; reset khi đổi đơn/nội dung/hành động; test UI riêng. |
| HC-RPT-006 | P2 | Selected order có thể giữ version cũ | Sau confirm, load chỉ setOrders, không cập nhật selected; version hiển thị/action sau có thể cũ. Xác nhận từ code, server vẫn kiểm conflict. | src/features/admin/Workspace.tsx; Recovery.tsx | Đồng bộ selected từ response mới và xử lý conflict rõ ràng; không bỏ optimistic concurrency. |
| HC-RPT-007 | P2 | Corpus và thuật toán chuyên biệt còn giới hạn | Đổi input trong cùng tool: phần bài chính vẫn theo mở bài cố định + ba phần dùng chung, chủ yếu đổi score/symbol; không có bảng Can Chi/mệnh đã xác minh. | src/content/corpus.ts; src/engine/index.ts; DATA_SOURCES.md | Biên soạn thêm biến thể có kiểm chứng; giữ nhãn mô phỏng, không gọi là tử vi chuẩn. |
| HC-RPT-008 | P2 | Pepper rotation chỉ triển khai v1 | Không thể bỏ v1 an toàn cho toàn bộ đơn cũ bằng code hiện tại; mới có trường version và hướng dẫn reissue. | functions/api/[[path]].ts; order_credentials; HANDOVER.md | Bổ sung keyring/version migration và test mã/phiên cũ trước xoay khóa; không xoay thật trong audit. |
| HC-RPT-009 | P2 | Quy trình validator/scanner cloud chưa xác minh | Local reject/EXIF test không chứng minh upload→quarantine→sanitize→release→signedURL cloud; PDF chưa có scanner được xác minh. | scripts/validate_attachment.py; FileUpload.tsx; migrations004–005 | Cấu hình scanner cập nhật, test files giả và cloud quota/permission/TTL trước release. |
| HC-RPT-010 | P2 | Thiếu QA thủ công và native Web Share | Automated axe/reflow không thay screen reader, zoom200% thật hoặc Web Share điện thoại; các ca này NOT_TESTED. | tests/e2e/site.spec.ts; src/lib/share.ts | Chạy NVDA/keyboard/zoom/native share trên thiết bị thật và lưu bằng chứng. |
| HC-RPT-011 | P2 | Dự án D yêu cầu quyền ghi quản trị | Tài khoản User chỉ ReadAndExecute ở D:\boi; npm dev/ci/report cần ghi sẽ lỗi khi chạy thường. ACL đã đọc; audit dùng UAC, không đổi ACL. | Quyền NTFS D:\boi | Chủ dự án chọn chạy PowerShell quản trị hoặc chủ động cấp quyền thư mục/copy checkout writable; Codex không tự đổi ACL. |
| HC-RPT-012 | P3 | Tài liệu cũ có thông tin lệch với code | DATA_SOURCES còn ghi dataset admin chưa xong; ASSET_LICENSES còn nêu Arial/Georgia cho Pillow dù renderer đang dùng TTF OFL; báo cáo cũ là lịch sử. | DATA_SOURCES.md; ASSET_LICENSES.md; IMPLEMENTATION_STATUS.md | Ở phiên bảo trì sau đối chiếu và cập nhật có lịch sử; dùng CODEX_REPORT mới nhất cho hiện trạng. |
| HC-RPT-013 | P3 | Cảnh báo bundle uncompressed | npm run build cảnh báo initial chunk >300kB không gzip; gzip trước đó khoảng103kB. Không phải lỗi build hoặc bằng chứng chậm trên thiết bị thật. | vite.config.ts; dist/assets | Chỉ tối ưu khi metric mới cho thấy cần; không tăng threshold để che cảnh báo. |
| HC-RPT-014 | P1 | Chưa có nghiệm thu giao dịch/private delivery/restore thật | Không có test staging nhiều worker cho confirm/limiter/revoke, chưa restore DB/Auth/Storage thật hoặc private G50 hoàn chỉnh. | functions/api; tests/integration; docs/RELEASE_CHECKLIST.md | Dựng staging, dùng dữ liệu giả, chạy race/security/private file/restore và ghi report; không mở checkout trước đó. |
| HC-RPT-015 | P2 | Cần xác minh retry sau Turnstile | Submit giữ challenge trong state, chưa thấy reset sau một attempt; token đã dùng có thể làm retry sau lỗi bị từ chối. Đây là rủi ro tĩnh, chưa tái hiện với Turnstile thật. | src/features/orders/OrderPage.tsx Challenge/submit | Thử token single-use trên staging và thiết kế reset/idempotent retry phù hợp; không kết luận đã lỗi trên cloud. |
| HC-RPT-016 | P3 | Format check thất bại đã tái hiện | Chạy npm run format:check tại D:\boi: exit1, Prettier báo src/main.tsx. Typecheck/lint/build vẫn exit0. Không sửa format trong lần kiểm kê. | src/main.tsx; package.json format:check | Ở phiên sửa được giao, format riêng file rồi chạy lại format:check/lint/typecheck; không trộn refactor logic. |

### F. Những gì còn thiếu

- **NOT_IMPLEMENTED:** cleanup/pseudonymize PII và Storage toàn vòng đời; keyring pepper nhiều version tự động; UI profile CRUD/đọc lại đầy đủ snapshot; UI quản lý giá đồng bộ giá server. Có thể có API/SQL một phần, không coi đã hoàn tất toàn tính năng.
- **Chưa tích hợp/NOT_TESTED:** real Google OAuth/MFA/Supabase/Cloudflare/Turnstile, private file delivery G50, upload/validator cloud/scanner PDF, ngân hàng và hỗ trợ thật, staging concurrency, backup/restore Auth+Storage và scheduler/CI/quota.
- **Placeholder có nhãn thật:** thông báo chưa cấu hình trên login/admin/lookup/checkout/contact/refund; support/refund/retention chưa được owner chốt; checkout khóa. Không có tài khoản demo giả tự cấp admin.
- **Mô phỏng công khai:** bốn nhóm ngày/giờ/tuổi/phong thủy chưa có lịch Can Chi/mệnh với nguồn hợp lệ; corpus gốc có đoạn hướng dẫn chung; giấc mơ dùng fallback, không phân tích AI.
- **Fixture, không production:** PGlite auth/storage test schemas, dữ liệu giả trong E2E và synthetic restore; video nhân vật hư cấu. Không lấy mock pass thay nghiệm thu thật.
- **Giới hạn free:** hosting/DB/storage/egress/CPU/build/MAU có quota và điều kiện của provider, có thể pause; chưa kiểm chứng quota áp dụng hiện tại. Chưa có quota monitor/scheduler cloud tự động; ngân sách video không vô hạn, sản xuất thủ công bằng template.
- Không xây bot Zalo/email tự gửi, đăng video tự động, QR thanh toán, LLM/video API trả phí, export khách/doanh thu/blog/ads/PWA; đây là tính năng đã loại, không phải TODO phải bổ sung.

### G. Việc cần chủ dự án cung cấp

1. Quyền truy cập dự án staging Supabase/Cloudflare và Google OAuth, exact domain/redirect, UUID owner/editor đã đối chiếu và thiết lập MFA. Cấp qua dashboard/secret manager, không dán khóa vào báo cáo/chat.
2. Thông tin ngân hàng đã xác minh (ngân hàng, tài khoản, người nhận), chính sách hoàn tiền, kênh hỗ trợ/giờ làm việc, xác nhận retention trước nhận đơn thật.
3. Cấu hình Turnstile/pepper qua kênh secrets; quyết định thư mục writable hoặc cho phép chạy tác vụ ghi D bằng UAC. Không tự thay ACL trong audit.
4. Nếu dùng ảnh/nhạc/logo của chủ dự án: tài sản và quyền sử dụng cụ thể; nếu không, giữ tài sản tự tạo/OFL hiện có. Không yêu cầu cung cấp PII khách để test.

### H. Công việc tiếp theo

1. Sửa các lỗi UI tĩnh HC-RPT-003/004/005/006, xác minh retry HC-RPT-015; thêm test thực chất cho từng ca, không nới quyền.
2. Chốt retention rồi xây/diễn tập cleanup và tombstone/backup/restore; thêm keyring rotation trước khi xoay khóa.
3. Cấu hình staging riêng; chạy OAuth/MFA, ma trận anon/A/B/editor/owner và đầy đủ luồng đặt→claim→confirm→publish→lookup→private download.
4. Test concurrency/limiter/challenge/timing, upload/scanner/TTL, consent revoke race và restore DB/Auth/Storage. QA thủ công reader/zoom/WebShare.
5. Đồng bộ tài liệu lệch, xác minh quota và CI thật. Chỉ đề xuất phát hành sau bằng chứng checklist đầy đủ; không deploy hoặc nhận tiền theo lệnh kiểm kê này.
6. Mỗi phiên thay đổi source/config/tests/deploy phải cập nhật **đủ bốn CODEX_*.md** trước thông báo hoàn thành; giữ lịch sử cũ.

### I. Hướng dẫn kiểm tra

Do ACL hiện tại của D, mở **PowerShell quản trị** cho lệnh có ghi file (hoặc chủ dự án cấp checkout writable). Không sửa ExecutionPolicy toàn máy và không tự đổi ACL.

```powershell
Set-Location -LiteralPath 'D:\boi'
npm run dev
```

Frontend: `http://127.0.0.1:5173`; `/kham-pha`, `/boi/ngay-sinh`, `/dich-vu`, `/dat-don`, `/tra-cuu`, `/tai-khoan`, `/thu-vien`, `/video-mau`; admin `http://127.0.0.1:5173/admin`. Vite không chạy Pages API; muốn thử API:

```powershell
npm run build
npm run worker:preview
```

Worker thường tại `http://localhost:8788`; thiếu cấu hình phải fail-closed. Admin cần Google thật + membership server + AAL2; **không có tài khoản admin demo/bypass**.

Dữ liệu thử an toàn: tên “Đặng Minh An”, ngày “2000-02-29”; cặp “Nguyễn Bình Yên”, “1999-01-12”; giờ “không rõ”; giấc mơ hư cấu “Một hồ sen trong sương”. Không nhập thông tin khách thật vào demo/screenshot. Test fixtures SQL có UUID giả, không phải tài khoản dùng đăng nhập.

Kiểm thử: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run test:integration`, `npm run test:e2e`, `npm run test:media`, `npm run build`, `npm run check:secrets`. `test:worker` chỉ chạy khi Worker local8788 không cấu hình đang chạy; giữ output cũ trước rerun. `npm ci` chỉ khi thiếu dependency/đổi lockfile; không chạy khi preview đang khóa binary.


### Xác minh sau push — 2026-10-27 23:58 +07
Commit 1f8750f đã push main thành công (normal push, không force). Production HTTP 200 nhận bundle /assets/index-Ceyh27Jl.js có UI khôi phục mới; trình duyệt thực /tai-khoan sau reload hiển thị hai nút thiết lập/làm lại. Ảnh production-mfa-controls.png ngoài Git trong .mfa-qr-fix-20261027. Git integration đã đưa mã mới ra website; chưa đọc được deployment ID/build logs vì Dashboard tải chậm sau đăng nhập. QR enroll mới, reset factor thật và verify AAL2 vẫn NOT_TESTED: chủ tài khoản phải tự thao tác, không agent tạo/đọc OTP hoặc QR. Nhận đơn thật vẫn khóa. Không coi DOM mới là MFA hoàn tất.


### Sau push/deploy — 2026-10-28T00:28:47.1681752+07:00
Commit 74426ebf53fd0bc869e7f36e2e53dd75236fdff5 push main thành công, không force. HTTP production /tai-khoan nhận bundle /assets/index-DtmJACGI.js: có form admin/đặt mật khẩu, không còn chuỗi nút Google. /api/admin-login thử username giả trả 401, no-store; không gửi mật khẩu thật, không tạo session thành công. /api/config vẫn checkout=false/public_preview=true. Không xác minh DOM production vì CUA mất kết nối; HTTP/bundle không thay cho kiểm thử đăng nhập/session/MFA thật. Chưa đặt mật khẩu người dùng. Người dùng giữ phiên cũ, tự nhập mật khẩu và bấm Lưu mật khẩu; không đăng xuất trước bước này. Bốn báo cáo đã cập nhật, giữ lịch sử. Logs/bằng chứng ngoài Git .admin-login-20261028.


### Sau commit/deploy và kiểm tra cloud — 2026-10-28T01:36:35+07:00
Commit d0ae8434bc2340ed89a57c47cc360e8700c6bc84 push main thành công (không force). Public artifact /assets/index-BP6pH_Vj.js đã có login tối giản/workspace mới, không Google button; GETconfig checkout=false/publicpreview=true. Browser production /tai-khoan xác nhận chỉ Tài khoản/Mật khẩu/Đăng nhập, chụp account-production.png. /admin/dat-mat-khau trong phiên owner hiện có đã xác minh hiển thị hai ô password mới và nút lưu; đã bàn giao cho chủ tài khoản, agent không nhập credential.

Cloud SQL chỉ đọc boolean xác nhận đúng một owner active và password_is_set=false; KHÔNG đọc hoặc lưu password/hash. Vì thế chưa thể login mật khẩu thành công, không đoán credentials hoặc dùng mật khẩu chat. Auth signup đã tắt; Email enabled, Google provider vẫn tạm bật cho phục hồi đến khi password mới nghiệm thu. Feature MANUAL_DELIVERY_ENABLED=false; chưa tạo/upload/result theo code thật qua endpoint mới, chưa khai báo app production hoàn tất.

Migration014 đã apply với sự cho phép trực tiếp của chủ dự án, trong transaction; hai bảng RLS=true, anon/authenticated direct access=false, policies0, bucketprivate20MB. SQL Editor không tự ghi CLIledger, không run lại014/001–013. Ảnh/log/cloud-schema.json ngoàiGit tại .manual-simple-20261028 trênC. Bốn báo cáo giữ lịch sử và cập nhật thực tế; cần người dùng tự lưu mật khẩu mới rồi đăng nhập để tiếp tục bật riêng module thủ công và QA cloud, thanh toán luôn khóa.


Lệnh local chính xác (sửa cách ghi liền tham số trong mục I): `npm run dev -- --port 5187`; `npm exec wrangler -- pages dev dist --port 8788 --ip 127.0.0.1`. Worker kiểm thử của vòng này đã được dừng, không dừng tiến trình khác.
