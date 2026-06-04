import type { ChatMessage } from "./aiChat";
import type { UserProfile } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface ChatApiPayload {
  messages: { role: "user" | "assistant"; content: string }[];
  profile: UserProfile;
}

export async function fetchAiReply(
  history: ChatMessage[],
  profile: UserProfile
): Promise<string | null> {
  const messages = history
    .filter((m) => m.id !== "welcome")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, profile } satisfies ChatApiPayload),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { reply?: string };
  return typeof data.reply === "string" ? data.reply : null;
}
