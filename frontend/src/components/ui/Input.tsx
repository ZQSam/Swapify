import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', style, ...props }, ref) => {
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
    };

    const inputStyles = {
      height: '40px',
      padding: '0 16px',
      border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-gray-100)'}`,
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.2s ease',
      width: '100%',
      ...(style || {}),
    };

    return (
      <div style={containerStyles}>
        {label && (
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-gray-900)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={className}
          style={inputStyles}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(255, 95, 5, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? 'var(--color-error)'
              : 'var(--color-gray-100)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {error && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
