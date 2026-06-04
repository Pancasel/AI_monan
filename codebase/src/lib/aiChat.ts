import { RESTAURANTS, getRestaurantById } from "../data/restaurants";
import { ALLERGEN_OPTIONS } from "../data/allergens";
import { rankRestaurants } from "./allergy";
import {
  estimateDistanceMeters,
  formatPriceShort,
  formatTravelTime,
  getRestaurantImage,
  imageFallbackAttr,
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

function dishNotFoundReply(query: string): string {
  const cleaned = query
    .replace(/nguyên liệu|thành phần|có gì|gồm|\?|món|cho tui|cho mình/gi, "")
    .trim();
  const name = cleaned.length >= 2 ? `**${cleaned}**` : "món này";
  return `Mình không tìm thấy ${name} trong dữ liệu hiện có. Bạn thử hỏi tên món khác trong menu quán gần bạn, hoặc hỏi quán phù hợp với bạn nhé.`;
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFC");
}

const OUT_OF_SCOPE_PATTERNS = [
  /code|lập trình|lap trinh|python|javascript|react|api key|openrouter|prompt hệ thống|source code|mã nguồn/,
  /thời tiết|thoi tiet|bóng đá|bong da|chính trị|chinh tri|tin tức|tin tuc/,
  /làm sao (để )?build|xây app|xay app|cách làm app|tech stack|framework/,
  /viết (bài|essay|thơ)|giải bài|toán học|vật lý|hóa học/,
];

function isOutOfScope(text: string): boolean {
  const t = normalize(text);
  return OUT_OF_SCOPE_PATTERNS.some((re) => re.test(t));
}

function outOfScopeReply(): string {
  return "Câu hỏi này nằm ngoài phạm vi của AI Món Ăn. Mình chỉ hỗ trợ gợi ý quán và món theo dị ứng của bạn.";
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
  {
    keywords: ["mì quảng", "mi quang"],
    filter: (r) =>
      normalize(r.cuisine).includes("mì quảng") ||
      r.menu.some((d) => normalize(d.name).includes("mì quảng")),
  },
  {
    keywords: ["bánh cuốn", "banh cuon"],
    filter: (r) =>
      normalize(r.cuisine).includes("bánh cuốn") ||
      r.menu.some((d) => normalize(d.name).includes("bánh cuốn")),
  },
  {
    keywords: ["bánh xèo", "banh xeo"],
    filter: (r) =>
      normalize(r.cuisine).includes("bánh xèo") ||
      r.menu.some((d) => normalize(d.name).includes("bánh xèo")),
  },
  {
    keywords: ["xôi", "xoi"],
    filter: (r) =>
      normalize(r.cuisine).includes("xôi") || r.menu.some((d) => normalize(d.name).includes("xôi")),
  },
  {
    keywords: ["nem nướng", "nem nuong"],
    filter: (r) =>
      normalize(r.cuisine).includes("nem nướng") ||
      r.menu.some((d) => normalize(d.name).includes("nem nướng")),
  },
  {
    keywords: ["chả cá", "cha ca"],
    filter: (r) =>
      normalize(r.cuisine).includes("chả cá") ||
      r.menu.some((d) => normalize(d.name).includes("chả cá")),
  },
  {
    keywords: ["chay", "ăn chay", "quán chay"],
    filter: (r) => normalize(r.cuisine).includes("chay"),
  },
  {
    keywords: ["huế", "hue"],
    filter: (r) => normalize(r.cuisine).includes("huế") || normalize(r.name).includes("huế"),
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
  const preset = profile.allergies
    .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id)?.label)
    .filter(Boolean);
  const custom = profile.customAllergyNotes?.trim();
  const parts = [...preset];
  if (custom) parts.push(custom);
  return parts.join(", ");
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
    t.includes("bánh cuốn") ||
    t.includes("bánh xèo") ||
    t.includes("mì quảng") ||
    t.includes("xôi") ||
    t.includes("nem nướng") ||
    t.includes("chả cá") ||
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
    return "Mình chưa tìm thấy quán phù hợp với yêu cầu này. Thử hỏi loại món hoặc tên quán cụ thể nhé.";
  }
  const allergyNote =
    profile.allergies.length > 0 || profile.customAllergyNotes?.trim()
      ? ` (lọc theo dị ứng: ${allergyLabels(profile)})`
      : "";
  const lines = ranked.slice(0, 8).map((item, i) => {
    const pct = Math.round(item.score * 100);
    const { restaurant: r } = item;
    return `${i + 1}. [${r.name}](restaurant:${r.id}) — ${pct}% món phù hợp · ${r.district} · ⭐ ${r.rating}`;
  });
  return `${intro}${allergyNote}:\n\n${lines.join("\n")}\n\nBấm tên quán để xem trên bản đồ và chỉ đường.`;
}

export function generateAiReply(userText: string, profile: UserProfile): string {
  if (isOutOfScope(userText)) {
    return outOfScopeReply();
  }

  const kind = classifyQuestion(userText);
  const t = normalize(userText);

  if (kind === "allergy") {
    if (profile.allergies.length === 0 && !profile.customAllergyNotes?.trim()) {
      return "Bạn chưa khai báo dị ứng nào. Bấm **Hồ sơ dị ứng** ở đầu chat để cập nhật nhé.";
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
      return dishNotFoundReply(userText);
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
    return dishNotFoundReply(userText);
  }

  const name = profile.name ? ` ${profile.name}` : "";
  const allergyInfo =
    profile.allergies.length > 0 || profile.customAllergyNotes?.trim()
      ? `\n\nMình nhớ bạn dị ứng: **${allergyLabels(profile)}**.`
      : "";
  return `Xin chào${name}! Mình gợi ý quán theo dị ứng, tra nguyên liệu món, quán chay và top rating.${allergyInfo}\n\nHỏi tên món, loại quán hoặc khu vực bạn muốn nhé.`;
}

function restaurantCardHtml(
  id: string,
  label: string,
  userCoords?: { lat: number; lng: number }
): string {
  const r = getRestaurantById(id);
  if (!r) {
    return `<a href="#" class="restaurant-link" data-restaurant-id="${id}">${label}</a>`;
  }
  const dist = estimateDistanceMeters(
    r.id,
    userCoords?.lat,
    userCoords?.lng,
    r.lat,
    r.lng
  );
  const travel = formatTravelTime(dist);
  const { min, max } = priceRange(r.menu);
  const img = r.image || getRestaurantImage(r.cuisine, r.id);
  return `<button type="button" class="chat-restaurant-card" data-restaurant-id="${id}">
    <img src="${img}" alt="" loading="lazy" ${imageFallbackAttr()} />
    <span class="chat-card-body">
      <span class="chat-card-name">${r.name}</span>
      <span class="chat-card-meta">★ ${r.rating} · ${travel} · ${formatPriceShort(min)} – ${formatPriceShort(max)}</span>
    </span>
  </button>`;
}

export function formatChatHtml(
  text: string,
  userCoords?: { lat: number; lng: number }
): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(restaurant:([^)]+)\)/g, (_, label, id) =>
      restaurantCardHtml(id, label, userCoords)
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

/** @deprecated use formatChatHtml */
export function formatMarkdownSimple(text: string): string {
  return formatChatHtml(text);
}

export { getRestaurantById };
