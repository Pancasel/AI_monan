import type { Restaurant } from "../types";
import { estimateDistanceMeters } from "./restaurantUi";

/** Đặt quán xung quanh vị trí người dùng (giả lập quán gần bạn) */
export function applyNearbyCoords(
  restaurants: Restaurant[],
  userLat: number,
  userLng: number
): Restaurant[] {
  return restaurants.map((r, i) => {
    let hash = i * 31;
    for (let j = 0; j < r.id.length; j++) hash = (hash * 17 + r.id.charCodeAt(j)) % 997;
    const angle = ((hash % 360) * Math.PI) / 180;
    const distKm = 0.25 + (hash % 55) / 100;
    const latOff = (distKm * Math.cos(angle)) / 111;
    const lngOff =
      (distKm * Math.sin(angle)) / (111 * Math.cos((userLat * Math.PI) / 180));
    return {
      ...r,
      lat: userLat + latOff,
      lng: userLng + lngOff,
    };
  });
}

export function sortByDistance(
  restaurants: Restaurant[],
  userLat: number,
  userLng: number
): Restaurant[] {
  return [...restaurants].sort(
    (a, b) =>
      estimateDistanceMeters(a.id, userLat, userLng, a.lat, a.lng) -
      estimateDistanceMeters(b.id, userLat, userLng, b.lat, b.lng)
  );
}
