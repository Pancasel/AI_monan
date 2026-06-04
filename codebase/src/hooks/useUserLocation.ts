import { useEffect, useState } from "react";

export const DEFAULT_LOCATION: [number, number] = [21.0285, 105.8542];

export function useUserLocation(): [number, number] | null {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(DEFAULT_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation(DEFAULT_LOCATION),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return userLocation;
}
