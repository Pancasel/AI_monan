# Hướng dẫn Hiểu Dự Án AI Món Ăn (Dành cho Non-Tech)

> Tài liệu này giúp bạn hiểu dự án theo cách đơn giản nhất, không cần biết lập trình. Đồng thời chuẩn bị sẵn các câu hỏi có thể bị hỏi trong phần phản biện (Q&A) và cách trả lời chúng.

---

## Dự án này là gì?

**AI Món Ăn** là một ứng dụng web giúp người bị **dị ứng thực phẩm** tìm quán ăn an toàn ở Hà Nội.

Hãy tưởng tượng bạn bị dị ứng đậu phộng (lạc). Bạn muốn đi ăn tối nhưng không biết quán nào an toàn. Bạn mở **AI Món Ăn** lên, nó sẽ tự động "đọc" menu của 30 quán ăn quanh bạn và **tô màu** từng món:

- 🟢 **Xanh** = "Món này an toàn, cứ gọi thoải mái"
- 🔴 **Đỏ** = "Cẩn thận! Món này có lạc, không nên ăn"
- 🟡 **Vàng** = "Chưa chắc chắn, nên hỏi lại đầu bếp"

Vậy là thay vì phải đọc từng món rồi tự đoán, bạn chỉ cần **nhìn màu** là biết ngay.

---

## App hoạt động như thế nào? (Giải thích bằng ví dụ)

### Bước 1: Khai báo "Tôi bị dị ứng gì"

Lần đầu mở app, bạn sẽ được hỏi: *"Bạn bị dị ứng gì?"*

Bạn tick vào các ô, ví dụ: ✅ Đậu phộng, ✅ Hải sản. App ghi nhớ thông tin này.

### Bước 2: Chat với Trợ lý AI

Bạn hỏi: *"Tối nay ăn gì ở Hoàn Kiếm?"*

AI sẽ trả lời kiểu: *"Với hồ sơ dị ứng của bạn (đậu phộng, hải sản), đây là các quán phù hợp nhất:*
1. *Phở Thìn – 85% món an toàn*
2. *Bún Chả Hương Liên – 78% món an toàn*
3. *..."*

AI **không bịa ra quán**. Nó chỉ gợi ý từ danh sách 30 quán có sẵn trong hệ thống.

### Bước 3: Xem Menu đã tô màu

Bạn bấm vào tên quán. Menu hiện ra, mỗi món đã có sẵn nhãn màu:

| Món ăn | Nhãn | Ý nghĩa |
|--------|------|---------|
| Phở bò tái | 🟢 Xanh | An toàn cho bạn |
| Gỏi cuốn tôm | 🔴 Đỏ | Có hải sản – TRÁNH |
| Nộm bò khô | 🟡 Vàng | Có thể có lạc rắc lên – HỎI QUÁN |

### Bước 4: Xử lý món Vàng

Khi gặp món Vàng, bạn bấm nút **"Hỏi nhà hàng"**. Trong app, hệ thống mô phỏng việc nhà hàng trả lời. Sau khi được xác nhận, món sẽ chuyển thành Xanh hoặc Đỏ.

**Điều đặc biệt:** Kết quả này được **lưu lại**. Người dùng sau có cùng dị ứng sẽ thấy món đó đã đổi màu sẵn, không cần hỏi lại nữa. Đây chính là cách app **học và thông minh hơn** theo thời gian.

---

## Tại sao AI chỉ "gợi ý" chứ không tự quyết định hộ?

Đây là câu hỏi quan trọng nhất của dự án.

**Trả lời ngắn:** Vì nếu AI sai, người dùng có thể **nhập viện** (sốc phản vệ). Rủi ro quá lớn để giao toàn quyền cho máy.

**Trả lời dài hơn:**
- AI ở đây đóng vai "**trợ lý sàng lọc**" – nó giúp bạn loại bỏ nhanh những món chắc chắn nguy hiểm (Đỏ) và đánh dấu những món chắc chắn an toàn (Xanh).
- Nhưng với những món **không rõ ràng** (Vàng), AI thừa nhận nó không biết chắc và **nhường quyền quyết định cho con người** (bạn + đầu bếp).
- Trong ngành AI, cách tiếp cận này gọi là **Augment** (tăng năng lực cho người dùng), trái ngược với **Automate** (tự động hóa hoàn toàn).

---

## "Bộ não" của AI hoạt động ra sao? (Giải thích đơn giản)

App có **2 bộ não** phối hợp với nhau:

### Bộ não 1: "Bộ lọc nhanh" (chạy ngay trên điện thoại bạn)

Khi bạn mở menu một quán, app sẽ:
1. Lấy tên món + danh sách nguyên liệu (VD: "Gỏi cuốn – tôm, bún, rau, nước mắm")
2. So khớp với danh sách dị ứng của bạn (VD: bạn dị ứng "tôm")
3. Thấy trùng → dán nhãn Đỏ. Không trùng → dán nhãn Xanh. Mơ hồ → dán nhãn Vàng.

Quá trình này xảy ra **tức thì**, không cần internet. Giống như một bảng tra cứu siêu nhanh.

### Bộ não 2: "Trợ lý chat thông minh" (chạy trên máy chủ)

Khi bạn chat hỏi AI, câu hỏi của bạn được gửi lên một máy chủ. Máy chủ này kết nối với một mô hình ngôn ngữ lớn (LLM – giống ChatGPT) để hiểu ý bạn và viết câu trả lời tự nhiên.

Nhưng LLM này **bị giới hạn chặt chẽ**:
- Chỉ được trả lời về đồ ăn và quán ăn ở Hà Nội
- Chỉ được dùng dữ liệu có sẵn trong hệ thống, **tuyệt đối không được bịa**
- Nếu không biết → phải nói "tôi không rõ" thay vì đoán bừa

---

## Dữ liệu trong app lấy từ đâu?

- **30 nhà hàng** ở Hà Nội (dữ liệu giả lập cho phiên bản demo)
- Mỗi quán có khoảng **15-20 món** Việt Nam (phở, bún, cơm, bánh mì, lẩu, chay, nhậu…)
- Mỗi món có **danh sách nguyên liệu** chi tiết
- Toạ độ nhà hàng trên bản đồ (giả lập)
- **9 loại dị ứng** được hỗ trợ: Cá, Tôm, Cua/Ghẹ, Sò/Ốc/Hải sản vỏ, Đậu phộng, Sữa/Phô mai, Trứng, Gluten, Đậu nành
- Ngoài ra người dùng có thể **tự nhập thêm** dị ứng riêng (ví dụ: "mè", "hạt điều")

---

## Công nghệ sử dụng (giải thích đơn giản)

| Thành phần | Công nghệ | Giải thích dễ hiểu |
|:---|:---|:---|
| Giao diện người dùng | React + TypeScript | Khung xây dựng giao diện web, giống như bộ xương của app |
| Công cụ chạy app | Vite | Giúp app khởi động và tải nhanh khi phát triển |
| Trợ lý AI Chat | OpenRouter API (DeepSeek) | Dịch vụ bên ngoài cung cấp "bộ não" AI để trả lời chat |
| Máy chủ | Express.js (Node.js) | Cái "cầu nối" giữa app và dịch vụ AI bên ngoài |
| Lưu trữ dữ liệu | localStorage (trình duyệt) | Nơi lưu hồ sơ dị ứng và kết quả xác nhận món Vàng, ngay trên máy bạn |
| Bản đồ | Leaflet (bản đồ mở) | Hiển thị vị trí các quán ăn trên bản đồ |

---

# 🥊 Chuẩn bị Phản biện (Debate / Q&A)

Dưới đây là những câu hỏi khó mà nhóm khác hoặc giảng viên **rất có thể sẽ hỏi**, kèm theo gợi ý cách trả lời.

---

### Câu 1: "Nếu AI đánh dấu Xanh nhưng thực tế món đó CÓ chất dị ứng thì sao? Ai chịu trách nhiệm?"

**Cách trả lời:**
> Đây là rủi ro nghiêm trọng nhất mà nhóm đã lường trước. Chính vì vậy nhóm chọn **Augment chứ không Automate**. App luôn hiển thị cảnh báo (disclaimer) rằng kết quả chỉ mang tính tham khảo. Ngoài ra, hệ thống áp dụng nguyên tắc *"Thà giết lầm hơn bỏ sót"* – nếu AI không chắc 100%, nó sẽ dán nhãn Vàng thay vì Xanh, buộc người dùng phải kiểm tra lại. Và trong phiên bản thực tế, cần có **disclaimer pháp lý** rõ ràng.

---

### Câu 2: "Dữ liệu nguyên liệu của các món ăn lấy từ đâu? Có chính xác không?"

**Cách trả lời:**
> Trong bản demo này, dữ liệu là **mock data** (dữ liệu giả lập) do nhóm tự xây dựng dựa trên kiến thức ẩm thực Việt Nam. Trong phiên bản sản phẩm thực tế, dữ liệu sẽ đến từ 3 nguồn: (1) nhà hàng tự khai báo menu trên nền tảng, (2) crawl từ các app delivery như ShopeeFood, và (3) cộng đồng người dùng đóng góp và xác nhận.

---

### Câu 3: "AI Chat của bạn có bị ảo giác (hallucination) không? Ví dụ bịa ra quán không có thật?"

**Cách trả lời:**
> Nhóm đã phòng chống điều này rất chặt. Trong System Prompt (lệnh điều khiển AI), nhóm ghi rõ: "CHỈ dùng dữ liệu catalog bên dưới — KHÔNG bịa quán, món, nguyên liệu". Toàn bộ danh sách 30 quán và menu được truyền trực tiếp vào context của AI, nên AI chỉ trả lời dựa trên những gì đã có. Nếu không tìm thấy, AI sẽ nói thẳng "Mình không tìm thấy món này trong dữ liệu".

---

### Câu 4: "Augment hay Automate? Tại sao không automate luôn cho tiện?"

**Cách trả lời:**
> Câu trả lời nằm ở **hậu quả khi sai**. Nếu AI tự động chốt món và giao hàng mà món đó có lạc → người dùng có thể bị sốc phản vệ. Hậu quả này là **không thể hoàn tác** (irreversible). Với những quyết định mà sai lầm có thể gây nguy hiểm đến tính mạng, con người PHẢI giữ quyền kiểm soát cuối cùng. Đây là nguyên tắc cốt lõi trong thiết kế sản phẩm AI có trách nhiệm.

---

### Câu 5: "Failure mode chính của app là gì?"

**Cách trả lời:**
> Có 3 failure mode chính:
> 1. **False Positive** (báo Xanh nhưng thực tế nguy hiểm): Xảy ra khi tên món không chứa từ khoá dị ứng nhưng thực tế lại có (VD: gỏi đu đủ rắc tôm khô mà menu không ghi). → Giải pháp: ép nhãn Vàng cho các món mơ hồ.
> 2. **AI Hallucination** (bịa thông tin): → Giải pháp: giới hạn context chặt, chỉ cho AI trả lời từ dữ liệu có sẵn.
> 3. **Dữ liệu menu lỗi thời**: Quán thay đổi menu nhưng app chưa cập nhật. → Giải pháp: cơ chế nhãn Vàng cho phép người dùng xác nhận lại bất kỳ lúc nào.

---

### Câu 6: "Phần mình làm gì trong dự án?" (hỏi cá nhân)

> ⚠️ **LƯU Ý QUAN TRỌNG:** Mỗi thành viên **BẮT BUỘC** phải trả lời được câu này. Không trả lời được = **0 điểm cá nhân**.

Mỗi người cần nắm rõ:
- Mình code phần nào? (ví dụ: giao diện chat, logic phân loại, trang Onboarding…)
- File nào là do mình viết hoặc chỉnh sửa?
- Tại sao lại chọn cách làm đó?

---

### Câu 7: "Tín hiệu học là gì? Nó hoạt động ra sao?"

**Cách trả lời:**
> Khi gặp món Vàng (không chắc chắn), người dùng hỏi nhà hàng và nhận được câu trả lời. Kết quả đó (VD: "Nộm bò khô KHÔNG có lạc") được **lưu lại vào bộ nhớ**. Lần sau, bất kỳ người dùng nào khác có cùng dị ứng đậu phộng mở quán đó sẽ thấy món này đã chuyển sang Xanh, không cần hỏi lại. App càng được dùng nhiều → càng có nhiều dữ liệu xác nhận → càng ít món Vàng → trải nghiệm càng mượt mà. Đây là vòng lặp phản hồi tích cực (positive feedback loop).

---

### Câu 8: "App có scale được không? 30 quán thì ít quá"

**Cách trả lời:**
> 30 quán là phạm vi của bản demo (prototype). Kiến trúc app được thiết kế sẵn cho việc mở rộng: dữ liệu quán nằm riêng trong một file data, chỉ cần thay bằng API kết nối database thật là scale được ngay. Phần logic phân loại dị ứng hoạt động độc lập với số lượng quán – dù 30 hay 3000 quán thì thuật toán vẫn chạy tương tự.

---

### Câu 9: "Tại sao dùng localStorage mà không dùng database thật?"

**Cách trả lời:**
> Vì đây là **prototype demo trong 1 ngày**. localStorage cho phép nhóm tập trung vào logic sản phẩm cốt lõi (phân loại dị ứng, AI chat, UX) thay vì mất thời gian setup server database. Trong phiên bản production, chắc chắn sẽ chuyển sang database thật (ví dụ: MongoDB hoặc PostgreSQL) để dữ liệu được chia sẻ giữa các người dùng.

---

## Checklist trước khi lên Demo

- [ ] Mỗi người đọc kỹ tài liệu này và nhớ ít nhất 3 câu trả lời phản biện
- [ ] Mỗi người biết rõ "phần mình làm gì" và giải thích được
- [ ] Chạy thử app 1 lần để chắc chắn không bị lỗi
- [ ] Chuẩn bị sẵn 2 test case (1 Xanh, 1 Vàng) để demo live
- [ ] Phân công ai nói phần nào trong 5 phút thuyết trình
- [ ] Dry run (tập thử) ít nhất 1 lần, bấm giờ
- [ ] Sạc đầy pin laptop và điện thoại (để chấm chéo nhóm khác)
