import { useState, useCallback, useEffect, useRef } from "react";
import { useRestaurants } from "../hooks/useRestaurants";
import { useUserLocation } from "../hooks/useUserLocation";
import { useTravelTime } from "../hooks/useTravelTime";
import { useMapRoute } from "../hooks/useMapRoute";
import { clearAuth } from "../lib/storage";
import {
  createWelcomeMessage,
  fetchRemoteSession,
  loadLocalSession,
  pickNewerSession,
  pushRemoteSession,
  saveLocalSession,
  subscribeLocalSession,
  type AppSessionState,
} from "../lib/chatSession";
import type { ChatMessage } from "../lib/aiChat";
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
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage(profile),
  ]);
  const [inputDraft, setInputDraft] = useState("");
  const sessionSyncRef = useRef(0);
  const profileKey = [
    profile.allergies.join(","),
    profile.customAllergyNotes ?? "",
  ].join("|");

  const refreshRestaurants = useCallback(() => {
    setDataVersion((v) => v + 1);
    setMenuKey((k) => k + 1);
  }, []);

  const selectedRestaurant = selectedId
    ? restaurants.find((r) => r.id === selectedId)
    : null;

  const { label: travelLabel } = useTravelTime(userLocation, selectedRestaurant);
  const { routeCoords, showDirections, routeLoading, fetchRoute } = useMapRoute(
    userLocation,
    selectedRestaurant
  );

  const persistSession = useCallback(
    (patch: Partial<AppSessionState>) => {
      const state: AppSessionState = {
        messages: patch.messages ?? messages,
        selectedId: patch.selectedId !== undefined ? patch.selectedId : selectedId,
        inputDraft: patch.inputDraft !== undefined ? patch.inputDraft : inputDraft,
        updatedAt: Date.now(),
      };
      sessionSyncRef.current = state.updatedAt;
      saveLocalSession(profile.email, state);
      void pushRemoteSession(profile.email, state);
    },
    [profile.email, messages, selectedId, inputDraft]
  );

  const applyRemoteSession = useCallback((remote: AppSessionState) => {
    if (remote.updatedAt <= sessionSyncRef.current) return;
    sessionSyncRef.current = remote.updatedAt;
    if (remote.messages.length > 0) setMessages(remote.messages);
    setSelectedId(remote.selectedId);
    setInputDraft(remote.inputDraft);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const local = loadLocalSession(profile.email);
      const remote = await fetchRemoteSession(profile.email);
      const merged = pickNewerSession(local, remote);
      if (cancelled || !merged) return;
      sessionSyncRef.current = merged.updatedAt;
      if (merged.messages.length > 0) setMessages(merged.messages);
      setSelectedId(merged.selectedId);
      setInputDraft(merged.inputDraft);
    })();

    return () => {
      cancelled = true;
    };
  }, [profile.email]);

  useEffect(() => {
    return subscribeLocalSession(profile.email, applyRemoteSession);
  }, [profile.email, applyRemoteSession]);

  useEffect(() => {
    const poll = window.setInterval(async () => {
      const remote = await fetchRemoteSession(profile.email);
      if (remote) applyRemoteSession(remote);
    }, 2000);
    return () => window.clearInterval(poll);
  }, [profile.email, applyRemoteSession]);

  useEffect(() => {
    const welcome = [createWelcomeMessage(profile)];
    setMessages(welcome);
    setInputDraft("");
    setSelectedId(null);
    sessionSyncRef.current = 0;
  }, [profileKey, profile.name]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      persistSession({});
    }, 300);
    return () => window.clearTimeout(timer);
  }, [messages, selectedId, inputDraft, persistSession]);

  const handleSelectRestaurant = useCallback(
    (id: string) => {
      setSelectedId(id);
      persistSession({ selectedId: id });
    },
    [persistSession]
  );

  const handleCloseRestaurant = useCallback(() => {
    setSelectedId(null);
    persistSession({ selectedId: null });
  }, [persistSession]);

  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  const handleProfileSave = (updated: UserProfile) => {
    onProfileUpdate(updated);
    refreshRestaurants();
  };

  const layoutClass = selectedId ? "foodmap-layout restaurant-open" : "foodmap-layout";

  return (
    <div className="foodmap-app">
      <div className={layoutClass}>
        <aside className="panel-chat" aria-label="FoodMap Assistant">
          <ChatPanel
            profile={profile}
            userLocation={userLocation}
            messages={messages}
            setMessages={setMessages}
            input={inputDraft}
            setInput={setInputDraft}
            onPersist={() => persistSession({})}
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
            routeCoords={routeCoords}
            showDirections={showDirections}
          />
          {selectedRestaurant && (
            <RestaurantMenuPanel
              key={`${selectedRestaurant.id}-${menuKey}`}
              restaurant={selectedRestaurant}
              profile={profile}
              userLocation={userLocation}
              travelLabel={travelLabel}
              routeLoading={routeLoading}
              onShowRouteOnMap={fetchRoute}
              onClose={handleCloseRestaurant}
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
