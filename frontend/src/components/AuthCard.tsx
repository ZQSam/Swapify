import React from "react";

type Props = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
};

export default function AuthCard({ title, subtitle, onBack, children }: Props) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        {onBack && (
          <button
            className="back-btn"
            type="button"
            onClick={onBack}
            aria-label="Back"
          >
            ←
          </button>
        )}

        {title && <h2 className="auth-title">{title}</h2>}
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}

        <div className="auth-content">{children}</div>
      </div>
    </div>
  );
}
