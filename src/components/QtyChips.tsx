import React from 'react';
import type { BaseUnit } from '../db/schema';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';

interface QtyChipsProps {
  chips: number[];
  baseUnit: BaseUnit;
  selectedQty?: number | null;
  onSelect: (qty: number) => void;
  className?: string;
}

export const QtyChips: React.FC<QtyChipsProps> = ({
  chips,
  baseUnit,
  selectedQty,
  onSelect,
  className = '',
}) => {
  const { lang } = useTranslation();

  return (
    <div className={`flex flex-wrap gap-2.5 items-center ${className}`}>
      {chips.map((qty) => {
        const isSelected = selectedQty === qty;
        return (
          <button
            key={qty}
            type="button"
            onClick={() => onSelect(qty)}
            className={`min-h-[48px] px-4 py-2 rounded-xl text-base font-semibold transition-all duration-100 active:scale-95 border ${
              isSelected
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-surface text-ink border-line hover:border-brand/40 active:bg-brand-soft/40'
            }`}
          >
            {formatQty(qty, baseUnit, lang)}
          </button>
        );
      })}
    </div>
  );
};
