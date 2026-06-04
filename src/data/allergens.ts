import type { AllergenOption } from "../types";

export const ALLERGEN_OPTIONS: AllergenOption[] = [
  { id: "ca", label: "Cá", keywords: ["cá", "cá thu", "cá basa", "cá hồi", "cá nấu", "cá kho", "cá chiên", "mắm cá", "nước mắm"] },
  { id: "tom", label: "Tôm", keywords: ["tôm", "tôm sú", "tôm càng", "tôm khô", "mắm tôm"] },
  { id: "cua", label: "Cua / ghẹ", keywords: ["cua", "ghẹ", "cua đồng", "ghẹ rang"] },
  { id: "so", label: "Sò / ốc / hải sản vỏ", keywords: ["sò", "ốc", "nghêu", "hến", "sứa", "mực"] },
  { id: "dau-phong", label: "Đậu phộng", keywords: ["đậu phộng", "lạc", "bơ lạc", "sốt lạc"] },
  { id: "sua", label: "Sữa / phô mai", keywords: ["sữa", "phô mai", "bơ sữa", "kem", "sữa đặc", "sữa tươi"] },
  { id: "trung", label: "Trứng", keywords: ["trứng", "trứng gà", "trứng vịt", "trứng cút", "ốp la"] },
  { id: "gluten", label: "Gluten / mì / bánh mì", keywords: ["mì", "bánh mì", "bột mì", "hoành thánh", "bún", "phở", "bánh phở"] },
  { id: "dau-nanh", label: "Đậu nành", keywords: ["đậu nành", "đậu hũ", "tương", "xì dầu", "miso"] },
];
