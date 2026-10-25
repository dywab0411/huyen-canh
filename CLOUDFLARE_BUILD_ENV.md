# Cloudflare Pages khóa Type — cấu hình build Vite

Cập nhật 26/10/2026. Không cần tạo lại project `huyencanh`. Chưa xác minh OAuth production thành công.

## Nguyên nhân khóa

Project có duy nhất cấu hình nguồn `wrangler.toml`, có `pages_build_output_dir="dist"` và `[vars]` chứa PUBLIC_PREVIEW_ONLY=true, CHECKOUT_ENABLED=false. Không có wrangler.jsonc nguồn cạnh tranh. Khi dùng Wrangler làm source of truth, Dashboard hiển thị nhưng không cho sửa các trường tương ứng; rê chuột Type thấy biểu tượng cấm không chứng minh tài khoản thiếu quyền hoặc Supabase key không hỗ trợ. Không sửa Type của dòng hiện có để chữa lỗi Vite.

Các tệp trong node_modules/.wrangler/artifacts không phải cấu hình nguồn cần sửa. Không xóa/đổi tên Wrangler để mở UI, vì làm vậy thay đổi nơi quản lý guard và bindings. Giữ nguyên hai cờ bảo vệ.

## Phương án chọn: biến chỉ cho lệnh build

Với Git integration, Cloudflare chạy build command trong shell Linux. Gán biến trước `npm run build` truyền trực tiếp vào process.env của Vite, không phụ thuộc khả năng chỉnh Type binding runtime. Đây là public configuration, **không dùng cách này cho secret**. Không đưa giá trị key thật vào mã nguồn/Git. Không cần code ứng dụng mới cho cách truyền biến này.

Workers & Pages → huyencanh → Settings → Build → Build configuration → Edit. Đặt Build command thành **một dòng** sau, thay placeholder bằng **publishable key thực của project** ngay trong Dashboard:

```sh
VITE_SUPABASE_URL='https://wutxklvvimwopckfjmga.supabase.co' VITE_SUPABASE_ANON_KEY='THAY_BANG_PUBLISHABLE_KEY_DAY_DU' npm run build
```

Key thực phải bắt đầu `sb_publishable_`, không dùng chuỗi placeholder hoặc dấu ba chấm. Giữ Build output directory `dist`, root trống nếu package.json nằm gốc repository, branch `main`. Không đặt Google client secret, sb_secret_, service_role hoặc database password vào lệnh này. Public key sẽ có trong JS theo thiết kế; lưu nó dưới Type Secret không biến nó thành bí mật ở frontend.

Bản sửa OAuth hỗ trợ alias `VITE_SUPABASE_PUBLISHABLE_KEY`. Nếu đã đặt alias này và có thể tồn tại giá trị cũ, ghi **cùng public key** cho cả hai tên trong build command để tránh alias ghi đè ANON. Hoặc chỉ dùng alias mới sau khi đã xác minh deployment chứa bản sửa. Hiện Dashboard đã quan sát chỉ có hai tên URL/ANON, chưa có alias.

Không thêm `VITE_PUBLIC_PREVIEW_ONLY=false` vào lệnh để vượt qua một public-preview gate đang bật. Build thường hiện tại mặc định không bật cờ VITE này khi chưa khai báo; nếu môi trường đang đặt true, giữ khóa và hoàn tất nghiệm thu Auth/RLS trước khi chủ dự án cho phép mở Auth. Không đổi `PUBLIC_PREVIEW_ONLY=true` hoặc `CHECKOUT_ENABLED=false` của backend. Không dùng `npm run build:public-preview` khi kiểm OAuth: script đó cố ý ép preview và xóa URL/key.

Sau khi lưu, tạo deployment mới từ commit OAuth đã được push. Runtime bindings không sửa được JS cũ và Refresh không chạy lại build. Có thể để nguyên hai Secret runtime đang có; không cần reveal, delete hoặc chuyển Type. Phương án này không sử dụng chúng để build. Không tự thao tác redeploy hay nhập key thay chủ dự án trong phiên này.

## Kiểm chứng cần làm sau deployment

1. Xác nhận commit, build command và deployment thành công, không in key vào log thủ công.
2. Mở `/tai-khoan`, nhấn Google. Nếu auth vẫn null, đối chiếu preview flag và artifact vừa build; không chỉ kiểm HTTP200.
3. Redirect phải qua Supabase/Google → `https://huyencanh.pages.dev/auth/callback` → exchangeCodeForSession → `/tai-khoan`. Trong Google Console redirect URI là URL Supabase `/auth/v1/callback`, không phải đường dẫn tài khoản website.
4. Chủ tài khoản tự hoàn tất đăng nhập/consent; kiểm session, profile/history chỉ của user đó, logout/cancel và A/B. Chỉ sau bước này mới ghi OAuth production VERIFIED.

Local build fixture chỉ kiểm Vite đóng URL và public-key fixture vào bundle, không gọi Google/Supabase và không chứng minh key thật/provider/RLS cloud hoạt động. Không chạy migration hoặc mở checkout trong phiên này.

## Nguồn chính thức

- [Wrangler là source of truth; Dashboard không sửa các trường tương ứng](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#source-of-truth)
- [Pages Git build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Vite env được thay lúc build](https://vite.dev/guide/env-and-mode)

Hướng dẫn này thay bước yêu cầu đổi Type trong OAUTH_DIAGNOSIS.md trước đây. Mã nguồn OAuth, guard, giá gói và schema không thay đổi do lựa chọn build command này.
