import { RESTAURANTS, getRestaurantById } from "../data/restaurants";
import { rankRestaurants } from "./allergy";
import {
  estimateDistanceMeters,
  formatPriceShort,
  getRestaurantImage,
  priceRange,
} from "./restaurantUi";
import type { UserProfile } from "../types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  html?: boolean;
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFC");
}

function findDishByName(query: string) {
  const q = normalize(query);
  for (const r of RESTAURANTS) {
    const dish = r.menu.find(
      (d) =>
        normalize(d.name).includes(q) ||
        q.includes(normalize(d.name)) ||
        normalize(d.name).split(" ").some((w) => w.length > 3 && q.includes(w))
    );
    if (dish) return { restaurant: r, dish };
  }
  return null;
}

export function classifyQuestion(text: string): "suggest" | "ingredients" | "dish" | "general" {
  const t = normalize(text);
  if (
    t.includes("nhà hàng") ||
    t.includes("quán") ||
    t.includes("gợi ý") ||
    t.includes("phù hợp") ||
    t.includes("phu hop") ||
    t.includes("hợp với tui") ||
    t.includes("hop voi tui") ||
    t.includes("ăn ở đâu") ||
    t.includes("đi đâu")
  ) {
    return "suggest";
  }
  if (
    t.includes("nguyên liệu") ||
    t.includes("thành phần") ||
    t.includes("có gì") ||
    t.includes("gồm")
  ) {
    return "ingredients";
  }
  if (
    t.includes("món") ||
    t.includes("phở") ||
    t.includes("bún") ||
    t.includes("cơm") ||
    t.includes("bánh mì") ||
    t.includes("lẩu")
  ) {
    return "dish";
  }
  return "general";
}

export function generateAiReply(userText: string, profile: UserProfile): string {
  const kind = classifyQuestion(userText);
  const t = normalize(userText);

  if (kind === "suggest") {
    const districtMatch = t.match(/(hoàn kiếm|ba đình|cầu giấy|đống đa|tây hồ|hai bà trưng|hà nội)/);
    const filter = districtMatch ? districtMatch[1] : t.includes("hà nội") ? "hà nội" : undefined;
    const ranked = rankRestaurants(RESTAURANTS, profile, filter);
    const top = ranked.slice(0, 8);
    if (top.length === 0) {
      return "Mình chưa tìm thấy nhà hàng phù hợp khu vực đó. Bạn thử hỏi \"gợi ý nhà hàng Hà Nội\" nhé.";
    }
    const allergyNote =
      profile.allergies.length > 0
        ? ` (đã lọc theo dị ứng: ${profile.allergies.join(", ")})`
        : "";
    const lines = top.map((item, i) => {
      const pct = Math.round(item.score * 100);
      const { restaurant: r } = item;
      return `${i + 1}. [${r.name}](restaurant:${r.id}) — ${pct}% món phù hợp (${item.safeCount}/${item.totalCount}) · ${r.district} · ⭐ ${r.rating}`;
    });
    return `Dựa trên hồ sơ của bạn${allergyNote}, điểm = món xanh / tổng món trong menu:\n\n${lines.join("\n")}\n\nBấm tên quán để xem vị trí trên bản đồ bên phải.`;
  }

  if (kind === "ingredients") {
    const found = findDishByName(userText);
    if (!found) {
      return "Bạn ghi rõ tên món (vd: \"Cơm gà có nguyên liệu gì?\" hoặc \"Phở bò tái\") để mình tra trong menu 30 quán nhé.";
    }
    const { dish, restaurant } = found;
    return `**${dish.name}** tại [${restaurant.name}](restaurant:${restaurant.id}):\n\nNguyên liệu: ${dish.ingredients.join(", ")}.\n\n${dish.description}`;
  }

  if (kind === "dish") {
    const found = findDishByName(userText);
    if (found) {
      const { dish, restaurant } = found;
      return `**${dish.name}** tại [${restaurant.name}](restaurant:${restaurant.id}) — ${dish.price.toLocaleString("vi-VN")}đ.\n\n${dish.description}\n\nNguyên liệu: ${dish.ingredients.join(", ")}.`;
    }
    return "Mình tìm trong menu các quán Hà Nội. Hãy nêu tên món cụ thể (vd: Bún chả, Cơm tấm sườn) hoặc hỏi \"gợi ý nhà hàng phù hợp với tui\".";
  }

  return `Xin chào${profile.name ? ` ${profile.name}` : ""}! Mình có thể:\n• Gợi ý nhà hàng theo dị ứng (vd: "Nhà hàng Hà Nội phù hợp với tui")\n• Liệt kê nguyên liệu món (vd: "Cơm gà có nguyên liệu gì?")\n• Trả lời chi tiết món trong menu\n\nBản đồ bên phải hiển thị 30 quán — chọn pin để xem menu có nhãn xanh/đỏ/vàng.`;
}

function restaurantCardHtml(id: string, label: string): string {
  const r = getRestaurantById(id);
  if (!r) {
    return `<a href="#" class="restaurant-link" data-restaurant-id="${id}">${label}</a>`;
  }
  const dist = estimateDistanceMeters(r.id);
  const { min, max } = priceRange(r.menu);
  const img = getRestaurantImage(r.cuisine);
  return `<button type="button" class="chat-restaurant-card" data-restaurant-id="${id}">
    <img src="${img}" alt="" loading="lazy" />
    <span class="chat-card-body">
      <span class="chat-card-name">${r.name}</span>
      <span class="chat-card-meta">★ ${r.rating} · ${dist}m · ${formatPriceShort(min)} – ${formatPriceShort(max)}</span>
    </span>
  </button>`;
}

export function formatChatHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(restaurant:([^)]+)\)/g, (_, label, id) =>
      restaurantCardHtml(id, label)
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

/** @deprecated use formatChatHtml */
export function formatMarkdownSimple(text: string): string {
  return formatChatHtml(text);
}

export { getRestaurantById };
