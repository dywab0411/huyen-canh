# Huyền Cảnh: admin → lưu bài/video → mã tra cứu

## Trạng thái

Ngày 28/10/2026: migration014 đã được chủ dự án cho phép và áp dụng vào project hiện tại. Hai bảng RLS bật, anon/authenticated không có quyền trực tiếp, bucket private20MB đã xác minh cloud. Không chạy lại 014; password mới và upload/lookup end-to-end vẫn chưa nghiệm thu.

Bản tối giản không nhận tiền, không mở đăng ký khách và không cần Google trên giao diện. Dữ liệu đơn trả tiền cũ không bị sửa/xóa. Chức năng mới có cờ MANUAL_DELIVERY_ENABLED=false cho đến khi schema, mật khẩu mới và quyền cloud được nghiệm thu. Không coi bản UI hoặc test fixture là hệ thống cloud hoạt động.

## 1. Cơ sở dữ liệu

Project hiện tại đã có 001–013: CHỈ chạy supabase/migrations/202610280014_manual_delivery.sql sau sao lưu và xác nhận. Không chạy lại release/supabase-new-staging.sql trên project này. File ghép chỉ dành project hoàn toàn mới. Trong SQL Editor, bọc nội dung 014 bằng BEGIN; và COMMIT; để lỗi sẽ rollback toàn bộ. SQL Editor không tự ghi ledger Supabase CLI; cần đối chiếu trước db push.

014 thêm manual_deliveries, manual_delivery_uploads, RLS và bucket manual-results PRIVATE giới hạn 20 MB. Không có quyền anon/authenticated trực tiếp trên hai bảng, không có policy client cho kho video. Backend dùng service_role đã có, không đưa vào frontend. Mã 256 bit lưu trong bảng chỉ admin được đọc; tra cứu công khai dùng HMAC với pepper ổn định. Không đổi pepper nếu chưa có kế hoạch chuyển đổi mã.

## 2. Tạo hoặc chuẩn bị admin trong Supabase Dashboard

Mở Authentication → Users. Tài khoản owner hiện có giữ nguyên UUID và dữ liệu; không xóa hoặc tạo lại cùng email.

- **Owner hiện có**: chọn user → Overview → Send password recovery. Chủ tài khoản tự mở email, tự nhập mật khẩu mới (từ 12 ký tự) và xác nhận. Website có trang riêng /admin/dat-mat-khau cho bước này; nếu còn phiên Auth đã xác minh, có thể mở trực tiếp trang này để tự đổi mật khẩu. Sau lưu, đăng nhập lại tại /tai-khoan bằng admin. Mật khẩu từng đưa vào chat phải bỏ, không sử dụng production.
- **Project mới chưa có owner**: Add user → Create new user; tự nhập email và mật khẩu mới trong Dashboard, tạo user và sao chép UUID. Không đưa password vào SQL, Git hoặc Build command. Trong SQL Editor, sau khi đối chiếu UUID là đúng người, thêm vào admin_members với role owner, active=true. Không cấp quyền dựa trên email trình duyệt hoặc tạo thêm owner tùy tiện. Endpoint alias admin chỉ mở khi có đúng một owner active; nếu có nhiều owner phải xử lý rõ chủ sở hữu trước.

SQL cấp quyền cho project chưa có owner (thay UUID placeholder, chủ dự án xem và xác nhận trước khi Run):

```sql
begin;
do $$ begin
  if exists(select 1 from public.admin_members where role='owner' and active) then
    raise exception 'Owner already exists: do not create another';
  end if;
end $$;
insert into public.admin_members(user_id,role,active)
values ('UUID_DA_DOI_CHIEU','owner',true);
commit;
```

Sign In / Providers: Email/password sign-in phải bật. Tắt Allow new users to sign up (không tắt Email provider). Chỉ tắt Google provider SAU KHI đăng nhập mật khẩu mới thành công trong cửa sổ riêng; agent không tự xóa Google identity, Auth user hoặc MFA factors. Người dùng được xác thực bằng password và owner membership ở backend; đường quản trị mới không yêu cầu thao tác TOTP. API thanh toán/đơn cũ vẫn giữ bảo vệ MFA cũ.

URL Configuration: giữ origin https://huyencanh.pages.dev; thêm https://huyencanh.pages.dev/admin/dat-mat-khau vào Redirect URLs khi cần. Link recovery dạng fragment sẽ được chuyển vào trang đặt mật khẩu và xóa token khỏi thanh địa chỉ trước khi gọi xác minh. Không chụp/chia sẻ link recovery, token hoặc password. Email recovery/Google cũ phụ thuộc cấu hình dịch vụ; chưa nghiệm thu flow email thì không đánh dấu PASS.

## 3. Cloudflare

Không thêm password vào bất kỳ biến môi trường nào. Giữ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUBLIC_ORIGIN, LOOKUP_PEPPER_V1 dạng server Secret đã cấu hình. VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY/publishable chỉ là cấu hình public của SDK, không phải khóa quản trị.

Sau 014 + đổi mật khẩu mới + QA được xác nhận, sửa MANUAL_DELIVERY_ENABLED="true" trong [vars] wrangler.toml rồi commit/build. Đây chỉ mở endpoint mới /api/delivery. Vẫn PUBLIC_PREVIEW_ONLY=true và CHECKOUT_ENABLED=false. Không mở lại paid checkout hoặc các API admin cũ. Nếu muốn thử cloud trước công khai, dùng preview deployment có cùng cấu hình riêng phù hợp và dữ liệu hoàn toàn giả; không tắt toàn bộ preview guard.

## 4. Sử dụng

/tai-khoan: admin, mật khẩu, Đăng nhập. /admin: Tạo mã đơn hàng tự động → nhập chữ → chọn MP4 tối đa 20 MB → Lưu đơn hàng. Đơn tạo mã nhưng chưa lưu là nháp, tra cứu không mở. Bấm mã trong danh sách để sửa. Tải lại danh sách khi có xung đột phiên bản; không ghi đè mù. Giữ nguyên mã khi sửa chữ/video.

/tra-cuu: khách nhập nguyên mã HC-... để xem, không cần tài khoản. Không gửi mã lên URL. Nội dung hiện bằng text, không render HTML từ bài nhập. Video nằm PRIVATE, link xem ký 60 giây; mở lại bằng mã khi hết hạn. Ai có mã có thể xem đơn đó nên giữ mã riêng. Không tạo trang liệt kê kết quả khách.

Xóa trên giao diện là xóa mềm: ngừng tra cứu/list và giữ khả năng phục hồi kỹ thuật; không tác động đơn trả tiền cũ. Link video đã cấp có thể còn hiệu lực tối đa 60 giây. Bản video cũ hoặc upload dở vẫn private, chưa có dọn file tự động; theo dõi quota Free và xử lý quản trị sau, không hứa dung lượng vô hạn. Việc phát MP4 phụ thuộc codec trình duyệt; kiểm magic ftyp không phải scanner/kiểm mọi codec.

## 5. Kiểm tra và rollback

Chạy npm run format:check, lint, typecheck, test, test:integration, build, test:e2e, check:secrets. Test mới dùng code/video giả và SQL local, không chứng minh cloud upload/Google/password thật. Kiểm tra anon/B không tạo/sửa/xóa hoặc liệt kê; owner password đăng nhập mới có thể CRUD; code sai/nháp/đã xóa không mở; video link hết hạn và không public; stale version 409; thử đổi video và text rồi lookup đúng đơn.

Rollback an toàn: MANUAL_DELIVERY_ENABLED=false và rebuild; giữ hai bảng, bucket và dữ liệu. Không DROP hoặc xóa Auth user khi rollback. Dữ liệu cũ/paid và guards không thay.


## Lỗi đổi mật khẩu do MFA cũ

Nếu Supabase yêu cầu AAL2, liên kết recovery đơn thuần không đủ. Xác minh bằng MFA hiện có hoặc chủ tài khoản xác nhận xử lý yếu tố MFA cũ cho đúng user trong Dashboard; không tắt RLS/MFA policy toàn cục. Sau khi giải quyết MFA, chính chủ tự nhập và lưu mật khẩu mới. Không gửi mật khẩu qua chat.
