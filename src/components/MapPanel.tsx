import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types";

const USER_LOCATION: [number, number] = [21.0285, 105.8542];

function createPinIcon(isSelected: boolean) {
  return L.divIcon({
    className: "map-pin-wrap",
    html: `<button type="button" class="map-pin ${isSelected ? "selected" : ""}" aria-label="Chọn quán"></button>`,
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
}

export function MapPanel({ restaurants, selectedId, onSelect }: MapPanelProps) {
  const [search, setSearch] = useState("");
  const selected = restaurants.find((r) => r.id === selectedId);

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
        <span className="map-count">{visible.length} quán trên bản đồ</span>
      </div>

      <div className="map-wrap">
        <MapContainer
          center={USER_LOCATION}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <CircleMarker
            center={USER_LOCATION}
            radius={8}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 1, weight: 3 }}
          />
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
