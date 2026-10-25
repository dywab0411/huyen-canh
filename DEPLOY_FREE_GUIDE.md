# Hướng dẫn đưa Huyền Cảnh lên Internet miễn phí

Cập nhật 25/10/2026, múi giờ Asia/Bangkok. **Chưa có URL công khai được xác minh.** Địa chỉ localhost hoặc URL mẫu bên dưới không phải bằng chứng đã triển khai.

## 1. Phương án phát hành

Dùng **Cloudflare Pages Free** cho React/Vite và Pages Functions cùng tên miền; dùng **Supabase Free** cho database, Auth và kho tệp của môi trường staging. Bạn được cấp tên miền phụ `TEN_DU_AN.pages.dev`, không cần mua tên miền riêng hoặc giữ máy Windows chạy liên tục.

Lần công khai đầu chỉ mở trang giới thiệu, 12 công cụ miễn phí, chính sách và video mẫu. Các công cụ xử lý ngay trên thiết bị. Tài khoản, đặt đơn, tra cứu đơn và tải ảnh của khách **chưa mở**. DEMO thử đơn vẫn chỉ có trên máy local, không đóng gói lên Internet. Bản xem thử không cần khóa Supabase.

Không mua dịch vụ, thêm thẻ, bật Workers Paid, nâng Supabase Pro hoặc thêm dịch vụ AI/video trả phí. Hết hạn mức thì dừng và báo chủ dự án.

## 2. Hạn mức đã đối chiếu

Thông tin kiểm tra ngày 25/10/2026, có thể thay đổi; kiểm tra lại dashboard trước khi phát hành.

| Dịch vụ Free | Hạn mức tham khảo | Cần lưu ý |
|---|---|---|
| Cloudflare Pages | 500 build/tháng; một build đồng thời; 20.000 tệp; 25 MiB/tệp | Dùng pages.dev; giảm số lần build khi gần hết quota. |
| Workers / Pages Functions | 100.000 request/ngày; 10 ms CPU/request | Chỉ `/api/*` chạy Functions. Không dựng hoặc chuyển mã video trong request. |
| Supabase | Hai project hoạt động; 500 MB database/project; 1 GB Storage; 5 GB egress và 5 GB cached egress; 50.000 MAU | Project Free có thể pause sau một tuần không hoạt động; không có backup tự động/PITR như Pro. |

Không hứa dịch vụ miễn phí có SLA hoặc lưu video vô hạn. Backup phải được chủ dự án mã hóa, giữ riêng và thử khôi phục trước khi có dữ liệu khách. Không tạo truy cập giả để né pause.

Nguồn chính thức: [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Supabase pricing](https://supabase.com/pricing).

## 3. Chuẩn bị tài khoản và máy

Bạn cần đăng nhập GitHub, Cloudflare và Supabase bằng tài khoản của mình. Chọn Free; không gửi mật khẩu, token, khóa API hoặc mật khẩu database qua chat.

Máy cần Git và Node LTS tương thích; dự án yêu cầu Node >=22.12 và đã kiểm Node24. Dùng PowerShell trong đúng thư mục. `D:\boi` hiện cần UAC để ghi; không đổi ACL hoặc ExecutionPolicy toàn hệ thống. Khi đã có repository Private, bạn có thể clone vào thư mục user có quyền ghi để làm việc thuận tiện hơn.

Kiểm tra hiện tại: Wrangler chưa đăng nhập; chưa có repository GitHub từ dự án, không có cấu hình Supabase cloud. GitHub CLI và Supabase CLI chưa có trên PATH. Không đoán account ID, project ref hoặc credentials; không dùng tài khoản temporary thay cho tài khoản chủ dự án.

## 4. Tạo GitHub Private từ mã nguồn sạch

Tại thư mục dự án:

```powershell
Set-Location -LiteralPath 'D:\boi'
npm run check:secrets
npm run prepare:repository -- --init
git status --short
git diff --cached --name-only
```

Công cụ chuẩn bị Git chỉ khởi tạo nhánh `main` và stage source đã cho phép. Nó không commit, tạo remote hoặc push. Kiểm danh sách tại `docs/deploy-free/repository-audit.json`; file audit không được stage. Nếu Git hiện có thay đổi hoặc remote từ trước, đối chiếu trước; không reset hoặc force push.

Không đưa các tệp sau lên Git: `.env` đã điền, `.dev.vars*`, `.wrangler`, node_modules, dist, release, log, dump database, backup/ZIP, screenshots, ảnh/video riêng hoặc mã truy cập thật. `.env.example` chỉ là mẫu trống. Công cụ kiểm secrets chỉ phát hiện mẫu đáng ngờ, không bảo đảm tuyệt đối.

Trên **github.com**, chọn New repository, nhập tên ví dụ `huyen-canh`, chọn **Private**, không tạo sẵn README/.gitignore/license, rồi tạo repository. Xác nhận nhãn Private. Chỉ cấp Cloudflare quyền vào repository này. Repository Private không làm website trở thành website riêng tư.

Sau khi đăng nhập GitHub và chọn danh tính Git của chính bạn:

```powershell
git config user.name 'TEN_HIEN_THI_CUA_BAN'
git config user.email 'EMAIL_GIT_CUA_BAN'
git commit -m 'Prepare free public preview'
# Điền tài khoản và tên repository thật, không chạy nguyên placeholder.
git remote add origin https://github.com/TEN_TAI_KHOAN/huyen-canh.git
git remote -v
git push -u origin main
```

Dùng Git Credential Manager hoặc GitHub Desktop để đăng nhập, không đặt token trong URL. Giữ ngân sách trả phí GitHub Actions ở 0; workflow dùng Ubuntu, có timeout và hủy lượt cũ. Chỉ ghi CI PASS sau khi workflow thực sự chạy thành công trên GitHub.

## 5. Kiểm tra và build đúng profile

```powershell
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm run check:secrets
npm run test:e2e
npm run build:public-preview
npm run check:deploy
```

E2E dùng cổng5187, Edge trên Windows và Chromium trong CI. Kiểm local API cần Worker8788 trong cửa sổ riêng:

```powershell
npm run worker:preview -- --ip 127.0.0.1 --port 8788
```

Không khởi động trùng hoặc dừng tiến trình chưa xác minh. Các bài xử lý ảnh/video thật cần Python/Pillow và FFmpeg trên máy vận hành; không chạy chúng trong Functions.

`build:public-preview` ép cờ build an toàn, bỏ URL/key Supabase khỏi môi trường build, tạo `dist/release-profile.json` và bỏ bản QR khỏi artifact công khai. File QR nguồn không bị xóa. `check:deploy` kiểm profile, kích thước/số tệp, routes, dấu hiệu credentials và sự vắng mặt của DEMO local.

**Không dùng `npm run build` thông thường để thay lệnh phát hành public-preview.** Local DEMO vẫn dùng build/dev bình thường, không đặt `VITE_PUBLIC_PREVIEW_ONLY=true` trong môi trường dev nếu muốn thấy form thử đơn.

## 6. Cloudflare Pages Free — kết nối GitHub

1. Đăng nhập `dash.cloudflare.com`, mở Workers & Pages, tạo Pages project và kết nối Git. Chọn đúng repository Private; chỉ cấp quyền cho repository đó.
2. Đặt tên project của bạn. `TEN_DU_AN` trong hướng dẫn là chỗ điền, không phải tên đã được tạo hoặc được giữ chỗ. Giá trị `name` trong wrangler.toml hiện là huyen-canh; nếu chọn tên khác, sửa name cho khớp trước khi push/deploy.
3. Chọn production branch `main`, root là gốc repository, framework Vite hoặc None. Build command: **npm run build:public-preview**. Output directory: **dist**. Node24; nếu cần đặt `NODE_VERSION=24` trong Build variables.
4. Cấu hình cả Production và Preview: `PUBLIC_PREVIEW_ONLY=true`, `CHECKOUT_ENABLED=false`. `wrangler.toml` cũng đã có hai cờ này. Không đặt bất kỳ khóa Supabase, Google hoặc Turnstile nào cho bản public đầu.
5. Bấm Deploy. Lưu đúng URL Cloudflare trả về. Sau đó kiểm mục10 trên URL đó. Không báo thành công chỉ vì build hoặc upload thành công.
6. Không bật Web Analytics, dịch vụ trả phí hoặc nâng gói. Nếu chạm quota, dừng và báo chủ dự án.

Cloudflare có hai cách khởi tạo project: Git integration và Direct Upload; chúng không chuyển đổi qua lại tùy ý. Chọn Git integration ngay từ đầu nếu muốn tự build sau mỗi push. Xem [hướng dẫn chính thức](https://developers.cloudflare.com/pages/get-started/git-integration/).

### Lựa chọn khác: Wrangler sau khi chủ dự án đăng nhập

Wrangler đã nằm trong dependencies của dự án, không cần cài global:

```powershell
npx wrangler login
npx wrangler whoami
# Chỉ sau login đúng tài khoản, build/check đạt và điền tên project thật:
npx wrangler pages project create TEN_DU_AN --production-branch main
npx wrangler pages deploy dist --project-name TEN_DU_AN --branch main
```

Nếu project đã có, không tạo lại. Không dùng `--temporary` hoặc đoán credentials. Direct Upload có Functions cần Wrangler, không chỉ kéo thả dist rồi cho rằng API đã được đưa lên. Các lệnh trên là hướng dẫn, chưa chứng minh đã chạy trên tài khoản cloud. Xem [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## 7. Supabase Free — chỉ chuẩn bị staging

1. Đăng nhập Supabase, chọn/tạo organization Free và tạo project Free. Chủ dự án tự đặt, giữ database password trong trình quản lý mật khẩu; không ghi vào Git/chat. Không bật Pro, custom domain, PITR hoặc add-on.
2. Chỉ áp dụng bootstrap cho project mới, trống phần ứng dụng. Nếu đã có bảng hoặc dữ liệu, dừng và backup/review; không drop hoặc reset.
3. Chạy `npm run prepare:database`. Nó ghép nguyên vẹn 13 migration001–013 thành `release/supabase-new-staging.sql`, trong một transaction; có manifest SHA256. Lệnh này chưa kết nối hay thực thi database.
4. Trong SQL Editor của project mới, dán file bootstrap và Run đúng một lần. Không chạy lại nếu đã thành công. Nếu lỗi, transaction rollback; tìm nguyên nhân trước khi thử lại.
5. Chạy `supabase/VERIFY_STAGING.sql`. Kết quả mong đợi: schema13; bảng ứng dụng bật RLS; bốn bucket đều private; anon/authenticated không SELECT orders/credentials; RPC riêng không cho anon; bốn gói G10/G20/G60/G70 active; G50 inactive; release vẫn khóa.
6. Không thêm policy `true`, bucket public hoặc quyền service-role vào browser để làm test đạt. Script chỉ đọc metadata, không trả dữ liệu khách. PGlite test không thay kiểm HTTP/RLS/Storage thật.
7. Dùng môi trường staging riêng để thử Auth/API với dữ liệu giả. Không gắn service-role vào bản public-preview hoặc đổi cờ để mở trước nghiệm thu.

SQL Editor không tự cập nhật lịch sử migration của Supabase CLI. Nếu sau này dùng `db push`, phải đối chiếu và repair migration history theo tài liệu chính thức trước; không áp dụng lại001 lên bảng đã có.

## 8. Google OAuth và owner MFA trên staging

- Trong Google Cloud Console, tạo OAuth consent screen và OAuth Client loại Web application. Không bật dịch vụ trả phí/billing. Nếu ở chế độ Testing, thêm các test user của bạn.
- Google Authorized redirect URI là **https://PROJECT_REF.supabase.co/auth/v1/callback**, lấy chính xác từ Supabase provider. Đây không phải route callback của frontend.
- Supabase Authentication → Providers → Google: điền Client ID và Client Secret ở dashboard Supabase. Không đưa secret vào VITE_ hoặc Cloudflare/frontend.
- Supabase URL Configuration: Site URL là HTTPS origin staging thật; Redirect URL là **https://TEN_DU_AN.pages.dev/auth/callback**. Chỉ thêm exact localhost callback nếu có nhu cầu. Không allowlist toàn `*.pages.dev`.
- App dùng PKCE. Thử login, logout, hủy login, hồ sơ/lịch sử A/B. Public-preview vẫn không cho đăng nhập, ngay cả vô tình có public key.
- Chỉ bootstrap owner từ UUID thật trong auth.users đã đối chiếu, bằng SQL được review; không dùng email do client gửi hoặc UUID fixture. Bật TOTP/MFA, kiểm AAL2 trước admin; kiểm editor và thu hồi role. Không có mật khẩu admin mẫu.

Nguồn: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## 9. Những cấu hình chủ dự án phải tự cung cấp

| Tên | Nơi đặt | Bản public-preview đầu |
|---|---|---|
| VITE_PUBLIC_PREVIEW_ONLY | Build; script tự đặt true | true |
| PUBLIC_PREVIEW_ONLY | Cloudflare Functions | true |
| CHECKOUT_ENABLED | Cloudflare Functions | false |
| VITE_SUPABASE_URL | Build sau nghiệm thu; URL project thật | Trống |
| VITE_SUPABASE_ANON_KEY | Build sau nghiệm thu; anon/publishable key | Trống |
| SUPABASE_URL | Functions của staging | Chưa đặt |
| SUPABASE_SERVICE_ROLE_KEY | Functions Secret của staging; quyền cao, chỉ server | Chưa đặt |
| LOOKUP_PEPPER_V1 | Functions Secret; chủ dự án tạo CSPRNG >=32byte và lưu giữ an toàn | Chưa đặt |
| TURNSTILE_SITE_KEY | Functions config, site Turnstile Free đúng hostname | Chưa đặt |
| TURNSTILE_SECRET_KEY | Functions Secret, cùng cặp với site key | Chưa đặt |
| PUBLIC_ORIGIN | Functions; exact HTTPS origin, không wildcard hoặc dấu / cuối | Chưa đặt |
| Google Client ID/Secret | Chỉ dashboard Supabase provider | Chưa cấu hình |
| Owner/editor UUID | Bảng admin_members sau đối chiếu người dùng thật | Chưa cấp |
| NODE_VERSION | Build config | 24 |
| Quyền GitHub/Cloudflare/Supabase | Đăng nhập CLI/provider/dashboard | Cần chủ dự án đăng nhập |

Không cần SESSION_SIGNING_SECRET: lookup dùng opaque session và digestDB. Validator offline dùng ADMIN_ACCESS_TOKEN tạm thời trên máy tin cậy, không ở Cloudflare/VITE_/báo cáo. Không tự xoay pepper làm mất tra cứu đơn cũ.

Ngân hàng, QR và hai số hỗ trợ đã có; không yêu cầu lại. Chính sách hoàn tiền, retention và giờ hỗ trợ vẫn phải chốt trước nhận đơn thật. Public key không phải secret, nhưng service-role/pepper/Google secret tuyệt đối không có trong repo hoặc bundle.

## 10. Kiểm URL thật sau khi deploy

Có thể chạy công cụ kiểm tra với URL do chính Cloudflare trả về (không dùng URL ví dụ):

```powershell
npm run verify:public-preview -- https://TEN_DU_AN.pages.dev docs/deploy-free/public-remote
```

Lệnh dùng dữ liệu giả, thử các công cụ miễn phí và kiểm API ghi bị chặn; không gửi đơn thật. Máy cần Edge trên Windows hoặc Chromium đã cài trong CI.

Chỉ đánh dấu remote PASS sau khi mở URL HTTPS Cloudflare thực sự trả về, kiểm desktop/mobile và ghi bằng chứng:

- Trang chủ, khám phá, bảng giá, thư viện, video mẫu và deep-link công cụ trả đúng nội dung, reload không404. Cả12 công cụ đọc được; video phát được; nhạc chỉ chạy khi bấm.
- `/dat-don`, `/tra-cuu`, `/tai-khoan`, `/dang-nhap`, `/auth/callback`, `/admin` chỉ giới thiệu phần miễn phí, không form khách hoặc file upload. `?demo=1` không mở DEMO trên Internet. QR nhận tiền không có trong artifact.
- GET `/api/config`: checkout=false, public_preview=true. POST orders/admin/lookup/photo/consent:403 và no-store. GET private:405. Không có PII, draft, mã truy cập hoặc signed URL trong phản hồi/log.
- Có CSP/nosniff/Referrer Policy; routing Functions chỉ `/api/*`. Kiểm quota và lỗi thật, không log body.
- Lưu URL, thời gian, HTTP/DOM và ảnh. Build hoặc kiểm trên workerd local không phải kiểm URL Internet.

## 11. Điều kiện mở dữ liệu khách và nhận đơn thật

Không chỉ đổi cờ để mở. Cần nghiệm thu Supabase13 migration thật; ma trận REST/RPC/Storage anon/A/B/editor/owner; OAuth/MFA; lookup HMAC/session/Origin/CSRF/limiter/Turnstile; retry/idempotency/price snapshots/concurrency; đối soát thủ công; publish chỉ sau paid và video released; consent đúng hash/revision, thu hồi; upload → validator → signedURL; retention/cleanup/key rotation/PDF scanner và backup/restore DB/Auth/Storage.

Sau bằng chứng thật và yêu cầu mở riêng, owner mới duyệt release_verified; CHECKOUT_ENABLED giữ false đến lúc đó. Hai câu điều khoản video không tự tạo consent công khai. Không tự gửi tin hoặc đăng video lên nền tảng ngoài.

## 12. Rollback và trạng thái bàn giao

Giữ artifact/profile/hash và deployment ID. Nếu giao diện lỗi, rollback deployment, giữ API khóa; không drop database hoặc chạy migration down phá dữ liệu. Nghi lộ key thì khóa route, bảo toàn audit và xử lý theo quy trình; không tự xoay pepper/xóa data.

Hiện bước cần chủ dự án: đăng nhập Cloudflare, tạo/xác minh GitHub Private và Supabase Free staging. Không có URL thật để công bố trước khi deploy và kiểm tra. Khi đã đăng nhập, Codex có thể kiểm lại quyền và tiếp tục bản xem thử; không cần gửi secrets qua chat.
