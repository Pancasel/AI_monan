import { useState } from "react";
import { ALLERGEN_OPTIONS } from "../data/allergens";
import type { AllergenId, UserProfile } from "../types";
import { saveAuth, saveProfile } from "../lib/storage";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [allergies, setAllergies] = useState<AllergenId[]>([]);

  const toggleAllergy = (id: AllergenId) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    saveAuth({ email: email.trim(), isLoggedIn: true });
    setStep(1);
  };

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleAllergies = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      allergies,
    };
    saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-logo">🍜</div>
        <h1 className="onboard-title">AI Món Ăn</h1>
        <p className="onboard-sub">Gợi ý nhà hàng & thực đơn theo dị ứng của bạn</p>

        <div className="onboard-steps">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`step-dot ${step === i ? "active" : ""}`} />
          ))}
        </div>

        {step === 0 && (
          <form onSubmit={handleAuth}>
            <p className="onboard-hint">Bước 1 — Đăng ký / Đăng nhập (demo, không cần server)</p>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={4}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Tiếp tục
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleProfile}>
            <p className="onboard-hint">Bước 2 — Hồ sơ người dùng (tên hiển thị)</p>
            <div className="form-group">
              <label>Họ tên / biệt danh</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Linh"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Tiếp tục
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
              Quay lại
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAllergies}>
            <p className="onboard-hint">
              Bước 3 — Bạn đang bị dị ứng gì? (vd: cá, đậu phộng, sữa…)
            </p>
            <div className="allergy-grid">
              {ALLERGEN_OPTIONS.map((a) => (
                <label key={a.id} className="allergy-chip">
                  <input
                    type="checkbox"
                    checked={allergies.includes(a.id)}
                    onChange={() => toggleAllergy(a.id)}
                  />
                  {a.label}
                </label>
              ))}
            </div>
            <button type="submit" className="btn btn-primary">
              Lưu hồ sơ & vào app
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              Quay lại
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
