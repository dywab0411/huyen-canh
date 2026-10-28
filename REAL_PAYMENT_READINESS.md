# Kiểm tra sẵn sàng thử chuyển khoản thật — 28/10/2026

**Kết luận hiện tại: BLOCKED. Không bật checkout, chưa tạo đơn trả tiền thật, chưa chuyển/nhận/xác nhận tiền.** Nâng cấp video và đơn thủ công không đồng nghĩa nghiệm thu luồng thanh toán.

## Biến điều khiển

| Biến | Thời điểm | Tác dụng thực tế |
|---|---|---|
| VITE_PUBLIC_PREVIEW_ONLY | Build-time Vite, src/lib/deployment.ts; src/main.tsx | true thay các route đặt đơn, tài khoản/admin bằng trang thông báo và không tạo Supabase client. false/không đặt mới cho UI thực xuất hiện. Thay đổi phải rebuild; không đủ để bật API nhận đơn. |
| PUBLIC_PREVIEW_ONLY | Runtime middleware | true chặn API cũ; /api/config trả checkout_enabled=false. Chỉ ngoại lệ admin-login và manual delivery/showcase theo flag riêng. Không được tắt toàn bộ chỉ để thử thanh toán. |
| CHECKOUT_ENABLED | Runtime API config và handler orders | phải true mới cho tạo đơn trả tiền; còn kiểm backend, Turnstile, Origin, pepper, database/release config. false hiện giữ khóa. |
| MANUAL_DELIVERY_ENABLED | Runtime | chỉ đơn soạn thủ công và thư viện; không thay đổi trạng thái tiền, không mở paid API. |

wrangler.toml hiện: PUBLIC_PREVIEW_ONLY=true, CHECKOUT_ENABLED=false, MANUAL_DELIVERY_ENABLED=true. Production trước nâng cấp xác minh anon delivery401, paid orders403; cần hậu kiểm sau deployment mới. Admin production mở được chứng tỏ bản build đang chạy không bật VITE preview guard, nhưng không được suy từ đó rằng checkout bật. Dashboard quản lý runtime vars qua Wrangler; không chèn service_role vào build command hoặc VITE.

## Bằng chứng và phần chưa đạt

- Supabase trước015: paid orders0, manual deliveries3, active owner1. Sau015 giữ nguyên0/3. RLS showcase=true; anon và authenticated privileges=false; bucket private,20MB. Chỉ thêm bảng/kho thư viện, không đổi dữ liệu cũ. Các kiểm tra thực với vai trò anon/customer/editor cho toàn bộ paid API chưa hoàn tất trên cloud; test local không thay thế.
- site_config production: bank khớp cấu hình Sacombank; support có; refund_policy chưa có; retention_approved=false; release_verified=false. Không tự đặt giá trị approved/verified cho qua gate.
- Backend admin cũ trong functions/api/[[path]].ts yêu cầu role hợp lệ + MFA AAL2. Tài khoản tối giản hiện dùng password, MFA cũ đã gỡ theo yêu cầu; UI /admin hiện là module manual, không mount AdminWorkspace xác nhận tiền. Không bỏ kiểm tra AAL2 để làm test đạt. Cần một thiết kế/luồng xác nhận tiền có bảo vệ được nghiệm thu trước mở checkout.
- Backup/restore test hiện là PGlite dữ liệu giả, chưa phải diễn tập khôi phục Supabase production/Storage. Cần hoàn tất bằng staging riêng trước nhận tiền.
- Chưa có đơn paid production, nên chưa kiểm được liên kết create→claim→admin-confirm→publish→lookup thực, Turnstile thực và đối soát ngân hàng. Không tạo đơn bằng SQL hoặc bypass flag để giả PASS.

## QR gốc

Đã giải mã ảnh public/assets/sacombank-owner-qr.jpg bằng zxing-cpp (chỉ công cụ kiểm tra ngoàiGit). Payload có BIN970403, tài khoản040058981194; là QR tĩnh, không có tag54 số tiền. Nội dung ghi sẵn CHUYEN TIEN NHANH QUA QR, không phải mã đơn. Tên người nhận in trên ảnh/mã nguồn là NGUYỄN MINH CHÍNH; tên ngân hàng thực trả về phải do chủ tài khoản đối chiếu trong ứng dụng ngân hàng. Không thay QR người dùng hoặc tạo VietQR mới.

UI PaymentInfo hiển thị số tiền từ snapshot đơn và order_code riêng, hướng dẫn sửa đúng10.000đ và mã đơn trong ứng dụng, không dùng mã bảo mật. Chưa thể đánh dấu PASS QR tự điền tiền/nội dung vì QR tĩnh không làm việc đó. Chưa thử giao dịch thật. Không nhấn xác nhận đã nhận tiền khi chưa kiểm tiền thực vào ngân hàng.

## Trình tự tiếp tục

1. Hoàn thiện/kiểm chứng luồng admin xác nhận tiền có bảo vệ, thử bằng staging và dữ liệu giả, kiểm khách không thể tự đánh dấu paid, version/duplicate/lookup quyền đúng.
2. Chủ dự án chốt chính sách hủy/hoàn và lưu trữ theo yêu cầu của mình; không tự thay bằng chính sách mập mờ hoặc tự thêm điều khoản kinh doanh. Điền cấu hình bằng luồng quản trị an toàn sau khi chốt.
3. Diễn tập backup/restore staging và kiểm Turnstile/Origin/bank settings/đủ schema/RLS thật. Cần quyền tạo hoặc dùng staging miễn phí nếu chưa có; không phá production để diễn tập.
4. Chỉ khi tất cả đạt mới đề xuất thay đổi hẹp cho checkout và xin xác nhận ở giai đoạn3. Hiện CHƯA yêu cầu bật hoặc tắt PUBLIC_PREVIEW_ONLY.
5. Sau xác nhận mới tạo đúng một đơn10.000đ trên UI thật; người dùng tự quét/chỉnh số tiền/nội dung/chuyển tiền. Chủ tài khoản đối chiếu giao dịch rồi tự xác nhận tiền; trả bài và kiểm tra theo mã đơn. Báo riêng từng bước thực tế.

Không cần bạn đổi cấu hình Cloudflare/Supabase để bật tiền trong lượt nâng cấp thư viện. Migration015 chỉ áp dụng sau xác nhận riêng, không chạy lại001–014. Các điều kiện chưa kiểm chứng ở trên là chặn phát hành có thật, không phải lỗi nhập mật khẩu.
