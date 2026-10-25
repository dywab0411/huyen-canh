# Chưa cho phép nhận tiền — checklist phát hành

- [ ] Supabase staging, Google OAuth local/staging/prod thật, logout/cancel, owner UUID đối chiếu và TOTP AAL2.
- [ ] Anon/khách A/khách B/editor/owner thử direct REST, RPC, Storage; file của B không được ký URL cho A, không draft leak.
- [ ] Bank/beneficiary/account xác minh, refund/support/giờ làm việc/retention owner chốt và chính sách hiển thị đúng.
- [ ] Turnstile site key/secret, exact hostname/action, PUBLIC_ORIGIN, worker CF IP; limiter persistent nhiều isolate, fail-closed khi DB hỏng; load/timing lookup thực.
- [ ] Tạo đơn giá server, idempotency retry/response mất, secret một lần, claim≠paid, hai admin confirm đồng thời, late reconciliation thật.
- [ ] Cookie Secure/HttpOnly/SameSite=Strict 15 phút, CSRF, no-store/noindex/referrer; không secrets/PII trong URL/log/storage.
- [ ] Upload quota/MIME/magic/quarantine, validate/re-encode/EXIF, scanner PDF đã cài/cập nhật, G50 video private 30–60s, signed URL 60s và cross-tenant real tests.
- [ ] Consent từng scope/asset/version/18+, preview, revoke vs publish đồng thời, website gỡ và queue nền tảng ngoài hoạt động thật; không tự đăng.
- [ ] Review quyền delivered, một/đơn, pending moderation, không thông tin riêng/XSS.
- [ ] Full browser zoom200% và screen reader thật (hiện chỉ có automated axe/keyboard/reflow640px).
- [ ] Backup DB/Auth/Storage mã hóa + restore staging đầy đủ và tombstone replay, rollback diễn tập, RTO/RPO ghi rõ.
- [ ] Hoàn thiện/chốt quy trình xóa PII và Storage theo policy/financial obligations; hiện chỉ có candidate dry-run, technical TTL cleanup và xóa lịch sử tự chọn, không có cleanup toàn bộ customer lifecycle tự động.
- [ ] Cấu hình expiry/TTL scheduler và quota operations 70/85%, Supabase pause recovery, release CI thật.
- [ ] Xác minh lại quota/provider terms và nguồn quyền tài sản khi phát hành. Không hứa miễn phí vô hạn.
- [ ] Release_verified chỉ đặt sau bằng chứng thật; CHECKOUT_ENABLED vẫn false cho tới lúc đó.

Không tick thay các phần chưa chạy thật. Danh sách này là gate vận hành, không được dùng để che phần code/ops chưa hoàn thiện.
