import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const variantStyles = {
    primary: {
      background: 'var(--color-primary)',
      color: '#fff',
    },
    secondary: {
      background: 'transparent',
      border: '2px solid var(--color-primary)',
      color: 'var(--color-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-gray-300)',
      border: 'none',
    },
    danger: {
      background: 'var(--color-error)',
      color: '#fff',
    },
  };

  const sizeStyles = {
    small: {
      height: '32px',
      padding: '0 16px',
      fontSize: '14px',
    },
    medium: {
      height: '40px',
      padding: '0 24px',
      fontSize: '16px',
    },
    large: {
      height: '48px',
      padding: '0 32px',
      fontSize: '16px',
    },
  };

  const hoverStyles =
    variant === 'ghost'
      ? { background: 'var(--color-gray-50)' }
      : variant === 'secondary'
      ? { background: 'rgba(255, 95, 5, 0.05)' }
      : { opacity: 0.9 };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={className}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(props.style || {}),
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
    >
      {loading && <span>⏳</span>}
      {children}
    </button>
  );
}
