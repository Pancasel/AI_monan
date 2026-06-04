import type { DISH_CATALOG } from "./dishCatalog";

/** 20 nhà hàng bổ sung — tổng 50 quán */
export const EXTRA_RESTAURANT_TEMPLATES: {
  name: string;
  cuisine: string;
  district: string;
  address: string;
  catalogKey: keyof typeof DISH_CATALOG;
  rating: number;
}[] = [
  { name: "Phở Sướng Hà Nội", cuisine: "Phở", district: "Hoàn Kiếm", address: "7 Nguyễn Hữu Huân", catalogKey: "pho", rating: 4.5 },
  { name: "Phở Việt 24", cuisine: "Phở", district: "Đống Đa", address: "24 Tôn Đức Thắng", catalogKey: "pho", rating: 4.2 },
  { name: "Phở Xưa & Nay", cuisine: "Phở gà", district: "Cầu Giấy", address: "18 Nguyễn Khánh Toàn", catalogKey: "pho", rating: 4.4 },
  { name: "Phở Bò Yên Phụ", cuisine: "Phở", district: "Tây Hồ", address: "42 Yên Phụ", catalogKey: "pho", rating: 4.3 },
  { name: "Phở Cuốn Thanh Trì", cuisine: "Phở cuốn", district: "Hoàn Kiếm", address: "8 Hàng Trống", catalogKey: "pho", rating: 4.1 },
  { name: "Bún Chả Sinh Từ", cuisine: "Bún chả", district: "Ba Đình", address: "57 Sinh Từ", catalogKey: "bun", rating: 4.6 },
  { name: "Bún Riêu 38", cuisine: "Bún", district: "Hoàn Kiếm", address: "38 Hàng Bún", catalogKey: "bun", rating: 4.3 },
  { name: "Bún Thang Cầu Gỗ", cuisine: "Bún", district: "Hoàn Kiếm", address: "52 Cầu Gỗ", catalogKey: "bun", rating: 4.2 },
  { name: "Bún Đậu Homemade", cuisine: "Bún đậu", district: "Cầu Giấy", address: "6 Hoàng Minh Giám", catalogKey: "bun", rating: 4.4 },
  { name: "Bún Bò Huế 68", cuisine: "Bún bò", district: "Đống Đa", address: "68 Kim Mã", catalogKey: "monHue", rating: 4.5 },
  { name: "Cơm Tấm Sài Gòn 88", cuisine: "Cơm tấm", district: "Hai Bà Trưng", address: "88 Bạch Đằng", catalogKey: "com", rating: 4.3 },
  { name: "Cơm Niêu 888", cuisine: "Cơm", district: "Ba Đình", address: "888 Kim Mã", catalogKey: "com", rating: 4.1 },
  { name: "Cơm Gà Xối Mỡ", cuisine: "Cơm", district: "Cầu Giấy", address: "33 Trần Thái Tông", catalogKey: "com", rating: 4.5 },
  { name: "Bánh Mì Hội An", cuisine: "Bánh mì", district: "Đống Đa", address: "15 Láng Hạ", catalogKey: "banhmi", rating: 4.4 },
  { name: "Bánh Mì 362", cuisine: "Bánh mì", district: "Cầu Giấy", address: "362 Cầu Giấy", catalogKey: "banhmi", rating: 4.2 },
  { name: "Lẩu Thái 567", cuisine: "Lẩu", district: "Hoàn Kiếm", address: "567 Bà Triệu", catalogKey: "lau", rating: 4.3 },
  { name: "Lẩu Nấm Thiên Nhiên", cuisine: "Lẩu", district: "Ba Đình", address: "21 Điện Biên Phủ", catalogKey: "lau", rating: 4.5 },
  { name: "Hải Sản 36", cuisine: "Hải sản", district: "Hai Bà Trưng", address: "36 Trần Nhân Tông", catalogKey: "haiSan", rating: 4.4 },
  { name: "Chay Lotus", cuisine: "Chay", district: "Cầu Giấy", address: "10 Phạm Hùng", catalogKey: "chay", rating: 4.6 },
  { name: "Quán Nhậu Đồng Quê", cuisine: "Nhậu", district: "Đống Đa", address: "55 Chùa Láng", catalogKey: "quanNhau", rating: 4.3 },
  { name: "Mì Quảng Cô Ba", cuisine: "Mì Quảng", district: "Hai Bà Trưng", address: "22 Bùi Thị Xuân", catalogKey: "miQuang", rating: 4.4 },
  { name: "Bánh Cuốn Kỳ Đồng", cuisine: "Bánh cuốn", district: "Đống Đa", address: "11 Kỳ Đồng", catalogKey: "banhCuon", rating: 4.3 },
  { name: "Xôi Vò Bà Già", cuisine: "Xôi", district: "Cầu Giấy", address: "4 Ngõ 12 Phạm Hùng", catalogKey: "xoi", rating: 4.2 },
  { name: "Nem Nướng 64", cuisine: "Nem nướng", district: "Hoàn Kiếm", address: "64 Trần Hưng Đạo", catalogKey: "nemNuong", rating: 4.5 },
];
