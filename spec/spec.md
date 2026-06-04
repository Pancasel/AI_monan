# SPEC Sản Phẩm: AI Món Ăn

## 1. Bằng chứng (Vấn đề và Nguồn gốc)

**Nỗi đau của người dùng:** Người bị dị ứng thực phẩm, hoặc có chế độ ăn kiêng nghiêm ngặt (chay, không gluten, không đường,...) gặp rất nhiều rủi ro và khó khăn khi tìm nhà hàng để ăn ngoài. Các ứng dụng như ShopeeFood, GrabFood hay Google Maps chỉ hiển thị menu chứ không lọc món ăn theo hồ sơ cá nhân của họ, khiến họ phải liên tục hỏi người phục vụ hoặc tự đọc kỹ từng thành phần một cách mệt mỏi.

**Bằng chứng quan sát:** 
- *Trải nghiệm trực tiếp:* Nhóm tự đóng vai người bị dị ứng đậu phộng (lạc) và tôm, lên các app giao đồ ăn hoặc đi ăn ở quán lạ. Rất khó để biết trong một bát phở trộn hoặc gỏi cuốn có rắc lạc/tôm hay không, trừ khi gọi điện hỏi quán.
- *Nguồn bên ngoài:* Nhiều bình luận, đánh giá của khách du lịch nước ngoài trên các diễn đàn du lịch (như TripAdvisor, Reddit) chia sẻ rằng rào cản lớn nhất khi thưởng thức ẩm thực đường phố ở Việt Nam là sự mập mờ trong thành phần món ăn (ví dụ: nước mắm tôm cá, bột ngọt, các loại hạt bí mật trong nước chấm).

## 2. Lát cắt để build (Phạm vi Prototype)

**Một câu tóm tắt:** "Một người dùng bị dị ứng hải sản và đậu phộng tìm quán ăn tối; trợ lý AI tự động quét menu của các quán xung quanh, dán nhãn Xanh (an toàn) / Đỏ (nguy hiểm) / Vàng (cần hỏi thêm) cho từng món ăn, và giúp người dùng chốt quán có số món Xanh cao nhất."

## 3. AI Product Canvas

| Thành phần | Câu trả lời |
| :--- | :--- |
| **Value (Giá trị)** | **Sản phẩm dành cho ai:** Người có chế độ ăn kiêng/dị ứng.<br>**Đau ở đâu:** Mệt mỏi vì phải dò hỏi, lo sợ ăn nhầm món gây nguy hiểm.<br>**AI giải được gì:** Tự động đọc và phân loại hàng trăm món ăn trên menu cực nhanh dựa trên thông tin nguyên liệu mà không cần con người tra cứu thủ công. |
| **Trust (Niềm tin)** | Nếu AI trả lời sai (đánh dấu an toàn cho món có dị ứng), rủi ro sức khỏe là rất lớn. Do đó, hệ thống sử dụng **nhãn Vàng** (chưa chắc chắn) để buộc người dùng phải xác nhận lại với đầu bếp. Người dùng có quyền sửa và báo cáo lỗi nếu thấy thông tin AI gợi ý không chính xác. |
| **Feasibility (Khả thi)** | Khả thi vì LLMs rất giỏi phân tích văn bản (tên món ăn, mô tả) và suy luận thành phần ẩn dựa trên ngữ cảnh ẩm thực. Chi phí gọi API mỗi lần quét menu thấp. Dữ liệu menu có thể lấy dễ dàng từ các nền tảng delivery. |
| **Tín hiệu học** | Khi một món có nhãn Vàng được nhà hàng/người dùng xác nhận là Xanh (an toàn) hoặc Đỏ (nguy hiểm), hệ thống sẽ lưu lại. Những người dùng sau có cùng loại dị ứng sẽ hưởng lợi trực tiếp từ lần cập nhật này mà không cần hỏi lại. |

## 4. Tăng năng lực (Augment) hay Tự động hóa (Automate)

**Lựa chọn:** Tăng năng lực (Augment).

**Lý do:** Rủi ro về sức khỏe (dị ứng nghiêm trọng có thể dẫn đến sốc phản vệ) là **không thể chấp nhận được** nếu AI tự động 100% quyết định món ăn an toàn. AI ở đây chỉ đóng vai trò *gợi ý và thu hẹp phạm vi tìm kiếm* (loại bỏ các món chắc chắn Đỏ, đánh dấu các món có vẻ Xanh). 
Con người (người dùng và nhà hàng) vẫn giữ quyền quyết định cuối cùng khi đối mặt với những món không rõ ràng (nhãn Vàng). 

## 5. Bốn đường đi của trải nghiệm

| Đường đi | Câu hỏi & Ví dụ cách xử lý trong Prototype |
| :--- | :--- |
| **Đường thuận** | AI nhận diện rõ ràng món ăn an toàn (VD: Khai báo dị ứng hải sản -> Chọn món Gà luộc). Món hiện nhãn **Xanh**, người dùng yên tâm chọn ăn. |
| **Khi AI không chắc** | AI lưỡng lự (VD: Bún chả không ghi rõ có dùng nước mắm hải sản hay không). Món bị dán nhãn **Vàng**. Giao diện có nút "Hỏi nhà hàng" để người dùng thao tác yêu cầu xác nhận. |
| **Khi AI sai** | Người dùng phát hiện AI đánh dấu Xanh nhưng thực tế món đó rắc đậu phộng. Ứng dụng cho phép người dùng ấn nút "Hoàn tác/Báo lỗi" chuyển trực tiếp sang nhãn Đỏ. |
| **Khi người dùng sửa** | Người dùng hoặc nhà hàng xác nhận chuyển đổi món từ Vàng sang Đỏ/Xanh. Dữ liệu (tín hiệu học) được lưu vào *localStorage* để cập nhật bộ luật cho những lần đánh giá sau. |

## 6. Những kiểu lỗi đáng lo nhất

1. **False Positive (Báo an toàn nhưng có thành phần gây dị ứng):** 
   - *Khi nào xảy ra:* Tên món ăn hoặc mô tả không chứa từ khóa dị ứng, bản thân AI không có đủ context ẩm thực Việt Nam (VD: "Gỏi đu đủ" thường có tôm khô rắc lên).
   - *Hậu quả:* Người dùng ăn phải món dị ứng, ảnh hưởng nghiêm trọng sức khỏe.
   - *Cách prototype xử lý:* Áp dụng nguyên tắc "Thà giết lầm hơn bỏ sót" trong System Prompt. Ép AI nếu không nắm chắc 100% nguyên liệu thì bắt buộc phải dán nhãn Vàng. Hiển thị Disclaimer cảnh báo người dùng.

2. **Ảo giác AI trong Chatbot (Hallucination):**
   - *Khi nào xảy ra:* Khi người dùng hỏi chi tiết nguyên liệu, AI tự bịa ra một nguyên liệu không tồn tại trong món ăn của quán.
   - *Hậu quả:* Người dùng từ chối món oan uổng hoặc mất niềm tin vào hệ thống.
   - *Cách prototype xử lý:* Cung cấp context chặt chẽ vào Prompt, buộc AI chỉ trả lời dựa trên menu đã cho. Trả lời "Tôi không rõ" nếu thiếu thông tin.

## 7. Kế hoạch kiểm thử và Bằng chứng demo

- **Test case 1 (Đường thuận):** 
  - *Hành động:* Khai báo dị ứng "Hải sản". Xem menu quán phở gà. 
  - *Kỳ vọng:* Hầu hết các món gà dán nhãn Xanh.
- **Test case 2 (Đường không chắc chắn & Học tập):** 
  - *Hành động:* Khai báo dị ứng "Đậu phộng". Xem menu món "Nộm bò khô". 
  - *Kỳ vọng:* AI dán nhãn Vàng.
  - *Hành động tiếp:* Ấn "Xác nhận an toàn". 
  - *Kỳ vọng tiếp:* Món lập tức chuyển sang Xanh. F5 tải lại trang, món vẫn giữ nhãn Xanh (chứng minh lưu data).
- **Bằng chứng:** Sẽ chuẩn bị sẵn slide demo và log ghi lại kết quả phân loại của AI trong console.

## 8. Phân công (Mẫu)

- **[Tên thành viên 1]:** Trình bày AI Product Canvas, giải thích bài toán và tại sao chọn mức độ can thiệp "Tăng năng lực".
- **[Tên thành viên 2]:** Demo trực tiếp trên màn hình 2 Test Case, biểu diễn chức năng nhãn Vàng và sự thay đổi của nhãn.
- **[Tên thành viên 3]:** Phụ trách trả lời Q&A (phản biện) về luồng hoạt động của prompt, cách xử lý khi AI bị ảo giác, luồng logic dưới code.
