import React from 'react';
import { Search, X, ScanBarcode } from 'lucide-react';
import { useTranslation } from '../i18n';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onScanClick?: () => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  placeholder,
  autoFocus = false,
  className = '',
  onScanClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 pointer-events-none text-ink">
        <Search className="w-5 h-5 stroke-[2.75]" />
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
        className="w-full min-h-[50px] pl-11 pr-12 py-2.5 rounded-2xl bg-white border-2 border-ink shadow-[2.5px_2.5px_0px_#141413] text-ink font-bold text-base placeholder:text-ink-muted/70 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_#141413] transition-all"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 w-9 h-9 flex items-center justify-center rounded-xl text-ink hover:bg-yellow-50 active:scale-90"
        >
          <X className="w-4 h-4 stroke-[2.75]" />
        </button>
      ) : onScanClick ? (
        <button
          type="button"
          onClick={onScanClick}
          aria-label="Scan barcode"
          className="absolute right-2 w-9 h-9 flex items-center justify-center rounded-xl bg-saffron border-2 border-ink shadow-[1.5px_1.5px_0px_#141413] text-ink active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#141413]"
        >
          <ScanBarcode className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      ) : null}
    </div>
  );
};
