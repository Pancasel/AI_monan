import { useState, useCallback } from "react";
import { useRestaurants } from "../hooks/useRestaurants";
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
  const restaurants = useRestaurants(dataVersion);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);
  const [menuKey, setMenuKey] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  const refreshRestaurants = useCallback(() => {
    setDataVersion((v) => v + 1);
    setMenuKey((k) => k + 1);
  }, []);

  const selectedRestaurant = selectedId
    ? restaurants.find((r) => r.id === selectedId)
    : null;

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
            onFocusRestaurant={handleSelectRestaurant}
            externalPrompt={chatPrompt}
            onExternalPromptConsumed={() => setChatPrompt(null)}
            onLogout={handleLogout}
            onEditProfile={() => setShowProfile(true)}
          />
        </aside>

        <main className="panel-map-area" aria-label="Bản đồ và thực đơn">
          <MapPanel
            restaurants={restaurants}
            selectedId={selectedId}
            onSelect={handleSelectRestaurant}
          />
          {selectedRestaurant && (
            <RestaurantMenuPanel
              key={`${selectedRestaurant.id}-${menuKey}`}
              restaurant={selectedRestaurant}
              profile={profile}
              onClose={() => setSelectedId(null)}
              onAskAi={(q) => setChatPrompt(q)}
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
