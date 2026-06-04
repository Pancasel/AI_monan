import { RESTAURANTS, getRestaurantById } from "../data/restaurants";
import { ALLERGEN_OPTIONS } from "../data/allergens";
import { rankRestaurants } from "./allergy";
import {
  estimateDistanceMeters,
  formatPriceShort,
  getRestaurantImage,
  priceRange,
} from "./restaurantUi";
import type { Restaurant, UserProfile } from "../types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  html?: boolean;
}

export type QuestionKind =
  | "suggest"
  | "ingredients"
  | "dish"
  | "rating"
  | "chay"
  | "allergy"
  | "general";

const NO_DATA_REPLY =
  "Mình chưa có thông tin chi tiết về món này trong hệ thống. Bạn thử hỏi tên món cụ thể hơn (vd: \"Bún chả Hà Nội\", \"Phở bò tái\") hoặc hỏi \"Gợi ý quán phù hợp với tui\" nhé.";

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFC");
}

const CUISINE_KEYWORDS: { keywords: string[]; filter: (r: Restaurant) => boolean }[] = [
  {
    keywords: ["bún bò", "bun bo", "bún bò huế"],
    filter: (r) => normalize(r.cuisine).includes("bún bò") || normalize(r.name).includes("bún bò"),
  },
  {
    keywords: ["bún chả", "bun cha"],
    filter: (r) => normalize(r.cuisine).includes("bún chả") || normalize(r.name).includes("bún chả"),
  },
  {
    keywords: ["bún đậu", "bun dau"],
    filter: (r) => normalize(r.cuisine).includes("bún đậu") || normalize(r.name).includes("bún đậu"),
  },
  {
    keywords: ["bún", "bun"],
    filter: (r) =>
      normalize(r.cuisine).includes("bún") ||
      normalize(r.name).includes("bún") ||
      r.menu.some((d) => normalize(d.name).startsWith("bún")),
  },
  {
    keywords: ["phở", "pho"],
    filter: (r) =>
      normalize(r.cuisine).includes("phở") ||
      normalize(r.name).includes("phở") ||
      r.menu.some((d) => normalize(d.name).includes("phở")),
  },
  {
    keywords: ["cơm", "com"],
    filter: (r) => normalize(r.cuisine).includes("cơm") || r.menu.some((d) => normalize(d.name).includes("cơm")),
  },
  {
    keywords: ["bánh mì", "banh mi"],
    filter: (r) =>
      normalize(r.cuisine).includes("bánh mì") ||
      r.menu.some((d) => normalize(d.name).includes("bánh mì")),
  },
  {
    keywords: ["lẩu", "lau"],
    filter: (r) => normalize(r.cuisine).includes("lẩu") || r.menu.some((d) => normalize(d.name).includes("lẩu")),
  },
  {
    keywords: ["hải sản", "hai san", "ốc", "oc"],
    filter: (r) =>
      normalize(r.cuisine).includes("hải sản") ||
      normalize(r.cuisine).includes("ốc") ||
      normalize(r.name).includes("hải sản"),
  },
  {
    keywords: ["nhậu", "nhau", "bia"],
    filter: (r) => normalize(r.cuisine).includes("nhậu") || normalize(r.name).includes("bia"),
  },
];

function matchCuisineFilter(text: string): ((r: Restaurant) => boolean) | null {
  const t = normalize(text);
  for (const { keywords, filter } of CUISINE_KEYWORDS) {
    if (keywords.some((kw) => t.includes(kw))) return filter;
  }
  return null;
}

function findDishByName(query: string) {
  const q = normalize(query);
  const qWords = q.split(/\s+/).filter((w) => w.length > 2);

  let best: { restaurant: Restaurant; dish: (typeof RESTAURANTS)[0]["menu"][0]; score: number } | null =
    null;

  for (const r of RESTAURANTS) {
    for (const dish of r.menu) {
      const dn = normalize(dish.name);
      let score = 0;
      if (dn === q || q === dn) score = 100;
      else if (dn.includes(q) && q.length >= 4) score = 80;
      else if (q.includes(dn)) score = 70;
      else if (qWords.some((w) => dn.includes(w))) score = 50;
      else if (qWords.filter((w) => dn.includes(w)).length >= 2) score = 60;

      if (score > 0 && (!best || score > best.score)) {
        best = { restaurant: r, dish, score };
      }
    }
  }
  return best ? { restaurant: best.restaurant, dish: best.dish } : null;
}

function findDishesAcrossRestaurants(dishKeyword: string, limit = 5) {
  const q = normalize(dishKeyword);
  const results: { restaurant: Restaurant; dish: (typeof RESTAURANTS)[0]["menu"][0] }[] = [];
  for (const r of RESTAURANTS) {
    for (const dish of r.menu) {
      if (normalize(dish.name).includes(q)) {
        results.push({ restaurant: r, dish });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}

function allergyLabels(profile: UserProfile): string {
  return profile.allergies
    .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(", ");
}

export function classifyQuestion(text: string): QuestionKind {
  const t = normalize(text);

  if (
    t.includes("top rating") ||
    t.includes("rating cao") ||
    t.includes("đánh giá cao") ||
    t.includes("quán ngon nhất") ||
    t.includes("quán tốt nhất")
  ) {
    return "rating";
  }

  if (
    (t.includes("chay") || t.includes("món chay") || t.includes("quán chay") || t.includes("ăn chay")) &&
    !t.includes("không chay")
  ) {
    return "chay";
  }

  if (
    t.includes("dị ứng") ||
    t.includes("di ung") ||
    t.includes("tui dị ứng") ||
    t.includes("tôi dị ứng") ||
    t.includes("mình dị ứng")
  ) {
    return "allergy";
  }

  if (
    t.includes("nguyên liệu") ||
    t.includes("thành phần") ||
    t.includes("có gì trong") ||
    (t.includes("có gì") && (t.includes("món") || t.includes("phở") || t.includes("bún") || t.includes("cơm")))
  ) {
    return "ingredients";
  }

  const cuisineFilter = matchCuisineFilter(t);
  const isSuggestIntent =
    t.includes("nhà hàng") ||
    t.includes("quán") ||
    t.includes("gợi ý") ||
    t.includes("phù hợp") ||
    t.includes("phu hop") ||
    t.includes("hợp với tui") ||
    t.includes("hop voi tui") ||
    t.includes("ăn ở đâu") ||
    t.includes("đi đâu");

  if (isSuggestIntent || cuisineFilter) {
    return "suggest";
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

function formatRestaurantList(
  ranked: ReturnType<typeof rankRestaurants>,
  profile: UserProfile,
  intro: string
): string {
  if (ranked.length === 0) {
    return "Mình chưa tìm thấy quán phù hợp với yêu cầu này. Thử hỏi \"Gợi ý quán phù hợp với tui\" hoặc chọn loại món cụ thể nhé.";
  }
  const allergyNote =
    profile.allergies.length > 0 ? ` (lọc theo dị ứng: ${allergyLabels(profile)})` : "";
  const lines = ranked.slice(0, 8).map((item, i) => {
    const pct = Math.round(item.score * 100);
    const { restaurant: r } = item;
    return `${i + 1}. [${r.name}](restaurant:${r.id}) — ${pct}% món phù hợp · ${r.district} · ⭐ ${r.rating}`;
  });
  return `${intro}${allergyNote}:\n\n${lines.join("\n")}\n\nBấm tên quán để xem trên bản đồ và chỉ đường.`;
}

export function generateAiReply(userText: string, profile: UserProfile): string {
  const kind = classifyQuestion(userText);
  const t = normalize(userText);

  if (kind === "allergy") {
    if (profile.allergies.length === 0) {
      return "Bạn chưa khai báo dị ứng nào. Bấm ⚙️ ở góc chat để cập nhật hồ sơ dị ứng nhé.";
    }
    const labels = allergyLabels(profile);
    const ranked = rankRestaurants(RESTAURANTS, profile);
    const top = ranked.slice(0, 5);
    const lines = top.map(
      (item, i) =>
        `${i + 1}. [${item.restaurant.name}](restaurant:${item.restaurant.id}) — ${Math.round(item.score * 100)}% món an toàn`
    );
    return `Theo hồ sơ, bạn dị ứng: **${labels}**.\n\nQuán phù hợp nhất:\n${lines.join("\n")}\n\nMón xanh = an toàn, đỏ = tránh, vàng = cần hỏi quán xác nhận.`;
  }

  if (kind === "rating") {
    const sorted = [...RESTAURANTS].sort((a, b) => b.rating - a.rating).slice(0, 8);
    const lines = sorted.map(
      (r, i) => `${i + 1}. [${r.name}](restaurant:${r.id}) — ⭐ ${r.rating} · ${r.cuisine} · ${r.district}`
    );
    return `Top quán rating cao nhất Hà Nội:\n\n${lines.join("\n")}\n\nBấm tên quán để xem chi tiết trên bản đồ.`;
  }

  if (kind === "chay") {
    const chayRestaurants = RESTAURANTS.filter(
      (r) => normalize(r.cuisine).includes("chay") || normalize(r.name).includes("chay")
    );
    const ranked = rankRestaurants(chayRestaurants, profile);
    return formatRestaurantList(
      ranked,
      profile,
      "Quán chay phù hợp với bạn"
    );
  }

  if (kind === "suggest") {
    const districtMatch = t.match(
      /(hoàn kiếm|ba đình|cầu giấy|đống đa|tây hồ|hai bà trưng|hà nội)/
    );
    const filter = districtMatch
      ? districtMatch[1]
      : t.includes("hà nội")
        ? "hà nội"
        : undefined;

    let list = RESTAURANTS;
    const cuisineFilter = matchCuisineFilter(t);
    if (cuisineFilter) {
      list = list.filter(cuisineFilter);
    }

    const ranked = rankRestaurants(list, profile, filter);
    const cuisineNote = cuisineFilter ? " theo loại món bạn hỏi" : "";
    return formatRestaurantList(ranked, profile, `Gợi ý nhà hàng${cuisineNote}`);
  }

  if (kind === "ingredients") {
    const found = findDishByName(userText);
    if (!found) {
      const partial = findDishesAcrossRestaurants(
        t.replace(/nguyên liệu|thành phần|có gì|gồm|\?/g, "").trim(),
        3
      );
      if (partial.length > 0) {
        const lines = partial.map(
          ({ dish, restaurant }) =>
            `• **${dish.name}** tại [${restaurant.name}](restaurant:${restaurant.id}): ${dish.ingredients.join(", ")}`
        );
        return `Mình tìm thấy các món liên quan:\n\n${lines.join("\n")}`;
      }
      return NO_DATA_REPLY;
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
    const cuisineFilter = matchCuisineFilter(t);
    if (cuisineFilter) {
      const filtered = RESTAURANTS.filter(cuisineFilter);
      const ranked = rankRestaurants(filtered, profile);
      return formatRestaurantList(ranked, profile, "Quán có món bạn hỏi");
    }
    return NO_DATA_REPLY;
  }

  const name = profile.name ? ` ${profile.name}` : "";
  const allergyInfo =
    profile.allergies.length > 0
      ? `\n\nMình nhớ bạn dị ứng: **${allergyLabels(profile)}**.`
      : "";
  return `Xin chào${name}! Mình có thể gợi ý quán theo dị ứng, tra nguyên liệu món, hoặc tìm quán chay / top rating.${allergyInfo}\n\nThử hỏi: "Gợi ý quán bún phù hợp", "Cơm gà có nguyên liệu gì?", hoặc "Top rating".`;
}

/** Gợi ý động theo hồ sơ — chỉ hiện câu hỏi thực sự hữu ích */
export function getDynamicSuggestions(profile: UserProfile): string[] {
  const suggestions: string[] = [];

  if (profile.allergies.length > 0) {
    const first = ALLERGEN_OPTIONS.find((a) => a.id === profile.allergies[0])?.label;
    suggestions.push(`Quán phù hợp (dị ứng ${first}${profile.allergies.length > 1 ? "…" : ""})`);
  } else {
    suggestions.push("Gợi ý quán phù hợp với tui");
  }

  suggestions.push("Gợi ý quán chay");
  suggestions.push("Top rating cao nhất");

  if (!profile.allergies.includes("ca")) {
    suggestions.push("Cơm gà có nguyên liệu gì?");
  } else {
    suggestions.push("Món nào không có cá?");
  }

  return suggestions.slice(0, 4);
}

function restaurantCardHtml(id: string, label: string): string {
  const r = getRestaurantById(id);
  if (!r) {
    return `<a href="#" class="restaurant-link" data-restaurant-id="${id}">${label}</a>`;
  }
  const dist = estimateDistanceMeters(r.id);
  const { min, max } = priceRange(r.menu);
  const img = r.image || getRestaurantImage(r.cuisine, r.id);
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
