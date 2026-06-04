import { useCallback, useEffect, useState } from "react";
import type { Restaurant } from "../types";

export function useMapRoute(
  userLocation: [number, number] | null,
  restaurant: Restaurant | null | undefined
) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);

  const fetchRoute = useCallback(async () => {
    if (!restaurant || !userLocation) return;
    setRouteLoading(true);
    try {
      const [uLat, uLng] = userLocation;
      const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${restaurant.lng},${restaurant.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        routes?: { geometry?: { coordinates?: [number, number][] } }[];
      };
      const coords = data.routes?.[0]?.geometry?.coordinates;
      if (coords) {
        setRouteCoords(coords.map(([lng, lat]) => [lat, lng] as [number, number]));
        setShowDirections(true);
      }
    } catch {
      setRouteCoords([]);
    } finally {
      setRouteLoading(false);
    }
  }, [restaurant, userLocation]);

  useEffect(() => {
    setRouteCoords([]);
    setShowDirections(false);
  }, [restaurant?.id]);

  return { routeCoords, showDirections, routeLoading, fetchRoute };
}
