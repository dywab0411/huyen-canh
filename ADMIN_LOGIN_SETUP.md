# Hướng dẫn mới nhất: SIMPLE_ADMIN_SETUP.md

Nội dung dưới đây là lịch sử trước yêu cầu tối giản 28/10/2026. Không dùng để mở checkout hoặc yêu cầu TOTP cho module thủ công mới.

---

# Đăng nhập admin bằng mật khẩu

Yêu cầu mới 28/10/2026: bỏ nút Google; dùng tên đăng nhập `admin`. Không tạo owner mới hoặc xóa dữ liệu/tài khoản cũ.

## Chủ tài khoản thực hiện

1. Giữ phiên đang đăng nhập tại https://huyencanh.pages.dev/tai-khoan, không đăng xuất trước khi đặt mật khẩu.
2. Sau khi website nhận bản mới, tìm **Đặt mật khẩu cho tài khoản của bạn**, tự nhập mật khẩu, chọn **Lưu mật khẩu**. Agent không nhập hoặc lưu mật khẩu thật.
3. Mở cửa sổ riêng tư để thử tên đăng nhập `admin` và mật khẩu vừa đặt; giữ cửa sổ cũ để tránh mất quyền truy cập nếu thử chưa thành công.
4. Xác minh MFA khi quản lý đơn. Mật khẩu không thay thế yêu cầu AAL2 của API.

Nếu đã mất phiên hiện có, chủ tài khoản cần đăng nhập Supabase Dashboard, mở Authentication → Users, chọn đúng tài khoản owner và thực hiện quy trình đặt lại mật khẩu theo giao diện dịch vụ. Không tạo user khác cùng tên rồi cấp quyền tự động. Chưa tắt Google provider tại Supabase trước khi đăng nhập mật khẩu được nghiệm thu, tránh khóa tài khoản. Google không còn nút đăng nhập trên website; callback cũ giữ để không phá phiên/chuyển hướng đang dở.

## Cơ chế

POST /api/admin-login kiểm Origin, JSON và giới hạn body, rate limit bằng consume_limit. Alias admin ánh xạ trên server tới đúng một owner active trong admin_members. Không có hoặc có nhiều owner thì đóng an toàn. Không tìm owner từ email/role do client gửi. Supabase Auth kiểm mật khẩu; trả session của đúng owner, không trả email hoặc service key. Client setSession để dùng refresh/MFA theo SDK hiện có.

Không thêm biến môi trường mới hoặc lưu mật khẩu vào Cloudflare. Dùng SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_ORIGIN và LOOKUP_PEPPER_V1 đã cấu hình. Email/password provider và password sign-in phải khả dụng trong Supabase; chưa được xác minh cloud ở vòng chuẩn bị này. Nếu dashboard đang tắt Email provider, chủ dự án phải bật đăng nhập mật khẩu trước khi thử. Không bật đăng ký công khai chỉ để đăng nhập admin.

Middleware preview chỉ cho tuyến xác thực /api/admin-login đi tới handler riêng. Các admin API, dữ liệu khách, tạo đơn/thanh toán và lookup vẫn bị guard preview; API admin tiếp tục kiểm membership+AAL2. Không bật CHECKOUT_ENABLED/release_verified, không giảm RLS.

## Kiểm thử và giới hạn

Integration kiểm missing config/Origin, throttle, username, membership, owner trùng, sai user/token, lỗi provider, payload lớn; dữ liệu hoàn toàn giả. E2E kiểm form mật khẩu, không prefill và không còn nút Google. Đây không phải bằng chứng đăng nhập password/MFA trên cloud. Cần chủ tài khoản tự đặt mật khẩu rồi kiểm tra đăng nhập/session/quyền thực tế.
