import { ALLERGEN_OPTIONS } from "../data/allergens";
import type {
  AllergenId,
  Dish,
  Restaurant,
  RestaurantScore,
  TaggedDish,
  UserProfile,
} from "../types";

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFC");
}

function dishText(dish: Dish): string {
  return normalize(`${dish.name} ${dish.ingredients.join(" ")}`);
}

function matchesKeyword(text: string, keyword: string): boolean {
  const k = normalize(keyword);
  return text.includes(k);
}

export function detectAllergensInDish(
  dish: Dish,
  allergyIds: AllergenId[]
): AllergenId[] {
  const text = dishText(dish);
  const found: AllergenId[] = [];
  for (const id of allergyIds) {
    const opt = ALLERGEN_OPTIONS.find((a) => a.id === id);
    if (!opt) continue;
    if (opt.keywords.some((kw) => matchesKeyword(text, kw))) {
      found.push(id);
    }
  }
  return found;
}

export function isAmbiguousDishName(dish: Dish): boolean {
  const name = normalize(dish.name);
  const vague = ["cá", "món cá", "món biển", "sandwich cá", "lẩu cá", "cá kho", "cá nấu"];
  const exactVague = vague.some((v) => name === v || name.startsWith(v + " ") || name.includes("mơ hồ") || name.includes("theo ngày"));
  const hasFishWord = name.includes("cá") && !name.includes("chả cá") && !name.includes("cá basa") && !name.includes("cá lóc") && !name.includes("cá kèo");
  if (dish.confirmed !== undefined) return false;
  if (exactVague) return true;
  if (hasFishWord && dish.ingredients.length <= 4) return true;
  return false;
}

function needsRestaurantConfirm(dish: Dish, profile: UserProfile): boolean {
  if (dish.confirmed) return false;
  if (dish.ambiguous) return true;
  if (profile.allergies.length === 0) return false;
  return isAmbiguousDishName(dish);
}

export function tagDish(dish: Dish, profile: UserProfile): TaggedDish {
  if (profile.allergies.length === 0) {
    return { ...dish, tag: "green", tagReason: "Bạn chưa khai báo dị ứng — món hiển thị bình thường." };
  }

  if (needsRestaurantConfirm(dish, profile)) {
    return {
      ...dish,
      tag: "yellow",
      tagReason: buildConfirmQuestion(dish, profile),
    };
  }

  if (dish.confirmed) {
    if (dish.confirmedContainsAllergen) {
      const labels = profile.allergies
        .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id)?.label)
        .filter(Boolean)
        .join(", ");
      return {
        ...dish,
        tag: "red",
        tagReason: `Nhà hàng xác nhận có chất dị ứng (${labels}).`,
      };
    }
    return { ...dish, tag: "green", tagReason: "Nhà hàng đã xác nhận: không chứa dị ứng của bạn." };
  }

  const detected = detectAllergensInDish(dish, profile.allergies);
  if (detected.length > 0) {
    const labels = detected
      .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id)?.label)
      .join(", ");
    return {
      ...dish,
      tag: "red",
      tagReason: `Có thể chứa: ${labels} (theo tên món / nguyên liệu).`,
    };
  }

  return { ...dish, tag: "green", tagReason: "Không phát hiện dị ứng trong tên món và nguyên liệu." };
}

export function tagMenu(menu: Dish[], profile: UserProfile): TaggedDish[] {
  return menu.map((d) => tagDish(d, profile));
}

export function scoreRestaurant(restaurant: Restaurant, profile: UserProfile): RestaurantScore {
  const tagged = tagMenu(restaurant.menu, profile);
  const totalCount = tagged.length;
  const safeCount = tagged.filter((d) => d.tag === "green").length;
  const score = totalCount === 0 ? 0 : safeCount / totalCount;
  return { restaurant, score, safeCount, totalCount };
}

export function rankRestaurants(
  restaurants: Restaurant[],
  profile: UserProfile,
  districtFilter?: string
): RestaurantScore[] {
  let list = restaurants;
  if (districtFilter) {
    const q = normalize(districtFilter);
    list = list.filter(
      (r) =>
        normalize(r.district).includes(q) ||
        normalize(r.address).includes(q) ||
        normalize("hà nội").includes(q) && q.includes("hà nội")
    );
  }
  return list
    .map((r) => scoreRestaurant(r, profile))
    .sort((a, b) => b.score - a.score || b.safeCount - a.safeCount);
}

export function buildConfirmQuestion(dish: Dish, profile: UserProfile): string {
  const text = dishText(dish);
  const name = normalize(dish.name);

  if (name.includes("cá") && profile.allergies.includes("ca")) {
    return `Món "${dish.name}" dùng loại cá gì? (cá thu, basa, hồi…). Nhờ quán xác nhận trước khi gọi.`;
  }

  const related = profile.allergies
    .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id))
    .filter((opt): opt is (typeof ALLERGEN_OPTIONS)[number] =>
      Boolean(opt && opt.keywords.some((kw) => matchesKeyword(text, kw) || matchesKeyword(normalize(dish.name), kw)))
    );

  if (related.length === 1) {
    const label = related[0].label.toLowerCase();
    return `Món "${dish.name}" có chứa ${label} không? Nhờ quán xác nhận thành phần.`;
  }

  const labels = profile.allergies
    .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(", ");
  return `Món "${dish.name}" có chứa ${labels} không? Vui lòng xác nhận thành phần với quán.`;
}
