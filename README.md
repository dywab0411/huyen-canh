# Cập nhật phát hành miễn phí — 25/10/2026

Mã local đã có. Hướng dẫn mới nhất là [DEPLOY_FREE_GUIDE.md](DEPLOY_FREE_GUIDE.md); xem CODEX_REPORT/CODEX_TODO/CODEX_HANDOFF trước tài liệu lịch sử bên dưới. Chỉ profile public-preview được chuẩn bị cho Internet: không Auth/đơn/ảnh khách, checkout vẫn khóa. Chưa có URL công khai được xác minh. Dùng `npm run build:public-preview` và `npm run check:deploy` cho bản này; `npm run dev` vẫn giữ local DEMO.

---

## Tài liệu lịch sử giữ nguyên

# Huyền Cảnh

Bản local React/Vite + Cloudflare Pages Functions + migrations Supabase. Chưa phát hành hoặc nhận tiền thật.

```powershell
Set-Location -LiteralPath 'D:\boi'
npm ci
npm run dev
```

Xem [HANDOVER.md](HANDOVER.md), [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), [truy vết U01–U110](docs/REQUIREMENT_TRACEABILITY.md), [video mẫu](public/assets/ho-sen-demo.mp4). Hướng dẫn gốc ở README_START_HERE.md vẫn giữ nguyên.

Các script: typecheck, lint, test, test:integration, test:e2e, build, check:secrets, worker:preview, test:worker, test:media, video. `test:worker` cần Worker preview chạy và chưa có credentials (kiểm fail-closed). Không dùng report local thay real staging OAuth/RLS/Storage/backup restore.
