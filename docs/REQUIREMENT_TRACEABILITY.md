# Truy vết U/N/A → feature → acceptance tests

Lựa chọn gốc giữ nguyên trong PRODUCT_REQUIREMENTS. Test ID là phạm vi truy vết, không tự mang nghĩa đã pass. Xem IMPLEMENTATION_STATUS cho trạng thái và giới hạn thật.

| Yêu cầu | Đáp án nguyên văn | Triển khai/phạm vi | Test ID |
|---|---|---|---|
| U01 | Tên website?: Tôi sẽ đặt tên sau | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U02 | Tên miền?: Miễn phí trước | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U03 | Khách hàng mục tiêu?: Gen Z 16–25 | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U04 | Phong cách tâm linh?: Thần thoại Việt | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U05 | Tính cách thương hiệu?: Thần bí, dịu dàng | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U06 | Linh vật đại diện?: Tiên nữ/pháp sư | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U07 | Có câu chuyện thương hiệu?: Để AI sáng tạo | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U08 | Ngôn ngữ?: Tiếng Việt | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U09 | Định vị website?: Tâm linh huyền bí | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U10 | Mức độ giống XemBoiOnline?: Gần đủ tính năng | Thương hiệu, Linh Sứ, tiếng Việt | UI01 |
| U11 | Bảng màu?: AI phối màu | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U12 | Giao diện sáng/tối?: Sáng dịu | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U13 | Phong cách hình ảnh?: Kết hợp | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U14 | Hiệu ứng nền?: Sao và tinh vân | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U15 | Hiệu ứng bói?: Tùy công cụ | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U16 | Mức độ hoạt ảnh?: Rất nhiều | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U17 | Nhạc nền?: Có, bật thủ công | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U18 | Hiệu ứng chuyển trang?: Phép thuật | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U19 | Kiểu chữ?: Kết hợp | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U20 | Giao diện ưu tiên?: Cả hai | Tokens, hoạt ảnh, reduced motion, nhạc bật tay | UI01–04 |
| U21 | Bố cục trang chủ?: Kết hợp | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U22 | Thanh tìm kiếm?: Có | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U23 | Danh mục công cụ?: Có | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U24 | Bắt đăng nhập để bói miễn phí?: Không | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U25 | Tài khoản khách?: Google | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U26 | Lịch sử bói?: Lưu tài khoản | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U27 | Chia sẻ kết quả?: Cả hai | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U28 | Lưu công cụ yêu thích?: Không | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U29 | Nhân vật hướng dẫn?: Có | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U30 | Trang hồ sơ cá nhân?: Có | Routes, tìm kiếm, tài khoản, history, share; không favorites | AUTH01/02,F08 |
| U31 | Tử vi ngày sinh?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U32 | Tử vi giờ sinh?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U33 | Hợp tuổi hai người?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U34 | Tình duyên theo tên?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U35 | Thần số học?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U36 | Cung hoàng đạo?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U37 | Tarot rút bài?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U38 | Bói bài Tây?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U39 | Gieo quẻ Kinh Dịch?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U40 | Xem chỉ tay?: Mô phỏng miễn phí | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U41 | Nhân tướng học?: Mô phỏng | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U42 | Tướng phu thê?: Mô phỏng | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U43 | Bói kiếp trước?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U44 | Giải mã giấc mơ?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U45 | Lịch âm/ngày tốt?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U46 | Phong thủy tuổi/mệnh?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U47 | Công danh/tài lộc?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U48 | Cúng online?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U49 | Bói tên/số may mắn?: Có | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U50 | Công cụ mới do AI đề xuất?: Không | Đúng 12 công cụ; nhóm bị loại không có route | F01–06 |
| U51 | Nguồn kết quả?: Kết hợp | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U52 | Cùng dữ liệu cho kết quả?: Luôn giống nhau | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U53 | Độ dài bài bói?: Trên 500 chữ | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U54 | Giọng văn?: Cổ phong | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U55 | Điểm tương hợp/may mắn?: Có | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U56 | Tiết lộ kết quả bằng hoạt ảnh?: Có | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U57 | Xuất ảnh kết quả?: Có | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U58 | Giới hạn lượt miễn phí?: Không giới hạn | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U59 | Cho nhập biệt danh?: Không | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U60 | Ghi rõ nội dung giải trí?: Có | Engine/version/NFC, bài ≥501 từ, PNG, giải trí | F01–08 |
| U61 | Gói 10k gồm?: Tổng quan tích cực | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U62 | Gói 20k gồm?: Tốt và khó khăn, Phân tích nhiều chủ đề, Kèm lời khuyên | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U63 | Gói 50k gồm?: Video + bài bói | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U64 | Video dài?: 30–60 giây | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U65 | Kiểu video?: Anime | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U66 | Khách chọn nhân vật?: Không | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U67 | Dùng ảnh khách?: Có, khi được phép | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U68 | Đăng video lên mạng?: Để AI chọn | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U69 | Thời gian giao?: Để AI chọn | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U70 | Số lần chỉnh sửa?: Không | Ba gói, video 36s, consent, hạn giao, không lượt sửa sở thích | VID01/02,CON01–04 |
| U71 | Ngân hàng nhận tiền?: Tôi cung cấp sau | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U72 | Tạo QR VietQR?: Không | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U73 | Kiểu mã đơn?: AI chọn | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U74 | Biên lai chuyển khoản?: Không bắt buộc | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U75 | Xác nhận thanh toán?: Tôi bấm trong admin | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U76 | Đơn chưa trả tiền hết hạn?: Để AI chọn | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U77 | Tra cứu bằng?: Mã đơn + SĐT | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U78 | Theo dõi trạng thái đơn?: Không | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U79 | Hoàn tiền?: Chưa quyết định | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U80 | Khách đánh giá dịch vụ?: Sao + nhận xét | Đơn/giá/secret/lookup/claim; checkout khóa khi thiếu cấu hình | ORD01–05,LOOK01–05,REV01 |
| U81 | Thông báo đơn mới?: Zalo thủ công | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U82 | Giao kết quả?: Tra cứu website, Zalo, Email | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U83 | Trình soạn thảo?: Có mẫu sẵn | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U84 | Lưu mẫu bài bói?: Có | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U85 | Tệp đính kèm?: Tất cả | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U86 | Tìm kiếm/lọc đơn?: Có | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U87 | Thống kê doanh thu?: Không | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U88 | Số quản trị viên?: 2–3 người | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U89 | Sửa dữ liệu bói trong admin?: Có | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U90 | Xuất dữ liệu?: Không | Owner/editor/MFA, draft/publish, quarantine, dataset; không export/doanh thu | ADM01/02,SEC01–06 |
| U91 | Kênh ưu tiên?: YouTube, TikTok | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U92 | Blog tâm linh?: Không | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U93 | Đăng bài blog?: Từ mẫu có sẵn | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U94 | Thư viện video công khai?: Có | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U95 | Mã giảm giá?: Không | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U96 | Giới thiệu bạn bè?: Không | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U97 | Google Analytics/Search Console?: Để sau | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U98 | Quảng cáo trên web?: Không | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U99 | Watermark ảnh/video?: Không | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U100 | Mục tiêu 3 tháng?: Để AI chọn | Library/consent/reviews; không blog/ads/coupon/referral | CON01–04,REV01 |
| U101 | Hosting?: AI tự chọn miễn phí | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U102 | Có GitHub?: Có | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U103 | Máy bạn dùng?: Windows | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U104 | Codex triển khai?: Toàn bộ một lượt | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U105 | Duyệt demo giao diện trước?: Không | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U106 | Điện thoại yếu?: Ưu tiên đồ họa | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U107 | Chế độ giảm hiệu ứng?: Có | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U108 | Ứng dụng PWA?: Để sau | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U109 | Thời gian xử lý đơn/ngày?: Trên 6 giờ | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |
| U110 | Bàn giao?: Toàn bộ | Cloudflare/Supabase, Windows, CI, tests/handover | OPS01–04 |

N: Huyền Cảnh, triển khai D:\boi; deterministic local 12 nhóm; Cloudflare/Supabase; mã bí mật 128 bit; consent từng nền tảng. N mới nhất triển khai website thay phạm vi chỉ-soạn-tài-liệu trong nguồn.

A01–A18 giữ theo PRD: Linh Sứ/câu chuyện, mô phỏng thuật toán, hạn giao 24/48/72h, template anime, guest order, HC+CSPRNG, expiry48h, refund pending, owner/editor, whitelist files, bảo vệ 16–17, không blog, mục tiêu vận hành, retention, lịch sử opt-in, reduced motion/nhạc, UTC/Asia_Ho_Chi_Minh.

Tính năng loại trừ: Tarot, hoàng đạo, bài Tây, Kinh Dịch, kiếp trước, lịch tốt, cúng online, bot Zalo, API AI/video trả phí, QR thanh toán, thanh toán tự động, analytics/ads/blog/PWA, coupon/referral/favorites, dashboard doanh thu, export khách. MFA dùng mã thiết lập TOTP của tài khoản, không phải QR thanh toán.
