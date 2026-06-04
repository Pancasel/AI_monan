import type { Dish, Restaurant } from "../types";
import { DISH_CATALOG } from "./dishCatalog";
import { EXTRA_RESTAURANT_TEMPLATES } from "./extraRestaurants";
import { getDishImage, getRestaurantImage } from "../lib/restaurantUi";

const RESTAURANT_TEMPLATES: {
  name: string;
  cuisine: string;
  district: string;
  address: string;
  catalogKey: keyof typeof DISH_CATALOG;
  rating: number;
}[] = [
  { name: "Phở Thìn Lò Đúc", cuisine: "Phở", district: "Hoàn Kiếm", address: "13 Lò Đúc", catalogKey: "pho", rating: 4.6 },
  { name: "Phở Gà Nguyệt Tuấn", cuisine: "Phở gà", district: "Ba Đình", address: "65 Nguyệt Tuấn", catalogKey: "pho", rating: 4.4 },
  { name: "Phở Bò Nam Định 29", cuisine: "Phở", district: "Cầu Giấy", address: "29 Phạm Văn Đồng", catalogKey: "pho", rating: 4.3 },
  { name: "Bún Chả Hương Liên", cuisine: "Bún chả", district: "Ba Đình", address: "24 Lê Văn Hưu", catalogKey: "bun", rating: 4.7 },
  { name: "Bún Riêu Cô Hồng", cuisine: "Bún", district: "Đống Đa", address: "56 Hàng Bún", catalogKey: "bun", rating: 4.2 },
  { name: "Bún Bò Huế O Xuân", cuisine: "Bún bò", district: "Hai Bà Trưng", address: "5 Nguyễn Du", catalogKey: "monHue", rating: 4.5 },
  { name: "Bún Đậu Mắm Tôm 31", cuisine: "Bún đậu", district: "Hoàn Kiếm", address: "31 Hàng Khay", catalogKey: "bun", rating: 4.1 },
  { name: "Cơm Tấm Cali", cuisine: "Cơm tấm", district: "Đống Đa", address: "32 Nguyễn Thái Học", catalogKey: "com", rating: 4.3 },
  { name: "Cơm Gà Hội An 45", cuisine: "Cơm", district: "Tây Hồ", address: "45 Xuân Diệu", catalogKey: "com", rating: 4.4 },
  { name: "Cơm Niêu Sài Gòn", cuisine: "Cơm", district: "Cầu Giấy", address: "12 Trần Duy Hưng", catalogKey: "com", rating: 4.0 },
  { name: "Bánh Mì 25", cuisine: "Bánh mì", district: "Hoàn Kiếm", address: "25 Hàng Gai", catalogKey: "banhmi", rating: 4.5 },
  { name: "Bánh Mì Phượng", cuisine: "Bánh mì", district: "Ba Đình", address: "67 Phan Đình Phùng", catalogKey: "banhmi", rating: 4.6 },
  { name: "Bánh Mì Chả Cá Nha Trang", cuisine: "Bánh mì", district: "Hai Bà Trưng", address: "88 Bạch Mai", catalogKey: "banhmi", rating: 4.2 },
  { name: "Lẩu Thái Tom Yum", cuisine: "Lẩu", district: "Cầu Giấy", address: "8 Phạm Hùng", catalogKey: "lau", rating: 4.4 },
  { name: "Lẩu Bò 999", cuisine: "Lẩu", district: "Đống Đa", address: "999 La Thành", catalogKey: "lau", rating: 4.3 },
  { name: "Lẩu Cá Basa 68", cuisine: "Lẩu", district: "Tây Hồ", address: "68 Âu Cơ", catalogKey: "lau", rating: 4.1 },
  { name: "Hải Sản Biển Đông", cuisine: "Hải sản", district: "Tây Hồ", address: "120 Âu Cơ", catalogKey: "haiSan", rating: 4.5 },
  { name: "Ốc Luộc Hà Nội", cuisine: "Ốc / hải sản", district: "Hoàn Kiếm", address: "3 Đinh Tiên Hoàng", catalogKey: "haiSan", rating: 4.0 },
  { name: "Cua Hoàng Gia", cuisine: "Hải sản", district: "Cầu Giấy", address: "45 Trung Kính", catalogKey: "haiSan", rating: 4.6 },
  { name: "Chay Garden", cuisine: "Chay", district: "Ba Đình", address: "22 Linh Lang", catalogKey: "chay", rating: 4.4 },
  { name: "Hum Vegetarian", cuisine: "Chay", district: "Hoàn Kiếm", address: "4 Ngô Văn Sở", catalogKey: "chay", rating: 4.7 },
  { name: "Món Huế Ngon", cuisine: "Huế", district: "Đống Đa", address: "30 Kim Mã", catalogKey: "monHue", rating: 4.3 },
  { name: "Quán Nhậu 36", cuisine: "Nhậu", district: "Hai Bà Trưng", address: "36 Bùi Thị Xuân", catalogKey: "quanNhau", rating: 4.2 },
  { name: "Bia Hơi Hà Nội", cuisine: "Nhậu", district: "Hoàn Kiếm", address: "2 Tạ Hiện", catalogKey: "quanNhau", rating: 4.1 },
  { name: "Phở Cuốn Thanh Hà", cuisine: "Phở cuốn", district: "Ba Đình", address: "25 Thanh Niên", catalogKey: "pho", rating: 4.3 },
  { name: "Bún Thang 48", cuisine: "Bún", district: "Hoàn Kiếm", address: "48 Cầu Gỗ", catalogKey: "bun", rating: 4.0 },
  { name: "Cơm Rang Dê Nhai", cuisine: "Cơm", district: "Hai Bà Trưng", address: "15 Lò Đúc", catalogKey: "com", rating: 4.2 },
  { name: "Lẩu Mắm Miền Tây", cuisine: "Lẩu", district: "Đống Đa", address: "77 Chùa Bộc", catalogKey: "lau", rating: 4.4 },
  { name: "Tôm Hùm Alaska", cuisine: "Hải sản", district: "Tây Hồ", address: "200 Quảng An", catalogKey: "haiSan", rating: 4.8 },
  { name: "Bánh Mì & Cà Phê Sáng", cuisine: "Bánh mì", district: "Cầu Giấy", address: "9 Nguyễn Phong Sắc", catalogKey: "banhmi", rating: 4.3 },
  { name: "Mì Quảng Bà Mua", cuisine: "Mì Quảng", district: "Hoàn Kiếm", address: "12 Hàng Bông", catalogKey: "miQuang", rating: 4.5 },
  { name: "Mì Quảng 1A", cuisine: "Mì Quảng", district: "Đống Đa", address: "1A Nguyễn Văn Huyên", catalogKey: "miQuang", rating: 4.3 },
  { name: "Bánh Cuốn Gia Truyền", cuisine: "Bánh cuốn", district: "Ba Đình", address: "14 Mai Hắc Đế", catalogKey: "banhCuon", rating: 4.6 },
  { name: "Bánh Cuốn Thanh Trì", cuisine: "Bánh cuốn", district: "Hoàn Kiếm", address: "66 Hàng Bồ", catalogKey: "banhCuon", rating: 4.4 },
  { name: "Bánh Xèo Sài Gòn", cuisine: "Bánh xèo", district: "Cầu Giấy", address: "25 Phạm Tháo", catalogKey: "banhXeo", rating: 4.4 },
  { name: "Bánh Xèo Miền Tây", cuisine: "Bánh xèo", district: "Tây Hồ", address: "18 Âu Cơ", catalogKey: "banhXeo", rating: 4.2 },
  { name: "Xôi Yến Hà Nội", cuisine: "Xôi", district: "Hoàn Kiếm", address: "35 Nguyễn Hữu Huân", catalogKey: "xoi", rating: 4.5 },
  { name: "Xôi Xéo Cô Tấm", cuisine: "Xôi", district: "Ba Đình", address: "8 Nguyễn Trung Trực", catalogKey: "xoi", rating: 4.3 },
  { name: "Nem Nướng Nha Trang 39", cuisine: "Nem nướng", district: "Hai Bà Trưng", address: "39 Lê Thanh Nghị", catalogKey: "nemNuong", rating: 4.4 },
  { name: "Chả Cá Thăng Long", cuisine: "Chả cá", district: "Ba Đình", address: "19-21 Ngô Thì Nhậm", catalogKey: "chaCa", rating: 4.7 },
  { name: "Chả Cá Hà Thành", cuisine: "Chả cá", district: "Hoàn Kiếm", address: "106 K1 Giảng Võ", catalogKey: "chaCa", rating: 4.5 },
  ...EXTRA_RESTAURANT_TEMPLATES,
];

/** Tâm quận Hà Nội — marker rải theo khu vực thật trên bản đồ */
const DISTRICT_CENTERS: Record<string, { lat: number; lng: number }> = {
  "Hoàn Kiếm": { lat: 21.0285, lng: 105.852 },
  "Ba Đình": { lat: 21.0354, lng: 105.818 },
  "Cầu Giấy": { lat: 21.0338, lng: 105.7905 },
  "Đống Đa": { lat: 21.0185, lng: 105.834 },
  "Tây Hồ": { lat: 21.0712, lng: 105.8213 },
  "Hai Bà Trưng": { lat: 21.0122, lng: 105.8644 },
};

const FALLBACK_CENTER = { lat: 21.0285, lng: 105.8542 };

const MENU_SIZE = 14;

/** Từ khóa theo loại quán — mỗi quán ưu tiên món cùng chuyên môn */
function focusKeywords(cuisine: string, catalogKey: keyof typeof DISH_CATALOG): string[] {
  const c = cuisine.toLowerCase();
  const keys: string[] = [];
  if (c.includes("phở gà") || c.includes("pho ga")) keys.push("phở gà", "gà", "lòng gà");
  else if (c.includes("phở cuốn")) keys.push("phở cuốn", "cuốn");
  else if (c.includes("phở")) keys.push("phở", "bò", "quẩy", "chả", "nem");
  if (c.includes("bún chả")) keys.push("bún chả", "chả");
  else if (c.includes("bún bò") || c.includes("huế")) keys.push("bún bò", "huế");
  else if (c.includes("bún riêu")) keys.push("bún riêu", "riêu");
  else if (c.includes("bún đậu")) keys.push("bún đậu", "mắm tôm", "đậu");
  else if (c.includes("bún thang")) keys.push("bún thang");
  else if (c.includes("bún")) keys.push("bún");
  if (c.includes("cơm tấm")) keys.push("cơm tấm", "sườn", "bì", "chả");
  else if (c.includes("cơm gà")) keys.push("cơm gà", "gà");
  else if (c.includes("cơm")) keys.push("cơm");
  if (c.includes("bánh mì")) keys.push("bánh mì");
  if (c.includes("lẩu")) keys.push("lẩu");
  if (c.includes("hải sản") || c.includes("ốc")) keys.push("tôm", "cua", "mực", "ốc", "nghêu", "sò");
  if (c.includes("chay")) keys.push("chay", "đậu", "nấm");
  if (c.includes("nhậu") || c.includes("bia")) keys.push("gà", "lòng", "nem", "bia");
  if (c.includes("mì quảng")) keys.push("mì quảng", "quảng");
  if (c.includes("bánh cuốn")) keys.push("bánh cuốn", "cuốn");
  if (c.includes("bánh xèo")) keys.push("bánh xèo", "khọt");
  if (c.includes("xôi")) keys.push("xôi");
  if (c.includes("nem nướng")) keys.push("nem nướng", "nem");
  if (c.includes("chả cá")) keys.push("chả cá", "cá lăng", "thì là");

  if (keys.length === 0) {
    const fallback: Partial<Record<keyof typeof DISH_CATALOG, string[]>> = {
      pho: ["phở"],
      bun: ["bún"],
      com: ["cơm"],
      banhmi: ["bánh mì"],
      lau: ["lẩu"],
      haiSan: ["tôm", "cua", "mực"],
      chay: ["chay"],
      monHue: ["huế", "bún bò"],
      quanNhau: ["gà", "lòng"],
      miQuang: ["mì quảng"],
      banhCuon: ["bánh cuốn"],
      banhXeo: ["bánh xèo"],
      xoi: ["xôi"],
      nemNuong: ["nem"],
      chaCa: ["chả cá"],
    };
    return fallback[catalogKey] ?? [];
  }
  return keys;
}

function dishFocusScore(name: string, keywords: string[]): number {
  const n = name.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (n.includes(kw)) score += 10;
  }
  return score;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h;
}

/** Mỗi quán ~14 món — cùng loại hình nhưng khác quán sẽ khác thực đơn */
function buildMenu(
  restaurantId: string,
  catalogKey: keyof typeof DISH_CATALOG,
  cuisine: string
): Dish[] {
  const templates = DISH_CATALOG[catalogKey];
  const keywords = focusKeywords(cuisine, catalogKey);
  const seed = hashId(restaurantId);

  const ranked = templates
    .map((t, index) => ({
      t,
      index,
      score: dishFocusScore(t.name, keywords) + ((index + seed) % 11),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const picked = ranked.slice(0, MENU_SIZE).sort((a, b) => a.index - b.index);

  return picked.map(({ t }, i) => ({
    id: `${restaurantId}-d${i + 1}`,
    name: t.name,
    price: t.price + (seed % 3) * 1000 + (i % 2) * 1000,
    description: t.description,
    ingredients: [...t.ingredients],
    ambiguous: t.ambiguous,
    image: getDishImage(t.name, cuisine),
  }));
}

/** Lệch nhẹ trong quận để 30 pin không chồng lên nhau */
function coordsForDistrict(district: string, index: number, id: string): { lat: number; lng: number } {
  const base = DISTRICT_CENTERS[district] ?? FALLBACK_CENTER;
  let hash = index * 31;
  for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) % 997;
  const latOff = ((hash % 13) - 6) * 0.0032;
  const lngOff = (((hash >> 4) % 13) - 6) * 0.0038;
  return { lat: base.lat + latOff, lng: base.lng + lngOff };
}

export const RESTAURANTS: Restaurant[] = RESTAURANT_TEMPLATES.map((t, i) => {
  const id = `r${i + 1}`;
  const { lat, lng } = coordsForDistrict(t.district, i, id);
  return {
    id,
    name: t.name,
    address: `${t.address}, ${t.district}, Hà Nội`,
    district: t.district,
    cuisine: t.cuisine,
    phone: `09${String(10000000 + i * 317429).slice(0, 8)}`,
    hours: "08:00 – 22:00",
    lat,
    lng,
    rating: t.rating,
    image: getRestaurantImage(t.cuisine, id),
    menu: buildMenu(id, t.catalogKey, t.cuisine),
  };
});

export function getRestaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}
