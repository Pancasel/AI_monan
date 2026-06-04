import "dotenv/config";
import express from "express";
import cors from "cors";
import { RESTAURANTS } from "../src/data/restaurants.js";
import { ALLERGEN_OPTIONS } from "../src/data/allergens.js";
import { rankRestaurants } from "../src/lib/allergy.js";
import type { UserProfile } from "../src/types/index.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat";

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

function buildSystemPrompt(profile: UserProfile): string {
  const allergyLabels = profile.allergies
    .map((id) => ALLERGEN_OPTIONS.find((a) => a.id === id)?.label)
    .filter(Boolean);

  const ranked = rankRestaurants(RESTAURANTS, profile).slice(0, 12);
  const topList = ranked
    .map((item) => {
      const r = item.restaurant;
      const pct = Math.round(item.score * 100);
      const dishes = r.menu
        .slice(0, 4)
        .map((d) => d.name)
        .join(", ");
      return `- id=${r.id} | ${r.name} | ${r.district} | ${r.cuisine} | ⭐${r.rating} | ${pct}% món phù hợp | món: ${dishes}`;
    })
    .join("\n");

  const catalog = RESTAURANTS.map(
    (r) =>
      `- id=${r.id} | ${r.name} | ${r.address} | ${r.cuisine} | menu: ${r.menu.map((d) => d.name).join("; ")}`
  ).join("\n");

  return `Bạn là trợ lý AI của app "AI Món Ăn" tại Hà Nội, chuyên gợi ý nhà hàng và tra cứu món ăn theo dị ứng.

Người dùng: ${profile.name || "bạn"}${profile.email ? ` (${profile.email})` : ""}.
Dị ứng đã khai báo: ${allergyLabels.length ? allergyLabels.join(", ") : "chưa có"}.

Quy tắc BẮT BUỘC:
1. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
2. Mỗi lần nhắc tên nhà hàng, PHẢI dùng link: [Tên quán](restaurant:ID) — app sẽ hiện thẻ quán có ảnh, rating, khoảng cách (vd: [Phở Thìn Lò Đúc](restaurant:r1)).
3. Khi gợi ý nhiều quán, mỗi quán một dòng riêng với link restaurant:ID; có thể thêm emoji thân thiện.
4. Giải thích món an toàn / đỏ / vàng theo dị ứng người dùng khi liên quan.
5. Chỉ dùng thông tin nhà hàng và món trong dữ liệu dưới đây; không bịa quán mới.

Top quán phù hợp (điểm = món xanh / tổng món):
${topList}

Toàn bộ ${RESTAURANTS.length} nhà hàng:
${catalog}`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: Boolean(OPENROUTER_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  const { messages, profile } = req.body as {
    messages?: { role: string; content: string }[];
    profile?: UserProfile;
  };

  if (!OPENROUTER_API_KEY) {
    res.status(503).json({
      error: "OPENROUTER_API_KEY chưa cấu hình. Thêm vào file .env ở thư mục gốc.",
    });
    return;
  }

  if (!Array.isArray(messages) || !profile) {
    res.status(400).json({ error: "messages và profile là bắt buộc" });
    return;
  }

  const system = buildSystemPrompt(profile);
  const apiMessages = [
    { role: "system" as const, content: system },
    ...messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-20)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content),
      })),
  ];

  try {
    const apiUrl = `${OPENROUTER_BASE_URL.replace(/\/$/, "")}/chat/completions`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL ?? "http://localhost:5173",
        "X-Title": "AI Mon An",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: apiMessages,
        temperature: 0.6,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      res.status(502).json({ error: "OpenRouter request failed" });
      return;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      res.status(502).json({ error: "Empty response from model" });
      return;
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(
    `API http://localhost:${PORT} | ${OPENROUTER_MODEL} @ ${OPENROUTER_BASE_URL} (${OPENROUTER_API_KEY ? "key ok" : "no key"})`
  );
});
