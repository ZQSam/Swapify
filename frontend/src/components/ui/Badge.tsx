import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'available' | 'closed';
}

export default function Badge({ children, variant = 'available' }: BadgeProps) {
  const styles = {
    available: {
      background: '#E8F5E9',
      color: 'var(--color-success)',
    },
    closed: {
      background: '#FFEBEE',
      color: '#C62828',
    },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}
