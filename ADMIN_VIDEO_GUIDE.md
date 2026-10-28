# Quản trị đơn và thư viện video — 28/10/2026

Vào /tai-khoan, đăng nhập admin bằng mật khẩu do chính chủ đã đặt, rồi mở /admin. Không thêm mật khẩu hoặc khóa quản trị vào VITE_*, Build command hay Git.

## Đơn hàng riêng tư

Bấm Tạo mã đơn hàng tự động hoặc nhấn một mã trong danh sách. Phần chỉnh sửa mở ngay trong trang hiện tại: nhập nội dung, chọn MP4 tối đa20MB, chờ tiến độ tải100%, rồi bấm Lưu đơn hàng. Khách vào /tra-cuu, nhập mã HC-... để xem đúng bài và video. Không dùng mã này làm nội dung chuyển khoản. Đơn thủ công là bài/kết quả độc lập, không tự xác nhận đã thanh toán. Tải lại danh sách khi báo xung đột phiên bản; không bỏ version.

## Thư viện

Mục Quản lý thư viện video → Thêm video mới → chọn một hoặc nhiều MP4/WebM, mỗi tệp tối đa20MB → tiêu đề/mô tả → Ẩn hoặc Công khai → xác nhận quyền sử dụng nếu đăng công khai → Đăng video. Nếu chọn nhiều tệp, tiêu đề được thêm số thứ tự và dùng chung mô tả; nhấn từng video để sửa riêng về sau. Tiến độ dựa trên byte thực tế của từng tệp;100% tải tệp chưa thay thế bước xác minh/lưu. Nếu một tệp lỗi, những tệp đã đăng trước đó giữ nguyên; tải lại danh sách trước khi tiếp tục để tránh đăng trùng.

Nhấn tiêu đề trong danh sách để chỉnh sửa; có nút Ẩn và Xóa. Xóa mềm ngừng niêm yết, không xóa vĩnh viễn tệp Storage. Video công khai nằm trong bucket riêng showcase-videos (vẫn private), endpoint chỉ ký link xem cho bản đã công khai, xác minh tệp và có xác nhận quyền. Link đã cấp có thể còn dùng tối đa5phút sau ẩn/xóa; trang Thư viện sẽ không cấp link mới. Video đơn ở manual-results, link tối đa60giây, không được tự chuyển sang thư viện. Luồng đăng mới chỉ dành video tự biên tập/có quyền và không chứa dữ liệu khách; nội dung khách cần quy trình cho phép riêng của module consent cũ, không được dùng checkbox biên tập thay thế.

## Supabase

Migration015 chỉ chạy một lần sau001–014. Nếu project đã có showcase_videos, KHÔNG chạy lại. Kiểm tra RLS bật; anon/authenticated không có SELECT/INSERT/UPDATE/DELETE trực tiếp; không thêm Storage policy công khai cho hai bucket. Chỉ server service_role tạo upload token theo đúng đường dẫn; trình duyệt chỉ nhận quyền cho một tệp. Không đổi bucket sang public. Các tệp tải dở/đã xóa mềm vẫn chiếm quota Free, chưa tự dọn; cần theo dõi Storage. Chưa có quét mã độc hoặc chuyển mã codec; header hợp lệ không bảo đảm mọi codec phát được.

## Cấu hình

Giữ MANUAL_DELIVERY_ENABLED=true cho đơn thủ công + thư viện. CHECKOUT_ENABLED=false, PUBLIC_PREVIEW_ONLY=true vẫn khóa luồng nhận tiền cũ. Build Vite hiện dùng cấu hình Auth public hợp lệ; VITE_PUBLIC_PREVIEW_ONLY=true sẽ chặn các trang tài khoản/admin/đặt đơn ở build-time, không phải cách mở checkout. Sau sửa biến VITE phải rebuild.

Rollback UI/API: quay lại commit trước nâng cấp hoặc tạm manual=false nếu phải đóng cả module thủ công; giữ bảng và tệp, không DROP migration, không xóa dữ liệu cũ.
