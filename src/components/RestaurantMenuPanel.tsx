import { tagMenu, buildConfirmQuestion } from "../lib/allergy";
import { saveConfirmation } from "../lib/storage";
import type { Restaurant, UserProfile } from "../types";
import { ImgWithFallback } from "./ImgWithFallback";

interface RestaurantMenuPanelProps {
  restaurant: Restaurant;
  profile: UserProfile;
  travelLabel?: string | null;
  onClose: () => void;
  onMenuUpdated: () => void;
}

export function RestaurantMenuPanel({
  restaurant,
  profile,
  travelLabel,
  onClose,
  onMenuUpdated,
}: RestaurantMenuPanelProps) {
  const tagged = tagMenu(restaurant.menu, profile);
  const safeCount = tagged.filter((d) => d.tag === "green").length;
  const scorePct =
    tagged.length === 0 ? 0 : Math.round((safeCount / tagged.length) * 100);

  const handleConfirm = (dishId: string, containsAllergen: boolean) => {
    saveConfirmation({
      restaurantId: restaurant.id,
      dishId,
      containsAllergen,
    });
    onMenuUpdated();
  };

  return (
    <aside className="restaurant-menu-panel" aria-label={`Menu ${restaurant.name}`}>
      <div className="menu-panel-hero">
        <ImgWithFallback src={restaurant.image} alt={restaurant.name} />
        <div className="menu-panel-hero-overlay" aria-hidden />
        <button type="button" className="menu-panel-close" onClick={onClose} aria-label="Đóng menu">
          ×
        </button>
      </div>
      <div className="menu-panel-header">
        <h2>{restaurant.name}</h2>
        <p className="menu-panel-meta">
          {restaurant.district} · ★ {restaurant.rating}
          {travelLabel && <span className="menu-panel-travel"> · 🚗 {travelLabel}</span>}
          {(profile.allergies.length > 0 || profile.customAllergyNotes?.trim()) && (
            <span className="menu-panel-score"> · {scorePct}% món phù hợp</span>
          )}
        </p>
        <p className="menu-panel-address">{restaurant.address}</p>
        {(profile.allergies.length > 0 || profile.customAllergyNotes?.trim()) && (
          <div className="menu-legend">
            <span className="legend-item">
              <span className="tag-dot green" /> Xanh — phù hợp
            </span>
            <span className="legend-item">
              <span className="tag-dot red" /> Đỏ — không phù hợp
            </span>
            <span className="legend-item">
              <span className="tag-dot yellow" /> Vàng — cần xác nhận
            </span>
          </div>
        )}
      </div>

      <div className="menu-list">
        {tagged.map((dish) => (
          <article
            key={dish.id}
            className={`menu-item tag-${dish.tag === "green" ? "green" : dish.tag === "red" ? "red" : "yellow"}`}
          >
            {dish.image && (
              <ImgWithFallback
                src={dish.image}
                alt={dish.name}
                className="menu-item-thumb"
              />
            )}
            <div className="menu-item-body">
              <div className="menu-item-top">
                <h4>
                  <span className={`menu-tag-badge ${dish.tag}`} aria-hidden />
                  {dish.name}
                </h4>
                <span className="menu-price">{dish.price.toLocaleString("vi-VN")}đ</span>
              </div>
              {dish.description && (
                <p className="menu-item-desc">{dish.description}</p>
              )}
              {(profile.allergies.length > 0 || profile.customAllergyNotes?.trim()) && (
                <p className="menu-tag-label">{dish.tagReason}</p>
              )}
              <p className="menu-ingredients">Nguyên liệu: {dish.ingredients.join(", ")}</p>

              {dish.tag === "yellow" && !dish.confirmed && profile.allergies.length > 0 && (
                <div className="confirm-box">
                  <p>
                    <strong>AI gợi ý hỏi nhà hàng:</strong> {buildConfirmQuestion(dish, profile)}
                  </p>
                  <div className="confirm-actions">
                    <button
                      type="button"
                      className="btn-safe"
                      onClick={() => handleConfirm(dish.id, false)}
                    >
                      Quán xác nhận: Không có dị ứng
                    </button>
                    <button
                      type="button"
                      className="btn-unsafe"
                      onClick={() => handleConfirm(dish.id, true)}
                    >
                      Quán xác nhận: Có dị ứng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
