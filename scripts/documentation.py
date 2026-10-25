from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
text=(root/'PRODUCT_REQUIREMENTS.md').read_text(encoding='utf8')
rows=re.findall(r'^(\d+)\. (.+)$',text,re.M)
groups=[(10,'Thương hiệu, Linh Sứ, tiếng Việt','UI01'),(20,'Tokens, hoạt ảnh, reduced motion, nhạc bật tay','UI01–04'),(30,'Routes, tìm kiếm, tài khoản, history, share; không favorites','AUTH01/02,F08'),(50,'Đúng 12 công cụ; nhóm bị loại không có route','F01–06'),(60,'Engine/version/NFC, bài ≥501 từ, PNG, giải trí','F01–08'),(70,'Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích','VID01/02,CON01–04'),(80,'Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình','ORD01–05,LOOK01–05,REV01'),(90,'Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu','ADM01/02,SEC01–06'),(100,'Library/consent/reviews; không blog/ads/coupon/referral','CON01–04,REV01'),(110,'Cloudflare/Supabase, Windows, CI, tests/handover','OPS01–04')]
lines=['# Truy vết U/N/A → feature → acceptance tests','','Lựa chọn gốc giữ nguyên trong PRODUCT_REQUIREMENTS. Test ID là phạm vi truy vết, không tự mang nghĩa đã pass. Xem IMPLEMENTATION_STATUS cho trạng thái và giới hạn thật.','','| Yêu cầu | Đáp án nguyên văn | Triển khai/phạm vi | Test ID |','|---|---|---|---|']
for n,answer in rows:
 feature,tests=next((feature,tests) for limit,feature,tests in groups if int(n)<=limit)
 lines.append(f'| U{int(n):02} | {answer.replace("|","/")} | {feature} | {tests} |')
assert len(rows)==110
lines+=['','N: Huyền Cảnh, triển khai D:\\boi; deterministic local 12 nhóm; Cloudflare/Supabase; mã bí mật 128 bit; consent từng nền tảng. N mới nhất triển khai website thay phạm vi chỉ-soạn-tài-liệu trong nguồn.','', 'A01–A18 giữ theo PRD: Linh Sứ/câu chuyện, mô phỏng thuật toán, hạn giao 24/48/72h, template anime, guest order, HC+CSPRNG, expiry48h, refund pending, owner/editor, whitelist files, bảo vệ 16–17, không blog, mục tiêu vận hành, retention, lịch sử opt-in, reduced motion/nhạc, UTC/Asia_Ho_Chi_Minh.','', 'Tính năng loại trừ: Tarot, hoàng đạo, bài Tây, Kinh Dịch, kiếp trước, lịch tốt, cúng online, bot Zalo, API AI/video trả phí, QR thanh toán, thanh toán tự động, analytics/ads/blog/PWA, coupon/referral/favorites, dashboard doanh thu, export khách. MFA dùng mã thiết lập TOTP của tài khoản, không phải QR thanh toán.']
(root/'docs/REQUIREMENT_TRACEABILITY.md').write_text('\n'.join(lines)+'\n',encoding='utf8')
