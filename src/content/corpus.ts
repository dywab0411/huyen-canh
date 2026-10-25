import type { ToolId } from "../engine";
type Entry = {
  title: string;
  intro: string;
  strength: string;
  pause: string;
  practice: string;
  symbols: string[];
};
const strength = `Giữa nhiều điều đang gọi sự chú ý, khả năng nhận ra điều mình thực sự coi trọng là một điểm tựa đáng quý. Bạn không cần trở thành một người khác để bắt đầu một thay đổi nhỏ. Hãy nhớ lại một lần mình đã kiên nhẫn với việc khó, giữ lời hẹn hoặc dành thời gian lắng nghe ai đó. Những hành động cụ thể ấy nói về nguồn lực của bạn rõ hơn bất kỳ con số nào. Khi nhìn về tuần tới, thử chọn một giá trị muốn gìn giữ: sự tử tế, tính trung thực, tinh thần học hỏi hoặc quyền được nghỉ ngơi. Giá trị không phải đích đến phải hoàn thành ngay; nó giống hướng đi giúp bạn chọn việc tiếp theo. Nếu đang phân vân giữa nhiều lựa chọn, hãy viết ra lợi ích, giới hạn và điều kiện thực tế của từng phương án. Bạn có thể xin thêm thông tin, nhờ một người đáng tin góp ý và dành thời gian suy nghĩ trước khi quyết định. Không biểu tượng nào có quyền quyết định thay cuộc sống của bạn.`;
const pause = `Có những ngày lòng giống mặt hồ nhiều gió: một lời nói bình thường cũng khiến ta nghĩ mãi. Khi ấy, hãy thử phân biệt điều đã xảy ra với cách mình diễn giải nó. Một người trả lời chậm chưa đủ để kết luận họ không quan tâm; một lần làm chưa tốt cũng không biến bạn thành người kém cỏi. Viết hai cột trên giấy, một bên là sự việc quan sát được, bên kia là suy nghĩ và cảm xúc của mình. Bạn không cần phủ nhận cảm xúc để kiểm tra lại suy nghĩ. Trong mối quan hệ, một câu hỏi rõ ràng thường hữu ích hơn việc đoán ý. Trong học tập và công việc, một phản hồi cụ thể giúp ích hơn lời tự trách chung chung. Nếu cảm thấy quá tải, bạn được phép tạm dừng cuộc trò chuyện, giảm một đầu việc hoặc tìm sự hỗ trợ từ người phù hợp. Bài đọc này chỉ là một khoảng nghỉ mang tính giải trí, không đánh giá nhân cách và không thay thế sự hỗ trợ chuyên môn khi bạn cần.`;
const practice = `Hãy dành mười phút ở một nơi đủ yên và chọn một hành động nhỏ có thể thực hiện trong khả năng hiện tại. Đó có thể là sắp lại bàn học, gửi lời cảm ơn, đọc vài trang sách hoặc nói rõ một nhu cầu với người thân. Ghi hành động ấy thành một câu có thời điểm cụ thể, chẳng hạn sau bữa tối mình sẽ chuẩn bị đồ cho buổi học ngày mai. Sau vài ngày, nhìn lại điều đã giúp và điều gây trở ngại. Nếu kế hoạch chưa phù hợp, thay đổi kích thước công việc thay vì xem đó là thất bại. Bạn cũng có thể chia sẻ mục tiêu với người tin cậy, nhưng không cần công khai thông tin riêng để chứng minh sự quyết tâm. Kết quả tốt đẹp thường đến từ nhiều điều kiện, sự hỗ trợ và những lần điều chỉnh bình thường. Giữ cho mình quyền lựa chọn, kiểm chứng thông tin và bước chậm khi cần. Huyền Cảnh mong khoảng lặng này giúp bạn trở về với đời sống cụ thể, nơi một việc tử tế nhỏ hôm nay vẫn có ý nghĩa ngay cả khi ngày mai chưa rõ.`;
const entries: Record<ToolId, [string, string, string[]]> = {
  "ngay-sinh": [
    "Vòng sáng của một khởi đầu",
    `Ngày sinh là một dấu mốc trong câu chuyện riêng, chứ không phải bản án về tính cách hoặc vận mệnh. Trong trải nghiệm mô phỏng này, vòng sáng tượng trưng cho khả năng bắt đầu lại ở bất kỳ độ tuổi nào. Hãy thử nhớ một điều mình từng thích khi nhỏ và xem điều ấy còn xuất hiện trong đời sống hôm nay ra sao. Có thể đó là sự tò mò khi tháo lắp một món đồ, niềm vui khi kể chuyện hoặc cảm giác dễ chịu bên cây cỏ. Không có cách sống nào tự động tốt hơn vì một ngày tháng. Chúng tôi chưa dùng bảng lịch Can Chi đã được kiểm chứng, nên không đưa ra kết luận về mệnh hay hạn. Hình ảnh ở đây chỉ mở một câu hỏi: bạn muốn dành thêm chỗ cho điều gì trong nhịp sống hiện tại?`,
    ["Vầng trăng", "Mầm sen", "Giọt sương"],
  ],
  "gio-sinh": [
    "Lắng nghe nhịp của mình",
    `Giờ sinh trong câu chuyện này gợi một chiếc đồng hồ mềm mại, nơi mỗi khoảng thời gian mang một sắc thái để suy ngẫm. Đây là mô phỏng biểu tượng, không phải lá số thời thần chuẩn. Múi giờ được hiển thị là Asia/Ho_Chi_Minh; nếu bạn chọn không rõ giờ, hệ thống giữ nguyên sự chưa biết ấy. Bạn không cần đoán giờ sinh để được xem kết quả. Hãy quan sát lúc nào trong ngày mình dễ tập trung, lúc nào cần nghỉ và điều gì thường làm nhịp sinh hoạt xáo trộn. Một nhịp sống phù hợp phụ thuộc vào lịch học, công việc, người cùng nhà và sức khỏe thực tế. Biểu tượng thời gian chỉ mời bạn thử điều chỉnh nhẹ một thói quen, không đòi tuân theo một khung giờ được cho là may mắn.`,
    ["Bình minh", "Đèn khuya", "Mây trưa"],
  ],
  "hop-tuoi": [
    "Hai dải lụa cùng bay",
    `Hai người gặp nhau mang theo hai cách lớn lên, hai nhịp giao tiếp và nhiều trải nghiệm khác nhau. Bài hợp tuổi này là mô phỏng, chưa sử dụng quy tắc tuổi mệnh có nguồn lịch được xác minh. Điểm số không đo tình yêu và không quyết định hai người có nên ở bên nhau. Điều đáng quan sát là cách đôi bên lắng nghe, tôn trọng giới hạn, giải quyết bất đồng và chia sẻ trách nhiệm. Cùng một cặp dữ liệu dù đổi thứ tự vẫn tạo cùng kết quả, bởi không ai giữ vị trí quan trọng hơn trong trải nghiệm này. Nếu muốn dùng bài đọc như một trò chuyện nhỏ, mỗi người có thể nêu một việc mình thấy được quan tâm và một việc muốn trao đổi rõ hơn. Sự đồng thuận phải đến từ người thật, không từ một con số.`,
    ["Dải lụa", "Cầu tre", "Hai cánh chim"],
  ],
  "tinh-duyen": [
    "Một đóa sen chung",
    `Tên gọi gắn với nhiều kỷ niệm: giọng ai đó gọi mình, nét chữ trên một tấm thiệp, hay lần đầu giới thiệu bản thân. Trải nghiệm này kết hợp hai họ tên thành một biểu tượng nhất quán, không dùng tên để suy ra tính cách hoặc mức độ chung thủy. Điểm tình duyên chỉ là điểm giải trí. Không nên dùng nó để thử lòng, ép một người trả lời hoặc phán xét mối quan hệ. Thử hỏi nhau về cách thích nhận sự quan tâm: lời nói, thời gian cùng làm việc, sự giúp đỡ hay khoảng riêng được tôn trọng. Câu trả lời có thể thay đổi theo hoàn cảnh và cần được hỏi lại. Một đóa sen chung không đòi hai người giống hệt nhau; nó gợi chỗ cho khác biệt được nói ra một cách an toàn.`,
    ["Sen hồng", "Nút lụa", "Cánh bướm"],
  ],
  "than-so-hoc": [
    "Con số như một lời nhắc",
    `Số đường đời ở đây được tính bằng tổng các chữ số ngày sinh dương lịch, rút gọn cho tới một chữ số, ngoại trừ các số 11, 22 và 33 được giữ lại theo quy tắc phiên bản một. Quy tắc được công khai để bạn tự kiểm tra phép tính. Phép cộng là xác định, nhưng ý nghĩa biểu tượng không phải bằng chứng khoa học về con người. Một con số có thể trở thành lời nhắc vui để chọn việc nhỏ, chẳng hạn ghi nhận điều đã học hoặc dành ít phút sắp xếp mục tiêu. Nó không cho biết nghề nghiệp bắt buộc, tuổi kết hôn hay khả năng làm giàu. Nếu gặp lời khẳng định tuyệt đối từ bất kỳ nguồn nào, bạn có quyền hỏi về bằng chứng và quyết định không làm theo.`,
    ["Hạt ngọc", "Vòng số", "Bậc thềm"],
  ],
  "chi-tay": [
    "Những việc đôi tay đã làm",
    `Bạn đang xem chỉ tay mô phỏng qua đặc điểm tự chọn. Hệ thống không nhận ảnh bàn tay, không phân tích sinh trắc học và không đọc đường sinh mệnh. Hình nét tay chỉ là một minh họa cho những việc bạn làm mỗi ngày: viết, nấu ăn, chăm cây hoặc giúp một người khác. Nếu muốn suy ngẫm, hãy nhớ lần đôi tay mình kiên trì học một kỹ năng mới. Ban đầu có thể vụng về, rồi nhờ luyện tập mà từng bước trở nên quen thuộc. Sự phát triển ấy đến từ thực hành, điều kiện sống và hỗ trợ chứ không nằm sẵn trong một đường nét. Bạn có thể chọn một kỹ năng muốn chăm chút tuần này, với mức độ vừa sức và không so sánh tiến độ của mình với người khác.`,
    ["Nét mực", "Lá tre", "Bàn tay mở"],
  ],
  "nhan-tuong": [
    "Gương soi không phán xét",
    `Nhân tướng trong Huyền Cảnh là một hoạt động mô phỏng bằng mô tả tự chọn, không phải phân tích gương mặt. Không có ảnh được thu thập ở công cụ này. Chúng tôi không suy ra đạo đức, sức khỏe, trí tuệ hoặc tương lai từ ngoại hình. Hãy xem tấm gương tưởng tượng như một lời mời nhận ra cách mình xuất hiện trong cuộc trò chuyện: có đang vội, có đang muốn được lắng nghe hay cần thêm khoảng riêng. Những trạng thái ấy có thể thay đổi và không định nghĩa toàn bộ con người bạn. Khi gặp ai mới, việc dành thời gian tìm hiểu hành động và lời nói của họ đáng tin hơn một nhận xét về đường nét. Với bản thân cũng vậy, bạn xứng đáng được đối xử tử tế mà không phải đạt một chuẩn ngoại hình.`,
    ["Gương nước", "Nét cọ", "Áng mây"],
  ],
  "phu-the": [
    "Hai nhịp cùng bước",
    `Tướng phu thê mô phỏng không nhận diện khuôn mặt và không đo độ giống nhau của hai người. Hai đặc điểm tự mô tả chỉ tạo một hình ảnh để bắt đầu cuộc trò chuyện về sự đồng hành. Người hợp với bạn không nhất thiết có vẻ ngoài tương tự hay đáp ứng một khuôn mẫu do người khác đặt ra. Những điều cần được chú ý hơn là sự an toàn, tôn trọng và khả năng thương lượng nhu cầu khác biệt. Đổi thứ tự hai mô tả không làm đổi điểm chung của cặp. Nếu đang độc thân, bạn vẫn có thể xem đây là dịp viết ra giới hạn và điều mình mong đợi ở một quan hệ tương lai. Không cần tìm một người ngay để hoàn thành câu chuyện; nhịp sống riêng của bạn cũng có giá trị đầy đủ.`,
    ["Hai bóng hình", "Đôi mái chèo", "Vòm lá"],
  ],
  "giac-mo": [
    "Mở một trang sương mỏng",
    `Giấc mơ có thể pha trộn ký ức, cảm xúc và những mảnh đời sống khó gọi tên. Công cụ này dùng một khung suy ngẫm an toàn cho cả hình ảnh quen lẫn biểu tượng chưa có trong từ điển; không khẳng định giấc mơ báo trước tương lai. Nội dung bạn nhập được giữ dưới dạng chữ và không gửi cho mô hình AI. Hãy thử kể lại cảm xúc nổi bật thay vì tìm ngay một điềm lành hay dữ. Bạn thấy tò mò, nhẹ nhõm, bối rối hay lo lắng? Có điều gì trong sinh hoạt gần đây gợi cảm giác tương tự? Bạn được phép bỏ qua chi tiết không muốn nhớ. Nếu giấc mơ gây khó chịu kéo dài, tìm người đáng tin hoặc hỗ trợ phù hợp có thể hữu ích hơn tiếp tục đoán ý nghĩa.`,
    ["Trang sách", "Làn sương", "Cánh cửa"],
  ],
  "phong-thuy": [
    "Góc nhỏ để thở",
    `Phong thủy tuổi mệnh ở đây được ghi rõ là mô phỏng vì chưa có bảng mệnh với nguồn lịch được kiểm chứng. Những gợi ý tập trung vào góc học tập thực tế, không yêu cầu mua vật phẩm hoặc đặt đồ theo một hướng được hứa sẽ đổi vận. Hãy nhìn ánh sáng, lối đi, độ gọn và chỗ cất vật thường dùng. Một chiếc bàn dễ sử dụng có thể giúp bạn bớt mất thời gian tìm đồ; điều đó không bảo đảm thành tích nhưng tạo điều kiện thuận tiện. Màu sắc nên dựa trên sở thích và khả năng đọc, không phải nỗi lo kỵ mệnh. Nếu ở không gian chung, hãy trao đổi trước khi thay đổi và giữ an toàn điện, cửa thoát cùng nhu cầu của người ở cùng.`,
    ["Góc tre", "Ánh cửa sổ", "Bình gốm"],
  ],
  "cong-danh": [
    "Gieo mầm ngày mai",
    `Công danh và tài lộc trong bài đọc là biểu tượng cho quá trình học tập, làm việc và quản lý nguồn lực thường ngày. Đây không phải lời khuyên đầu tư, dự báo thu nhập hoặc bảo đảm thăng tiến. Một mục tiêu có thể bắt đầu bằng câu hỏi cụ thể: kỹ năng nào đang thiếu, ai có thể góp ý, lịch tuần này còn bao nhiêu thời gian thực sự. Khi cân nhắc một cơ hội, hãy kiểm tra thông tin về trách nhiệm, thù lao và điều kiện tham gia. Tránh quyết định vì sợ bỏ lỡ một thời điểm may mắn mà bài đọc tưởng tượng gợi ra. Bạn có thể tiến chậm, đổi hướng hoặc xin hỗ trợ. Thành tựu có nhiều hình thức, kể cả giữ được một nhịp sống bền vững trong giai đoạn khó.`,
    ["Mầm xanh", "Ngọc sáng", "Bậc đá"],
  ],
  "ten-may-man": [
    "Một tín hiệu nho nhỏ",
    `Tên và số may mắn là trò chơi biểu tượng từ dữ liệu đã chuẩn hóa, không phải công thức đổi vận. Bảng chuyển tự phiên bản một bỏ dấu tiếng Việt và chuyển Đ thành D khi cần tính tên; họ tên hiển thị vẫn được giữ đúng dấu trong biểu mẫu. Một tín hiệu vui có thể nhắc bạn uống nước, chuẩn bị bài hoặc ghi lại điều biết ơn. Không nên dùng điểm hoặc số ở đây cho cờ bạc, đầu tư hay quyết định liên quan an toàn. Bạn cũng không cần đổi tên thật, mua vật phẩm hoặc trả tiền để tránh một con số. Nếu thích, hãy tự đặt ý nghĩa nhẹ nhàng cho biểu tượng nhận được. Ý nghĩa ấy có thể thay đổi theo trải nghiệm của bạn, không phải quy tắc bắt mọi người cùng tuân theo.`,
    ["Hạt sáng", "Chòm sao", "Nét chữ"],
  ],
};
export const corpus = Object.fromEntries(
  Object.entries(entries).map(([id, [title, intro, symbols]]) => [
    id,
    { title, intro, strength, pause, practice, symbols },
  ]),
) as Record<ToolId, Entry>;
