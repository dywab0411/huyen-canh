# Quyết định triển khai

- N mới nhất yêu cầu triển khai website thay phần câu chữ “chỉ soạn tài liệu” còn trong PRD/DOC01. Giữ các tài liệu gốc nguyên trạng; DOC01 chỉ nghiệm thu việc đọc/truy vết, không dùng để cấm nhiệm vụ mới.
- U/N và A01–A18 giữ nguyên. Stack React/Vite/TS strict + Pages Functions + Supabase; không dùng Sites hosting do yêu cầu Cloudflare/Supabase và chưa cho phép phát hành công khai.
- Triển khai ở workspace C rồi đồng bộ D do sandbox chỉ cấp quyền ghi C. Bộ tài liệu gốc D không ghi đè.
- Chưa xác minh bảng Can Chi/mệnh hợp lệ: F01/F02/F03/F10 mang nhãn mô phỏng. Không ngụ ý lịch chuẩn. F05 phép cộng ngày sinh công khai, giữ master 11/22/33; tên chuyển tự NFC/NFD, Đ→D phiên bản 1.
- Ngày hiện tại chỉ là tham số validation ngoài engine; không nằm trong seed. Dataset/engine version trong hash. Chưa tự nhận tên người dùng là họ tên thật vì không có cách xác minh tự động; form yêu cầu họ tên gồm ít nhất hai phần.
- Corpus có phần riêng cho 12 công cụ cùng ba phần hướng dẫn suy ngẫm chung. Không lặp đoạn trong một kết quả. Không bịa citation hoặc cá nhân hóa chuyên gia.
- Không giả lập đăng nhập, đơn đã trả tiền hoặc đánh giá khách. Backend thiếu cấu hình fail closed. UI ghi rõ bản local.
- PGlite chạy SQL Postgres thật local nhưng schema auth/storage trong test là fixture; không chứng minh remote OAuth/Storage, timing, concurrency nhiều isolate hoặc backup restore provider.
- Video là minh họa vector raster tự vẽ kiểu anime, không dùng AI/API trả phí, 36s 720p không watermark. Âm thanh hợp âm do script tự tổng hợp, bật tay.


## 2026-10-25 — Vòng nội dung và thư viện video
Yêu cầu trực tiếp mới nhất gồm rà soát copy và CMS video; tài liệu dán kèm về đổi giá/QR/form/tra cứu là tài liệu tham khảo, không được coi là lệnh thực thi. Không áp dụng giá60k70k, thông tin ngân hàng/QR, hỗ trợ hoặc tra cứu một ô từ tài liệu đó. Giữ default10k20k50k, snapshot, 3 yếu tố lookup, manual confirmation và các guard hiện hành. CMS video được chủ dự án yêu cầu rõ, không mở rộng thành blog. Library customer posts yêu cầu quyền từng asset và riêng bản nội dung; editorial cần owner xác nhận không có dữ liệu khách. Xóa bài là soft-delete có audit, không tự chạy cleanup Storage khi retention chưa được chốt. Không deploy production.

## 2026-10-25: yêu cầu giao diện mới nhất
Chủ website yêu cầu bốn gói 10.000/20.000/60.000/70.000đ và bỏ SLA cố định, thay quy định ba gói trước đây cho đơn mới. Migration 011 chỉ thay danh mục bán, không sửa snapshot đơn cũ. QR gốc Sacombank do chủ website cung cấp được phép hiển thị; không dùng API tạo QR và không tự xác nhận tiền. Mã tra cứu HCX có 256 bit entropy, server lưu HMAC, không đặt URL. Đơn cũ vẫn cần xác thực đủ thông tin trước khi đổi mã. Tuổi không khai báo lưu unknown, không tự suy đoán đủ 18 tuổi.

## 2026-10-25 — DEMO và ngày/giờ sinh
DEMO chỉ Vite dev trên loopback, sessionStorage riêng không API/ảnh/ngân hàng thật, TTL1h và mã DEMO khác HCX. Không lưu tên/ngày sinh/giờ sinh trong DEMO. Đơn thật cần ngày sinh hợp lệ, giờ HH nullable, migration012 không backfill. Chi tiết sinh chỉ endpoint admin được auth+MFA hiện hữu, không list/public lookup. Hai câu video nguyên văn owner chỉ là nội dung hợp đồng; không tạo consent và không đổi gate public exact-revision.

## 2026-10-25 — nhập ngày/tháng/năm và giờ/phút
UI dùng DD/MM/YYYY tường minh độc lập locale, chuyển sang ISOYYYY-MM-DD cho API. Giờ nhập HH:mm24h, mặc định mở để có thể gõ ngay; rỗng hoặc Không rõ lưu null, không mặc định 00:00. Migration013 chỉ đổi validator cho lần gửi mới; đơn cũ HH giữ nguyên, admin hiển thị chưa có phút, không suy đoán.

## 2026-10-25 — phát hành public-preview miễn phí
Yêu cầu mới cho phép bản xem thử Internet thay quy định chưa deploy của các phiên trước. Cloudflare Pages+Functions same-origin, Supabase Free cho staging. Public build tắt Auth và form dữ liệu khách; middleware server chặn mọi POST/private API trước truy vấnDB, kể cả vô tình cấu hình credentials. _routes chỉ /api/* để static assets không chạyFunctions. QR nhận tiền không đưa vào artifact preview. Repo chuẩn bị local trên nhánhmain, không tự dựng danh tính Git, chưa tạo remote/private URL nếu chưa đăng nhập. Không đặt secrets trongGit hoặc VITE_ và không mởcheckout bằng thayprofile.


## 2026-10-28 — tài khoản chỉ dành admin
Yêu cầu mới của owner thay Google UI bằng alias admin/mật khẩu. Giữ Supabase Auth, RLS, membership, MFA và dữ liệu cũ; không backend auth tự chế, không mật khẩu trong bundle. Alias server chỉ chọn một owner active; nếu cấu hình mơ hồ thì fail closed. Chưa tắt provider Google cloud trước nghiệm thu password để tránh mất tài khoản. Chủ tài khoản tự nhập mật khẩu bằng form authenticated, không agent cài credential.


## 2026-10-28 — phạm vi tối giản được chủ website chốt
Chỉ UI đăng nhập admin, soạn chữ/video và mã tra cứu. Dùng Supabase Auth + owner membership kiểm backend; riêng workflow thủ công mới yêu cầu session password, không yêu cầu TOTP trên UI này. API paid/legacy giữ nguyên MFA; thanh toán luôn khóa. Hai bảng/bucket private mới tách khỏi đơn cũ để bảo toàn dữ liệu/snapshot. Tra cứu dùng capability 256 bit qua POST, link video60s; xóa mềm/version guard/idempotency. Mở cloud phụ thuộc migration014 được duyệt, đổi mật khẩu đã chia sẻ và QA quyền thực tế, featureflag mặc định false. Khách không có đăng ký/hồ sơ trên giao diện. /tra-cuu-cu giữ quyền truy cập đơn cũ, không đưa lên điều hướng chính. Chỉ DEV giữ demo cũ.
