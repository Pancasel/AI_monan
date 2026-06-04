import { useState, useRef, useEffect, useCallback } from "react";
import { generateAiReply, formatChatHtml, type ChatMessage } from "../lib/aiChat";
import { fetchAiReply } from "../lib/chatApi";
import type { UserProfile } from "../types";

interface ChatPanelProps {
  profile: UserProfile;
  userLocation?: [number, number] | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onPersist: () => void;
  onFocusRestaurant?: (id: string) => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
}

export function ChatPanel({
  profile,
  userLocation,
  messages,
  setMessages,
  input,
  setInput,
  onPersist,
  onFocusRestaurant,
  onLogout,
  onEditProfile,
}: ChatPanelProps) {
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userCoords = userLocation
    ? { lat: userLocation[0], lng: userLocation[1] }
    : undefined;

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      const history = nextMessages;
      let reply = await fetchAiReply(history, profile);
      if (!reply) {
        reply = generateAiReply(trimmed, profile);
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        html: true,
      };
      setMessages([...nextMessages, assistantMsg]);
      setLoading(false);
    },
    [loading, messages, profile, setMessages, setInput]
  );

  useEffect(() => {
    if (!loading) onPersist();
  }, [messages, loading, onPersist]);

  const handleChatClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest("[data-restaurant-id]");
    if (!el) return;
    e.preventDefault();
    const id = el.getAttribute("data-restaurant-id");
    if (id) onFocusRestaurant?.(id);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div className="chat-brand">
          <span className="chat-logo" aria-hidden>
            🍜
          </span>
          <div>
            <h1>FoodMap Assistant</h1>
            {onEditProfile && (
              <button
                type="button"
                className="chat-profile-link"
                onClick={onEditProfile}
              >
                Hồ sơ dị ứng
              </button>
            )}
          </div>
        </div>
        <div className="chat-header-actions">
          {onLogout && (
            <button type="button" className="chat-logout" onClick={onLogout} title="Đăng xuất">
              ↪
            </button>
          )}
        </div>
      </header>

      <div className="chat-messages" onClick={handleChatClick}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <span className="chat-avatar bot" aria-hidden>
                🤖
              </span>
            )}
            <div
              className={`chat-bubble ${msg.role}`}
              {...(msg.html && msg.role === "assistant"
                ? {
                    dangerouslySetInnerHTML: {
                      __html: formatChatHtml(msg.content, userCoords),
                    },
                  }
                : {})}
            >
              {!msg.html || msg.role === "user" ? msg.content : null}
            </div>
            {msg.role === "user" && (
              <span className="chat-avatar user" aria-hidden>
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-row assistant">
            <span className="chat-avatar bot">🤖</span>
            <div className="chat-bubble assistant chat-loading">Đang suy nghĩ...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi quán, món, dị ứng..."
          disabled={loading}
        />
        <button type="submit" className="chat-send" disabled={loading} aria-label="Gửi">
          ➤
        </button>
      </form>
    </div>
  );
}
