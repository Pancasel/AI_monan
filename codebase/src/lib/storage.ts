import type { UserProfile } from "../types";

const PROFILE_KEY = "ai-monan-profile";
const AUTH_KEY = "ai-monan-auth";
const CONFIRMATIONS_KEY = "ai-monan-confirmations";

export interface AuthState {
  email: string;
  isLoggedIn: boolean;
}

export function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export type DishConfirmation = {
  restaurantId: string;
  dishId: string;
  containsAllergen: boolean;
};

export function loadConfirmations(): DishConfirmation[] {
  try {
    const raw = localStorage.getItem(CONFIRMATIONS_KEY);
    return raw ? (JSON.parse(raw) as DishConfirmation[]) : [];
  } catch {
    return [];
  }
}

export function saveConfirmation(c: DishConfirmation): void {
  const list = loadConfirmations().filter(
    (x) => !(x.restaurantId === c.restaurantId && x.dishId === c.dishId)
  );
  list.push(c);
  localStorage.setItem(CONFIRMATIONS_KEY, JSON.stringify(list));
}
