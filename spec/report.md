# Báo Cáo Kỹ Thuật (Technical Report) - AI Món Ăn

Tài liệu này trình bày chi tiết về luồng hoạt động, kiến trúc hệ thống, các công nghệ sử dụng và pipeline xử lý hoàn chỉnh của dự án AI Món Ăn.

---

## 1. Kiến trúc hệ thống (System Architecture)

Hệ thống được thiết kế theo kiến trúc **Client-Side Heavy (Single Page Application)**, trong đó phần lớn logic xử lý, quản lý trạng thái, và phân tích dữ liệu được thực hiện trực tiếp trên trình duyệt của người dùng. Hệ thống có khả năng giao tiếp với một API bên ngoài để xử lý ngôn ngữ tự nhiên (LLM Chat).

**Các khối kiến trúc chính:**
1. **User Interface (UI) Layer:** Chịu trách nhiệm hiển thị giao diện giả lập thiết bị di động (Device Preview Shell), Bản đồ hiển thị nhà hàng và giao diện Chatbot.
2. **State Management & Storage:** Quản lý trạng thái thông qua React State và tự động đồng bộ xuống `localStorage` để duy trì phiên đăng nhập và hồ sơ người dùng (bao gồm danh sách dị ứng).
3. **Data Layer (Mocked):** Chứa dữ liệu cứng (mock data) của 30 nhà hàng, toạ độ giả lập và danh sách các món ăn/thành phần.
4. **AI Processing Layer:** Xử lý đầu vào của người dùng trong chat. Bao gồm 2 phần:
   - *Local NLP Engine:* Sử dụng Regex và thuật toán chấm điểm (Scoring) để phân loại câu hỏi, trích xuất thực thể (tên món, khu vực) và xếp hạng nhà hàng (Ranking).
   - *Remote LLM Engine:* Gọi API bên ngoài (`/api/chat`) để sinh phản hồi tự nhiên khi cần thiết.

---

## 2. Tech Stack (Các công nghệ sử dụng)

- **Ngôn ngữ lập trình:** TypeScript, HTML5, CSS3.
- **Frontend Framework:** React 18 (sử dụng Functional Components & Hooks).
- **Build Tool:** Vite (giúp build nhanh và hỗ trợ HMR - Hot Module Replacement).
- **Styling:** Vanilla CSS (tùy biến giao diện linh hoạt, không phụ thuộc thư viện thứ 3).
- **Lưu trữ dữ liệu:** `localStorage` API (lưu User Profile, Auth, và lịch sử đánh giá món ăn "nhãn Vàng").
- **API Communication:** Fetch API (gọi LLM bên ngoài thông qua biến môi trường `VITE_API_URL`).

---

## 3. Pipeline xử lý hoàn chỉnh (Processing Pipeline)

Hệ thống xử lý luồng dữ liệu (Data Pipeline) từ lúc người dùng tương tác cho đến khi AI trả kết quả được chia làm 3 giai đoạn chính:

### Giai đoạn 1: Onboarding & Xây dựng hồ sơ (Profile Building)
1. Người dùng truy cập ứng dụng và thực hiện "Đăng nhập".
2. **Khai báo y tế:** Ứng dụng yêu cầu người dùng chọn các thành phần dị ứng (ví dụ: Hải sản, Đậu phộng, Sữa...).
3. Dữ liệu này được đóng gói thành đối tượng `UserProfile` và ghi xuống `localStorage`.

### Giai đoạn 2: Tương tác Chat & Phân tích yêu cầu (NLU Pipeline)
Khi người dùng gõ tin nhắn vào khung chat (ví dụ: *"Tìm quán bún chả không có lạc"*):
1. **Tiền xử lý văn bản (Normalization):** Chuyển chuỗi về chữ thường, loại bỏ dấu nếu cần.
2. **Kiểm tra ngoại lệ (Out of Scope):** Regex chặn các câu hỏi không liên quan (chính trị, code, thời tiết).
3. **Phân loại câu hỏi (Intent Classification):** Engine tại file `aiChat.ts` phân loại câu hỏi thành các nhóm: `suggest` (gợi ý), `ingredients` (hỏi nguyên liệu), `dish` (hỏi món cụ thể), `allergy` (hỏi về dị ứng), `chay` (hỏi đồ chay).
4. **Trích xuất thông tin (Entity Extraction):** Bắt các từ khoá về khu vực ("Cầu Giấy", "Hoàn Kiếm") hoặc loại ẩm thực ("bún bò", "bánh mì").

### Giai đoạn 3: Phân tích Dữ liệu và Xếp hạng (Scoring & Ranking)
1. **Lọc cơ sở (Filtering):** Lấy danh sách 30 nhà hàng từ mock data. Lọc theo khu vực hoặc loại món (nếu có).
2. **Chấm điểm An toàn (Allergy Scoring):** Chạy thuật toán `rankRestaurants`. 
   - Quét từng món trong menu của quán.
   - Đối chiếu thành phần món ăn với `UserProfile` (dị ứng).
   - Dán nhãn **Xanh** (An toàn), **Đỏ** (Nguy hiểm), hoặc **Vàng** (Không chắc chắn).
   - Tính toán tỷ lệ phần trăm (%) số món Xanh của quán.
3. **Sinh phản hồi (Response Generation):**
   - Sắp xếp top 5 quán an toàn nhất.
   - Định dạng văn bản trả về (Markdown & HTML) cho hiển thị thẻ nhà hàng (Restaurant Card).
   - (Tùy chọn) Gửi payload gồm Lịch sử chat + Profile lên `chatApi.ts` để LLM viết lại phản hồi cho mềm mại hơn.

---

## 4. Flow Hoạt động Của Người Dùng (User Flow)

Dưới đây là luồng hành vi thực tế của người dùng trên giao diện:

```mermaid
flowchart TD
    A([Khởi động Ứng Dụng]) --> B{Đã tạo Hồ sơ?}
    
    subgraph Phase1 [1. Onboarding & Khai báo]
        B -- Chưa --> C[Khai báo thông tin cơ bản]
        C --> D[Chọn thành phần Dị ứng/Kiêng cữ]
        D --> E[(Lưu vào LocalStorage)]
    end

    E --> F([Mở Giao Diện Chính])
    B -- Rồi --> F
    
    subgraph Phase2 [2. Trợ lý AI & Tìm kiếm]
        F --> G[Chat yêu cầu món hoặc quán]
        G --> H[AI phân tích Intent & Đối chiếu Menu]
        H --> I[Gợi ý Top quán có % món Xanh cao]
        I --> J[Chọn quán trên Danh sách/Bản đồ]
    end
    
    subgraph Phase3 [3. Ra Quyết Định & Tín hiệu học]
        J --> K[Hiển thị Menu với Nhãn AI]
        K --> L{Kiểm tra Nhãn Dị ứng}
        
        L -- 🟢 Nhãn Xanh --> M[An toàn -> Yên tâm gọi món]
        L -- 🔴 Nhãn Đỏ --> N[Nguy hiểm -> Bỏ qua món này]
        L -- 🟡 Nhãn Vàng --> O[Nghi ngờ -> Bấm 'Hỏi Nhà Hàng']
        
        O --> P[Nhà hàng xác nhận thành phần (Giả lập)]
        P --> Q[Đổi món Vàng thành Xanh hoặc Đỏ]
        Q --> R[(Lưu LocalStorage - Không phải hỏi lại lần sau)]
    end
```

---
**Tổng kết:** Dự án AI Món Ăn là sự kết hợp hoàn hảo giữa logic xử lý phân loại quy tắc (Rule-based Regex) cho tốc độ cực nhanh ở Client và sự linh hoạt của LLM. Pipeline đi từ lúc thu thập Profile -> Chấm điểm an toàn menu -> Cập nhật luồng bất định (nhãn Vàng) đã đáp ứng hoàn hảo tiêu chí "Augment (Tăng năng lực)" của Hackathon.
