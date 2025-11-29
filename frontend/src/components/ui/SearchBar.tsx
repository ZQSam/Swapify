import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export default function SearchBar({ onSearch, ...props }: SearchBarProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <Search
        size={20}
        color="var(--color-gray-300)"
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <input
        {...props}
        type="text"
        style={{
          width: '100%',
          height: '40px',
          padding: '0 16px 0 48px',
          border: '1px solid var(--color-gray-100)',
          borderRadius: '8px',
          fontSize: '16px',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(255, 95, 5, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-gray-100)';
          e.target.style.boxShadow = 'none';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
}
