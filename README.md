# AI Món Ăn

Web demo gợi ý nhà hàng và thực đơn theo dị ứng — theo flowchart onboarding → chat + bản đồ → menu gắn nhãn xanh/đỏ/vàng.

## Dữ liệu

- **30 nhà hàng** quanh Hà Nội (tọa độ giả lập trên bản đồ)
- Mỗi quán **≥ 15 món** Việt Nam (phở, bún, cơm, bánh mì, lẩu, hải sản, chay, Huế, nhậu…)
- Hồ sơ & xác nhận món vàng lưu **localStorage**

## Chạy local

```bash
npm install
npm run dev
```

Mở URL in ra terminal (thường `http://localhost:5173`).

## Luồng chính

1. Đăng nhập demo → hồ sơ → chọn dị ứng
2. **Trái:** AI chat (gợi ý quán theo điểm món xanh/tổng, hỏi nguyên liệu, chi tiết món)
3. **Phải:** Bản đồ 30 pin → chọn quán → menu có nhãn
4. Món **vàng:** mô phỏng nhà hàng xác nhận → cập nhật xanh/đỏ
