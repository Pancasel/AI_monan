import { useState } from "react";
import { ALLERGEN_OPTIONS } from "../data/allergens";
import { saveProfile } from "../lib/storage";
import type { AllergenId, UserProfile } from "../types";

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export function ProfileSettings({ profile, onSave, onClose }: ProfileSettingsProps) {
  const [name, setName] = useState(profile.name);
  const [allergies, setAllergies] = useState<AllergenId[]>(profile.allergies);

  const toggleAllergy = (id: AllergenId) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      allergies,
    };
    saveProfile(updated);
    onSave(updated);
    onClose();
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Hồ sơ dị ứng</h2>
          <button type="button" className="profile-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên hiển thị</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
            />
          </div>

          <p className="profile-hint">Chọn món bạn bị dị ứng — AI sẽ lọc menu theo hồ sơ này:</p>

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
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}
