import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'available' | 'pending' | 'sold';
}

export default function Badge({ children, variant = 'available' }: BadgeProps) {
  const styles = {
    available: {
      background: '#E8F5E9',
      color: 'var(--color-success)',
    },
    pending: {
      background: '#FFF4E5',
      color: 'var(--color-warning)',
    },
    sold: {
      background: 'var(--color-gray-50)',
      color: 'var(--color-gray-300)',
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
