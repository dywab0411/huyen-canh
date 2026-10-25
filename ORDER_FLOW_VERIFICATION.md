# Kiểm tra đặt đơn, DEMO và ngày/giờ sinh — 2026-10-25T17:38:24+07:00

## Nguyên nhân khóa nhận đơn thật

Backend local phản hồi HTTP, không phải trang bị lỗi hoặc backend hoàn toàn ngừng chạy. API đang trả checkout_enabled=false và mã nguyên nhân: **BACKEND_NOT_CONFIGURED, CHECKOUT_FLAG_OFF, CHALLENGE_NOT_CONFIGURED, SECURITY_NOT_CONFIGURED**. Bảng giá fallback defaults vì chưa có kết nối Supabase phục vụ catalog đã xác minh. Trong runtime hiện tại thiếu cấu hình backend/feature flag/challenge/security; xem readiness-presence.json chỉ ghi presence, không ghi giá trị khóa. Không suy diễn rằng database cloud đã được kiểm tra hoặc chính sách trong cloud đã duyệt: database hiện chưa được kết nối để kiểm chứng.

Config còn yêu cầu ngân hàng đúng, chính sách hoàn tiền/hỗ trợ, retention_approved, release_verified và schema_version12; migration012 khóa lại release. Không thay bất kỳ flag nhận tiền, secret hoặc ACL nào.

## Trình duyệt thật — không mock

- Thời điểm: 2026-10-25T10:37:50.424Z; source D:/boi, cwd D:\boi, PID35444, revision2026-10-25-order-v4.
- /dat-don?goi=G20: chọn đúng G20, ngày sinh bắt buộc, giờ sinh mặc định không rõ/disabled.
- /dat-don G60: thêm người thứ hai có ngày sinh bắt buộc; khung đúng hai câu nguyên văn owner, không checkbox bên trong. Chuyển G70 giữ khung; G10/G20 không khung. Checkbox quyền ảnh chỉ xuất hiện riêng nếu người dùng chọn ảnh và không bị xóa.
- Cả4gói qua /dat-don?demo=1&goi=G10/G20/G60/G70 → tạo mã DEMO → giả lập báo chuyển khoản → /tra-cuu?demo=1 → nhập mã → trả kết quả mẫu; G60/G70 mở metadata MP4 mẫu thành công. **Không tạo đơn thật, không xác nhận tiền thật, POST=0**.
- DEMO chỉ sessionStorage riêng của tab, TTL1h, tối đa20 mục; không lưu tên/ngày/giờ/điện thoại/ảnh, không có QR/ngân hàng nhận tiền và không gửi tới Supabase. Chỉ các trường gói/giá/mã ngẫu nhiên/hạn/trạng thái giả được giữ. Mã DEMO khác HCX và API thật không chấp nhận mã DEMO.
- Build preview8788 bỏ qua ?demo=1, hiện form thật đang khóa; bundle JS không có chuỗi giao diện/lưu trữ DEMO. Điều kiện DEV và hostname loopback, không feature flag cho phép demo production.
- Mobile390px không tràn ngang; pageerror=0; xem browser.json. Không ghi mã thật hoặc PII khách trong bằng chứng.

- [dat-don-g20.png](docs/screenshots/order-round/dat-don-g20.png)
- [dat-don-g60-birth-terms.png](docs/screenshots/order-round/dat-don-g60-birth-terms.png)
- [mobile-dat-don-g60.png](docs/screenshots/order-round/mobile-dat-don-g60.png)
- [demo-order-g70.png](docs/screenshots/order-round/demo-order-g70.png)
- [demo-result-g70.png](docs/screenshots/order-round/demo-result-g70.png)

## Kiểm thử cuối tại D:\boi

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/order-round/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/order-round/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |
| `npm run test:worker` | 0 |

Unit35/35; integration57/57 (PGlite12migrations và API mocks); E2E42 đạt; media4 và library-media2. Build warning bundle xem build.log, không che. Browser thực tế5173 là riêng, không dùng mock. Chi tiết log/manifest tại docs/order-round/20261025.

## Điều kiện mở nhận đơn thật

1. Cấu hình staging Supabase/Auth/OAuth, backend private service credential, pepper hiện hữu, PUBLIC_ORIGIN và Turnstile site/secret; không đặt secret vào VITE_*.
2. Backup và apply001–012 lên staging; đồng bộ Functions/frontend; kiểm version12, bốn quote server, snapshot cũ và ngày/giờ sinh mới, không backfill.
3. Chạy thực tế anon/A/B/editor/owner, owner MFA, thu hồi role, private storage; chứng minh DOB không lộ qua public lookup/list/consent và cross-order.
4. Chạy lookup HCX HMAC/limiter/Origin/CSRF/sessionTTL/rotation recovery, legacy upgrade, challenge token một lần, idempotency, conflict đa admin; giữ mọi gate.
5. Đối soát thủ công, tiền đúng số/đúng đơn; claim không thành paid, paid không tự publish; kiểm audit/version/video released/private/public consent exact revision.
6. Chốt hoàn tiền, retention/hỗ trợ; thử backup/restore, ảnh/video upload→validator→release→signedURL→revoke. Sau nghiệm thu mới owner duyệt release_verified và bật CHECKOUT_ENABLED. Không bật trong phiên này.

Cloud, giao dịch ngân hàng, SMS/Zalo/email gửi thật và public video trên nền tảng ngoài **NOT_TESTED/BLOCKED**. Không deploy production. Hai câu video chỉ hiển thị hợp đồng, không tạo consent hoặc cấp quyền admin tự công khai.
