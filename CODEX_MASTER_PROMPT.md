# Prompt tổng giao Codex triển khai

Bạn là kỹ sư phụ trách xây dựng trọn bộ Huyền Cảnh trong D:\boi trên Windows. Đọc AGENTS.md, README_START_HERE.md và 5 đặc tả sản phẩm/thiết kế/kiến trúc/dữ liệu/kiểm thử trước khi viết code. Nguồn 110 đáp án nguyên văn nằm cuối PRODUCT_REQUIREMENTS.md; áp dụng yêu cầu mới nhất có đánh dấu N và phân biệt các quyết định A.

## Cách thực hiện
1. Kiểm tra thư mục, mã có sẵn và công cụ; không phá thay đổi người dùng. Tạo IMPLEMENTATION_STATUS.md và DECISIONS.md.
2. Làm prompts 01–10 tuần tự; tự chuyển bước khi gate đạt, không chờ duyệt giao diện. Mỗi bước đọc prompt, thực thi thật, chạy checks, cập nhật trạng thái rồi tiếp tục.
3. Nếu thiếu secret/tài khoản/ngân hàng, xây adapter demo có nhãn, hoàn thành phần local, ghi chính xác phần remote còn blocked. Không yêu cầu người dùng quyết định lại các chi tiết đã được chốt hoặc A đã có phương án mặc định.
4. Không tự đăng ký dịch vụ trả tiền, cắm thẻ, tự gửi tin hoặc đăng YouTube/TikTok. Chuẩn bị toàn bộ cấu hình và bản chạy review được trước các thao tác công khai cần chủ website cấu hình/cho phép.

## Những điều không được thay đổi
Tiếng Việt, Gen Z, thần thoại Việt, sáng dịu + hoạt ảnh phong phú + giảm hiệu ứng, nhạc bật tay. Đúng 12 nhóm đã chọn, deterministic local không API bói/AI trả phí, bài >500 từ. Không bổ sung Tarot/hoàng đạo/blog hoặc tính năng loại trừ. Google OAuth optional cho miễn phí, lịch sử có chủ quyền.

Giá 10.000/20.000/50.000 VNĐ kiểm tra server. Thanh toán chuyển khoản đối chiếu thủ công, không QR. Mã đơn + SĐT + mã bí mật entropy cao. Admin 2–3 người, RLS/role guard thật, private storage, không xuất dữ liệu/doanh thu dashboard. Zalo/email thao tác thủ công, không giả automation.

G50 gồm bài và video anime template 30–60s; phải bàn giao video mẫu xem được, nguồn template và quy trình dựng Windows. Dùng ảnh riêng khi đã consent; công khai website/YouTube/TikTok cần quyền riêng từng nền tảng và asset version; mặc định tắt. Không dùng video unlisted như bảo mật giao riêng. Không watermark.

## Chất lượng bàn giao
Mọi nút hoạt động hoặc bị khóa có lý do thật. Tests theo ACCEPTANCE_TESTS.md; chứng minh guest không đọc DB orders, khách A không đọc B, code+phone thiếu secret không mở được, hai admin không double-confirm, consent revoke ngăn publish. Có screenshots desktop/mobile/reduced motion và tệp video. Có DATA_SOURCES.md, ASSET_LICENSES.md, `.env.example`, migrations/RLS, HANDOVER.md, backup/restore/rollback hướng dẫn, checklist quota và cấu hình còn thiếu.

Không kết thúc bằng “bạn có muốn tôi tiếp tục?”. Tiếp tục đến hết công việc đã được giao. Kết thúc bằng phần đã thực hiện, kết quả test thật, file chạy/deliverable, phần bị chặn vì cấu hình ngoài và đúng bước chủ website cần làm. Không gọi một ứng dụng demo chưa cấu hình OAuth/DB là production hoàn tất.
