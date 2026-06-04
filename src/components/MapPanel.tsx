import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types";
import { DEFAULT_LOCATION } from "../hooks/useUserLocation";
import { useTravelTime } from "../hooks/useTravelTime";
import { googleMapsDirectionsUrl, markerColor } from "../lib/restaurantUi";

function createPinIcon(isSelected: boolean) {
  const color = markerColor(undefined, isSelected);
  return L.divIcon({
    className: "map-pin-wrap",
    html: `<button type="button" class="map-pin ${isSelected ? "selected" : ""}" style="background:${color}" aria-label="Chọn quán"></button>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom ?? 16, { duration: 0.75 });
  }, [lat, lng, zoom, map]);
  return null;
}

function FlyToUser({ location, zoom = 15 }: { location: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(location, zoom, { duration: 0.85 });
  }, [location[0], location[1], zoom, map]);
  return null;
}

function RestaurantMarker({
  restaurant,
  isSelected,
  onSelect,
}: {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.setZIndexOffset(2000);
    }
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[restaurant.lat, restaurant.lng]}
      icon={createPinIcon(isSelected)}
      zIndexOffset={isSelected ? 2000 : 0}
      eventHandlers={{
        click: () => onSelect(restaurant.id),
      }}
    />
  );
}

interface MapPanelProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation: [number, number] | null;
}

export function MapPanel({ restaurants, selectedId, onSelect, userLocation }: MapPanelProps) {
  const [search, setSearch] = useState("");
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(false);

  const selected = restaurants.find((r) => r.id === selectedId);
  const { label: travelLabel } = useTravelTime(userLocation, selected);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
    );
  }, [restaurants, search]);

  const fetchRoute = useCallback(async () => {
    if (!selected || !userLocation) return;
    setRouteLoading(true);
    try {
      const [uLat, uLng] = userLocation;
      const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${selected.lng},${selected.lat}?overview=full&geometries=geojson`;
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
  }, [selected, userLocation]);

  useEffect(() => {
    setRouteCoords([]);
    setShowDirections(false);
  }, [selectedId]);

  const mapCenter = userLocation ?? DEFAULT_LOCATION;

  return (
    <div className="map-panel">
      <div className="map-toolbar">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm quán, khu vực..."
          className="map-search"
        />
        <span className="map-count">{visible.length} quán gần bạn</span>
      </div>

      {selected && (
        <div className="map-directions-bar">
          {travelLabel && (
            <span className="map-travel-time" title="Thời gian đi từ vị trí của bạn">
              🚗 {travelLabel}
            </span>
          )}
          <button
            type="button"
            className="map-dir-btn"
            disabled={routeLoading || !userLocation}
            onClick={fetchRoute}
          >
            {routeLoading ? "Đang tính…" : "🗺 Chỉ đường trên bản đồ"}
          </button>
          <a
            className="map-dir-btn map-dir-link"
            href={googleMapsDirectionsUrl(
              selected.lat,
              selected.lng,
              selected.name,
              userLocation?.[0],
              userLocation?.[1]
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở Google Maps
          </a>
        </div>
      )}

      <div className="map-wrap">
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; Google-style via <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <CircleMarker
            center={mapCenter}
            radius={9}
            pathOptions={{
              color: "#4285F4",
              fillColor: "#4285F4",
              fillOpacity: 1,
              weight: 3,
            }}
          />
          {showDirections && routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "#7B1FA2", weight: 5, opacity: 0.85 }}
            />
          )}
          {userLocation && !selectedId && <FlyToUser location={userLocation} />}
          {selected && <FlyTo lat={selected.lat} lng={selected.lng} />}
          {visible.map((r) => (
            <RestaurantMarker
              key={r.id}
              restaurant={r}
              isSelected={selectedId === r.id}
              onSelect={onSelect}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
