import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const iconMap = {
    success: <CheckCircle size={20} color="var(--color-success)" />,
    error: <XCircle size={20} color="var(--color-error)" />,
    warning: <AlertCircle size={20} color="var(--color-warning)" />,
  };

  const bgColors = {
    success: '#E8F5E9',
    error: '#FFEBEE',
    warning: '#FFF4E5',
  };

  const textColors = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: bgColors[type],
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1001,
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {iconMap[type]}
      <span
        style={{
          flex: 1,
          fontSize: '14px',
          color: textColors[type],
          fontWeight: 500,
        }}
      >
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} color={textColors[type]} />
      </button>
    </div>
  );
}
