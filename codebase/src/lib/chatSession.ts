import { generateAiReply, type ChatMessage } from "./aiChat";
import type { UserProfile } from "../types";

export interface AppSessionState {
  messages: ChatMessage[];
  selectedId: string | null;
  inputDraft: string;
  updatedAt: number;
}

const CHANNEL_NAME = "ai-monan-session";
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function createWelcomeMessage(profile: UserProfile): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: generateAiReply("xin chào", profile),
    html: true,
  };
}

function sessionStorageKey(email: string): string {
  return `ai-monan-session-${email.trim().toLowerCase()}`;
}

export function loadLocalSession(email: string): AppSessionState | null {
  try {
    const raw = localStorage.getItem(sessionStorageKey(email));
    if (!raw) return null;
    return JSON.parse(raw) as AppSessionState;
  } catch {
    return null;
  }
}

export function saveLocalSession(email: string, state: AppSessionState): void {
  const payload = { ...state, updatedAt: Date.now() };
  localStorage.setItem(sessionStorageKey(email), JSON.stringify(payload));
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ email: email.trim().toLowerCase(), state: payload });
    channel.close();
  } catch {
    /* BroadcastChannel unsupported */
  }
}

export function subscribeLocalSession(
  email: string,
  onRemote: (state: AppSessionState) => void
): () => void {
  const key = sessionStorageKey(email);
  const normalized = email.trim().toLowerCase();

  const onStorage = (e: StorageEvent) => {
    if (e.key !== key || !e.newValue) return;
    try {
      onRemote(JSON.parse(e.newValue) as AppSessionState);
    } catch {
      /* ignore */
    }
  };

  let channel: BroadcastChannel | null = null;
  const onBroadcast = (e: MessageEvent) => {
    const data = e.data as { email?: string; state?: AppSessionState };
    if (data?.email === normalized && data.state) onRemote(data.state);
  };

  window.addEventListener("storage", onStorage);
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", onBroadcast);
  } catch {
    /* ignore */
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.removeEventListener("message", onBroadcast);
    channel?.close();
  };
}

export async function fetchRemoteSession(
  email: string
): Promise<AppSessionState | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/session/${encodeURIComponent(email.trim().toLowerCase())}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { session?: AppSessionState | null };
    return data.session ?? null;
  } catch {
    return null;
  }
}

export async function pushRemoteSession(
  email: string,
  state: AppSessionState
): Promise<void> {
  try {
    await fetch(
      `${API_BASE}/api/session/${encodeURIComponent(email.trim().toLowerCase())}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }
    );
  } catch {
    /* offline */
  }
}

export function pickNewerSession(
  a: AppSessionState | null,
  b: AppSessionState | null
): AppSessionState | null {
  if (!a) return b;
  if (!b) return a;
  return a.updatedAt >= b.updatedAt ? a : b;
}
