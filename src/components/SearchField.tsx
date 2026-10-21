import React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from '../i18n';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder,
  autoFocus = false,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 pointer-events-none text-ink-muted">
        <Search className="w-5 h-5 stroke-[2.25]" />
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('search.placeholder')}
        autoFocus={autoFocus}
        autoCorrect="off"
        autoCapitalize="none"
        enterKeyHint="search"
        className="w-full min-h-[50px] pl-11 pr-11 py-2.5 rounded-2xl bg-surface border border-line text-ink text-base placeholder:text-ink-muted/70 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-xs"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 w-9 h-9 flex items-center justify-center rounded-xl text-ink-muted hover:text-ink active:scale-90"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
