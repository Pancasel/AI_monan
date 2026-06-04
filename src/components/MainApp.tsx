import { useState, useCallback } from "react";
import { useRestaurants } from "../hooks/useRestaurants";
import { useUserLocation } from "../hooks/useUserLocation";
import { useTravelTime } from "../hooks/useTravelTime";
import { clearAuth } from "../lib/storage";
import type { UserProfile } from "../types";
import { ChatPanel } from "./ChatPanel";
import { MapPanel } from "./MapPanel";
import { RestaurantMenuPanel } from "./RestaurantMenuPanel";
import { ProfileSettings } from "./ProfileSettings";

interface MainAppProps {
  profile: UserProfile;
  onLogout: () => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function MainApp({ profile, onLogout, onProfileUpdate }: MainAppProps) {
  const [dataVersion, setDataVersion] = useState(0);
  const userLocation = useUserLocation();
  const restaurants = useRestaurants(dataVersion, userLocation);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuKey, setMenuKey] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const refreshRestaurants = useCallback(() => {
    setDataVersion((v) => v + 1);
    setMenuKey((k) => k + 1);
  }, []);

  const selectedRestaurant = selectedId
    ? restaurants.find((r) => r.id === selectedId)
    : null;

  const { label: travelLabel } = useTravelTime(userLocation, selectedRestaurant);

  const handleSelectRestaurant = (id: string) => {
    setSelectedId(id);
  };

  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  const handleProfileSave = (updated: UserProfile) => {
    onProfileUpdate(updated);
    refreshRestaurants();
  };

  return (
    <div className="foodmap-app">
      <div className="foodmap-layout">
        <aside className="panel-chat" aria-label="FoodMap Assistant">
          <ChatPanel
            profile={profile}
            userLocation={userLocation}
            onFocusRestaurant={handleSelectRestaurant}
            onLogout={handleLogout}
            onEditProfile={() => setShowProfile(true)}
          />
        </aside>

        <main className="panel-map-area" aria-label="Bản đồ và thực đơn">
          <MapPanel
            restaurants={restaurants}
            selectedId={selectedId}
            onSelect={handleSelectRestaurant}
            userLocation={userLocation}
          />
          {selectedRestaurant && (
            <RestaurantMenuPanel
              key={`${selectedRestaurant.id}-${menuKey}`}
              restaurant={selectedRestaurant}
              profile={profile}
              travelLabel={travelLabel}
              onClose={() => setSelectedId(null)}
              onMenuUpdated={refreshRestaurants}
            />
          )}
        </main>
      </div>

      {showProfile && (
        <ProfileSettings
          profile={profile}
          onSave={handleProfileSave}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
