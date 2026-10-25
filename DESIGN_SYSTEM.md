# Hệ thiết kế Huyền Cảnh

## Định hướng đã chọn
U04–06, U11–20, U106–107: thần thoại Việt, tiên nữ/pháp sư, sáng dịu, sao/tinh vân, đồ họa kết hợp, hoạt ảnh phong phú, âm thanh bật tay, chuyển trang phép thuật, desktop/mobile. Các token dưới đây là đề xuất A, không phải bảng màu do người dùng chọn.

## Token đề xuất
| Token | Giá trị | Công dụng |
|---|---|---|
| canvas | #FAF7F2 | Nền ngà |
| surface | #FFFFFF | Form và nội dung dài |
| mist | #EDE7F5 | Mây tím rất nhẹ |
| ink | #2D2440 | Chữ chính |
| muted | #62566D | Chữ phụ; phải đo contrast trên nền thực |
| primary | #68518B | CTA, link |
| primary-hover | #513A73 | Hover/focus |
| jade | #316B62 | Xác nhận/thành công |
| gold | #C49B59 | Trang trí, không dùng chữ nhỏ |
| danger | #A13249 | Lỗi kèm mô tả |

Font heading Noto Serif (Vietnamese subset, self-host giấy phép OFL); body Be Vietnam Pro. Fallback serif/sans hệ thống. Body 16px/1.65; heading clamp(2rem,5vw,4rem); văn bài tối đa 70ch. Không dùng phông thư pháp cho form hoặc bài dài. Spacing 4/8/12/16/24/32/48/64/96; radius 12/20/28; shadow mềm. Test tương phản 4.5:1 chữ thường, 3:1 chữ lớn và thành phần UI có ý nghĩa; chỉnh token nếu không đạt.

## Bố cục
Hero: thông điệp “Chạm vào miền tĩnh lặng, lắng nghe điều trong bạn”, minh họa tiên nữ cạnh hồ sen, hai CTA “Khám phá miễn phí” và “Xem dịch vụ”. Không ngụ ý trị liệu/chẩn đoán. Dưới hero: ô tìm, 12 thẻ nhóm, giới thiệu cách hoạt động, giá ba gói, video mẫu, câu hỏi thường gặp, footer pháp lý/liên hệ. Dùng họa tiết sen, mây, tre, trống đồng cách điệu thưa, tránh lẫn thẩm mỹ cung điện Trung Hoa như bản sao có sẵn.

Mobile 360px trở lên: 1–2 cột thẻ theo độ rộng, form một cột, CTA rộng và khoảng chạm ≥44px. Desktop ≥1024px: container 1200px, 3–4 cột; form và preview hai cột. Kiểm tra 360/390/768/1024/1440, landscape, zoom 200%, không cuộn ngang. Floating guide thu gọn được, không che CTA/lỗi.

## Thành phần
Button loading/disabled; input label thật, help/error liên kết aria; date/hour input nhập bàn phím được; tabs; dialog có focus trap/restore; toast không là nơi duy nhất chứa thông tin; card; skeleton; empty/error/offline states; accordion; confirm dialog cho phát hành/xóa/xác nhận tiền; upload progress và lỗi dung lượng. Admin dùng cùng màu nhưng giảm trang trí, ưu tiên đọc và thao tác chính xác.

## Chuyển động và âm thanh
Nền sao tối đa 40 hạt desktop/16 mobile (ngân sách đề xuất), opacity thấp, dừng khi tab ẩn. Dùng transform/opacity, tránh animation layout liên tục; không chớp ≥3 lần/giây. Micro 120–200ms, card 240–400ms, reveal 1–2 giây có “Bỏ qua”, chuyển trang ≤500ms và không trì hoãn navigation khi tắt hiệu ứng. Không bắt người dùng xem hết hoạt ảnh mới đọc kết quả.

`prefers-reduced-motion` và toggle “Giảm hiệu ứng” phải dừng particles/parallax/page morph/reveal dài; giữ trạng thái kết quả và chức năng. Khi có saved override, tôn trọng lựa chọn hiển thị rõ, cho reset về hệ thống. Âm thanh mặc định tắt, bật sau click, volume/mute dễ tìm, không autoplay qua route mới. Có phương án không âm thanh nếu chưa có nhạc được cấp phép.

## Riêng tư trong UI
Mã bí mật chỉ hiển thị khi tạo đơn, có xác nhận đã lưu và che/hiện; không đưa vào URL, analytics hoặc ảnh screenshot chia sẻ. Form tra cứu giải thích cần đủ ba trường, không dùng query string. Consent optional tách biệt theo mục đích/nền tảng, không tick sẵn, chữ dễ đọc. Mọi chỗ nhận ảnh nói rõ có cần hay không và thời hạn lưu. Không chụp ảnh mặt/chỉ tay cho ba công cụ mô phỏng miễn phí.

## QA hình ảnh
Chụp các viewport cho home, form, 12 nhóm/reveal/result, pricing/order/lookup, account, admin và empty/error. Kiểm tra bản đầy hiệu ứng và reduced motion. Điểm đề xuất: Lighthouse accessibility ≥95; không coi điểm tự động thay thế test bàn phím/screen reader. Giữ ảnh screenshot chỉ có dữ liệu giả.
