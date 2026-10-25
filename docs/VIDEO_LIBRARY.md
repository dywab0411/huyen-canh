# Thư viện video Huyền Cảnh

## Phạm vi và hiện trạng

CMS local có thêm/sửa/lưu nháp/công khai/ẩn/xóa bài; mỗi bài gồm MP4, tiêu đề, lời bói, ảnh bìa, danh mục và ngày đăng do server ghi nhận. Đã xây Functions và migration010, chưa apply/deploy cloud. Không seed video, đánh giá hoặc số liệu khách hàng vào website.

Trang `/thu-vien` đọc `/api/library`, chỉ nhận bài public còn đủ quyền. Khi trống, hiển thị phần giới thiệu và liên kết phim mẫu; không hiển thị thông báo thiếu nội dung hoặc đánh giá. Đánh giá chỉ hiển thị từ endpoint hiện hữu khi có bản đã được duyệt, không có đánh giá tự tạo.

## Dữ liệu và quyền

- `library_posts`: payload có phiên bản nội dung riêng `content_revision` và phiên bản mutation `version`. Sửa bất kỳ trường nội dung nào tăng cả hai và đưa về nháp; publish/hide/delete tăng version, không thay nội dung đã được xem.
- `library_assets`: tệp website tự biên tập trong bucket **private** `library-media`. MP4 tối đa20MB, 30–60giây; JPEG/PNG/WebP tối đa5MB. Server kiểm extension/MIME/size/magic; validator decode/re-encode và bỏ metadata trước release. Tệp đã release bất biến.
- Nội dung khách dùng attachments `public_derivative` đã release và phải thuộc cùng đơn. Từng video/ảnh bìa cần consent website còn hiệu lực, khớp hash/version, tuổi18+. Bài đăng còn cần preview và consent riêng của đúng content_revision. Quyền dùng ảnh để soạn riêng không phải quyền công khai.
- `library_previews` và `library_consents`: lưu lần xem có hạn15phút, quyền đồng ý append-only. Lookup cookie+CSRF+session phải thuộc đúng đơn. Người khác, phiên hết hạn/thu hồi, người chưa đủ18 và revision cũ không cấp được quyền mới.
- Editorial yêu cầu owner xác nhận có quyền và không có dữ liệu/câu chuyện riêng của khách. Không được dùng nhãn editorial để né consent. Cơ chế này là tuyên bố có ghi audit, không tự nhận diện nội dung ảnh bằng AI.
- Chỉ owner với MFA AAL2 được quản lý. Editor, anon và authenticated không được ghi trực tiếp hoặc gọi RPC thư viện. Public đọc qua Functions allowlist; không trả UUID đơn, thông tin khách, bucket/key riêng hoặc dữ liệu draft cho khách vãng lai.

## Quy trình quản lý

1. Sau khi cấu hình staging và apply migrations001–010, vào `/admin`, xác minh membership+MFA. Mở **Quản lý thư viện video** trong OwnerPanel và tải danh sách.
2. Bài website tự biên tập: tải MP4 và ảnh bìa từ mục tải tệp. Ghi lại UUID. Tệp vẫn quarantine, chưa dùng để public.
3. Trên máy vận hành tin cậy, đặt `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ACCESS_TOKEN` trong môi trường riêng (không lưu vào code/log/report). Chạy:

```powershell
python scripts/validate_attachment.py --library UUID_TEP
```

Validator xác minh Auth user, MFA AAL2 và owner còn hiệu lực, xử lý tệp tạm rồi gọi release_library_asset. Không có endpoint browser để bỏ qua validator. Lỗi kiểm định giữ tệp chưa phát hành. Chạy riêng cho video và cover; tải lại danh sách để chọn hai tệp đã release.

4. Điền tiêu đề, nội dung văn bản thuần, danh mục, xác nhận quyền rồi **Lưu bài thành nháp**. Xem lại trước **Công khai bài đăng**. Khi sửa phải lưu lại và rà soát quyền. Xung đột version yêu cầu tải lại, không tự replay.
5. Bài khách hàng: dùng UUID đơn, video/ảnh bìa public_derivative được tải bằng luồng đơn hiện hữu và kiểm định bằng `python scripts/validate_attachment.py UUID_ATTACHMENT` (không --library). Không dùng file source/private_result để public.
6. Khách vào tra cứu đã xác minh, mở ConsentPanel cấp quyền riêng từng tệp, rồi **Quyền công khai bài đăng thư viện**, xem đủ video/cover/title/body/category và chọn đồng ý đúng bản. Không tick sẵn. Owner chỉ publish khi tất cả quyền còn hợp lệ; không có override.
7. Khách thu hồi quyền bài hoặc tệp thì các lượt đọc feed mới không thấy bài. Owner có thể **Ẩn** để về nháp hoặc xác nhận **Xóa** để loại khỏi thư viện. Xóa là soft-delete, giữ audit và dữ liệu kỹ thuật cho quy trình retention; không tự xóa Storage.

## Các giới hạn cần nghiệm thu

- Signed URL60giây đã cấp có thể còn dùng đến khi hết hạn; không thu hồi được bản đã tải. UI có nút tải lại video để lấy URL mới sau khi đủ quyền còn hiệu lực.
- Feed hiện24 bài gần nhất; admin và danh sách bài của đơn tối đa100. Chưa có phân trang/tìm kiếm server; bộ lọc danh mục hoạt động trên dữ liệu đã tải.
- Orphan/pending asset và Storage của bài đã xóa cần vòng đời cleanup sau khi owner chốt retention (HC-RPT-002); chưa có tác vụ tự xóa toàn vòng đời. Free tier có quota; chưa kiểm chứng quota hiện hành.
- Chưa kiểm upload→validator→release→signedURL end-to-end trên Supabase, hoặc race nhiều Worker và auth/role revoke thật. Test mock/PGlite không thay nghiệm thu cloud. Không mở checkout hoặc deploy production trong phiên này.
- Không có quyền mặc định cho YouTube/TikTok từ consent bài website; các scope ngoài vẫn riêng như trước.
