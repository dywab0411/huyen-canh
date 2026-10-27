# CODEX_CHANGELOG.md

Nhật ký chỉ thêm mới; không ghi đè lịch sử.


## 2026-10-25 12:20:16 +07:00 (Asia/Bangkok) — 20261025T051523Z

- Mục tiêu: kiểm kê dự án D, chạy checks khả dụng, thiết lập quy trình báo cáo bắt buộc; không sửa lỗi lớn/deploy.
- Thay đổi chính: tạo/cập nhật đủ CODEX_REPORT.md, CODEX_CHANGELOG.md, CODEX_TODO.md, CODEX_HANDOFF.md; append quy định AGENTS.md; lưu inventory/fingerprint, log mới và bản sao artifact cũ.
- File liên quan: bốn báo cáo, AGENTS.md, `docs/audits/20261025T051523Z/**`; app source/config/migrations không thay đổi theo hash trước/sau.
- Kết quả: unit=26, integration=19, E2E=24; exit code từng lệnh ở `docs/audits/20261025T051523Z/results.json`. Không ghi PASS cho lệnh không chạy/thất bại.
- Vấn đề còn lại: HC-RPT-001–016; format:check exit1 ở src/main.tsx, thiếu cloud/đối soát/private delivery/restore thật, lifecycle cleanup, UI pricing/history/confirm/version và manual QA. Tổng dự án IN_PROGRESS, không production-ready.
- Lịch sử trước phiên: giữ nguyên IMPLEMENTATION_STATUS/HANDOVER và báo cáo cũ; không dựng thêm mốc giờ hoặc commit giả cho công việc trước.


## 2026-10-25 12:50:23 +07:00 — Vòng sửa local 20261025-local

- Mục tiêu: sửa HC-RPT-005/006/003/004/015/016 và cải thiện007 trước cấu hình production; không deploy/đổi ACL/secret/bank.
- Thay đổi: tách ack, derive selected/version và409; additive migration009+versioned/quoted RPC; server price DTO/default10k20k50k; profile/full immutable history UI; one-use Turnstile retry cùng idempotency key; format;48 câu hỏi gốc/4 nhánh/tool, engine1.1.0+datasetv2.
- File: src/features/admin/{Workspace,Recovery,FileUpload}; features/account/{Account,SavedSnapshot}; features/orders/OrderPage; lib/{auth,api-error,packages}; src/main.tsx; content/reflections; engine/index; functions/api/{packages,[[path]]}; migration009; tests local-fixes/version-api/database/account/content/packages/dataset, immutable v1 fixture/harness; DATA_SOURCES. Danh sách/hash33 file trong docs/fixes/20261025-local/source-manifest.json. Bốn CODEX file cập nhật giữ nguyên lịch sử.
- Kiểm thử cuối tại D: format/lint/typecheck/build exit0; unit30/30, integration26/26, E2E28/28, media4, Worker7+GETpackages, secrets scan exit0. Build warning422,20kB/131,85gzip, không đo lại Lighthouse; không render lại video vòng này.
- Lỗi trung gian giữ log:3 E2E đỏ/1 narrative đỏ trước sửa; dataset expectation sau bump, format Account, lint quét HTML report; D Vitest quét source backup thành suite trùng. Đã dùng ZIP lưu backup/report, không tắt security/lint/test để đạt. Rerun unit/integration cuối đạt30/26, không dùng41 test trùng làm kết quả.
- Còn lại:004 PARTIAL (Auth thật chưa test,100 history không pagination),007 PARTIAL (corpus còn chung, không lịch Can Chi thẩm định),001/014 cloud/restore/MFA/Storage/Turnstile BLOCKED/NOT_TESTED;002 retention,008 keyring,009 scanner/cloud,010 manual QA,011 ACL,012 docs legacy,013 bundle. Tổng dự án IN_PROGRESS, không production-ready.
- Backup nguồn/report gốc before.zip; evidence results.json và log; không giải nén backup tests vào repo trước chạy Vitest. Không apply migration009 remote trong vòng này.


## 2026-10-25 16:02:41 +07:00 — Cập nhật nội dung và CMS video (20261025-content)

- Mục tiêu: rà soát copy, thư viện giới thiệu đẹp khi trống, owner CRUD bài video và quyền công khai cụ thể; không production deploy.
- Đã ghi bản sửa TTL cuối vào D và chạy lại các gate tại D.
- Thay đổi28 file: main/style/Account/SavedSnapshot/OrderPage/Portal/PublicGallery; VideoLibrary/OwnerPanel/model/PublicationConsent; API/library module; migration010; validator --library; unit/integration/E2E+media tests; docs/VIDEO_LIBRARY/ASSET_LICENSES/DECISIONS. Danh sách/hash đầy đủ source-manifest.json; hai file TTL có interimAfter.
- CMS MP4/title/body/cover/category/date/draft-public, soft-delete audit; customer asset rights+exact post revision, minors/crossorder/expiry denied; sửa bài về draft, revoke chặn feed mới. Bỏ negative marketing và empty reviews, không tạo dữ liệu khách giả. Giữ pháp lý và ảnh consent, bank/pricing/lookup cũ.
- Kết quả cuối sau bản sửa TTL tại D: format/lint/typecheck/build0; unit31, integration38, E2E32; media4+2 sanitize thật. Worker: 7 HTTP smoke +GET packages +GET library default/empty/no-store đạt local. Warning bundle427,12/133,05gzip còn, chưa Lighthouse mới. Không xuất video khách mới hoặc test upload cloud.
- Lỗi xử lý: format library module; negative fixture trùng UUID released (tách và kiểm quarantine thật); FFmpeg temp bị sandbox (chạy thích hợp trong workspace); FK consent chặn TTL (bỏ FK lịch sử, giữ immutable events, test cleanup). Log trung gian/backup giữ nguyên, không tắt guard.
- Còn lại: HC-LIB001 cloud,002 cleanup,003 pagination,004 race/URL; blockers HC-RPT cũ giữ trạng thái; migration010 chưa remote, không deploy/không đổi ACL/secret/bank. PASS regression local sau ghi D


## 2026-10-25T16:43:58+07:00 — 20261025-visible-v3

Mục tiêu: sửa phiên bản thấy tại5173. Nguyên nhân chưa triển khai yêu cầu trực tiếp mới, không chỉ cache. Thay catalog4gói/form/QR/support/lookupcapability, HomeSections, migration011/privatephoto/video gate; source-manifest liệt kê file. Đã xác minh PID/source và5DOM thật, ảnh latest, không mock. Unit34, integration46, E2E36, checks xem results.json. Cloud/staging/cleanup/retention/keyring/nativeQA còn mở; checkout khóa, không deploy/đổiACL/mất đơn. Bốn báo cáo và VISIBLE_UI_VERIFICATION đã cập nhật, giữ lịch sử.


## 2026-10-25T17:38:24+07:00 — 20261025-order-v4

Mục tiêu: chẩn đoán khóa checkout, DEMO local4gói, DOB/HH2người và2câuvideo nguyênvăn. File theo source-manifest docs/order-round/20261025. Thêm migration012/SQLbirthcheck+marker,adminDTOguard,DEMOkhôngPII/API/thanh toánthật và khôngbundleproduction. Bằngchứng browser thật5173:4luồngDEMO0POST+ảnhterms/mobile; preview8788khôngDEMO. Unit35,integration57,E2E42,media4+2/checks0. Còn cloud/backend/flag/securityblockers nhưconfig,khôngdeploy/đổiACL hoặc mởcheckout. Giữlịch sửvàcậphật4report.


## 2026-10-25T17:47:56+07:00 — 20261025-birth-v5

Sửa ô giờ bị khóa mặc định: nhậpHH:mm, ngàyDD/MM/YYYY; API/SQL13 giữphút, khôngsuyđoánphútđơncũ; adminđịnhdạngngày/giờtươngứng. File/hash theo source-manifest docs/birth-round/20261025. Unit37,integration58,E2E44,format/lint/typecheck/build/media đạt; browserthật5173khôngmock0POST,ảnhvàBIRTH_INPUT_VERIFICATION. Cloud013NOT_TESTED,giữcheckoutkhóa/khôngdeploy/đổiACL. Cậpnhật4reportsvàgiữlịchsử.


## 2026-10-25T17:53:04+07:00 — 20261025-demo-v6

SửaDemoOrder: nútclaim bịdisable sau1click nhưngnhãncũ vànoticeởdướicard. ĐổiXemlại/noticeBước2/3/primarytra cứu, khôngrollback hoặcpaid thật. Regression đỏtrướcsửa vàpasssau; unit37,integration58,E2E45; real5173khôngmock0POST,ảnhvàlogdocs/claim-round/20261025. KhôngđổiDB/API/secret/ACL/checkout; cloudblockerscũgiữnguyên. Cậpnhật4reports vàgiữlịchsử.


## 2026-10-25T18:08:42+07:00 — 20261025-preview-v7

Thêm OrderPreview local thực sự thay validationmessage,scroll/focus/clearOnEdit,CTA DEMO khôngPII; giữcheckoutthậtkhóa. File OrderPage/OrderPreview/style/site-info/testorder-preview theo manifestdocs/preview-round/20261025. Testđỏtrướcsửa; unit37,integration58,E2E46; browser5173thật0POST. KhôngđổiDB/API/ACL/secret/flags/consent hoặcdeploy. Cậpnhật4reports,giữlịchsử.


## 2026-10-25T23:29:26+07:00 — 20261025-deploy-free-v8

Mục tiêu: chuẩn bịCloudflareFree+SupabaseFree+GitHubPrivate. Thêmpublic-profilefrontend/middlewareAPIstrict,routeapi-only,artifactpreflight,noQR/noDEMO/noAuthPII,cleanGitstaging,migrationexport13/read-onlyverifySQL,CIportablevàDEPLOY_FREE_GUIDE. File/hash theo source-manifest docs/deploy-free/20261025. Unit37,integration62,E2E46,media4+2,productionchecks/audit0; workerdlocal12tools/video/privateformsclosed/API403no-store/0UIpost/CSP0. LocalGitstagekhôngremote/commit/push. ThiếuloginCF/GitHub/Supabase,khôngdeploy/URLpublic,khôngmởcheckout hoặcchi phí. Giữlịch sửvàcậpnhật4report.


## 2026-10-25T23:29:50+07:00 — Chuẩn bị Supabase thật

Rà soát migration001–013, RLS/grants, Storage, OAuthPKCE, adminAAL2, lookup và khóa checkout. Tạo SUPABASE_SETUP_GUIDE.md cùng hướng dẫn Dashboard/env chính xác; liên kết DEPLOY_FREE_GUIDE và VERIFY_STAGING. Unit37, integration62, E2E46 local; logs docs/deploy-free/20261025. Cloud NOT_TESTED, không chạy migration, bootstrap hoặc mở nhận đơn. HC-SB001–004 và blocker cũ còn mở.


## 2026-10-26T00:10:36+07:00 — Đồng bộ GitHub main

Sao lưu/verify Git bundle và ZIP trước thay đổi. Đồng bộ179file D sang checkout C, obsolete0; sourcecommit881e7a812dad2337609bf73eb8ca91cba40341f4 đãpushmain thường vàlsremote trùng. Format/lint/typecheck/unit37/integration62/publicbuild/artifact/secretsPASS; npmci retry sauENOTFOUND đạt0, audit0vulns; E2E không chạy lại. Cảnh báo whitespace giữ nguyên. Files thay đổi theo sync-manifest ngoàiGit. Khôngforce/đụngSupabase/checkout/deploy. Cậpnhật4báocáo, cloud/CIchưa nghiệmthu.


## 2026-10-26T02:30:32+07:00 — OAuth chẩn đoán và cấu hình local

Đọc production/Cloudflare/Supabase: authnull vì build thiếu env; provider không phải bước lỗi hiện tại. Sửa auth-config/auth/publicbuild, thêm8test và OAUTH_DIAGNOSIS. Unit45/integration62/build/publicbuild/artifact/type/lint/format/scanPASS; chưaE2Emới hoặc realGoogle. Chưa push/deploy/cloudchanges; Auth/RLS/checkoutgate giữ nguyên. Bốn báo cáo cậpnhật, backup/logC .oauth-evidence-20261026.


## 2026-10-26T22:24:07+07:00 — Production rebuild và sửa lưu hồ sơ

RebuildCFba575c3a/commitcfab3b8 bằngbuildcommand đãlưu,artifactnhậnpublicenv. Googlechooserđúng; userloginthực,save/readbackprofilesessionreloadPASS. ChẩnđoánREST404PGRST205vàDashboardpublictrống; sauownerxácnhậnđãapply001–013transactionSuccess. Metadata13/RLS4private/releaselock/noadmin vàanon4tables401/42501PASS. Không runtimecodechange, khônge2elocalmới, khôngmởcheckout/admin hoặcxóaAuth. Cậpnhật4reportgiữlịchsử; cloudA/B/expiry/admin/payment/Storage/restorecònchưaQA. EvidencengoàiGit .oauth-production-20261026trênC.


## 2026-10-27T11:19:37+07:00 — Kiểmthửgói20k

Thêmtests/integration/g20-lifecycle.test.ts;45unit/63integration/2E2E,format/lint/type/build/scanPASS. BrowserDEMO20kcreate/claim/lookup/sample/reload/wrongcodePASS,0POSTtheoE2E. ProductionG20formvàconfig/POSTorders/lookup403đãkiểm,realcloudE2EBLOCKED. Testfixturebanđầulỗiawaitparameter/quoteversionđãsửa,khôngbỏconcurrency. Khôngđơn/tiền/admin/cloudguardmutation. BằngchứngG20_TEST_REPORT.md+ảnh/logngoàiGittrênC .g20-test-20261027.


## Chuẩn bị backend nhận đơn — 2026-10-27T11:40:35+07:00

Trạng thái IN_PROGRESS/BLOCKED nhận đơn thật. Đã lưu sáu Secret trên Cloudflare Production: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_ORIGIN, LOOKUP_PEPPER_V1, TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY. Không ghi giá trị khóa vào source hoặc báo cáo. Turnstile Managed cho huyencanh.pages.dev, pre-clearance tắt. Chưa nghiệm thu deployment mới nhận các runtime Secret này.

Sau xác nhận trực tiếp của chủ dự án, đã cấp owner cho UUID tài khoản đã đối chiếu với Auth và ghi audit. Không cấp quyền từ email do trình duyệt gửi. MFA AAL2 vẫn bắt buộc; chờ chủ tài khoản tự thiết lập TOTP và xác minh phiên trên trang tài khoản. Không lưu OTP hoặc QR TOTP.

PASS kiểm tra cloud RLS hồ sơ bằng SET LOCAL ROLE authenticated với claims thử và ROLLBACK: người B không đọc/sửa hồ sơ owner; owner đọc được hồ sơ chính mình. Đây là kiểm tra SQL, KHÔNG thay cho hai phiên Google thực hoặc kiểm thử toàn bộ API/admin/Storage.

Chủ dự án chốt hủy trong 15 phút từ khi đăng ký; còn thiếu tỷ lệ hoàn, thời gian xử lý và trường hợp hủy sau 15 phút khi chưa làm. Chưa tự đặt chính sách không hoàn tiền. Chủ dự án chọn không có thời hạn lưu; chưa sửa migration hoặc áp dụng chính sách mới lên cloud. Các RPC dry-run hiện vẫn liệt kê ứng viên 30/180 ngày, chưa có xác minh quy trình xóa/backup. TTL bảo mật, phiên tra cứu và thời hạn thanh toán phải giữ nguyên.

PUBLIC_PREVIEW_ONLY=true, CHECKOUT_ENABLED=false; chưa mở nhận tiền. Tạo đơn thật → xác nhận thanh toán → trả bài → tra cứu trên cloud: NOT_TESTED. Backup/restore, MFA API, signed URL và quyền truy cập chéo đơn cần nghiệm thu trước release_verified. Không có test/build mới trong vòng chỉ cấu hình này; kết quả 45 unit/63 integration/2 E2E của vòng G20 trước giữ phạm vi cũ, không tính là kiểm thử mới.

File cập nhật vòng này: bốn CODEX_*.md. Bằng chứng tên cấu hình và kết quả SQL nằm ngoài Git tại C:/Users/User/Downloads/boi/.checkout-ready-20261027/preparation.json, không có giá trị secrets. Không sửa mã ứng dụng, không push hoặc triển khai source mới trong vòng cấu hình này.

Tiếp theo: người dùng hoàn tất MFA và chốt chi tiết hoàn tiền; triển khai lựa chọn retention bằng migration bổ sung và test, giữ TTL kỹ thuật; kiểm thử backend/deployment với cấu hình mới, kiểm thử đầy đủ quyền/đơn/lookup và diễn tập khôi phục. Không chạy lại migration 001–013; không đổi ngân hàng, ACL, khóa hay mở release để bỏ qua gate.


## Sửa QR MFA — 2026-10-27T23:53:53+07:00

Nguyên nhân đã xác định trong SDK cài đặt: Supabase auth-js thêm tiền tố data:image/svg+xml;utf-8 vào qr_code, trong khi Mfa.tsx bọc thêm tiền tố data URI và encode toàn bộ lần nữa. Trình duyệt nhận nội dung không phải SVG nên ảnh hỏng. Bấm thiết lập lại gặp friendly name trùng vì lần enroll đầu đã tạo factor chưa xác minh.

Đã sửa src/features/account/Mfa.tsx và thêm src/lib/mfa-qr.ts: chuẩn hóa raw SVG/data URI, không bọc lồng; khóa nút khi đang tạo/đã có QR. Thêm nút Làm lại thiết lập chưa hoàn tất để chính người dùng bỏ factor TOTP unverified mang đúng tên ứng dụng; không xóa verified factor, không tự thực hiện trên tài khoản người dùng. Không giảm MFA/RLS hoặc thay checkout.

Regression tests/unit/mfa-qr.test.ts: 3 test tái hiện trước sửa đều FAIL (exit 1), sau sửa toàn bộ unit 48/48 PASS, integration 63/63 PASS. Format/lint/typecheck/build/check:secrets đều exit 0. Chưa chạy E2E QR tương tác trong vòng này; chưa xác minh QR mới hoặc mã TOTP thật trên production. Không lưu QR, OTP hoặc secret thật trong test/report. Bằng chứng lệnh/log ngoài Git .mfa-qr-fix-20261027 trên C.

Trạng thái local PASS; production QR/AAL2 NOT_TESTED chờ deployment và chủ tài khoản tự thao tác. Chưa mở nhận đơn thật. Owner/backend đã cấu hình theo báo cáo vòng trước. Không tự thay chính sách hủy/hoàn hoặc retention trong bản sửa QR.


### Xác minh sau push — 2026-10-27 23:58 +07
Commit 1f8750f đã push main thành công (normal push, không force). Production HTTP 200 nhận bundle /assets/index-Ceyh27Jl.js có UI khôi phục mới; trình duyệt thực /tai-khoan sau reload hiển thị hai nút thiết lập/làm lại. Ảnh production-mfa-controls.png ngoài Git trong .mfa-qr-fix-20261027. Git integration đã đưa mã mới ra website; chưa đọc được deployment ID/build logs vì Dashboard tải chậm sau đăng nhập. QR enroll mới, reset factor thật và verify AAL2 vẫn NOT_TESTED: chủ tài khoản phải tự thao tác, không agent tạo/đọc OTP hoặc QR. Nhận đơn thật vẫn khóa. Không coi DOM mới là MFA hoàn tất.


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


### Sau push/deploy — 2026-10-28T00:28:47.1681752+07:00
Commit 74426ebf53fd0bc869e7f36e2e53dd75236fdff5 push main thành công, không force. HTTP production /tai-khoan nhận bundle /assets/index-DtmJACGI.js: có form admin/đặt mật khẩu, không còn chuỗi nút Google. /api/admin-login thử username giả trả 401, no-store; không gửi mật khẩu thật, không tạo session thành công. /api/config vẫn checkout=false/public_preview=true. Không xác minh DOM production vì CUA mất kết nối; HTTP/bundle không thay cho kiểm thử đăng nhập/session/MFA thật. Chưa đặt mật khẩu người dùng. Người dùng giữ phiên cũ, tự nhập mật khẩu và bấm Lưu mật khẩu; không đăng xuất trước bước này. Bốn báo cáo đã cập nhật, giữ lịch sử. Logs/bằng chứng ngoài Git .admin-login-20261028.


## Kiểm tra đăng nhập thật — 2026-10-28T00:37:58+07:00

Trạng thái HC-ADMIN001/002: PARTIAL/BLOCKED mật khẩu thật, KHÔNG PASS đăng nhập. Browser production Chrome /tai-khoan nhập alias admin thành công, form không crash; thử đúng thông tin do chủ dự án cung cấp một lần, nhận thông báo Tài khoản hoặc mật khẩu không đúng, vẫn ở form login và không có link quản trị. Không lưu mật khẩu vào file/log/report. Không nhận được session thành công. Phản hồi này chưa phân biệt sai mật khẩu, password chưa được đặt hay cấu hình Email/password provider; không bịa nguyên nhân provider cụ thể.

Bản sửa trước chỉ tạo form/endpoint; agent CHƯA thiết lập mật khẩu thật trên Supabase. Vì thế không thể coi alias admin là credential đã sẵn sàng. Phiên IAB đang đăng nhập từ trước vẫn còn, có form Đặt mật khẩu cho tài khoản của bạn; đã giữ phiên này, không đăng xuất, không xóa user/factor, không đổi mật khẩu bằng agent. Chủ tài khoản cần tự nhập và lưu mật khẩu trong phiên đó rồi thử lại; đây là bước thay credential cần người dùng trực tiếp thao tác. MFA và checkout guards giữ nguyên.

PASS browser nhập username không lỗi; FAIL đăng nhập bằng thông tin được cung cấp trong lần thử này; NOT_TESTED đăng nhập thành công/refresh/AAL2. Bằng chứng screenshot login-rejected.png ngoài Git tại C:/Users/User/Downloads/boi/.admin-retest-20261028. Không sửa app hoặc deploy trong vòng kiểm tra này. Không chạy lại format/lint/typecheck/build/unit/integration/E2E vì không thay mã nguồn; số test vòng trước là lịch sử, không tính PASS mới.

Đã cập nhật bốn báo cáo, giữ lịch sử. Tiếp theo: chủ tài khoản tự Lưu mật khẩu tại https://huyencanh.pages.dev/tai-khoan (không đăng xuất trước), rồi kiểm tra lại đăng nhập/session bằng phiên riêng. Nếu Supabase báo lỗi khi lưu, ghi đúng thông báo để xử lý; không bypass Auth/RLS/MFA hoặc dùng mật khẩu nhúng.


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


### Sau commit/deploy và kiểm tra cloud — 2026-10-28T01:36:35+07:00
Commit d0ae8434bc2340ed89a57c47cc360e8700c6bc84 push main thành công (không force). Public artifact /assets/index-BP6pH_Vj.js đã có login tối giản/workspace mới, không Google button; GETconfig checkout=false/publicpreview=true. Browser production /tai-khoan xác nhận chỉ Tài khoản/Mật khẩu/Đăng nhập, chụp account-production.png. /admin/dat-mat-khau trong phiên owner hiện có đã xác minh hiển thị hai ô password mới và nút lưu; đã bàn giao cho chủ tài khoản, agent không nhập credential.

Cloud SQL chỉ đọc boolean xác nhận đúng một owner active và password_is_set=false; KHÔNG đọc hoặc lưu password/hash. Vì thế chưa thể login mật khẩu thành công, không đoán credentials hoặc dùng mật khẩu chat. Auth signup đã tắt; Email enabled, Google provider vẫn tạm bật cho phục hồi đến khi password mới nghiệm thu. Feature MANUAL_DELIVERY_ENABLED=false; chưa tạo/upload/result theo code thật qua endpoint mới, chưa khai báo app production hoàn tất.

Migration014 đã apply với sự cho phép trực tiếp của chủ dự án, trong transaction; hai bảng RLS=true, anon/authenticated direct access=false, policies0, bucketprivate20MB. SQL Editor không tự ghi CLIledger, không run lại014/001–013. Ảnh/log/cloud-schema.json ngoàiGit tại .manual-simple-20261028 trênC. Bốn báo cáo giữ lịch sử và cập nhật thực tế; cần người dùng tự lưu mật khẩu mới rồi đăng nhập để tiếp tục bật riêng module thủ công và QA cloud, thanh toán luôn khóa.


Lệnh local chính xác (sửa cách ghi liền tham số trong mục I): `npm run dev -- --port 5187`; `npm exec wrangler -- pages dev dist --port 8788 --ip 127.0.0.1`. Worker kiểm thử của vòng này đã được dừng, không dừng tiến trình khác.


## Sửa nhập nhầm tên tài khoản — 2026-10-28T01:58:48+07:00

Browser production cho thấy usernameIsAdmin=false và ngay cả trim/lowercase vẫn không phải admin. Không đọc/ghi giá trị tên người dùng đã nhập hoặc mật khẩu. Đã điền lại alias admin trên form, không submit credential, không đổi password. Chưa xác minh đăng nhập thành công. Trang /admin/dat-mat-khau vẫn có phiên xác minh và form để chính chủ tài khoản tự nhập/lưu mật khẩu; agent không thực hiện bước thay credential.

src/features/account/Account.tsx: cố định alias admin bằng hằng số và readonly input; submit luôn dùng alias server, tránh lỗi nhập nhầm/autofill. Không thay backend Auth, role, MFA legacy hoặc feature/payment guards. User yêu cầu đơn giản và tự chọn mật khẩu; không nhúng hoặc lưu giá trị mật khẩu vào source/Git/reports. Bước lưu password phải do người dùng tự nhập và bấm lưu trên website; không tuyên bố đã cài password.

Regression mới tests/e2e/admin-login.spec.ts: trước sửa FAIL vì input editable(exit1); sau sửa một assertion fixture mong có API payload thất bại vì local auth null đóng an toàn, đã sửa test theo phạm vi UI readonly và xóa password sau lỗi, không bỏ guard Auth. Cuối cùng 3/3 targeted E2E PASS(exit0). Format/lint/typecheck/build/check:secrets exit0, 48 unit PASS, 78 integration PASS. Không chạy lại full53 E2E; vòng trước full52 PASS là lịch sử. Log .login-alias-20261028 trênC ngoàiGit.

Cập nhật source/test và đủ bốn báo cáo, giữ lịch sử. Không thay database/Storage, không mở MANUAL_DELIVERY_ENABLED hoặc thanh toán, không reset người dùng. HC-SIMPLE001/002 vẫn PARTIAL/NOT_TESTED cloud password→CRUD→lookup. Tiếp theo: chủ tài khoản tự lưu mật khẩu và đăng nhập bằng admin, rồi kiểm chứng phiên thực trước bật riêng module và QA cloud. Không đoán/đọc password mới hoặc tái sử dụng credential chat trong code.


## Sửa lỗi đổi mật khẩu bị MFA cũ chặn — 2026-10-28 +07

Nguyên nhân đã xác minh trong Supabase Auth logs: PUT /user trả 401, AAL2 required khi tài khoản còn MFA. Frontend trước đây ném Error rỗng nên che nguyên nhân. Không phải bằng chứng mật khẩu nhập sai. HC-AUTH-PASSWORD: PARTIAL; đổi mật khẩu và đăng nhập thật chưa được xác minh.

Đã sửa src/features/manual/SetAdminPassword.tsx để giữ mã lỗi; thêm src/lib/password-error.ts ánh xạ whitelist thông báo ngắn, không in raw provider message/token. tests/unit/password-error.test.ts có 4 regression: MFA, phiên hết hạn/reauth, mật khẩu yếu/trùng, không lộ thông báo tùy ý. Trước sửa 3 FAIL/1 PASS exit1; sau sửa toàn bộ 52 unit PASS, 78 integration PASS exit0. Format, lint, typecheck, build, check:secrets exit0. Lint lần đầu exit1 do helper import chưa dùng, đã sửa và chạy lại PASS. Chưa chạy lại E2E vòng này; test local không chứng minh cloud đổi mật khẩu thành công.

Chủ tài khoản xác nhận gỡ MFA cũ CHỈ tài khoản quản trị trong câu trả lời trực tiếp; đã thực hiện Remove MFA factors trong Supabase Dashboard. Không thay MFA policy toàn cục, RLS, quyền owner, dữ liệu đơn hoặc guards. Cần kiểm tra số factor còn lại và chủ tài khoản tự nhập/submit mật khẩu mới; không ghi credential vào source/Git/reports. Không mở nhận tiền hoặc manual delivery.

Tiếp theo: xác minh gỡ MFA, chủ tài khoản lưu password mới trên /admin/dat-mat-khau, thử login admin và refresh session; sau đó QA cloud CRUD/video/lookup trước mở module. Không tự thay mật khẩu, DROP dữ liệu, đổi ACL hoặc bật thanh toán. Source đã chuẩn bị commit/push; trạng thái deployment cần kiểm chứng sau push. Log local ngoàiGit tại .password-aal-20261028. Chạy Windows npm run dev; build/test theo package.json. Không tái chạy migration001–014 trên cloud.

