# Xác minh giao diện thực tế — 2026-10-25T16:43:58+07:00

## Tiến trình và nguyên nhân

- Trước sửa: PID10908, D:\node.exe, cwd D:\boi, Vite dev từ D:\boi\node_modules\vite. DOM thực tế vẫn ba gói 10k/20k/50k và SLA24/48/72h. Nguyên nhân: yêu cầu giá/form/ngân hàng/lookup trước đó nằm trong tài liệu tham khảo chưa được triển khai, không phải chỉ cache. Yêu cầu trực tiếp mới nhất đã cho phép thay đổi này.
- Sau sửa: PID **35444**, root **D:/boi**, cwd **D:\boi**, mode **vite-dev**, revision **2026-10-25-visible-v3**. Đối chiếu command line/executable/cwd ở [process-after.json](docs/visible-ui/20261025/process-after.json). Endpoint `/__hc/dev-info` chỉ có trong dev, không đóng gói vào production.
- PID cũ chỉ dừng sau xác minh dự án. Source hiện tại D:\boi; C:\Users\User\Downloads\boi và .visible-round-20261025 là bản chuẩn bị, không phục vụ5173. Không đổi ACL, không deploy, không sửa dữ liệu đơn hàng thật.

## Năm trang — Playwright Edge thật, không mock/intercept API

- [http://127.0.0.1:5173/](http://127.0.0.1:5173/): four prices 10000,20000,60000,70000; no G50/fixed SLA, benefits/community/differences; 9 FAQ; [screenshot](docs/screenshots/latest/home.png).
- [http://127.0.0.1:5173/dich-vu](http://127.0.0.1:5173/dich-vu): four prices 10000,20000,60000,70000; no G50/fixed SLA; [screenshot](docs/screenshots/latest/dich-vu.png).
- [http://127.0.0.1:5173/dat-don](http://127.0.0.1:5173/dat-don): required name/gender/phone/package; optional pair/photo; bank+two support tel links; original QR SHA256 bd182122efdb265662a96552eb7dca7d3c206a186acc7aabe26e25021cfb1c90; [screenshot](docs/screenshots/latest/dat-don.png).
- [http://127.0.0.1:5173/tra-cuu](http://127.0.0.1:5173/tra-cuu): one visible secret input; legacy lookup separately collapsed; [screenshot](docs/screenshots/latest/tra-cuu.png).
- [http://127.0.0.1:5173/thu-vien](http://127.0.0.1:5173/thu-vien): UI revision v3, thư viện giới thiệu khi chưa có bài, không dữ liệu khách giả; [screenshot](docs/screenshots/latest/thu-vien.png).

- Thời điểm DOM từng trang lưu [dom-after.json](docs/visible-ui/20261025/dom-after.json), đối chiếu [DOM trước sửa](docs/visible-ui/20261025/dom-before.json).
- Responsive: 390px: home,pricing,order no horizontal overflow. Có thêm ảnh mobile-home/mobile-dich-vu/mobile-dat-don trong docs/screenshots/latest.
- Browser pageerror: 0. Kiểm tra ảnh QR HTTP tải được và SHA256 trùng nguyên byte ảnh gốc chủ website cung cấp, không tạo lại QR.

## PASS có phạm vi

- Bốn gói đúng 10.000đ luận giải tích cực;20.000đ tích cực/khó khăn/lời khuyên;60.000đ video tích cực;70.000đ video tích cực/khó khăn/lời khuyên. Không gói G50 bán mới hoặc SLA24/48/72h trong trang dịch vụ/trang chủ.
- Trang chủ thêm lợi ích, cộng đồng dạng lời mời chia sẻ, điểm khác biệt và >=6FAQ; không số người dùng/lời chứng thực giả. Các route đang import OrderPage/LookupPage mới; không render Lookup cũ trong main.
- Form có tên/giới tính/điện thoại/gói bắt buộc; người thứ hai/ghi chú/ảnh tùy chọn, ảnh có consent riêng mặc định tắt. Thông tin ngân hàng và hai số hỗ trợ/tel đúng yêu cầu. Không tự mặc định người gửi ảnh đủ tuổi.
- Tra cứu mặc định một trường mã bí mật; đơn cũ có luồng xác thực riêng thu gọn và nâng cấp mã sau xác thực. Mã chuyển khoản công khai không thay mã bí mật.
- Thư viện hiện intro khi chưa có bài; CMS và quyền exact-revision giữ nguyên, có regression local. Không giả đã đăng video khách.
- Unit 34/34, integration 46/46 (PGlite fixture), E2E 36 đạt (có mock riêng trong ca quyền/order). Xác minh năm URL5173 ở trên KHÔNG mock.

## BLOCKED / NOT_TESTED

- Chưa apply migration011 lên Supabase thật, chưa nghiệm thu Auth/OAuth/MFA/RLS/Storage/Turnstile Siteverify/checkout/concurrency nhiều Worker trên cloud. Migration cũ001–010 không sửa, snapshot đơn cũ có regression giữ nguyên.
- Không thử giao dịch ngân hàng, không khẳng định đã nhận tiền; checkout vẫn fail-closed. Việc tải ảnh thật và cấp video riêng/public cần staging và quyền hợp lệ; không dùng fixture thay bằng chứng thật.
- Thư viện CRUD owner và video/cover sanitization có kiểm local, upload→release→public cùng revoke thật vẫn NOT_TESTED. Retention/cleanup/key rotation/pagination và native accessibility còn ở CODEX_TODO.

## Lệnh và exit code thực tế tại D:\boi

| Lệnh | Exit |
|---|---:|
| `npm run format:check` | 0 |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `npm test -- --reporter=default --reporter=json --outputFile=docs/visible-ui/20261025/unit.json` | 0 |
| `npm run test:integration -- --reporter=default --reporter=json --outputFile=docs/visible-ui/20261025/integration.json` | 0 |
| `npm run test:e2e` | 0 |
| `npm run check:secrets` | 0 |
| `npm run test:media` | 0 |
| `python tests/library_media_test.py` | 0 |
| `npm run test:worker` | 0 |

Logs đầy đủ trong docs/visible-ui/20261025; build warning kích thước bundle nếu có được giữ nguyên trong build.log, không tăng ngưỡng để che. Không deploy production.

## Rà soát literal cũ

[Toàn bộ kết quả tìm](docs/visible-ui/20261025/legacy-search.txt): G50 và delivery_hours còn trong migration lịch sử, fixture snapshot đơn cũ và gate xuất bản video cho đơn cũ. UI bán mới không render G50/SLA; đã kiểm DOM riêng. Không xóa lịch sử hoặc đổi giá chốt đơn cũ.
