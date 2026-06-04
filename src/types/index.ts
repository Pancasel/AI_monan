export type AllergenId =
  | "ca"
  | "tom"
  | "cua"
  | "so"
  | "dau-phong"
  | "sua"
  | "trung"
  | "gluten"
  | "dau-nanh";

export interface AllergenOption {
  id: AllergenId;
  label: string;
  keywords: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  allergies: AllergenId[];
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  /** Tên mơ hồ — cần nhà hàng xác nhận (nhãn vàng) */
  ambiguous?: boolean;
  /** Nhà hàng đã xác nhận thành phần (cho món vàng) */
  confirmed?: boolean;
  /** Ghi đè sau khi nhà hàng xác nhận */
  confirmedContainsAllergen?: boolean;
}

export type DishTag = "green" | "red" | "yellow";

export interface TaggedDish extends Dish {
  tag: DishTag;
  tagReason: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  district: string;
  cuisine: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  rating: number;
  menu: Dish[];
}

export interface RestaurantScore {
  restaurant: Restaurant;
  score: number;
  safeCount: number;
  totalCount: number;
}

export interface PendingQuestion {
  dishId: string;
  restaurantId: string;
  question: string;
}
