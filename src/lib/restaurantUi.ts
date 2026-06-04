import type { Dish } from "../types";

const CUISINE_IMAGES: Record<string, string> = {
  Phở: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=480&h=280&fit=crop",
  "Phở gà": "https://images.unsplash.com/photo-1617094835757-69aa2710f309?w=480&h=280&fit=crop",
  "Bún chả": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=480&h=280&fit=crop",
  Bún: "https://images.unsplash.com/photo-1555126634-0897a6d11ac0?w=480&h=280&fit=crop",
  "Cơm tấm": "https://images.unsplash.com/photo-1603133884108-004b53c1b7f4?w=480&h=280&fit=crop",
  Cơm: "https://images.unsplash.com/photo-1512058564366-43710a2f0a6e?w=480&h=280&fit=crop",
  "Bánh mì": "https://images.unsplash.com/photo-1553909489-cd47eeb1c4a0?w=480&h=280&fit=crop",
  Lẩu: "https://images.unsplash.com/photo-1563379091339-03246963d7c9?w=480&h=280&fit=crop",
  "Hải sản": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=480&h=280&fit=crop",
  Chay: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=480&h=280&fit=crop",
  Huế: "https://images.unsplash.com/photo-1555126634-0897a6d11ac0?w=480&h=280&fit=crop",
  Nhậu: "https://images.unsplash.com/photo-1544025162-d76694265947?w=480&h=280&fit=crop",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&h=280&fit=crop";

export function getRestaurantImage(cuisine: string): string {
  for (const [key, url] of Object.entries(CUISINE_IMAGES)) {
    if (cuisine.includes(key) || key.includes(cuisine)) return url;
  }
  return DEFAULT_IMAGE;
}

export function estimateDistanceMeters(restaurantId: string): number {
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

export function markerColor(rating: number): string {
  return rating >= 4.5 ? "#ea580c" : rating >= 4.2 ? "#f97316" : "#dc2626";
}
