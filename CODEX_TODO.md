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
