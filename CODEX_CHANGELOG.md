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
