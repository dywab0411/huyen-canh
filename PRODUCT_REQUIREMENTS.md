# Yêu cầu sản phẩm Huyền Cảnh

## 1. Nguồn và cách phân định
- **U01–U110**: đáp án nguyên văn được lưu cuối tài liệu. Đây là lựa chọn người dùng.
- **N**: yêu cầu mới nhất: tên Huyền Cảnh; tài liệu ở D:\boi; 12 nhóm deterministic; Cloudflare/Supabase; mã bí mật ngoài mã đơn + SĐT; consent riêng trước đăng YouTube/TikTok; chỉ soạn tài liệu ở bước bàn giao này.
- **Axx**: giả định thiết kế do bộ tài liệu bổ sung, có thể điều chỉnh và phải ghi DECISIONS.md; không mô tả chúng như đáp án người dùng.

## 2. Phạm vi và trải nghiệm
Thương hiệu thần thoại Việt, thần bí dịu dàng, tiếng Việt, Gen Z 16–25; không sử dụng hù dọa hoặc dự đoán bệnh tật/tai nạn/chết chóc. Nhân vật hướng dẫn tiên nữ/pháp sư tên tạm **Linh Sứ** (A01). Câu chuyện A02: giữa hồ sen và mây sớm, Huyền Cảnh là nơi người trẻ dừng lại, soi chiếu cảm xúc qua biểu tượng dân gian. Không mạo danh tín ngưỡng hoặc nhân vật tôn giáo có thật.

Trang: chủ `/`, danh mục `/kham-pha`, trang công cụ `/boi/:slug`, bảng giá `/dich-vu`, đặt đơn `/dat-don`, tra cứu `/tra-cuu`, hồ sơ/lịch sử `/tai-khoan`, thư viện `/thu-vien`, trang mẫu video, chính sách riêng tư/điều khoản/hoàn tiền/liên hệ, đăng nhập, admin. Tìm kiếm có dấu/không dấu. Miễn phí không cần đăng nhập; Google là cách đăng nhập duy nhất cho tài khoản. Không có mục yêu thích.

## 3. Mười hai nhóm bói được chọn
Mỗi nhóm có form riêng, kiểm tra dữ liệu, hoạt ảnh riêng có thể bỏ qua, điểm 0–100 chỉ mang tính giải trí, tối thiểu 501 từ tiếng Việt phân tách bởi khoảng trắng ở phần nội dung chính (không tính menu/form/disclaimer). Không lặp đoạn để đủ chữ. Cùng canonical input + engine version + dataset version phải cho cùng nội dung và điểm, không dùng ngày hiện tại hoặc random không seed.

| ID | Nhóm / slug | Đầu vào và logic đề xuất A03 | Hiệu ứng |
|---|---|---|---|
| F01 | Tử vi ngày sinh / ngay-sinh | Họ tên, ngày dương lịch; quy tắc Can Chi/năm có phạm vi lịch và kiểm thử ranh giới, hoặc ghi rõ mô phỏng nếu chưa có nguồn lịch hợp lệ | Vòng sáng ngày sinh |
| F02 | Tử vi giờ sinh / gio-sinh | Họ tên, ngày, giờ địa phương; chọn giờ không rõ nếu cần, không tự bịa giờ; múi giờ mặc định Asia/Ho_Chi_Minh hiển thị rõ | Đồng hồ 12 thời thần |
| F03 | Hợp tuổi / hop-tuoi | Tên/ngày sinh hai người; so quy tắc tuổi/mệnh có nguồn; đối xứng A+B = B+A | Hai dải lụa hội tụ |
| F04 | Tình duyên theo tên / tinh-duyen | Hai họ tên thật, không biệt danh; seed cặp đã sắp xếp; mô phỏng biểu tượng | Hoa sen nở |
| F05 | Thần số học / than-so-hoc | Họ tên và ngày; thuật toán số đường đời công khai, quy tắc master number được version hóa | Chuỗi số phát sáng |
| F06 | Chỉ tay mô phỏng / chi-tay | Câu hỏi đặc điểm tay do khách tự chọn; không bắt upload, không đọc sinh trắc học từ ảnh | Đường tay SVG |
| F07 | Nhân tướng mô phỏng / nhan-tuong | Mô tả tự chọn; không suy ra đạo đức, bệnh hoặc tương lai từ gương mặt | Nét vẽ biểu tượng |
| F08 | Tướng phu thê mô phỏng / phu-the | Đặc điểm tự mô tả của hai người; không nhận diện khuôn mặt | Hai bóng hình cách điệu |
| F09 | Giải mã giấc mơ / giac-mo | Văn bản giới hạn 2.000 ký tự; từ điển biểu tượng và fallback cho từ chưa có; escape đầu ra | Sương mở trang sách |
| F10 | Phong thủy tuổi/mệnh / phong-thuy | Ngày/năm sinh, bối cảnh góc học tập; bảng màu/mệnh có nguồn, không khuyến nghị mua vật phẩm | Ngũ sắc nhẹ |
| F11 | Công danh/tài lộc / cong-danh | Họ tên/ngày sinh, chủ đề; lời khuyên học tập và thói quen, không tư vấn đầu tư | Mây nâng ngọc |
| F12 | Tên/số may mắn / ten-may-man | Họ tên thật, ngày sinh; bảng chữ/số + hash version hóa | Hạt sáng thành số |

A03 là phương án triển khai, không phải khẳng định hệ thống tử vi chuẩn chuyên gia. Nguồn kết hợp: bảng quy tắc có giấy phép hợp lệ + nội dung tự biên soạn. Chưa có nguồn được xác minh thì chỉ dùng nội dung tự viết và nhãn mô phỏng; không bịa citation. Nghiêm cấm thêm hoàng đạo, Tarot, bài Tây, Kinh Dịch, kiếp trước, lịch ngày tốt, cúng online hoặc công cụ mới.

## 4. Hợp đồng engine
Normalize Unicode NFC; trim/collapse whitespace; chuẩn hóa case dùng trong khóa nhưng giữ tên đẹp khi hiển thị. Với tính tên, dùng bảng chuyển tự tiếng Việt version hóa, xử lý Đ/đ; không âm thầm đổi quy tắc. Ngày ISO thật, leap year, ngày tương lai bị từ chối. Hash SHA-256 từ canonical JSON (key order cố định) + tool ID + versions. Không dùng hash an toàn để tuyên bố bói có cơ sở khoa học.

Kết quả JSON có `toolId, canonicalInput, engineVersion, datasetVersion, score, sections, entertainmentNotice`. Template render tách khỏi engine. Dataset sửa qua admin: draft → validate → publish immutable version; kết quả lịch sử lưu snapshot/version, không bị đổi khi dataset mới phát hành. Với ảnh chia sẻ luôn hỏi phạm vi dữ liệu hiển thị, mặc định ẩn tên thật/ngày sinh/SĐT; không tạo public URL chứa kết quả riêng tư. Cả ảnh tải xuống và Web Share API/fallback sao chép thông điệp + link công cụ, không tự upload dữ liệu.

## 5. Gói dịch vụ
| Gói | Giá VNĐ | Sản phẩm bàn giao | Hạn đề xuất A04 sau xác nhận đã nhận tiền |
|---|---:|---|---|
| G10 | 10.000 | Bài tổng quan tích cực do người vận hành soạn | 24 giờ |
| G20 | 20.000 | Điểm thuận lợi, khó khăn, nhiều chủ đề và lời khuyên không gây sợ | 48 giờ |
| G50 | 50.000 | Bài bói và video anime template 30–60 giây do người vận hành làm | 72 giờ |

Khách không chọn nhân vật, không gồm lượt chỉnh sửa theo U70. Lỗi kỹ thuật/giao sai nội dung vẫn có kênh báo lỗi; không biến “không chỉnh sửa” thành từ chối khắc phục lỗi. Video không có watermark. Không hứa dịch vụ tự sinh phim cá nhân bằng AI miễn phí. Codex bàn giao ít nhất một video mẫu 30–60 giây dùng nhân vật/tài sản tự tạo hoặc có giấy phép, không ảnh người thật; template dựng có thể tái sử dụng trên Windows, xuất MP4 H.264 720p, phụ đề rõ, không cần giọng đọc trả phí (A05).

## 6. Đặt đơn và thanh toán
Guest được đặt đơn (A06); tài khoản Google là tùy chọn. Form lấy tên, SĐT Việt Nam, gói, dữ liệu chủ đề tối thiểu, kênh nhận; email chỉ bắt buộc nếu chọn nhận email. Hiển thị giá và thời gian trước xác nhận. Ngân hàng cấu hình server; thiếu ngân hàng thì khóa đơn thật. Không QR. Mã đơn public có prefix HC và 12 ký tự Crockford ngẫu nhiên CSPRNG, kiểm tra unique (A07); độc lập với UUID nội bộ. Tạo mã bí mật 128 bit CSPRNG, hiển thị đúng một lần, cho tải/chép thủ công; lưu hash phía server, không lưu plaintext.

Tạo đơn có idempotency key. Giá lấy từ bảng gói server, lưu snapshot. Nội dung chuyển khoản chỉ có mã đơn, không SĐT hoặc mã bí mật. Biên lai không bắt buộc, chỉ là bằng chứng phụ; nút “Tôi đã chuyển khoản” chỉ báo khách khai đã trả, không đánh dấu đã thanh toán. Admin đối chiếu tài khoản ngân hàng rồi bấm xác nhận; lưu người xác nhận, giờ, số tiền, mã tham chiếu được bảo vệ. Không kết nối tài khoản ngân hàng tự động.

A08: đơn chưa xác nhận tiền hết hạn sau 48 giờ; tiền đến muộn phải đối soát thủ công, không mất đơn/tiền hoặc tự đánh dấu paid. Hết hạn chỉ tác động unpaid, không xóa kết quả paid. A09: hoàn tiền chưa được người dùng quyết định; hiển thị cấu hình `refund_policy_pending`, checkout production bị khóa đến khi owner cung cấp chính sách. Không tự khẳng định “không hoàn tiền”.

U78 không theo dõi trạng thái: không có timeline/trang tiến độ khách, push hoặc polling. Tra cứu trả thông điệp tối thiểu “chưa có kết quả” hoặc kết quả đã phát hành khi đủ ba thông tin; admin vẫn cần trạng thái nội bộ để vận hành. Không tiết lộ một đơn có tồn tại qua thông báo sai.

## 7. Admin và giao kết quả
2–3 người gồm owner + 1–2 editor (A10). Editor lọc/tìm đơn, đối soát tiền, soạn từ mẫu, đính kèm, preview và phát hành; owner quản trị vai trò, cấu hình ngân hàng/gói, consent công khai, dataset publish, xóa/khôi phục theo quy trình. Thay đổi giá không ảnh hưởng đơn cũ. Không dashboard doanh thu, không export khách; audit phục vụ an toàn.

Giao kết quả qua website và thao tác Zalo/email thủ công; tạo nội dung để admin copy, không giả bot Zalo/email miễn phí vô hạn. Tin nhắn mặc định chỉ có mã đơn + đường dẫn tra cứu, không mã bí mật/PII/bài bói. Không gửi thực tế từ test. File “tất cả” ở U85 được hiểu là hỗ trợ các nhóm thông dụng an toàn: JPG/PNG/WebP, PDF, MP4, MP3, TXT; ZIP/HTML/SVG/script/executable/Office macro bị từ chối (A11). Video/ảnh riêng trong private storage; xem DATABASE_AND_SECURITY.md.

## 8. Consent, video công khai và đánh giá
Consent dịch vụ cần thiết tách khỏi checkbox tùy chọn dùng ảnh để làm video, đăng website, đăng YouTube, đăng TikTok. Mặc định tất cả tùy chọn tắt; mua gói không đồng nghĩa công khai. Lưu mục đích, nền tảng, asset/version cụ thể, nội dung thông báo/version, actor/time và thu hồi. Trước xuất bản phải duyệt bản cuối; đổi ảnh/video thì consent công khai cũ không tự áp dụng.

A12 bảo vệ nhóm 16–17: không dùng ảnh nhận diện hoặc công khai video cá nhân của người chưa đủ 18 trong bản đầu; vẫn có mẫu hư cấu và trải nghiệm miễn phí. Đây là giả định sản phẩm thận trọng, không phải kết luận pháp lý. Form chỉ hỏi nhóm tuổi cần thiết, không thu giấy tờ tùy thân. Khách 18+ có thể chọn từng quyền độc lập. Từ chối công khai không thay đổi giá/chất lượng giao riêng.

Thu hồi qua portal đã xác thực hoặc hỗ trợ có xác minh; gỡ thư viện và bản sao do website kiểm soát, đưa việc gỡ YouTube/TikTok vào hàng đợi thủ công, ghi biên nhận xử lý; giải thích không bảo đảm xóa bản sao đã được bên khác tải lại. Không nhúng video riêng ở chế độ public/unlisted như biện pháp bảo mật. Thư viện chỉ chứa mẫu hư cấu hoặc bản đã được consent hợp lệ. Không tự đăng nền tảng.

Đánh giá sao 1–5 + nhận xét sau giao; một đánh giá/đơn, sửa được, cần proof quyền nhận kết quả. Duyệt trước hiển thị, chống XSS/spam, không lộ tên thật, số điện thoại hoặc nội dung riêng. Chủ website không tự tạo đánh giá khách.

## 9. Những giả định còn lại và xử lý mâu thuẫn
- A13: U92 không blog được ưu tiên: không CMS/blog/tin tức. U93 chỉ dùng mẫu nội dung cho landing, công cụ và FAQ, không tự mở blog.
- A14: mục tiêu 3 tháng: 12/12 công cụ hoạt động, 0 lỗ hổng quyền truy cập nghiêm trọng còn mở, 95% đơn giao đúng hạn; mục tiêu thử nghiệm 30 đơn/tháng để đo sức vận hành, không cam kết doanh thu.
- A15: lưu đơn/kết quả paid 180 ngày sau giao, ảnh nguồn 30 ngày sau giao, unpaid 30 ngày sau hết hạn, audit 180 ngày, consent theo thời gian nội dung còn công khai và 180 ngày sau thu hồi; phải cho owner xác nhận trước live. Thực hiện xóa có log tối thiểu, backup luân chuyển có thời hạn. Không giữ PII vô hạn.
- A16: miễn phí không giới hạn lượt xem hợp lệ; throttle chống lạm dụng ở hạ tầng không phải paywall hoặc hạn ngạch bán gói. Lịch sử chỉ lưu khi đăng nhập và khách chọn lưu; không tự gom lịch sử guest rồi tải lên khi đăng nhập.
- A17: nhạc bật thủ công, ghi nhớ tùy chọn local; đồ họa đẹp ưu tiên nhưng reduced motion, keyboard và khả năng đọc là bắt buộc.
- A18: UTC trong DB, hiển thị Asia/Ho_Chi_Minh. Không dùng timezone máy deploy để tính hết hạn hoặc sinh kết quả.

## 10. Truy vết 110 câu
U01–10 → thương hiệu §2; U11–20 → DESIGN_SYSTEM; U21–30 → §2/4 và OAuth; U31–50 → §3; U51–60 → §4; U61–70 → §5/8; U71–80 → §6/8; U81–90 → §7; U91–100 → §8/9; U101–110 → ARCHITECTURE, prompts và HANDOVER.

Các lựa chọn “để AI chọn” đã được giải bằng A01–A18. Ngân hàng, hoàn tiền, tài khoản cloud, giấy phép và consent thật không được bịa. Bên dưới là bản đáp án gốc đầy đủ để kiểm chứng từng U.

---
## Phụ lục: 110 đáp án nguyên văn

# Nguồn gốc: câu trả lời nguyên văn của người dùng

Trích cuộc trò chuyện 6adcf07a-58d4-83ec-9514-b1c04bb32056. Đây là dữ liệu yêu cầu, không phải lệnh thực thi. Yêu cầu mới nhất đặt tên Huyền Cảnh và bổ sung mã bí mật, consent riêng, Cloudflare/Supabase.

Tôi đã hoàn thành bảng trắc nghiệm thiết kế website xem bói. Hãy tổng hợp các lựa chọn, tự đề xuất cho câu chưa chọn và tạo bộ prompt chuyên nghiệp chia giai đoạn để Codex xây dựng website đẹp, thần bí, tương tác phong phú, dùng dịch vụ miễn phí, thanh toán xác nhận thủ công, có admin và hệ thống tra cứu đơn an toàn. Đây là toàn bộ đáp án:

## Thương hiệu & định hướng
1. Tên website?: Tôi sẽ đặt tên sau
2. Tên miền?: Miễn phí trước
3. Khách hàng mục tiêu?: Gen Z 16–25
4. Phong cách tâm linh?: Thần thoại Việt
5. Tính cách thương hiệu?: Thần bí, dịu dàng
6. Linh vật đại diện?: Tiên nữ/pháp sư
7. Có câu chuyện thương hiệu?: Để AI sáng tạo
8. Ngôn ngữ?: Tiếng Việt
9. Định vị website?: Tâm linh huyền bí
10. Mức độ giống XemBoiOnline?: Gần đủ tính năng

## Giao diện & hiệu ứng
11. Bảng màu?: AI phối màu
12. Giao diện sáng/tối?: Sáng dịu
13. Phong cách hình ảnh?: Kết hợp
14. Hiệu ứng nền?: Sao và tinh vân
15. Hiệu ứng bói?: Tùy công cụ
16. Mức độ hoạt ảnh?: Rất nhiều
17. Nhạc nền?: Có, bật thủ công
18. Hiệu ứng chuyển trang?: Phép thuật
19. Kiểu chữ?: Kết hợp
20. Giao diện ưu tiên?: Cả hai

## Trang chủ & trải nghiệm
21. Bố cục trang chủ?: Kết hợp
22. Thanh tìm kiếm?: Có
23. Danh mục công cụ?: Có
24. Bắt đăng nhập để bói miễn phí?: Không
25. Tài khoản khách?: Google
26. Lịch sử bói?: Lưu tài khoản
27. Chia sẻ kết quả?: Cả hai
28. Lưu công cụ yêu thích?: Không
29. Nhân vật hướng dẫn?: Có
30. Trang hồ sơ cá nhân?: Có

## 20 công cụ bói miễn phí
31. Tử vi ngày sinh?: Có
32. Tử vi giờ sinh?: Có
33. Hợp tuổi hai người?: Có
34. Tình duyên theo tên?: Có
35. Thần số học?: Có
36. Cung hoàng đạo?: Không
37. Tarot rút bài?: Không
38. Bói bài Tây?: Không
39. Gieo quẻ Kinh Dịch?: Không
40. Xem chỉ tay?: Mô phỏng miễn phí
41. Nhân tướng học?: Mô phỏng
42. Tướng phu thê?: Mô phỏng
43. Bói kiếp trước?: Không
44. Giải mã giấc mơ?: Có
45. Lịch âm/ngày tốt?: Không
46. Phong thủy tuổi/mệnh?: Có
47. Công danh/tài lộc?: Có
48. Cúng online?: Không
49. Bói tên/số may mắn?: Có
50. Công cụ mới do AI đề xuất?: Không

## Logic bói miễn phí
51. Nguồn kết quả?: Kết hợp
52. Cùng dữ liệu cho kết quả?: Luôn giống nhau
53. Độ dài bài bói?: Trên 500 chữ
54. Giọng văn?: Cổ phong
55. Điểm tương hợp/may mắn?: Có
56. Tiết lộ kết quả bằng hoạt ảnh?: Có
57. Xuất ảnh kết quả?: Có
58. Giới hạn lượt miễn phí?: Không giới hạn
59. Cho nhập biệt danh?: Không
60. Ghi rõ nội dung giải trí?: Có

## Gói dịch vụ 10k – 50k
61. Gói 10k gồm?: Tổng quan tích cực
62. Gói 20k gồm?: Tốt và khó khăn, Phân tích nhiều chủ đề, Kèm lời khuyên
63. Gói 50k gồm?: Video + bài bói
64. Video dài?: 30–60 giây
65. Kiểu video?: Anime
66. Khách chọn nhân vật?: Không
67. Dùng ảnh khách?: Có, khi được phép
68. Đăng video lên mạng?: Để AI chọn
69. Thời gian giao?: Để AI chọn
70. Số lần chỉnh sửa?: Không

## Thanh toán & đơn hàng
71. Ngân hàng nhận tiền?: Tôi cung cấp sau
72. Tạo QR VietQR?: Không
73. Kiểu mã đơn?: AI chọn
74. Biên lai chuyển khoản?: Không bắt buộc
75. Xác nhận thanh toán?: Tôi bấm trong admin
76. Đơn chưa trả tiền hết hạn?: Để AI chọn
77. Tra cứu bằng?: Mã đơn + SĐT
78. Theo dõi trạng thái đơn?: Không
79. Hoàn tiền?: Chưa quyết định
80. Khách đánh giá dịch vụ?: Sao + nhận xét

## Trang quản trị
81. Thông báo đơn mới?: Zalo thủ công
82. Giao kết quả?: Tra cứu website, Zalo, Email
83. Trình soạn thảo?: Có mẫu sẵn
84. Lưu mẫu bài bói?: Có
85. Tệp đính kèm?: Tất cả
86. Tìm kiếm/lọc đơn?: Có
87. Thống kê doanh thu?: Không
88. Số quản trị viên?: 2–3 người
89. Sửa dữ liệu bói trong admin?: Có
90. Xuất dữ liệu?: Không

## SEO & quảng bá
91. Kênh ưu tiên?: YouTube, TikTok
92. Blog tâm linh?: Không
93. Đăng bài blog?: Từ mẫu có sẵn
94. Thư viện video công khai?: Có
95. Mã giảm giá?: Không
96. Giới thiệu bạn bè?: Không
97. Google Analytics/Search Console?: Để sau
98. Quảng cáo trên web?: Không
99. Watermark ảnh/video?: Không
100. Mục tiêu 3 tháng?: Để AI chọn

## Kỹ thuật & bàn giao Codex
101. Hosting?: AI tự chọn miễn phí
102. Có GitHub?: Có
103. Máy bạn dùng?: Windows
104. Codex triển khai?: Toàn bộ một lượt
105. Duyệt demo giao diện trước?: Không
106. Điện thoại yếu?: Ưu tiên đồ họa
107. Chế độ giảm hiệu ứng?: Có
108. Ứng dụng PWA?: Để sau
109. Thời gian xử lý đơn/ngày?: Trên 6 giờ
110. Bàn giao?: Toàn bộ
