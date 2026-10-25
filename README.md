# Huyền Cảnh

Bản local React/Vite + Cloudflare Pages Functions + migrations Supabase. Chưa phát hành hoặc nhận tiền thật.

```powershell
Set-Location -LiteralPath 'D:\boi'
npm ci
npm run dev
```

Xem [HANDOVER.md](HANDOVER.md), [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), [truy vết U01–U110](docs/REQUIREMENT_TRACEABILITY.md), [video mẫu](public/assets/ho-sen-demo.mp4). Hướng dẫn gốc ở README_START_HERE.md vẫn giữ nguyên.

Các script: typecheck, lint, test, test:integration, test:e2e, build, check:secrets, worker:preview, test:worker, test:media, video. `test:worker` cần Worker preview chạy và chưa có credentials (kiểm fail-closed). Không dùng report local thay real staging OAuth/RLS/Storage/backup restore.
