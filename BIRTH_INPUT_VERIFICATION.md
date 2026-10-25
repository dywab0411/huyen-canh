# Xác minh nhập ngày và giờ — 2026-10-25T17:47:56+07:00

Source D:\boi, PID35444, revision2026-10-25-birth-v5; browser5173 thật, không mock. Kiểm form thật và DEMO /dat-don?goi=G20&demo=1:

- Ngày hiển thị **29/02/2000**, gửi **2000-02-29**, không phụ thuộc locale trình duyệt.
- Giờ nhập ngay được **09:37**; ô dạng đồng hồ00:00,24h; không còn bị chọn Không rõ mặc định khóa ô.
- Người thứ hai ngày12/01/1999, giờ **00:00**; nửa đêm không bị coi lànull.
- Chọn Không rõ xóa giờ, vô hiệu hóa ô và gửinull; bỏ chọn mở ô trống, không tự thêm00:00.
- DEMO tạo bản ghi thành công; POST=0, pageerror=0; mobile390px không tràn ngang.

[Ảnh form thật](docs/screenshots/birth-round/real-date-time.png) · [Ảnh DEMO](docs/screenshots/birth-round/demo-date-time.png) · [Ảnh mobile](docs/screenshots/birth-round/mobile-date-time.png).

Unit37, integration58, E2E44 đạt tạiD. Kết quả/log/manifest/browser.json: docs/birth-round/20261025. Migration013 chỉ thay validation mới và marker13, không cập nhật snapshot cũ; cloud NOT_TESTED. Checkout vẫn giữ khóa, không deploy.
