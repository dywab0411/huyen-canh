# Nguồn dữ liệu

- `src/content/corpus.ts`: nội dung tiếng Việt tự biên soạn cho dự án 25/10/2026. Không sao chép XemBoiOnline hoặc nguồn bài bói. 12 mở bài riêng + 3 phần hướng dẫn chung, không coi đây là dự đoán có cơ sở khoa học.
- `src/engine/index.ts`: SHA-256 canonical JSON + ID/version; điểm 0–100 là biểu tượng. Thần số học cộng chữ số ngày sinh, giữ 11/22/33 ở mỗi bước. Quy tắc được tự triển khai, không nhập thư viện bói.
- Không nhập bảng lịch âm/Can Chi/mệnh: chưa xác minh giấy phép/phạm vi, nên ghi mô phỏng và không có lá số chuẩn.
- Giấc mơ sử dụng fallback suy ngẫm tự viết, không tạo điềm báo hay gửi lên AI.
- Dataset `2026.10.25-v1` chỉ thay qua version mới; kết quả history giữ snapshot. Chức năng publish dataset trong admin chưa hoàn tất.
- Tài liệu tương thích đã tra: https://vite.dev/guide/ ; https://supabase.com/docs/reference/javascript/auth-signinwithoauth ; https://supabase.com/docs/guides/auth/social-sign-in/auth-google . Cấu hình OAuth chưa chạy thật.
- Quota provider trong ARCHITECTURE chưa được xác minh lại cho deployment; không coi các con số là SLA hoặc miễn phí vô hạn.


## Dataset 2026.10.25-v2 / engine 1.1.0
`src/content/reflections.ts`: 48 câu hỏi biên soạn gốc cho 12 nhóm; các câu hỏi mới được phát hành theo CC BY 4.0, ghi công dự án Huyền Cảnh (2026), cho phép sử dụng/sửa/phân phối với ghi công và nêu thay đổi. Không sao chép nguồn bên ngoài, không tuyên bố là dữ liệu tử vi truyền thống đã kiểm chứng. Lựa chọn 4 nhánh theo hash chuẩn hóa; đoạn thực hành thay đổi có nội dung, không chỉ đổi điểm. Corpus v1 và snapshot cũ giữ nguyên. Đây vẫn là phạm vi biên tập nhỏ, chưa thay thế một kho tri thức truyền thống có thẩm định.


## Kiểm tra quota cho phát hành — 25/10/2026
Đã đối chiếu lại nguồn chính thức CloudflarePageslimits/Workerslimits và Supabasepricing, OAuth/redirect/StorageRLS khi viết DEPLOY_FREE_GUIDE. Bảng trong hướng dẫn mới thay ghi chú quota chưa xác minh của lịch sử; không phải SLA hoặc bằng chứng đã deploy. Không thay dataset/corpus hoặc độ chính xác luận giải.
