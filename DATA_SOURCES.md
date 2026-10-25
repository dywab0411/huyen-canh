# Nguồn dữ liệu

- `src/content/corpus.ts`: nội dung tiếng Việt tự biên soạn cho dự án 25/10/2026. Không sao chép XemBoiOnline hoặc nguồn bài bói. 12 mở bài riêng + 3 phần hướng dẫn chung, không coi đây là dự đoán có cơ sở khoa học.
- `src/engine/index.ts`: SHA-256 canonical JSON + ID/version; điểm 0–100 là biểu tượng. Thần số học cộng chữ số ngày sinh, giữ 11/22/33 ở mỗi bước. Quy tắc được tự triển khai, không nhập thư viện bói.
- Không nhập bảng lịch âm/Can Chi/mệnh: chưa xác minh giấy phép/phạm vi, nên ghi mô phỏng và không có lá số chuẩn.
- Giấc mơ sử dụng fallback suy ngẫm tự viết, không tạo điềm báo hay gửi lên AI.
- Dataset `2026.10.25-v1` chỉ thay qua version mới; kết quả history giữ snapshot. Chức năng publish dataset trong admin chưa hoàn tất.
- Tài liệu tương thích đã tra: https://vite.dev/guide/ ; https://supabase.com/docs/reference/javascript/auth-signinwithoauth ; https://supabase.com/docs/guides/auth/social-sign-in/auth-google . Cấu hình OAuth chưa chạy thật.
- Quota provider trong ARCHITECTURE chưa được xác minh lại cho deployment; không coi các con số là SLA hoặc miễn phí vô hạn.
