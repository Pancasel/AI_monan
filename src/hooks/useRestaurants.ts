import { useMemo } from "react";
import { RESTAURANTS } from "../data/restaurants";
import { loadConfirmations } from "../lib/storage";
import type { Restaurant } from "../types";

export function useRestaurants(refreshKey = 0): Restaurant[] {
  return useMemo(() => {
    void refreshKey;
    const confirmations = loadConfirmations();
    return RESTAURANTS.map((r) => ({
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
  }, [refreshKey]);
}
