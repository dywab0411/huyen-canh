# Kết nối Supabase thật — Huyền Cảnh

Cập nhật 25/10/2026. Đây là hướng dẫn chuẩn bị, **không phải xác nhận cloud đã được cấu hình**. Không có migration nào được công cụ chuẩn bị này chạy lên Internet. Giữ `CHECKOUT_ENABLED=false` và `site_config.release_verified=false` đến khi nghiệm thu riêng. Dùng project Free mới dành cho staging, dữ liệu giả; không thử với thông tin khách.

## 1. Những việc bạn làm trên Dashboard

1. Mở đúng project Supabase vừa tạo; ghi nhận Project URL và project ref tại Connect hoặc Project Settings → Data API. Tên hiển thị tùy ý, không quyết định kết nối. Không lấy ref bằng cách đoán từ ảnh.
2. Kiểm tra Organization/Project vẫn ở Free. Không nâng cấp, thêm thẻ hoặc bật dịch vụ trả phí. Không gửi database password, secret key, service_role hoặc mã MFA qua chat.
3. Trước khi chạy SQL, mở Table Editor và SQL Editor kiểm tra project có bảng ứng dụng hay chưa. Nếu có `orders`, `site_config` hoặc dữ liệu thật, dừng; không chạy lại từ 001. Cần đối chiếu lịch sử migration và backup trước.
4. Với project mới rỗng, sau khi bạn xác nhận cho phép áp dụng schema, dùng SQL Editor thực hiện mục 2. Hiện tại **chưa thực hiện bước này**.
5. Sau schema, kiểm tra Database/RLS và Storage theo mục 3; cấu hình Authentication theo mục 4.
6. Chỉ nhập khóa bí mật trực tiếp vào Cloudflare Dashboard theo mục 5. Không chụp ảnh màn hình có khóa hoặc dán khóa vào issue/GitHub/chat.

## 2. Migration — thứ tự bắt buộc

Không sửa hoặc bỏ qua migration cũ. Các migration đầu không thiết kế để chạy lại tùy ý. Có G50 trong lịch sử là có chủ đích để bảo toàn đơn cũ; 011 chuyển các gói bán mới sang G10/G20/G60/G70.

| File trong `supabase/migrations` | Vai trò |
|---|---|
| 202610250001_initial.sql | Bảng, RLS, quyền cơ sở, ba bucket, RPC đơn/tra cứu/thanh toán |
| 202610250002_consent.sql | Quyền công khai, thu hồi, việc gỡ nội dung bên ngoài |
| 202610250003_operations.sql | Dataset, thành viên admin, duyệt đánh giá |
| 202610250004_files.sql | Đăng ký tệp riêng tư |
| 202610250005_release.sql | Kiểm định và chuyển tệp khỏi quarantine |
| 202610250006_preview.sql | Xem trước và bằng chứng quyền công khai |
| 202610250007_config.sql | Cấu hình, giá có version, gallery |
| 202610250008_retention_tasks.sql | Ứng viên retention và TTL; không tự thiết lập scheduler |
| 202610250009_local_fixes.sql | Optimistic concurrency/thanh toán và kết quả riêng biệt |
| 202610250010_video_library.sql | CMS video, bucket thứ tư, quyền theo revision |
| 202610250011_visible_orders_v2.sql | Bốn gói 10k/20k/60k/70k, mã truy cập mới, ảnh khách |
| 202610250012_order_birth.sql | Ngày sinh/giờ sinh, validation và marker schema |
| 202610250013_birth_minutes.sql | Giờ HH:mm, marker cuối 13, khóa release |

Trong PowerShell tại `D:\boi`, chạy `npm run prepare:database`. Lệnh chỉ xuất `release/supabase-new-staging.sql` và manifest SHA-256, không kết nối database. Tệp SQL ghép có BEGIN/COMMIT, **chỉ dùng cho project staging mới rỗng**. Sau xác nhận riêng của chủ dự án, mở SQL Editor → New query, dán toàn bộ tệp, chạy một lần và kiểm tra không có lỗi. Không chạy đồng thời tệp ghép và từng migration. Nếu lỗi, lưu thông báo đã che dữ liệu nhạy cảm, dừng để sửa; không xóa bảng hoặc tắt RLS.

SQL Editor không tự cập nhật ledger của Supabase CLI. Trước khi chuyển sang `supabase db push`, người triển khai phải đối chiếu/repair ledger bằng đúng 13 migration đã thực sự áp dụng. Không reset database hoặc push mù lên project có dữ liệu.

Sau đó chạy thủ công nội dung `supabase/VERIFY_STAGING.sql` trong SQL Editor. Đây là truy vấn metadata đọc, không xuất khách hàng. Kỳ vọng: marker 13; mọi bảng ứng dụng RLS=true; bốn bucket public=false; quyền SELECT trực tiếp orders/credentials của anon và authenticated bị từ chối; RPC tra cứu riêng không cho anon; gói active G10=10000, G20=20000, G60=60000, G70=70000; delivery_hours mới null; release_verified=false.

## 3. RLS và Storage cần kiểm tra

Mã hiện tại cho phép user đọc/sửa profile và lịch sử của chính mình qua `auth.uid()`. Đơn, credential, draft, audit, consent và CMS không cho client truy cập trực tiếp. Các RPC nghiệp vụ nhạy cảm chỉ cấp cho service_role; API xác thực user/role trước khi gọi. **service_role bỏ qua RLS**, nên chỉ có RLS chưa đủ chứng minh API an toàn.

Storage → Buckets phải có bốn bucket PRIVATE:

| Bucket | Giới hạn bucket | Nội dung |
|---|---:|---|
| source-photos | 5 MiB | Ảnh nguồn, không gallery |
| private-results | 20 MiB | Kết quả riêng |
| public-derivatives | 20 MiB | Bản dùng công khai sau kiểm quyền; bucket vẫn private |
| library-media | 20 MiB | Video MP4/ảnh bìa CMS |

Không bật Public hoặc thêm policy `using(true)` để chữa lỗi upload. Không tạo policy broad cho authenticated. API cấp đường dẫn và signed URL sau xác minh quyền; URL đọc có TTL 60 giây, không đưa vào log hoặc báo cáo. Upload có quarantine và giới hạn loại/dung lượng; kiểm định tệp và strip EXIF là bước thực tế riêng, không mặc nhiên đã chạy antivirus. Khung hai câu video trong form **không cấp quyền xuất bản**: vẫn cần quyền hợp lệ gắn chính xác asset/hash/version hoặc revision bài đăng. Thu hồi phải ẩn nội dung và có quy trình gỡ nền tảng ngoài.

## 4. Google OAuth, người dùng và admin

1. Supabase → Authentication → URL Configuration: Site URL là origin HTTPS chính xác của website staging, không có đường dẫn. Redirect URLs thêm chính xác `https://TEN_DU_AN.pages.dev/auth/callback`. Chỉ thêm localhost callback riêng khi thật sự thử local; không wildcard toàn bộ production hoặc mọi preview branch.
2. Google Cloud Console → cấu hình OAuth consent screen và OAuth client loại Web application. Khai báo origin website, và Authorized redirect URI là callback Supabase hiển thị, thường `https://PROJECT_REF.supabase.co/auth/v1/callback`. Đây **khác** callback website `/auth/callback`.
3. Supabase → Authentication → Sign In / Providers → Google: nhập Google Client ID/Client secret trực tiếp tại đây, bật provider. Client secret không đặt vào Cloudflare hoặc VITE. Nếu ứng dụng Google còn Testing, thêm đúng tài khoản test; không tuyên bố OAuth public đã nghiệm thu.
4. Trên staging có Auth được bật, thử login, hủy, callback PKCE và logout. Mã nguồn dùng PKCE, không tự cấp quyền admin theo email.
5. Đăng nhập tài khoản owner thật để tạo user, kiểm UUID tại Authentication → Users. Owner đầu tiên cần bootstrap có kiểm soát bởi chủ project qua SQL Editor, không có nút tự phong quyền. Sau khi đối chiếu UUID và xác nhận bootstrap, câu lệnh mẫu là `insert into public.admin_members(user_id,role,active) values ('UUID_THAT_DA_KIEM_TRA'::uuid,'owner',true);`. **Không chạy nguyên placeholder**, không chạy nếu đã có owner; tối đa ba admin active qua luồng quản lý. Không sửa auth.users hoặc metadata client để cấp quyền.
6. Trong `/tai-khoan`, đăng ký và xác minh TOTP MFA rồi vào `/admin`; API đòi JWT hợp lệ, membership active và AAL2. Kiểm tra editor bị từ chối đổi cấu hình/thành viên và owner đã bị revoke bị từ chối request kế tiếp. Không bỏ MFA để test đạt.

Bản `build:public-preview` cố ý ẩn tài khoản/admin/form và không dùng Supabase. Muốn kiểm OAuth phải dùng **staging riêng để kiểm thử** với build `npm run build`, env Supabase đầy đủ, `VITE_PUBLIC_PREVIEW_ONLY=false`, `PUBLIC_PREVIEW_ONLY=false`, nhưng vẫn `CHECKOUT_ENABLED=false`. Bản staging này không được giới thiệu là dịch vụ sẵn sàng tiếp nhận khách.

## 5. Biến môi trường Cloudflare — tên đúng với mã nguồn

Pages → project → Settings → Variables and Secrets (tên menu có thể đổi). Tách Preview và Production. Giá trị VITE được đóng vào bundle lúc build: phải build/deploy lại khi đổi. Secret server không có tiền tố VITE, không commit `.env`/`.dev.vars`.

| Tên | Nơi / loại | Giá trị hoặc điều kiện |
|---|---|---|
| VITE_PUBLIC_PREVIEW_ONLY | Build, không bí mật | true cho bản công khai miễn phí; false chỉ staging kiểm Auth |
| PUBLIC_PREVIEW_ONLY | Functions, không bí mật | true cho public miễn phí; false chỉ staging kiểm API; kiểm wrangler.toml vì biến cấu hình có thể lấy từ file |
| VITE_SUPABASE_URL | Build, công khai | Project URL; để trống khi public-only |
| VITE_SUPABASE_ANON_KEY | Build, công khai | Legacy anon key đúng project từ API Keys; tuyệt đối không service_role. Mã dùng tên này, không tự đổi thành tên biến khác |
| SUPABASE_URL | Functions, không bí mật | Cùng Project URL |
| SUPABASE_SERVICE_ROLE_KEY | Functions **Secret** | Legacy service_role đúng project; chỉ nhập Dashboard, không frontend |
| LOOKUP_PEPPER_V1 | Functions **Secret** | Chuỗi ngẫu nhiên mật mã ít nhất 32 byte, lưu riêng an toàn; không tự rotate vì mã cũ phụ thuộc nó |
| PUBLIC_ORIGIN | Functions, không bí mật | Origin HTTPS chính xác của deployment, không slash cuối/path; mỗi staging một origin đúng |
| CHECKOUT_ENABLED | Functions, không bí mật | **false** trong giai đoạn này |
| TURNSTILE_SITE_KEY | Functions, công khai | Widget đúng hostname, config API đưa site key cho UI |
| TURNSTILE_SECRET_KEY | Functions **Secret** | Secret cùng widget, không dùng test key cho public thật |

Project Settings → API Keys có thể tách Publishable/Secret và Legacy anon/service_role. Hướng dẫn này theo cặp legacy mà mã hiện tại đặt tên; không dán nhầm key. Chuyển loại key mới cần kiểm thử tương thích riêng. Không cần database password, DATABASE_URL, JWT signing secret, Google client secret, Cloudflare token hoặc Supabase access token trong biến runtime ứng dụng này.

Nếu có `wrangler.toml`, rà soát biến khai báo trong file thay vì trông đợi Dashboard ghi đè; ưu tiên sửa cấu hình staging có review. Bản chuẩn bị mặc định PUBLIC_PREVIEW_ONLY=true và CHECKOUT_ENABLED=false. Secrets vẫn đặt trực tiếp tại môi trường Functions. Không dùng cùng service_role giữa các project độc lập.

## 6. Nghiệm thu trước khi mở nhận đơn

Local tests/PGlite/mock không chứng minh Supabase cloud an toàn. Cần ghi riêng kết quả trên staging thật cho anon, khách A, khách B, editor và owner MFA:

- Anon không đọc REST orders/credentials/draft hoặc tải/list tệp riêng. A không đọc/sửa profile, lịch sử, đơn và attachment của B; thử cả API và truy cập trực tiếp.
- OAuth login/logout/cancel/PKCE, JWT giả/hết hạn, owner revoke và AAL1 bị chặn admin.
- Lookup mã sai/hết hạn/revoke: không lộ tồn tại đơn; đúng chỉ trả published DTO; cookie HttpOnly/Secure/SameSite, CSRF/Origin/no-store; limiter bền qua restart và nhiều isolate.
- Trong đợt QA được cho phép riêng, dùng dữ liệu giả và cấu hình staging kiểm soát để thử bốn gói, sửa giá client, idempotency và version conflict, Turnstile token chỉ dùng một lần. Không bật checkout ở production để thử.
- Claim chuyển khoản không thành paid; xác nhận paid không tự publish; hai admin cạnh tranh không tạo hai thanh toán; snapshot đơn cũ nguyên vẹn.
- Upload vượt quota/MIME giả bị chặn; tệp quarantine không phát hành; signed URL hết hạn; thu hồi consent ẩn nội dung; video quyền revision riêng.
- Diễn tập backup/restore, retention/TTL và giới hạn Free. Migration 008 không tự tạo cron hay chạy dọn dữ liệu. Chủ dự án phải duyệt retention và quy trình vận hành.

Chỉ sau bằng chứng QA thật và xác nhận riêng mới cân nhắc release_verified=true cùng CHECKOUT_ENABLED=true. Chưa có bước này trong phiên hiện tại. URL `/api/config` phải tiếp tục trả checkout_enabled=false; mã blocker chỉ là chẩn đoán, không phải bằng chứng mọi endpoint đã an toàn.

## 7. Lệnh kiểm tra Windows và bàn giao

```powershell
Set-Location D:\boi
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
npm run test:e2e
npm run check:secrets
npm run prepare:database
```

E2E cần dev server/Worker theo playwright.config.ts; không dừng tiến trình khác khi chưa xác minh PID/source. Local mặc định Vite http://127.0.0.1:5173 và Worker http://127.0.0.1:8788. `/admin` không có tài khoản demo hoặc mật khẩu mặc định. Xem CODEX_REPORT mới nhất để biết lệnh thực sự đã chạy, exit code và scope; không lấy danh sách lệnh này làm kết quả PASS.

## 8. Nguồn chính thức đã đối chiếu

- [Google OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Redirect allowlist](https://supabase.com/docs/guides/auth/redirect-urls)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

Thông tin Dashboard có thể đổi tên menu. Project Healthy trong ảnh chỉ chứng minh trạng thái hạ tầng ở thời điểm chụp, không chứng minh schema, OAuth, policy hay nhận đơn đã sẵn sàng.
