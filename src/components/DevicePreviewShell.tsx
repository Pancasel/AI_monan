import { useState, type ReactNode } from "react";

export type PreviewMode = "web" | "phone";

interface DevicePreviewShellProps {
  children: ReactNode;
}

export function DevicePreviewShell({ children }: DevicePreviewShellProps) {
  const [mode, setMode] = useState<PreviewMode>("web");

  return (
    <div className={`preview-shell preview-${mode}`}>
      <div className="preview-toolbar" role="tablist" aria-label="Chế độ xem">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "web"}
          className={`preview-tab ${mode === "web" ? "active" : ""}`}
          onClick={() => setMode("web")}
        >
          Web
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "phone"}
          className={`preview-tab ${mode === "phone" ? "active" : ""}`}
          onClick={() => setMode("phone")}
        >
          Điện thoại
        </button>
      </div>

      <div className="preview-viewport">
        {mode === "phone" ? (
          <div className="phone-mockup" aria-label="Khung điện thoại">
            <div className="phone-notch" aria-hidden />
            <div className="phone-screen">{children}</div>
          </div>
        ) : (
          <div className="preview-app-root">{children}</div>
        )}
      </div>
    </div>
  );
}
