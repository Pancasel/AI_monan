import { useMemo } from "react";
import { RESTAURANTS } from "../data/restaurants";
import { applyNearbyCoords, sortByDistance } from "../lib/nearbyRestaurants";
import { loadConfirmations } from "../lib/storage";
import type { Restaurant } from "../types";

export function useRestaurants(
  refreshKey = 0,
  userLocation: [number, number] | null = null
): Restaurant[] {
  return useMemo(() => {
    void refreshKey;
    const confirmations = loadConfirmations();
    let list = RESTAURANTS.map((r) => ({
      ...r,
      menu: r.menu.map((d) => {
        const c = confirmations.find(
          (x) => x.restaurantId === r.id && x.dishId === d.id
        );
        if (!c) return d;
        return {
          ...d,
          confirmed: true,
          confirmedContainsAllergen: c.containsAllergen,
        };
      }),
    }));

    if (userLocation) {
      const [lat, lng] = userLocation;
      list = sortByDistance(applyNearbyCoords(list, lat, lng), lat, lng);
    }

    return list;
  }, [refreshKey, userLocation?.[0], userLocation?.[1]]);
}
