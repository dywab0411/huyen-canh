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

## G20 test — 2026-10-27T11:19:37+07:00

LocalPASS:45unit/63integration/2E2E,format/lint/type/build/scan. Testmới g20-lifecycle.test.ts (PGlitedisposable) điđủquote/idempotency/claim/notpaid/confirmretry/drafthidden/staleversion/publish/secretlookup20k; khôngcloudmutation. BrowserDEMOđúng/saimãvàreloadPASS. Productiongói20khiểnthị,checkoutfalse/publicpreviewtrue,orders+lookupPOST403:no-store;realcloudendtoendBLOCKED, khôngmởkhóa. XemG20_TEST_REPORT.md; testdataDEMOkhôngphảiđơnthật. Cácblockertrướcgiữnguyên, testscreenshot/logC .g20-test-20261027ngoàiGit. KhôngđổiACL/secret/ngânhàng/Admin/Supabase; khôngchạylạimigrationcloud.

---

## Production profile — 2026-10-26T22:24:07+07:00

PASS: deployba575c3a, buildenv vàsave/readbackprofile+sessionreload thực. Chủdựánđãduyệtapply001–013: schema13/RLS/private4buckets/releasefalse/noadmin verified; anon4tables401/42501. HC-PROFILE001đóng, HC-AUTH003vẫnPARTIALlogout/expiry/A-B; cloudsecurity/payment/lookup/storageQA vẫnNOT_TESTED. Khôngrunlạimigrationghép, cầnCLIledgerreconcile. Khôngmởcheckout. BằngchứngngoàiGit .oauth-production-20261026trênC.

---

## OAuth — 2026-10-26T02:30:32+07:00

HC-AUTH001 PARTIAL: production build không có Supabase env. HC-AUTH002 BLOCKED: Auth/RLS production QA trước enable. HC-AUTH003 NOT_TESTED: login/callback/session thật. Đọc OAUTH_DIAGNOSIS.md. Local45unit/62integration/build/typecheck/lint/formatPASS; E2E không chạy lại. Source chưa push/deploy. Giữ cloud blockers và checkoutfalse.

---

## GitHub sync — 2026-10-26T00:10:36+07:00

- PASS: source commit 881e7a812dad2337609bf73eb8ca91cba40341f4 đã push main, ls-remote trùng; 179 source files, obsolete0. Backup bundle/ZIP ngoài Git.
- PASS kiểm tra phiên này: format/lint/typecheck/unit37/integration62/publicbuild/artifact/secrets. E2E không chạy lại. Actions/Cloudflare deploy và Supabase vẫn NOT_TESTED.
- Các blocker cloud và chức năng lịch sử giữ nguyên; không mở checkout.

---

## Supabase setup — 2026-10-25T23:29:50+07:00

- HC-SB001–004 BLOCKED/NOT_TESTED cloud: schema13, OAuth/MFA/RLS/Storage, staging env, backup/retention. Hướng dẫn mới SUPABASE_SETUP_GUIDE.md.
- PASS local: unit37, integration62, E2E46; logs docs/deploy-free/20261025. Không chạy SQL cloud, checkout=false. Các blocker cũ giữ nguyên.

---

# CODEX_TODO.md

## MỚI NHẤT — 20261025-deploy-free-v8 — 2026-10-25T23:29:26+07:00

- Public-preview READY_FOR_QA local: buildFunctions/artifact/workerd/browser12tools/video/privateformsclosed/API403 đạt. KhôngcóURLInternet,khôngdeploy.
- HC-DEPLOY001/002/003 BLOCKED: Cloudflarelogin/GitHubPrivate/SupabaseFreeproject+OAuth+MFA thiếu. LocalGitmain đãstage178file,khôngcommit/remote/push. CIcloudNOT_TESTED004.
- Unit37,integration62,E2E46; productionchecks/scan/audit0; logs docs/deploy-free/20261025,ảnhpublic ởsubfolderpublic. NpmciCđãkiểm, khônggáncloudPASS.
- DEPLOY_FREE_GUIDE làhướngdẫnmới; chỉkhiđăngnhậpđúngFreeaccountmớitiếptụcdeploypreview. PhảiverifyHTTPSURLthật trướcbáothànhcông.
- GiữPUBLIC_PREVIEW_ONLY=true/CHECKOUT_ENABLED=false, frontendprofilepublictắtAuth/PII. Cloud13/ORD/BIRTH/RPT/LIB cácblockercũkhôngđóng; retention/cleanup/keyring/scanner/nativeQA/pagination/performancecònmở. Khôngmởpaid/nânggói/thêmthẻ/đổiACL.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## MỚI NHẤT — 20261025-preview-v7 — 2026-10-25T18:08:42+07:00

- HC-PREVIEW001 PASS local: preview thực sự render summary,focus/scroll vàxóa khisửa; CTA DEMO riêng không PII. Không gửiPOST.
- Unit37,integration58,E2E46; logs/browser/manifest docs/preview-round/20261025,ảnhdocs/screenshots/preview-round.
- Checkout thật vẫnkhóa; cácHC-BIRTH001/HC-ORD001/002 vàHC-RPT/HC-LIB chưađóng cloud giữ nguyên như lịch sử. Khôngdeploy/đổiACL/secret.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## MỚI NHẤT — 20261025-demo-v6 — 2026-10-25T17:53:04+07:00

- HC-DEMO-TRANSFER P2 PASS local: sau lầnbấmđầu không còn nút disablednhãncũ; cónotice tại card, xemlạikhôngrollback, linktra cứu nổi bật.
- Kiểmthật5173 khôngmock,0POST; unit37,integration58,E2E45. Bằngchứng docs/claim-round/20261025.
- HC-BIRTH001/HC-ORD001/002 và cácHC-RPT/HC-LIB đang mở trước đó giữ nguyên. Cloud001–013 chưanghiệmthu, checkoutvẫnkhóa. Khôngdeploy/đổiACL/secret.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## MỚI NHẤT — 20261025-birth-v5 — 2026-10-25T17:47:56+07:00

- PASS local: nhập giờHH:mm ngay được, ngàyDD/MM/YYYY, unknown/rỗngnull và midnight00:00; browser thật5173 cảlive/DEMO vàmobile.
- HC-BIRTH001 BLOCKED: apply001–013/QA staging; config cầnmarker13, không tựmởrelease. Không đổi snapshot giờHHcũ.
- Unit37,integration58,E2E44,format/lint/typecheck/build/media đạt; xemdocs/birth-round/20261025.
- CácHC-ORD001/002, HC-RPT001/002/004/007/008/009/010/011/012/013/014 vàHC-LIB001–004 còn phạm vi mở như báo cáo trước; bản sửa định dạng không đóng các blocker cloud.
- Không deploy/đổiACL/secret hoặc mở nhận tiền thật.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## MỚI NHẤT — 20261025-order-v4 — 2026-10-25T17:38:24+07:00

- DEMO local4gói tạo/nhậnmã/hướngdẫngiả/tra cứu/kếtquảmẫu PASS browser thật5173,0POST. Bảnproduction không chứaDEMO. Ngày sinh/HHnullable/người2 và2câuvideoPASSlocal.
- HC-ORD001 P1 BLOCKED: BACKEND_NOT_CONFIGURED, CHECKOUT_FLAG_OFF, CHALLENGE_NOT_CONFIGURED, SECURITY_NOT_CONFIGURED. Thiếu môi trường, không bỏguardđểmở. HC-ORD002 P1 NOT_TESTED: apply012+roles/DOB/ảnh/lookup cloud.
- Owner chỉ mở nhận thật sau checklist ORDER_FLOW_VERIFICATION mục điều kiện: cấu hình/backup/001–012/authMFA/RLS/Turnstile/lookupCSRF/idempotency/manualpayment/rights/retention/releaseverified; sauđóbậtflag. Không deploy.
- CácHC-RPT001/002/004/007/008/009/010/011/012/013/014,HC-LIB001–004 vẫn còn phạm vi mở theo lịch sử;003/005/006/015/016 localregressionPASSkhông tươngđươngcloud.
- BằngchứngcuốiD:unit35,integration57,E2E42,media4+2. Logs/DOM/screenshot ởdocs/order-round/20261025 vàdocs/screenshots/order-round.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## TRẠNG THÁI MỚI NHẤT — 2026-10-25T16:43:58+07:00

- HC-VIS-UI PASS local:5URL5173 đúng revision và bốn gói, ảnh tại docs/screenshots/latest; PID35444 sourceD. Xem VISIBLE_UI_VERIFICATION.md.
- HC-VIS-001 P1 BLOCKED: chưa apply011/cloudQA; checkout giữ khóa. Backup/apply staging001–011, xác thực đủ quyền rồi mới mở.
- HC-RPT-003/005/006/015/016 local regression PASS;003 giờ bốn gói mới, snapshot G50 cũ giữ nguyên.004/007 vẫn PARTIAL;001/014 cloud BLOCKED;002 retention/008rotation/009scanner/010nativeQA/011ACL/012docs/013bundle còn mở.
- HC-LIB-001/004 cloud NOT_TESTED;002 cleanup BLOCKED;003 pagination PARTIAL.
- Mã HCX mới cần migration011 và pepper hiện hữu, không đổi secret; legacy còn lối xác thực đủ3 yếu tố rồi cấp mã một lần. Không dùng mã thanh toán công khai thay xác thực.
- UIQR/bank/hai số đã có, không xin lại; cần chính sách hoàn tiền/retention, quyền staging OAuth/Turnstile/ownerMFA.
- Unit34, integration46, E2E36 tạiD. Không deploy. Giữ lịch sử bên dưới, yêu cầu mới về4giá/QR/form/lookup thay ghi chú không đổi ở vòng cũ.

---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## HIỆN TRẠNG MỚI NHẤT — 20261025-content — 2026-10-25 16:02:41 +07:00

Đã ghi bản sửa TTL cuối vào D và chạy lại các gate tại D.

- Copy quảng bá, empty library, không fake reviews: PASS local. CMS owner CRUD/metadata/version và consent asset+post: triển khai và kiểm local, **PARTIAL tổng thể / cloud NOT_TESTED**.
- HC-LIB-001 P1 BLOCKED: apply010/staging private upload/validator/release/signedURL/Auth/MFA/role-revoke thật. Chưa deploy.
- HC-LIB-002 P2 BLOCKED: soft-delete chưa cleanup Storage/orphan; gắn HC-RPT-002 retention owner chốt.
- HC-LIB-003 P3 PARTIAL: public24/admin100, chưa phân trang; category lọc đã tải.
- HC-LIB-004 P2 NOT_TESTED: race nhiều Worker/cache/URL60s và revoke staging; không hứa xóa byte đã tải.
- TTL session↔append-only consent: PASS regression local sau ghi D. Regression cleanup không mất consent.
- Giữ HC-RPT-003/005/006/015/016 local PASS;004/007 PARTIAL.001/014 cloud BLOCKED,002 cleanup/008 rotation/009 scanner còn mở;010 manual QA/011 ACL/012 docs lịch sử/013 bundle vẫn mở. Literal restore report8→10 đã sửa, không đóng mọi vấn đề docs012.
- Không đổi giá/default/snapshot/ngân hàng/QR/form/3-factor lookup theo tài liệu tham khảo. Không có customer video/reviews seed.
- Kết quả cuối sau bản sửa TTL tại D: unit31, integration38, E2E32; format/lint/typecheck/build0, media4+2 real sanitize; xem results.json và CODEX_REPORT mới. Giữ log fail fixture/format trung gian.

Ưu tiên: Nghiệm thu staging thư viện sau cấu hình →staging quyền+private files+restore →retention/pagination/manual QA. Mỗi phiên sửa source vẫn cập nhật bốn CODEX file, giữ lịch sử bên dưới.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## Trạng thái mới nhất sau vòng sửa 20261025-local — 2026-10-25 12:50:23 +07:00

Bảng này thay trạng thái hiện hành; các bảng kiểm kê cũ bên dưới giữ nguyên làm lịch sử.

| Mã | Trạng thái hiện tại | Việc còn lại / điều kiện tiếp tục |
|---|---|---|
| HC-RPT-001 | BLOCKED / cloud NOT_TESTED | Cấu hình staging Auth/MFA/RLS/Storage; test anon/A/B/editor/owner thật. |
| HC-RPT-002 | BLOCKED P1 | Owner chốt retention; chưa xây cleanup PII+Storage đầy đủ, chỉ dry-run. |
| HC-RPT-003 | PASS regression local | DTO giá server/default, quote version, snapshot/idempotency SQL đạt; Supabase thật NOT_TESTED. |
| HC-RPT-004 | PARTIAL | Profile UI + full snapshot + own-user SQL local đạt; Auth save/chuyển A→B thật NOT_TESTED; thêm pagination vượt100 bài. |
| HC-RPT-005 | PASS regression local | Tách checkbox, reset theo order/version/body/ref đã chạy UI; cần admin cloud QA trước live. |
| HC-RPT-006 | PASS regression local | Derived selection/DTO refresh + versioned RPC +409 + null/stale rejection đạt; multi-admin HTTP race thật NOT_TESTED. |
| HC-RPT-007 | PARTIAL | 48 câu hỏi gốc CC BY4.0 /4 nhánh mỗi nhóm, ≥501 từ; còn phần chung, chưa có dữ liệu lịch Can Chi thẩm định. |
| HC-RPT-008 | OPEN P2 | Keyring rotation và migration pepper chưa xây, không tự xoay secret. |
| HC-RPT-009 | BLOCKED / NOT_TESTED | Scanner PDF và upload→release→private signedURL cloud. |
| HC-RPT-010 | NOT_TESTED | QA screen reader/zoom200%/native Web Share trên thiết bị thật. |
| HC-RPT-011 | BLOCKED | ACL D không đổi; owner quyết định checkout writable/quyền, hiện cần UAC. |
| HC-RPT-012 | OPEN P3 | Docs lịch sử và literal8 migrations trong generated RESTORE_APP_REPORT chưa đồng bộ9; xem report mới và test migration list. |
| HC-RPT-013 | OPEN P3 | Build warning422,20kB/131,85gzip; đo performance lại, không che warning. |
| HC-RPT-014 | BLOCKED P1 | Private G50/concurrency/restore Auth+Storage staging thật. |
| HC-RPT-015 | PASS regression local / Siteverify thật NOT_TESTED | Token mới sau attempt, key retry giữ nguyên; mock UI+SQL đạt. Cần staging challenge/timeout/race thật. |
| HC-RPT-016 | PASS | Format/lint/typecheck/build tại D exit0; không còn lỗi Prettier main. |

Ưu tiên: cấu hình staging và ma trận quyền thật →private delivery/restore →retention/keyring →pagination/corpus/QA/performance. Không mở checkout trước release gate; không deploy production trong phiên này.

Bằng chứng cuối: unit30, integration26, E2E28, media4, Worker7+quote endpoint; `docs/fixes/20261025-local/results.json`. Bằng chứng lỗi trung gian và backup giữ nguyên. Mỗi phiên sửa source tiếp theo vẫn phải cập nhật đủ bốn CODEX file.


---

## LỊCH SỬ GIỮ NGUYÊN

# CODEX_TODO.md

## Phiên kiểm kê 20261025T051523Z

Cập nhật: 2026-10-25 12:20:16 +07:00 (Asia/Bangkok). Phạm vi: kiểm kê, kiểm thử local và báo cáo; không sửa logic ứng dụng, database, giá hoặc cấu hình live.

Danh sách mở, chỉ ghi việc được phép làm ở phiên triển khai sau; lần này không sửa logic lớn. Không đổi NOT_TESTED thành PASS trước khi có log mới.

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

## Thứ tự và điều kiện đóng việc

| Thứ tự | Mã | Điều kiện đóng |
|---|---|---|
|1|HC-RPT-005/006/003/004/015|Sửa có test tái hiện và regression; không sửa giá đã chốt hoặc bỏ guard để pass|
|2|HC-RPT-002/008|Policy được owner chốt; dry-run/apply/tombstone/rotation/restore test bằng dữ liệu giả|
|3|HC-RPT-001/014/009|Staging có cấu hình, ma trận quyền thật, full private delivery/concurrency/scanner/restore bằng chứng|
|4|HC-RPT-010/007/012/013/016|QA thủ công, cải thiện corpus có nguồn, docs nhất quán và sửa format khi được giao; performance đo lại nếu đổi ảnh/font/bundle|
|Theo owner|HC-RPT-011|Owner chọn quyền thư mục hoặc checkout writable; không tự thay ACL|

Không cần bổ sung các tính năng đã loại: bot Zalo/email tự động, API bói/video trả phí, QR thanh toán, analytics/ads/blog/PWA, favorites/coupon/referral/export/dashboard doanh thu. Không coi thiếu những tính năng này là lỗi.


### Xác minh sau push — 2026-10-27 23:58 +07
Commit 1f8750f đã push main thành công (normal push, không force). Production HTTP 200 nhận bundle /assets/index-Ceyh27Jl.js có UI khôi phục mới; trình duyệt thực /tai-khoan sau reload hiển thị hai nút thiết lập/làm lại. Ảnh production-mfa-controls.png ngoài Git trong .mfa-qr-fix-20261027. Git integration đã đưa mã mới ra website; chưa đọc được deployment ID/build logs vì Dashboard tải chậm sau đăng nhập. QR enroll mới, reset factor thật và verify AAL2 vẫn NOT_TESTED: chủ tài khoản phải tự thao tác, không agent tạo/đọc OTP hoặc QR. Nhận đơn thật vẫn khóa. Không coi DOM mới là MFA hoàn tất.


### Sau push/deploy — 2026-10-28T00:28:47.1681752+07:00
Commit 74426ebf53fd0bc869e7f36e2e53dd75236fdff5 push main thành công, không force. HTTP production /tai-khoan nhận bundle /assets/index-DtmJACGI.js: có form admin/đặt mật khẩu, không còn chuỗi nút Google. /api/admin-login thử username giả trả 401, no-store; không gửi mật khẩu thật, không tạo session thành công. /api/config vẫn checkout=false/public_preview=true. Không xác minh DOM production vì CUA mất kết nối; HTTP/bundle không thay cho kiểm thử đăng nhập/session/MFA thật. Chưa đặt mật khẩu người dùng. Người dùng giữ phiên cũ, tự nhập mật khẩu và bấm Lưu mật khẩu; không đăng xuất trước bước này. Bốn báo cáo đã cập nhật, giữ lịch sử. Logs/bằng chứng ngoài Git .admin-login-20261028.


### Sau commit/deploy và kiểm tra cloud — 2026-10-28T01:36:35+07:00
Commit d0ae8434bc2340ed89a57c47cc360e8700c6bc84 push main thành công (không force). Public artifact /assets/index-BP6pH_Vj.js đã có login tối giản/workspace mới, không Google button; GETconfig checkout=false/publicpreview=true. Browser production /tai-khoan xác nhận chỉ Tài khoản/Mật khẩu/Đăng nhập, chụp account-production.png. /admin/dat-mat-khau trong phiên owner hiện có đã xác minh hiển thị hai ô password mới và nút lưu; đã bàn giao cho chủ tài khoản, agent không nhập credential.

Cloud SQL chỉ đọc boolean xác nhận đúng một owner active và password_is_set=false; KHÔNG đọc hoặc lưu password/hash. Vì thế chưa thể login mật khẩu thành công, không đoán credentials hoặc dùng mật khẩu chat. Auth signup đã tắt; Email enabled, Google provider vẫn tạm bật cho phục hồi đến khi password mới nghiệm thu. Feature MANUAL_DELIVERY_ENABLED=false; chưa tạo/upload/result theo code thật qua endpoint mới, chưa khai báo app production hoàn tất.

Migration014 đã apply với sự cho phép trực tiếp của chủ dự án, trong transaction; hai bảng RLS=true, anon/authenticated direct access=false, policies0, bucketprivate20MB. SQL Editor không tự ghi CLIledger, không run lại014/001–013. Ảnh/log/cloud-schema.json ngoàiGit tại .manual-simple-20261028 trênC. Bốn báo cáo giữ lịch sử và cập nhật thực tế; cần người dùng tự lưu mật khẩu mới rồi đăng nhập để tiếp tục bật riêng module thủ công và QA cloud, thanh toán luôn khóa.


Lệnh local chính xác (sửa cách ghi liền tham số trong mục I): `npm run dev -- --port 5187`; `npm exec wrangler -- pages dev dist --port 8788 --ip 127.0.0.1`. Worker kiểm thử của vòng này đã được dừng, không dừng tiến trình khác.
