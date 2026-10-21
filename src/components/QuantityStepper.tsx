import React from 'react';
import { Plus, Minus } from 'lucide-react';
import type { BaseUnit } from '../db/schema';
import { formatQty, getStepSize } from '../domain/units';
import { useTranslation } from '../i18n';

interface QuantityStepperProps {
  qty: number;
  baseUnit: BaseUnit;
  onChange: (newQty: number) => void;
  min?: number;
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  qty,
  baseUnit,
  onChange,
  min = 0,
  className = '',
}) => {
  const { lang } = useTranslation();
  const step = getStepSize(qty, baseUnit);

  const handleDecrement = () => {
    const nextVal = Math.max(min, qty - step);
    onChange(nextVal);
  };

  const handleIncrement = () => {
    onChange(qty + step);
  };

  return (
    <div className={`flex items-center gap-3 bg-white p-2 comic-card-sm ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={qty <= min}
        aria-label="Decrease quantity"
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-white text-ink btn-comic-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Minus className="w-5 h-5 stroke-[3]" />
      </button>

      <div className="flex-1 text-center py-1">
        <div className="text-2xl font-black text-ink tabular-nums font-pixel tracking-tight">
          {formatQty(qty, baseUnit, lang)}
        </div>
        <div className="text-xs font-bold text-ink-muted">
          (±{formatQty(step, baseUnit, lang)})
        </div>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        aria-label="Increase quantity"
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-lime text-ink btn-comic-sm cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  );
};
