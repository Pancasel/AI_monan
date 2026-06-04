import { googleMapsDirectionsUrl } from "../lib/restaurantUi";
import type { Restaurant } from "../types";

interface RestaurantDirectionsFooterProps {
  restaurant: Restaurant;
  userLocation: [number, number] | null;
  travelLabel?: string | null;
  routeLoading: boolean;
  onShowRouteOnMap: () => void;
}

export function RestaurantDirectionsFooter({
  restaurant,
  userLocation,
  travelLabel,
  routeLoading,
  onShowRouteOnMap,
}: RestaurantDirectionsFooterProps) {
  return (
    <footer className="menu-directions-footer" aria-label="Chỉ đường">
      {travelLabel && (
        <p className="menu-dir-travel" title="Thời gian đi từ vị trí của bạn">
          🚗 {travelLabel}
        </p>
      )}
      <div className="menu-dir-actions">
        <button
          type="button"
          className="dir-btn"
          disabled={routeLoading || !userLocation}
          onClick={onShowRouteOnMap}
        >
          {routeLoading ? "Đang tính…" : "🗺 Chỉ đường trên bản đồ"}
        </button>
        <a
          className="dir-btn dir-link"
          href={googleMapsDirectionsUrl(
            restaurant.lat,
            restaurant.lng,
            restaurant.name,
            userLocation?.[0],
            userLocation?.[1]
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          Mở Google Maps
        </a>
      </div>
    </footer>
  );
}
