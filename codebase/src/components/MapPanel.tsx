import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types";
import { DEFAULT_LOCATION } from "../hooks/useUserLocation";
import { markerColor } from "../lib/restaurantUi";

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
  routeCoords: [number, number][];
  showDirections: boolean;
}

export function MapPanel({
  restaurants,
  selectedId,
  onSelect,
  userLocation,
  routeCoords,
  showDirections,
}: MapPanelProps) {
  const selected = restaurants.find((r) => r.id === selectedId);
  const mapCenter = userLocation ?? DEFAULT_LOCATION;

  return (
    <div className="map-panel">
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
          {restaurants.map((r) => (
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
