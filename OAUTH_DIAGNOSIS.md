Cập nhật 26/10/2026: Khi Dashboard khóa Type do Wrangler, dùng hướng dẫn [CLOUDFLARE_BUILD_ENV.md](CLOUDFLARE_BUILD_ENV.md). Không cần đổi Type hoặc tạo lại project. Nội dung chẩn đoán phía dưới được giữ làm bằng chứng.

# Google OAuth — chẩn đoán production ngày 26/10/2026

**PARTIAL: đã xác định lỗi trước OAuth, chưa xác minh đăng nhập production thành công.** Không thay cấu hình cloud, secrets, migration hoặc checkout trong phiên này.

## Bằng chứng trực tiếp

- Trình duyệt thật tại https://huyencanh.pages.dev/tai-khoan hiển thị “Đăng nhập hiện tạm chưa khả dụng”. Nút Google không disabled trong DOM; nhấn sẽ gọi login(), nhưng auth=null nên báo lỗi trước khi gửi request tới Google.
- HTML200 tải `/assets/index-c-3TpVsN.js`. Bundle công khai không chứa Project URL Supabase, không chứa publishable key hoặc legacy anon JWT; hàm login đã được tối ưu thành throw “Chưa cấu hình Google OAuth/Supabase”. Vì vậy cấu hình cần thiết không đi vào artifact đang phục vụ, không phải lỗi Google client secret tại bước này.
- Dashboard Cloudflare production: build `npm run build`, output `dist`, branch main, repo hiển thị `dywab0411/huyencanh`; deployment `4c3c481f-ff2c-44c3-a029-f74b2e80f255` thành công, commit `3cd559ce2ed338de756d3b2300d1ce862985f7a7`. Commit trùng lần đồng bộ trước; không kết luận repo khác chỉ từ việc tên đổi.
- Variables and secrets có tên `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, đều Type Secret/Value encrypted. Không reveal/copy giá trị, nên chưa xác nhận chúng có rỗng, sai project hoặc nhập trước/sau deployment. Build log chỉ hiện PUBLIC_PREVIEW_ONLY=true và CHECKOUT_ENABLED=false; log một mình không đủ chứng minh mọi secret vắng mặt, nhưng artifact chứng minh client không nhận cấu hình.
- Supabase URL Configuration: Site URL `https://huyencanh.pages.dev`, Redirect URL `https://huyencanh.pages.dev/**`. Callback `/auth/callback` nằm trong allowlist hiện tại. Khuyến nghị thêm URL chính xác và giảm wildcard sau khi đối chiếu các luồng cần dùng; không tự đổi trong phiên.
- Wrangler CLI chưa đăng nhập; phiên Chrome Dashboard có quyền đọc. Không có bằng chứng đã nghiệm thu session/token/Google consent/MFA production.

## Điều kiện code

Trước sửa: `auth = !publicPreview && url && key ? createClient(...) : null`, với `publicPreview = import.meta.env.VITE_PUBLIC_PREVIEW_ONLY === 'true'`. Account gọi login; nếu auth=null thì báo lỗi. Đăng xuất disabled khi không có user; không nhầm với Google bị disabled. Trong source mới, route tài khoản và callback còn bị ẩn hoàn toàn nếu publicPreview=true.

Vite thay `import.meta.env.VITE_*` khi build. Thêm biến runtime sau deployment không sửa được bundle cũ. `build:public-preview` cố ý ép preview=true và xóa các giá trị Supabase khỏi subprocess; dù Dashboard có khóa, build này vẫn không bật Auth. Bản production đang được kiểm dùng build thường.

## Thay đổi local

- `src/lib/auth-config.ts`: chẩn đoán reason an toàn (không giá trị), trim env, chấp nhận sb_publishable_ và legacy anon; từ chối sb_secret_ và legacy service_role; giữ preview guard.
- `src/lib/auth.ts`: hỗ trợ thêm alias `VITE_SUPABASE_PUBLISHABLE_KEY`, ưu tiên alias rồi mới `VITE_SUPABASE_ANON_KEY`; vẫn tương thích tên cũ. SDK hiện tại nhận publishable key trực tiếp, không yêu cầu nó là JWT. Không hardcode key thực.
- Callback giữ PKCE: website → Supabase/Google → `/auth/callback?code=...` → exchangeCodeForSession → `/tai-khoan`. Code được xóa khỏi URL bằng replaceState. Không đổi redirect thẳng về `/tai-khoan` vì trang này chưa tự exchange code.
- `scripts/build-public-preview.mjs`: xóa cả alias mới; giữ bản public-only an toàn.
- `tests/unit/auth-config.test.ts`: cấu hình thiếu/preview/URL/key, legacy anon/server rejection và SDK tạo URL Google PKCE bằng fixture publishable giả, không request mạng. Test này không chứng minh Google/provider/key thật hoạt động.

## Cloudflare: cách cấu hình chính xác

1. Vào Workers & Pages → huyencanh → Settings → Production. Xác nhận Git/main và commit mới cần triển khai. Thay đổi local chưa tự xuất hiện trên GitHub hoặc production; chưa push/deploy bản sửa của phiên này.
2. Trong cấu hình **biến dùng lúc build**, đặt public values dạng Text/Plaintext (hoặc build environment theo UI), không chỉ binding Secret runtime của Functions:

| Biến build | Giá trị |
|---|---|
| VITE_SUPABASE_URL | Project URL đúng project, ví dụ theo Dashboard Connect; không dán password |
| VITE_SUPABASE_ANON_KEY | **Publishable key sb_publishable_ được chấp nhận ngay với tên biến này**, hoặc legacy anon |
| VITE_SUPABASE_PUBLISHABLE_KEY | Alias mới sau khi triển khai source sửa; tùy chọn, không cần đặt nếu dùng tên trên; nếu có thì được ưu tiên |
| VITE_PUBLIC_PREVIEW_ONLY | false **chỉ sau khi cho phép và nghiệm thu phần Auth/RLS profile/history cho production** |

Public key được thiết kế cho browser; không thay bằng `sb_secret_`, service_role, database password hoặc Google client secret. Việc đổi từ Secret sang public build variable chỉ áp dụng đúng Project URL/public key đã xác minh; không reveal hoặc chuyển khóa quản trị.

3. Build command `npm run build`, output `dist`, root trống nếu package.json ở root. Không dùng `build:public-preview` khi muốn Auth. Giữ Functions `PUBLIC_PREVIEW_ONLY=true` và `CHECKOUT_ENABLED=false`: không mở API đơn/thanh toán chỉ để sửa Google. Điều này không thay thế việc kiểm tra RLS của profile/history mà browser gọi trực tiếp.
4. Nếu lấy env từ wrangler.toml, đặt URL/public key qua cơ chế build environment phù hợp với Pages; kiểm build log và artifact sau rebuild. Không đưa secret server vào vars có VITE. Không thêm khóa vào mã nguồn.
5. Tạo deployment mới sau khi lưu biến, kiểm đúng commit. Không chỉ Refresh trình duyệt. Chưa tự bấm redeploy trong phiên vì chưa xác minh giá trị khóa/public Auth gate.
6. Supabase Site URL là `https://huyencanh.pages.dev`; Redirect allowlist cần `https://huyencanh.pages.dev/auth/callback`. Google Web OAuth redirect URI là callback Supabase `/auth/v1/callback` của project, **khác** callback website. Client secret chỉ ở Supabase Google provider.
7. Trên production mới, nhấn Google, chủ tài khoản tự chọn tài khoản/đăng nhập/đồng ý nếu được yêu cầu. Xác minh về `/tai-khoan`, có phiên user hợp lệ, tải profile/history đúng user, logout xóa dữ liệu UI; thử cancel/error và quyền A/B. Không ghi code/token/email/ảnh user vào screenshot hoặc báo cáo.

Chỉ chuyển trạng thái VERIFIED sau khi hoàn thành bước7 trên URL thực. Hiện production còn lỗi, status PARTIAL/NOT_TESTED end-to-end. Các gate admin MFA, orders, thanh toán, Storage và Supabase cloud vẫn giữ nguyên.

Nguồn: [Vite env build-time](https://vite.dev/guide/env-and-mode), [Supabase public/secret keys](https://supabase.com/docs/guides/getting-started/api-keys), [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).
