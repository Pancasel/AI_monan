import { useState, useRef, useEffect, useCallback } from "react";
import {
  generateAiReply,
  formatChatHtml,
  type ChatMessage,
} from "../lib/aiChat";
import { fetchAiReply } from "../lib/chatApi";
import type { UserProfile } from "../types";

const SUGGESTIONS = [
  "Nhà hàng Hà Nội phù hợp với tui",
  "Cơm gà có nguyên liệu gì?",
  "Gợi ý quán chay",
  "Top rating",
];

interface ChatPanelProps {
  profile: UserProfile;
  onFocusRestaurant?: (id: string) => void;
  externalPrompt?: string | null;
  onExternalPromptConsumed?: () => void;
  onLogout?: () => void;
}

export function ChatPanel({
  profile,
  onFocusRestaurant,
  externalPrompt,
  onExternalPromptConsumed,
  onLogout,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: generateAiReply("xin chào", profile),
      html: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      setMessages((m) => [...m, userMsg]);
      setInput("");
      setLoading(true);

      const history = [...messages, userMsg];
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
      setMessages((m) => [...m, assistantMsg]);
      setLoading(false);
    },
    [loading, messages, profile]
  );

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

  useEffect(() => {
    if (externalPrompt) {
      send(externalPrompt);
      onExternalPromptConsumed?.();
    }
  }, [externalPrompt]);

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div className="chat-brand">
          <span className="chat-logo" aria-hidden>
            🍜
          </span>
          <div>
            <h1>FoodMap Assistant</h1>
            <p>Tìm quán phù hợp · Hà Nội</p>
          </div>
        </div>
        {onLogout && (
          <button type="button" className="chat-logout" onClick={onLogout} title="Đăng xuất">
            ↪
          </button>
        )}
      </header>

      <div className="chat-messages" onClick={handleChatClick}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-row ${msg.role}`}
          >
            {msg.role === "assistant" && (
              <span className="chat-avatar bot" aria-hidden>
                🤖
              </span>
            )}
            <div
              className={`chat-bubble ${msg.role}`}
              {...(msg.html && msg.role === "assistant"
                ? { dangerouslySetInnerHTML: { __html: formatChatHtml(msg.content) } }
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

      <div className="chat-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="suggest-pill"
            disabled={loading}
            onClick={() => send(s)}
          >
            {s}
          </button>
        ))}
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
          placeholder="Hỏi về quán, món, dị ứng..."
          disabled={loading}
        />
        <button type="submit" className="chat-send" disabled={loading} aria-label="Gửi">
          ➤
        </button>
      </form>
    </div>
  );
}
