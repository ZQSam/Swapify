import type { CSSProperties } from 'react';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export default function LoadingSpinner({
  size = 40,
  color = 'var(--color-primary)',
  style,
}: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
