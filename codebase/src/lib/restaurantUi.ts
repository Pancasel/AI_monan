import type { Dish } from "../types";

const CUISINE_IMAGES: Record<string, string> = {
  Phở: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=640&h=360&fit=crop",
  "Phở gà": "https://images.unsplash.com/photo-1617094835757-69aa2710f309?w=640&h=360&fit=crop",
  "Phở cuốn": "https://images.unsplash.com/photo-1585036896545-ad26feffbe95?w=640&h=360&fit=crop",
  "Bún chả": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=640&h=360&fit=crop",
  Bún: "https://images.unsplash.com/photo-1555126634-0897a6d11ac0?w=640&h=360&fit=crop",
  "Bún đậu": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=640&h=360&fit=crop",
  "Bún bò": "https://images.unsplash.com/photo-1569562211093-4edf0d275d45?w=640&h=360&fit=crop",
  "Cơm tấm": "https://images.unsplash.com/photo-1603133884108-004b53c1b7f4?w=640&h=360&fit=crop",
  Cơm: "https://images.unsplash.com/photo-1512058564366-43710a2f0a6e?w=640&h=360&fit=crop",
  "Bánh mì": "https://images.unsplash.com/photo-1553909489-cd47eeb1c4a0?w=640&h=360&fit=crop",
  Lẩu: "https://images.unsplash.com/photo-1563379091339-03246963d7c9?w=640&h=360&fit=crop",
  "Hải sản": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=640&h=360&fit=crop",
  "Ốc / hải sản": "https://images.unsplash.com/photo-1565680018434-b1cbd5c5d289?w=640&h=360&fit=crop",
  Chay: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&h=360&fit=crop",
  Huế: "https://images.unsplash.com/photo-1569562211093-4edf0d275d45?w=640&h=360&fit=crop",
  Nhậu: "https://images.unsplash.com/photo-1544025162-d76694265947?w=640&h=360&fit=crop",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&h=360&fit=crop";

/** SVG cục bộ — luôn tải được khi CDN ảnh lỗi */
export const IMAGE_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect fill="#fed7aa" width="100%" height="100%"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-size="72">🍜</text></svg>'
  );

export function imageFallbackAttr(fallback = IMAGE_FALLBACK): string {
  const safe = fallback.replace(/'/g, "%27");
  return `onerror="this.onerror=null;this.src='${safe}'"`;
}

const DISH_IMAGES: Record<string, string> = {
  phở: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=280&fit=crop",
  bún: "https://images.unsplash.com/photo-1555126634-0897a6d11ac0?w=400&h=280&fit=crop",
  cơm: "https://images.unsplash.com/photo-1512058564366-43710a2f0a6e?w=400&h=280&fit=crop",
  "bánh mì": "https://images.unsplash.com/photo-1553909489-cd47eeb1c4a0?w=400&h=280&fit=crop",
  lẩu: "https://images.unsplash.com/photo-1563379091339-03246963d7c9?w=400&h=280&fit=crop",
  cua: "https://images.unsplash.com/photo-1565680018434-b1cbd5c5d289?w=400&h=280&fit=crop",
  tôm: "https://images.unsplash.com/photo-1565680018434-b1cbd5c5d289?w=400&h=280&fit=crop",
  chay: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=280&fit=crop",
  gà: "https://images.unsplash.com/photo-1598103442097-8b743aff334c?w=400&h=280&fit=crop",
  cá: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=280&fit=crop",
  nem: "https://images.unsplash.com/photo-1529003605850-f9162adedcaf?w=400&h=280&fit=crop",
};

/** Ảnh quán theo loại món — dùng cho thẻ chat và panel chi tiết */
export function getRestaurantImage(cuisine: string, restaurantId?: string): string {
  for (const [key, url] of Object.entries(CUISINE_IMAGES)) {
    if (cuisine.includes(key) || key.includes(cuisine)) return url;
  }
  if (restaurantId) {
    const idx = parseInt(restaurantId.replace(/\D/g, ""), 10) || 0;
    const variants = Object.values(CUISINE_IMAGES);
    return variants[idx % variants.length];
  }
  return DEFAULT_IMAGE;
}

export function getDishImage(dishName: string, cuisine?: string): string {
  const n = dishName.toLowerCase();
  for (const [key, url] of Object.entries(DISH_IMAGES)) {
    if (n.includes(key)) return url;
  }
  if (cuisine) return getRestaurantImage(cuisine);
  return DEFAULT_IMAGE;
}

export function estimateDistanceMeters(
  restaurantId: string,
  userLat?: number,
  userLng?: number,
  restLat?: number,
  restLng?: number
): number {
  if (userLat != null && userLng != null && restLat != null && restLng != null) {
    const R = 6371000;
    const dLat = ((restLat - userLat) * Math.PI) / 180;
    const dLng = ((restLng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((restLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  let hash = 0;
  for (let i = 0; i < restaurantId.length; i++) {
    hash = (hash * 31 + restaurantId.charCodeAt(i)) % 997;
  }
  return 200 + (hash % 1200);
}

export function estimateDeliveryMinutes(distanceM: number): string {
  const min = Math.max(12, Math.round(distanceM / 80));
  const max = min + 10;
  return `${min}-${max} phút`;
}

/** Thời gian đi từ vị trí hiện tại tới quán */
export function formatTravelTime(distanceM: number, durationSec?: number): string {
  const mins =
    durationSec != null
      ? Math.max(1, Math.round(durationSec / 60))
      : Math.max(1, Math.round(distanceM / 350));
  const dist =
    distanceM >= 1000 ? `${(distanceM / 1000).toFixed(1)} km` : `${distanceM} m`;
  return `${mins} phút · ${dist}`;
}

export function priceRange(menu: Dish[]): { min: number; max: number } {
  if (!menu.length) return { min: 0, max: 0 };
  const prices = menu.map((d) => d.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatPriceShort(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export function fakeReviewCount(rating: number, id: string): number {
  let h = 0;
  for (const c of id) h = (h * 13 + c.charCodeAt(0)) % 500;
  return Math.round(rating * 180 + h);
}

export function cuisineEmoji(cuisine: string): string {
  const c = cuisine.toLowerCase();
  if (c.includes("phở")) return "🍜";
  if (c.includes("bún")) return "🥢";
  if (c.includes("cơm")) return "🍚";
  if (c.includes("bánh mì")) return "🥖";
  if (c.includes("lẩu")) return "🍲";
  if (c.includes("hải sản") || c.includes("ốc")) return "🦐";
  if (c.includes("chay")) return "🥗";
  return "🍽️";
}

/** Màu pin: đỏ mặc định, tím khi chọn */
export function markerColor(_rating?: number, isSelected = false): string {
  if (isSelected) return "#7B1FA2";
  return "#E53935";
}

export function googleMapsDirectionsUrl(
  destLat: number,
  destLng: number,
  destName?: string,
  originLat?: number,
  originLng?: number
): string {
  const dest = `${destLat},${destLng}`;
  const origin =
    originLat != null && originLng != null ? `${originLat},${originLng}` : "My+Location";
  const name = destName ? encodeURIComponent(destName) : "";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${name ? `&destination_place_id=${name}` : ""}&travelmode=driving`;
}
