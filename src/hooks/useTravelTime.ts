import { useEffect, useMemo, useState } from "react";
import type { Restaurant } from "../types";
import { estimateDistanceMeters, formatTravelTime } from "../lib/restaurantUi";

export function useTravelTime(
  userLocation: [number, number] | null,
  restaurant: Restaurant | null | undefined
) {
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const distanceM = useMemo(() => {
    if (!userLocation || !restaurant) return null;
    return estimateDistanceMeters(
      restaurant.id,
      userLocation[0],
      userLocation[1],
      restaurant.lat,
      restaurant.lng
    );
  }, [userLocation, restaurant]);

  useEffect(() => {
    if (!userLocation || !restaurant) {
      setDurationSec(null);
      return;
    }
    const [uLat, uLng] = userLocation;
    let cancelled = false;
    setLoading(true);
    const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${restaurant.lng},${restaurant.lat}?overview=false`;
    fetch(url)
      .then((res) => res.json())
      .then((data: { routes?: { duration?: number }[] }) => {
        if (cancelled) return;
        const sec = data.routes?.[0]?.duration;
        setDurationSec(sec != null ? Math.round(sec) : null);
      })
      .catch(() => {
        if (!cancelled) setDurationSec(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userLocation, restaurant?.id, restaurant?.lat, restaurant?.lng]);

  const label = useMemo(() => {
    if (distanceM == null) return null;
    return formatTravelTime(distanceM, durationSec ?? undefined);
  }, [distanceM, durationSec]);

  return { distanceM, durationSec, label, loading };
}
