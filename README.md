# Day06-[Tên Lớp]-Nhom[XX]: AI Món Ăn (AI Food Allergen Guide)

**Mô tả ngắn gọn:** 
AI Món Ăn là ứng dụng Web App thông minh tích hợp AI hỗ trợ người dùng có chế độ ăn kiêng hoặc dị ứng thực phẩm. Dựa vào hồ sơ sức khỏe và lựa chọn dị ứng, hệ thống sẽ tự động quét menu, sàng lọc và dán nhãn (Xanh - An toàn, Đỏ - Nguy hiểm, Vàng - Cần xác nhận) cho từng món ăn tại các nhà hàng, giúp người dùng an tâm khi ra quyết định ăn uống.

## Danh sách thành viên

| Họ và tên | Mã học viên | Phân công công việc |
| :--- | :--- | :--- |
| [Tên thành viên 1] | [Mã HV 1] | Dựng UI/UX, tích hợp bản đồ & React components |
| [Tên thành viên 2] | [Mã HV 2] | Thiết kế luồng Prompt, viết SPEC, kiểm thử AI |
| [Tên thành viên 3] | [Mã HV 3] | Tích hợp API AI, xử lý logic phân loại món ăn (Xanh/Đỏ/Vàng) |

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

**Yêu cầu hệ thống:** Node.js (phiên bản 18 trở lên).

1. Clone repo này về máy.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi động môi trường dev:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập vào URL được in ra trong terminal (thường là `http://localhost:5173`).
