import React, { useState } from 'react';
import type { Item, StockState } from '../db/schema';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';
import { ConfidenceDot } from './ConfidenceDot';
import { StatusChip, type StatusType } from './StatusChip';
import { QuickAddButton } from './QuickAddButton';
import { triggerHaptic } from '../lib/haptics';
import { MoreVertical } from 'lucide-react';

interface ProductRowProps {
  item: Item;
  stockState?: StockState;
  onQuickSale?: (item: Item) => void;
  onOpenActions?: (item: Item) => void;
  onClickRow?: (item: Item) => void;
  mode?: 'sale' | 'stock' | 'list';
  showCategory?: boolean;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  item,
  stockState,
  onQuickSale,
  onOpenActions,
  onClickRow,
  mode = 'sale',
  showCategory = false,
}) => {
  const { lang } = useTranslation();
  const [isFlashing, setIsFlashing] = useState(false);

  // Determine localized name
  const localizedName = item.names[lang] || item.names.hi || item.names.en;
  const secondaryName = lang !== 'en' ? item.names.en : item.names.hi;

  // Derive status
  let status: StatusType = 'inStock';
  if (stockState?.qty === null || stockState?.qty === undefined) {
    status = 'inStock';
  } else if (stockState.qty === 0) {
    status = 'out';
  } else if (stockState.qty <= item.minQty) {
    status = 'low';
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 450);

    if (onQuickSale) {
      onQuickSale(item);
    }
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenActions) {
      onOpenActions(item);
    }
  };

  return (
    <div
      onClick={() => onClickRow && onClickRow(item)}
      className={`relative flex items-center gap-3.5 p-3 rounded-2xl bg-surface border transition-all duration-200 cursor-pointer ${
        isFlashing
          ? 'bg-brand-soft border-brand scale-[1.01] shadow-md ring-2 ring-brand/30'
          : 'border-line/70 hover:border-brand/30 shadow-xs'
      }`}
    >
      {/* Emoji Thumbnail */}
      <div className="w-13 h-13 shrink-0 rounded-2xl bg-canvas flex items-center justify-center text-3xl select-none border border-line/40">
        {item.emoji || '📦'}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-bold text-ink truncate leading-tight">
            {localizedName}
          </h3>
          {stockState && <ConfidenceDot confidence={stockState.confidence} />}
        </div>

        <div className="flex items-center gap-2 mt-0.5 text-xs text-ink-muted truncate">
          <span>{secondaryName}</span>
          {showCategory && (
            <>
              <span>•</span>
              <span className="capitalize">{item.category.replace('_', ' ')}</span>
            </>
          )}
        </div>

        {/* Stock info strip */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {stockState && stockState.qty !== null ? (
            <span className="text-sm font-bold text-ink tabular-nums">
              {formatQty(stockState.qty, item.baseUnit, lang)}
            </span>
          ) : (
            <span className="text-xs text-ink-muted italic">
              {formatQty(null, item.baseUnit, lang)}
            </span>
          )}

          <StatusChip status={status} />

          {stockState?.negative && (
            <span className="text-[11px] font-semibold text-danger bg-danger/10 px-1.5 py-0.5 rounded">
              Ginti kar lo
            </span>
          )}
        </div>
      </div>

      {/* Action Slot */}
      <div className="flex items-center gap-1 shrink-0">
        {mode === 'sale' && (
          <>
            <QuickAddButton
              onClick={handleQuickAdd}
              ariaLabel={`Sell ${localizedName}`}
            />
            {onOpenActions && (
              <button
                type="button"
                onClick={handleMoreClick}
                aria-label="More actions"
                className="w-10 h-14 flex items-center justify-center text-ink-muted hover:text-ink active:scale-90"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            )}
          </>
        )}

        {mode === 'stock' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMoreClick}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-soft text-blue font-semibold text-sm hover:bg-blue/20 active:scale-95 transition-transform"
            >
              + Stock
            </button>
            <button
              type="button"
              onClick={() => onClickRow && onClickRow(item)}
              aria-label="Edit product details"
              className="w-10 h-11 flex items-center justify-center text-ink-muted hover:text-ink active:scale-90"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
