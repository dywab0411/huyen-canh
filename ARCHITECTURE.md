# Kiến trúc và ngân sách miễn phí

## Stack đề xuất (giả định kỹ thuật)
React + Vite + TypeScript strict, React Router, CSS variables/Tailwind tùy chọn, thư viện chuyển động có giấy phép phù hợp, Zod; Vitest cho engine, Playwright cho E2E. Cloudflare Pages phục vụ bundle và `pages.dev`; Pages Functions làm API same-origin. Supabase Postgres/Auth/Storage cho dữ liệu, Google OAuth và tệp riêng tư. Không cần server Windows chạy 24/7, không cần API AI.

Google OAuth qua Supabase PKCE, URL allowlist chính xác cho local/staging/prod, không wildcard redirect tùy tiện. Sau login xác minh session qua server bằng Supabase Auth, không tin JWT decode đơn thuần. Logout xóa phiên, returnTo chỉ nhận đường dẫn nội bộ. Quyền admin từ bảng admin_members, không phải query/localStorage. Dùng SDK chính thức, pin version; Codex kiểm tra tài liệu tương thích lúc triển khai.

## Luồng dữ liệu
Trình duyệt → engine deterministic local + dataset public version hóa cho bói miễn phí.
Trình duyệt → Supabase với user JWT và RLS cho hồ sơ/lịch sử của chính mình.
Trình duyệt → Pages Functions → RPC/DB giao dịch cho đơn, lookup và admin đặc quyền.
Functions → Supabase private Storage cho signed URL sau kiểm tra quyền.
Không gửi kết quả khách, ảnh hoặc giấc mơ sang mô hình AI, font/CDN hoặc nền tảng công khai.

Public dataset không chứa thông tin cá nhân. Publish tạo JSON version immutable và manifest current; engine đã bắt đầu giữ version đang dùng. Lịch sử giữ snapshot; người dùng có thể xóa bản lưu. Truy cập public dataset được cache, còn đơn/lookup/admin dùng `Cache-Control: no-store` và không cache tại CDN/service worker.

## Sơ đồ thư mục đích
```text
src/app/                 routes, providers
src/components/          UI dùng chung
src/features/{readings,orders,account,admin,consent}/
src/engine/              pure functions, normalizers, registries
src/content/             schema, fixtures dữ liệu tự viết
functions/api/           Pages Functions cùng hợp đồng validation
supabase/migrations/     schema, RLS, RPC, storage policies
supabase/tests/          kiểm thử quyền
public/assets/           chỉ tài sản công khai có giấy phép
tests/{unit,integration,e2e}/
video-template/          nguồn template + quy trình dựng Windows
docs/                    vận hành, privacy, backups, cấu hình
```

## Hợp đồng API tối thiểu
| Endpoint | Quyền | Hành vi |
|---|---|---|
| POST /api/orders | Guest có chống spam | Tạo idempotent, giá server, trả mã đơn + mã bí mật một lần |
| POST /api/orders/lookup | Ba trường + rate limit | Tạo phiên lookup ngắn sau xác minh; trả chưa có kết quả/kết quả tối thiểu |
| POST /api/orders/claim-transfer | Phiên lookup hoặc ba trường | Ghi payment_claimed, không paid |
| POST /api/results/file-url | Phiên lookup đúng đơn hoặc chủ tài khoản | URL signed ngắn hạn |
| POST /api/consents/change | Khách có proof quyền | Grant/revoke riêng từng scope, lưu audit |
| POST /api/reviews | Quyền đơn đã delivered | Một review/đơn, pending moderation |
| /api/admin/* | Verified session + membership + MFA | Tìm/lọc, payment confirm, soạn/publish, file, dataset, consent; role guard mỗi action |

Mã lỗi thống nhất, request ID không chứa PII. JSON giới hạn kích thước, validate ở server; không nhận filter SQL trực tiếp. Không tạo GET lookup có SĐT/secret. Viết OpenAPI hoặc schema route dùng chung để test.

## Free tier: kiểm tra ngày 25/10/2026
Tóm tắt theo nguồn chính thức, có thể đổi; phải kiểm tra lại trước deploy, không suy ra SLA.
- Supabase Free: DB 500 MB, file storage 1 GB, egress 5 GB và cached egress 5 GB, 50.000 MAU; tối đa 2 project active; có thể pause sau một tuần không hoạt động. Không coi free có managed daily backup như Pro. Nguồn: https://supabase.com/pricing
- Cloudflare Pages Free: 500 builds/tháng, 1 concurrent build, timeout build 20 phút, 20.000 files/site, tối đa 25 MiB/tệp tĩnh. Functions dùng quota Workers. Nguồn: https://developers.cloudflare.com/pages/platform/limits/
- Workers/Functions quota CPU/request thay đổi theo gói và sản phẩm; kiểm tra trực tiếp trước phát hành, ghi giá trị áp dụng vào HANDOVER thay vì coi API vô hạn. Nguồn: https://developers.cloudflare.com/workers/platform/limits/

## Ngân sách nội bộ và khi gần hết quota (A)
Không dùng video riêng trong Pages assets. Mục tiêu mỗi MP4 30–60 giây ≤15 MB, 720p; giới hạn upload video 20 MB, ảnh 5 MB, PDF/audio 10 MB và tổng 30 MB/đơn. Đây là giới hạn ứng dụng, không phải quota provider. 30 video ×15 MB ≈450 MB lưu trữ, 30 video ×15 MB ×5 lần tải ≈2,25 GB egress; metadata/bản gốc/ảnh còn cộng thêm. Không hứa 1 GB lưu được vô hạn video hoặc lưu mãi.

Kiểm tra quota thủ công hàng tuần, cảnh báo vận hành ở 70%, hạn chế upload mới ở 85%, khóa nhận G50 nếu không còn ngân sách; vẫn cho tải kết quả đang còn trong thời hạn và hiển thị hỗ trợ. Không tự xóa kết quả còn cam kết để lấy chỗ. Có thể giảm bitrate hoặc archive offline theo chính sách đã công bố. Không tự nâng gói/cắm thẻ. Khi vượt free, báo rõ phương án chờ quota/giảm nội dung/xin chủ website quyết định; không giấu chi phí.

Thư viện public nhúng YouTube/TikTok chỉ sau consent hợp lệ hoặc video demo hư cấu; không dùng nhúng để giao video riêng. Không tự bật analytics. Video generation ngoài luồng request, dựng thủ công trên Windows bằng công cụ miễn phí có kiểm tra giấy phép, không Cloudflare CPU transcoding.

## Môi trường và secrets
`.env.example` chỉ placeholders. Public: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY. Server: SUPABASE_SERVICE_ROLE_KEY (chỉ route đặc quyền tối thiểu), LOOKUP_PEPPER version hóa, session signing secret, Turnstile secret nếu bật. Google client secret cấu hình Supabase, không đưa vào frontend. Tách demo/staging/prod, không dùng dữ liệu thật để test.

## Local, deploy và vận hành Windows
Codex tạo script npm cho dev/build/typecheck/lint/test/test:e2e và worker preview. Hướng dẫn Node LTS tương thích, Git, PowerShell; Supabase local có thể cần Docker Desktop, nếu máy thiếu thì dùng project staging riêng và giải thích không đụng production. Không tắt bảo mật máy hoặc đổi ExecutionPolicy toàn hệ thống.

GitHub CI chạy kiểm thử không có production secrets; migrations review và áp dụng trước release, không drop data. Lần deploy đầu dùng pages.dev, OAuth redirect HTTPS tương ứng. Backup DB và private files được mã hóa ra kho owner kiểm soát; manifest/checksum, hạn giữ 30 ngày đề xuất; diễn tập restore staging. Backup không phải tính năng export dữ liệu admin. Rollback bundle và migration tương thích, không mặc định rollback DB bằng xóa dữ liệu. Khi Supabase pause, thông báo tạm gián đoạn, không hiển thị mock paid hoặc mất đơn.
