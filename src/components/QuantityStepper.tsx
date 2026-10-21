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
    <div className={`flex items-center gap-3 bg-surface p-1.5 rounded-2xl border border-line ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={qty <= min}
        aria-label="Decrease quantity"
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-canvas text-ink hover:bg-line/40 disabled:opacity-40 disabled:cursor-not-allowed active:scale-92 transition-transform"
      >
        <Minus className="w-5 h-5 stroke-[2.5]" />
      </button>

      <div className="flex-1 text-center py-1">
        <div className="text-2xl font-bold text-ink tabular-nums tracking-tight">
          {formatQty(qty, baseUnit, lang)}
        </div>
        <div className="text-xs text-ink-muted">
          (±{formatQty(step, baseUnit, lang)})
        </div>
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        aria-label="Increase quantity"
        className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-soft text-brand-dark hover:bg-brand/20 active:scale-92 transition-transform"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
