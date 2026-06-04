import { useState, useEffect } from "react";
import { Onboarding } from "./components/Onboarding";
import { MainApp } from "./components/MainApp";
import { loadAuth, loadProfile } from "./lib/storage";
import type { UserProfile } from "./types";

export default function App() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const auth = loadAuth();
    const p = loadProfile();
    if (auth?.isLoggedIn && p) setProfile(p);
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="app-loading">Đang tải…</div>;
  }

  if (!profile) {
    return <Onboarding onComplete={setProfile} />;
  }

  return <MainApp profile={profile} onLogout={() => setProfile(null)} onProfileUpdate={setProfile} />;
}
