import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AutocompleteOption {
  value: string;
  label: string;
  subtitle?: string;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
}

export default function Autocomplete({
  options,
  value,
  onChange,
  onSelect,
  placeholder,
  label,
  loading = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && options.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          const option = options[selectedIndex];
          onChange(option.label);
          onSelect?.(option);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-gray-900)',
            marginBottom: '8px',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (options.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '40px',
            padding: '0 40px 0 16px',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocusCapture={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(255, 95, 5, 0.1)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = 'var(--color-gray-100)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <ChevronDown
          size={20}
          color="var(--color-gray-300)"
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0'})`,
            transition: 'transform 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      </div>

      {isOpen && options.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.label);
                onSelect?.(option);
                setIsOpen(false);
              }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background:
                  index === selectedIndex ? 'var(--color-gray-50)' : '#fff',
                borderBottom:
                  index < options.length - 1
                    ? '1px solid var(--color-gray-100)'
                    : 'none',
              }}
              onMouseEnter={(e) => {
                setSelectedIndex(index);
                e.currentTarget.style.background = 'var(--color-gray-50)';
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              <div style={{ fontSize: '14px', color: 'var(--color-gray-900)' }}>
                {option.label}
              </div>
              {option.subtitle && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-gray-300)',
                    marginTop: '2px',
                  }}
                >
                  {option.subtitle}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && loading && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid var(--color-gray-100)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            color: 'var(--color-gray-300)',
            fontSize: '14px',
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}
