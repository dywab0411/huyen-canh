from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
lh=json.loads((root/'docs/lighthouse.json').read_text(encoding='utf8'))
status='''# Huyền Cảnh — trạng thái bàn giao 25/10/2026

**Bản local đã triển khai. Chưa hoàn tất production/remote, chưa deploy công khai, chưa nhận tiền, không gửi tin hoặc đăng YouTube/TikTok.**

Đã đọc đủ 8 tài liệu gốc + prompts01–10 và 110 đáp án; N triển khai mới nhất thay phạm vi chỉ-soạn-tài-liệu cũ. Tài liệu gốc D giữ nguyên. Mã được dựng trong workspace C và đồng bộ D sau kiểm thử. Mọi gate remote chưa có bằng chứng đều giữ BLOCKED; không coi mock/PGlite là Supabase production.

## Theo giai đoạn

| Giai đoạn | Kết quả triển khai | Gate |
|---|---|---|
|01|React/Vite/TS strict, lockfile, Pages Functions, env, CI Windows, truy vết110U và các quyết định A|PASS local|
|02|Tokens, SVG Linh Sứ/sen/mây, routes thật, tìm không dấu, 12 thẻ, 3 gói, FAQ/guide, responsive|PASS automated local; manual reader/zoom chưa làm|
|03|12 registry/forms, NFC/phone/date/leap/Đ, canonical pair theo UTF16 không phụ thuộc locale sort, SHA256+versions, corpus≥501 từ/kết quả|PASS unit + 100 lần trên Node/Edge; Can Chi/mệnh ghi mô phỏng|
|04|12 CSS reveal/skip, reduced motion system/override/reset, nhạc tự tạo bật tay, PNG mặc định ẩn PII, share link không dữ liệu riêng|PASS local PNG/offline/motion/music; Web Share native chưa thử thiết bị thật|
|05|Schema/RLS mặc định deny, auth PKCE callback, hồ sơ/history own-user, Google optional, role+MFA mỗi request|PASS SQL local; BLOCKED Google/Supabase thật|
|06|Order idempotency/price snapshots, HC CSPRNG+128bit secret, HMACphone/secret, claim, atomic confirm, late payment, lookup/session/CSRF/limiter/Turnstile guard|PASS local SQL/guards; BLOCKED full HTTP/cloud/concurrency thực|
|07|Admin list/filter/confirm, draft/preview/revision/publish, G50 video gate, upload quarantine + validator local, owner config/member/dataset, review moderation/reset secret|PASS local code/SQL/media; BLOCKED real Auth/Storage operational flow|
|08|MP4 thực36s720p, nguồn template/license, consent scopes+preview+hash/version+18+ và revoke, queue ngoài nền tảng; gallery/reviews không giả khách|Video PASS; consent SQL PASS local; private delivery/public workflow remote BLOCKED|
|09|Typecheck/lint/unit/integration/E2E/build/scan/audit, axe/Lighthouse, screenshots|PASS phạm vi khả dụng; không gán remote pass|
|10|HANDOVER Windows/config/deploy/backup/rollback/quota, restore application schema synthetic với tombstone replay, checklist phát hành|PASS tài liệu+diễn tập local; remote restore/deploy/cleanup lifecycle chưa hoàn tất|

## Lệnh thực sự đã chạy và kết quả

- `npm run typecheck`: PASS TypeScript strict.
- `npm run lint`: PASS. Ban đầu lint quét .wrangler generated bundle; đã sửa phạm vi ignore, không bỏ rule source.
- `npm test`: **26/26 PASS** (3 file).
- `npm run test:integration`: **19/19 PASS** (4 file), chạy SQL Postgres WASM PGlite với migrations001–008; fixture Auth/Storage không phải dịch vụ thật.
- `npm run test:e2e`: **24/24 PASS**, Edge155 trên Windows, 1 worker; 12 công cụ offline, XSS text, PNG download, runtime equality100 lần/tool, reduced motion, music bật tay, routes/prices/video và accessibility.
- `npm run test:worker`: **7 HTTP check PASS** trên Wrangler local8788; config khóa, public empty, dataset503, private GET405 và POST403 do chưa có PUBLIC_ORIGIN/secrets. Không chứng minh cloud data operations.
- `npm run test:media`: **4 check PASS** với Python/Pillow: decode/re-encode ảnh, EXIFstrip, executable giả JPEG/scriptTXT bị từ chối, PDF fail-closed thiếu scanner. Script đã được chạy thật bằng Python; không có scan antivirus thật.
- `npm run build`: PASS; initial JS khoảng103,45KB gzip, dưới250KB mục tiêu. Vite còn cảnh báo chunk uncompressed>300KB; không che cảnh báo này. Admin/dataset lazy chunks riêng.
- `npm run check:secrets`: PASS heuristic source/build scan; không phải chứng minh tuyệt đối không có secret.
- `npm audit` sau cập nhật: **0 vulnerabilities** toàn bộ dependency; audit production cũng0. Dependency ban đầu12 cảnh báo đã sửa, có override undici7.30.1 cho Wrangler.
- `python video-template/render.py`: PASS, H.264/yuv420p/24fps,1280×720,36,0s,717258bytes; đã phát bằng Edge và xem frame, sửa font thiếu glyph Việt. VTT + WAV + template kèm theo.
- Restore local: `docs/RESTORE_LOCAL_REPORT.json` synthetic nhỏ và `docs/RESTORE_APP_REPORT.json` toàn bộ app schema/migrations/roles/orders/consent/RLS; AES256GCM, tái áp deletion sau mốc backup. **Không có actual Supabase Storage object/Auth remote restore**.

## Hiệu năng / hình ảnh

'''
status+=f"Lighthouse mobile mô phỏng (Edge155 headless Windows,412×823,DPR1.75,CPU4x,RTT150ms,1638.4Kbps,Wrangler local không credentials): performance **{round(lh['categories']['performance']['score']*100)}**, accessibility **{round(lh['categories']['accessibility']['score']*100)}**, LCP **{lh['audits']['largest-contentful-paint']['numericValue']/1000:.2f}s**, CLS **{lh['audits']['cumulative-layout-shift']['numericValue']}**. Lần đầu LCP3,20s; tối ưu WOFF2 font564KB→73KB và lazy code đã đạt mục tiêu local. Chưa đo mạng/thiết bị thật hoặc staging.\n\n"
status+='''38 screenshot dữ liệu giả trong docs/screenshots: home360/390/768/1024/1440, 12 desktop + mobile reduced, PNG, video, form/reflow. Axe home và các form không có violations trong bộ đã chạy; test keyboard skip link. Reflow640px là mô phỏng desktop200%, **không phải browser zoom thật**; screen reader thủ công chưa chạy. PNG lỗi offline do loadfont đã được phát hiện, sửa fallbackArial và chạy lại; ảnh cuối có dấu Việt đúng và không tên/ngày/SĐT mặc định.

## Cấu hình ngoài còn thiếu

Supabase URL/anon/service-role và staging project, GoogleOAuth ClientID/secret+redirect, owner/editor UUID thực+TOTP, Cloudflare project/domain/exact origin, Turnstile site/secret, LOOKUP_PEPPER_V1, bank/beneficiary/account thật, refund/support/hours và retention owner chốt. Không có secret thật được tạo/commit. SESSION_SIGNING_SECRET không dùng vì lookup opaque256bit+digestDB, đã bỏ khỏi env example.

## Phần chưa hoàn tất, phân biệt với thiếu credentials

- **Chưa chạy thật do cấu hình:** OAuth local/staging/prod, REST/RPC/Storage matrix cả5vai trò trên Supabase, actual signedURL60s, multi-isolate/concurrent HTTP confirm/limiter/consent và timing oracle, upload/validator release vào cloud, Google MFA thật, Cloudflare deploy, GitHubCI, quota/pause/scheduler và backup/restore DB/Auth/Storage staging.
- **Code/ops còn phải hoàn thiện trước live:** tác vụ xóa PII/storage đầy đủ theo retention/financial policy chưa triển khai tự động; hiện có candidate dry-run orders/source/audit/revokedconsent và technicalTTL, không tự nhận đã cleanup lifecycle. Pepperrotation chỉv1+quy trình reissue, chưa hỗ trợ nhiều key tự động. Không có tích hợp đăng/gỡ video ngoài nền tảng; chỉ approval/checklist và biên nhận thủ công đúng phạm vi đã chốt. Owner sửa giá qua API có version/snapshot; UI pricing hiện theo giáU61–63, cần đồng bộ/retest nếu owner thực sự đổi giá (mọi đổi config khóa release).
- **Chưa kiểm thủ công:** screenreader và browserzoom200% thật, WebShare native trên điện thoại, đánh giá mỹ thuật video bởi owner. Không dùng chúng làm lý do dừng các phần local độc lập.

## Những lỗi đã sửa trong lượt

Type FormEvent; migration dùng từ khóa window→window_id; conflict dependency và advisories; contrast theoaxe; glyph Việt video/PNG; PNG export offline khi font chưa cache; locale-dependent pair sort; thêm external removal task cả bản approved vì có thể owner đã đăng thủ công; bỏ quét lint generated .wrangler. Không nới RLS để test pass.

## Trạng thái từng acceptance ID

PASS_LOCAL = chỉ bằng chứng local ghi ở trên; PARTIAL/BLOCKED không được diễn giải là production hoàn tất.

| Test ID | Trạng thái | Bằng chứng / giới hạn |
|---|---|---|
'''
mapping={
'DOC01':('PASS_LOCAL','8file+10prompt+110U; N mới nhất thay giai đoạn chỉ tài liệu'),
'UI01':('PASS_LOCAL','5 viewport no-overflow/screenshots, đúng12/3gói'),
'UI02':('PARTIAL','axe100, keyboard/reflow; screenreader/browserzoom thật chưa chạy'),
'UI03':('PASS_LOCAL','12reveal/skip + system/override reduced motion, screenshots'),
'UI04':('PASS_LOCAL','không request nhạc trước click, bật/tắt/chuyển route'),
'F01':('PASS_LOCAL','12 schema và corpus≥501 từ; phần hướng dẫn chung được công khai'),
'F02':('PASS_LOCAL','100lần/tool Node24 và Edge155 byte-equal'),
'F03':('PASS_LOCAL','NFC/Đ/leap/future/unknownhour; không tự xác minh tên thật'),
'F04':('PASS_LOCAL','pair swap unit + stable canonical ordering'),
'F05':('PASS_LOCAL','fallback, length2000, browser script không thực thi'),
'F06':('PASS_LOCAL','12tool sau offline không APIAI/login'),
'F07':('PASS_LOCAL','unitv2/snapshot + SQL owner publish immutable'),
'F08':('PARTIAL','PNG thật/defaultẩnPII/offlinePASS; nativeWebShare chưa thử điện thoại'),
'AUTH01':('BLOCKED','thiếu Google/Supabase thật'),
'AUTH02':('PARTIAL','RLSA/B/historylocalPASS; remoteAuth chưa chạy'),
'ORD01':('PARTIAL','SQLserverprice/snapshot/idempotencyPASS; realHTTPstaging chưa chạy'),
'ORD02':('PASS_LOCAL','config/checkout khóa khi thiếu dữ liệu, khôngQRthanh toán'),
'ORD03':('PARTIAL','claimRPCkhôngpaid; remoteE2Ethanh toán chưa chạy'),
'ORD04':('PARTIAL','rowlock/version/unique+retrylocalPASS; haiHTTPworker thật chưa chạy'),
'ORD05':('PASS_LOCAL','expiry48h chỉunpaid, paid/delivered giữ nguyên; reason cho late'),
'LOOK01':('PARTIAL','digest/phone/codeSQLdenyPASS; timingoraclethật chưađo'),
'LOOK02':('PARTIAL','sessionTTL/DTOlocalPASS; cookie+filecloud chưa chạy'),
'LOOK03':('PARTIAL','atomicSQLpersistentPASS; nhiềuisolate/realTurnstileBLOCKED'),
'LOOK04':('PARTIAL','POST/no-store/noindex/nolog/localstoragecodechecked; remotebundlelogs chưakiểm'),
'LOOK05':('PASS_LOCAL','ownerreset thu hồi credential/session SQL'),
'SEC01':('PARTIAL','anonpublictable/RPCdenySQLPASS; realStorageRESTBLOCKED'),
'SEC02':('PARTIAL','historyA/BSQLPASS; crossattachmentrealHTTPBLOCKED'),
'SEC03':('PARTIAL','roleowner/editor/revokeSQLPASS, auth/MFAfailclosed; realJWTMFA BLOCKED'),
'SEC04':('PARTIAL','text/XSS/OriginchecksPASS; sessionCSRFcloud cầnthử'),
'SEC05':('PARTIAL','MIME/magic/quarantine/PILstripPASS; realcloud/scanner/signedexpiryBLOCKED'),
'SEC06':('PASS_LOCAL','heuristicsecret scan + npm audit0; CIremotelogs chưa có'),
'ADM01':('PARTIAL','adminUI/API+SQLpaid/G50gates; remoteflowBLOCKED'),
'ADM02':('PASS_LOCAL','datasetowner/schema/license/hash/immutableSQL; remoteBLOCKED'),
'CON01':('PASS_LOCAL','service-only mặcđịnh, optionalquyền không tựgrant'),
'CON02':('PARTIAL','SQLpreview/hash/version/scopePASS; realmediapreviewBLOCKED'),
'CON03':('PASS_LOCAL','SQL16–17 từchốiphoto/public'),
'CON04':('PARTIAL','transaction/revokepreventrepublishSQLPASS; concurrentworkers+outside removal chưa chạy'),
'VID01':('PASS_LOCAL','MP4thật36s1280×720H264đãphát/xem, nguồn/license'),
'VID02':('BLOCKED','privateStorage/end-to-endG50 cầncredentials, gateSQLđãcó'),
'REV01':('PARTIAL','schema/RPC/UI/moderation khôngfake; remoteproof/storage chưa chạy'),
'OPS01':('PARTIAL','offlinereadings/failclosedPASS; realquota/pause chưa thử'),
'OPS02':('PARTIAL','encryptedappPGliterestore+tombstonePASS; remoteDB/Auth/StorageBLOCKED'),
'OPS03':('PARTIAL','candidate/technicalTTLdryrun cóSQL, unitprotection; fullpolicycleanup chưa triển khai'),
'OPS04':('PARTIAL','WindowsCbuild/testsPASS; Dcleaninstall sẽ ghi kết quả đồng bộ bên dưới'),
}
ids=re.findall(r'^\| ([A-Z]+\d+) \|', (root/'ACCEPTANCE_TESTS.md').read_text(encoding='utf8'), re.M)
for ident in ids:
 state,why=mapping.get(ident,('BLOCKED','Chưa có bằng chứng'))
 status+=f'| {ident} | {state} | {why} |\n'
status+='\nĐọc HANDOVER.md và docs/RELEASE_CHECKLIST.md trước cấu hình. Không gọi ứng dụng production-ready hoặc hoàn tất live.\n'
(root/'IMPLEMENTATION_STATUS.md').write_text(status,encoding='utf8')
p=root/'HANDOVER.md';s=p.read_text(encoding='utf8').replace('001→007','001→008').replace('giao diện hiện cần bổ sung luồng nhập lý do late nếu dùng thường xuyên, có API `reason` đã hỗ trợ. Chưa được hứa xử lý tiền muộn trọn UI.','mở mục Tiền đến muộn trong admin để ghi lý do và tham chiếu. Luồng remote vẫn cần test staging.').replace('Endpoint đã có; màn hình reset chuyên dụng chưa hoàn thiện.','Có màn hình cấp mã mới trong mục khôi phục của owner; chưa chạy xác minh khách thật.').replace('màn hình quản lý hàng đợi nền tảng ngoài chưa hoàn thiện, xử lý kỹ thuật bằng dashboard có quyền.','Có màn hình hàng đợi owner và biên nhận gỡ thủ công.').replace('Code hiện có dry-run đơn, chưa có tác vụ xóa toàn bộ storage/consent theo policy đã chốt;','Code hiện có candidate dry-run đơn/ảnh nguồn/audit/consent thu hồi và cleanup technical TTL, chưa có tác vụ xóa toàn bộ storage/consent theo policy đã chốt;');p.write_text(s,encoding='utf8')
print('Wrote status for',len(ids),'acceptance IDs; actual logs only, remote remains blocked.')
