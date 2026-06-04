# Day06-[Tên Lớp]-Nhom[XX]: AI Món Ăn (AI Food Allergen Guide)

**Mô tả ngắn gọn:** 
AI Món Ăn là ứng dụng Web App thông minh tích hợp AI hỗ trợ người dùng có chế độ ăn kiêng hoặc dị ứng thực phẩm. Dựa vào hồ sơ sức khỏe và lựa chọn dị ứng, hệ thống sẽ tự động quét menu, sàng lọc và dán nhãn (Xanh - An toàn, Đỏ - Nguy hiểm, Vàng - Cần xác nhận) cho từng món ăn tại các nhà hàng, giúp người dùng an tâm khi ra quyết định ăn uống.

## Danh sách thành viên

| Họ và tên | Mã học viên | Phân công công việc |
| :--- | :--- | :--- |
| Đỗ Quốc An | 2A202600952 | Quản lý dự án, viết tài liệu SPEC, phân tích AI Product Canvas |
| Nguyễn Khánh Linh | 2A202600856 | Dựng UI/UX, tích hợp bản đồ & React components, luồng Onboarding |
| Trần Diệu Linh | 2A202600875 | Prompt Engineering, thiết kế luồng xử lý AI ảo giác & Nhãn Vàng |
| Thân Minh Hiếu | 2A202600854 | Kỹ sư dữ liệu, xây dựng Ma trận từ khóa dị ứng và logic Tagging |
| Trần Minh Quang | 2A202600924 | Tích hợp API LLM, xử lý Backend và quản lý LocalStorage |

## Luồng chức năng chính (Flow Demo)

1. **Onboarding:** Đăng nhập (demo) → Khai báo hồ sơ cá nhân → Chọn các thành phần bị dị ứng.
2. **Giao diện chính:**
   - **Bên trái (AI Chat):** Trợ lý ảo gợi ý các quán ăn an toàn nhất dựa trên hồ sơ, giải đáp về nguyên liệu và chi tiết từng món.
   - **Bên phải (Bản đồ & Menu):** Hiển thị 30 nhà hàng. Khi chọn quán, menu hiển thị các món ăn được AI gắn nhãn (Xanh, Đỏ, Vàng).
3. **Luồng giải quyết bất định (Món Vàng):** Khi món chưa rõ thành phần gây dị ứng, người dùng yêu cầu nhà hàng xác nhận → AI cập nhật nhãn Xanh/Đỏ phù hợp (lưu vào localStorage).

## Dữ liệu và Công nghệ đã sử dụng

- **Frontend:** React, TypeScript, Vite. Giao diện giả lập thiết bị (DevicePreviewShell).
- **AI & Logic:** AI Chat phân tích món ăn theo dị ứng người dùng.
- **Database (Mock):** 
  - 30 nhà hàng quanh Hà Nội (tọa độ giả lập trên bản đồ).
  - Mỗi quán ≥ 15 món Việt Nam (phở, bún, cơm, bánh mì, lẩu, chay, nhậu…).
- **Lưu trữ:** Dữ liệu hồ sơ người dùng và trạng thái xác nhận "Món Vàng" được lưu ở `localStorage`.

## Hướng dẫn chạy Prototype (Local)

**Yêu cầu hệ thống:** 
- Node.js (phiên bản 18 trở lên).
- Mã API của OpenRouter để chạy tính năng AI Chat.

1. Clone repo này về máy và mở thư mục dự án:
   ```bash
   git clone https://github.com/Pancasel/AI_monan.git
   cd AI_monan
   ```

2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường (BẮT BUỘC để chạy AI):
   - Tạo một bản sao của file `.env.example` và đổi tên nó thành `.env`.
   - Mở file `.env` ra và điền key của bạn vào dòng: `OPENROUTER_API_KEY=your_key_here`
   - *(Mẹo: Bạn có thể đăng ký tài khoản và lấy Key hoàn toàn miễn phí tại https://openrouter.ai/keys)*

4. Khởi động môi trường dev (lệnh này sẽ chạy song song cả Web Frontend và API Server):
   ```bash
   npm run dev
   ```

5. Mở trình duyệt và truy cập vào URL được in ra trong terminal (thường là `http://localhost:5173`).
