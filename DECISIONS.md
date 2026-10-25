# Quyết định triển khai

- N mới nhất yêu cầu triển khai website thay phần câu chữ “chỉ soạn tài liệu” còn trong PRD/DOC01. Giữ các tài liệu gốc nguyên trạng; DOC01 chỉ nghiệm thu việc đọc/truy vết, không dùng để cấm nhiệm vụ mới.
- U/N và A01–A18 giữ nguyên. Stack React/Vite/TS strict + Pages Functions + Supabase; không dùng Sites hosting do yêu cầu Cloudflare/Supabase và chưa cho phép phát hành công khai.
- Triển khai ở workspace C rồi đồng bộ D do sandbox chỉ cấp quyền ghi C. Bộ tài liệu gốc D không ghi đè.
- Chưa xác minh bảng Can Chi/mệnh hợp lệ: F01/F02/F03/F10 mang nhãn mô phỏng. Không ngụ ý lịch chuẩn. F05 phép cộng ngày sinh công khai, giữ master 11/22/33; tên chuyển tự NFC/NFD, Đ→D phiên bản 1.
- Ngày hiện tại chỉ là tham số validation ngoài engine; không nằm trong seed. Dataset/engine version trong hash. Chưa tự nhận tên người dùng là họ tên thật vì không có cách xác minh tự động; form yêu cầu họ tên gồm ít nhất hai phần.
- Corpus có phần riêng cho 12 công cụ cùng ba phần hướng dẫn suy ngẫm chung. Không lặp đoạn trong một kết quả. Không bịa citation hoặc cá nhân hóa chuyên gia.
- Không giả lập đăng nhập, đơn đã trả tiền hoặc đánh giá khách. Backend thiếu cấu hình fail closed. UI ghi rõ bản local.
- PGlite chạy SQL Postgres thật local nhưng schema auth/storage trong test là fixture; không chứng minh remote OAuth/Storage, timing, concurrency nhiều isolate hoặc backup restore provider.
- Video là minh họa vector raster tự vẽ kiểu anime, không dùng AI/API trả phí, 36s 720p không watermark. Âm thanh hợp âm do script tự tổng hợp, bật tay.
