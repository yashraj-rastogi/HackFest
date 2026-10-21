import React, { useState } from 'react';
import type { Item, StockState } from '../db/schema';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';
import { QtyChips } from './QtyChips';
import { QuantityStepper } from './QuantityStepper';
import { X, ShoppingBag, PackagePlus, ClipboardCheck, AlertOctagon, HelpCircle } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';

type SheetTab = 'sale' | 'stockIn' | 'count';

interface QuickActionSheetProps {
  item: Item | null;
  stockState?: StockState;
  initialTab?: SheetTab;
  onClose: () => void;
  onRecordSale: (item: Item, qty: number) => void;
  onRecordStockIn: (item: Item, qty: number) => void;
  onRecordCount: (item: Item, qty: number) => void;
  onRecordKhatam: (item: Item) => void;
  onRecordMissed: (item: Item) => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  item,
  stockState,
  initialTab = 'sale',
  onClose,
  onRecordSale,
  onRecordStockIn,
  onRecordCount,
  onRecordKhatam,
  onRecordMissed,
}) => {
  const { lang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SheetTab>(initialTab);
  const [customQty, setCustomQty] = useState<number>(() => {
    return item ? item.defaultSaleQty : 1000;
  });

  if (!item) return null;

  const localizedName = item.names[lang] || item.names.hi || item.names.en;

  const handleSaleSelect = (qty: number) => {
    triggerHaptic(15);
    onRecordSale(item, qty);
    onClose();
  };

  const handleStockInSelect = (qty: number) => {
    triggerHaptic(15);
    onRecordStockIn(item, qty);
    onClose();
  };

  const handleCountSubmit = () => {
    triggerHaptic(15);
    onRecordCount(item, customQty);
    onClose();
  };

  const handleKhatam = () => {
    triggerHaptic(20);
    onRecordKhatam(item);
    onClose();
  };

  const handleMissed = () => {
    triggerHaptic(15);
    onRecordMissed(item);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Actions for ${localizedName}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-t-3xl p-5 border-t border-line shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-line rounded-full mx-auto mb-4" />

        {/* Item Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line/60">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0 p-2 rounded-2xl bg-canvas border border-line/40">
              {item.emoji || '📦'}
            </span>
            <div className="truncate">
              <h2 className="text-lg font-bold text-ink truncate leading-tight">
                {localizedName}
              </h2>
              <div className="text-xs text-ink-muted mt-0.5">
                {t('prompt.currentStock')}:{' '}
                <span className="font-bold text-ink">
                  {formatQty(stockState?.qty, item.baseUnit, lang)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-canvas text-ink hover:bg-line/40 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Action modes"
          className="grid grid-cols-3 gap-1.5 p-1 bg-canvas rounded-2xl my-4 border border-line"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sale'}
            onClick={() => setActiveTab('sale')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
              activeTab === 'sale'
                ? 'bg-brand text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('nav.sale')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stockIn'}
            onClick={() => setActiveTab('stockIn')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
              activeTab === 'stockIn'
                ? 'bg-blue text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>{t('action.addStock')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'count'}
            onClick={() => setActiveTab('count')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
              activeTab === 'count'
                ? 'bg-lilac text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{t('action.count')}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'sale' && (
          <div className="py-2 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t('home.recordSale')} — {t('prompt.howMany')}
            </div>
            <QtyChips
              chips={item.chips}
              baseUnit={item.baseUnit}
              onSelect={handleSaleSelect}
            />

            <div className="pt-2 border-t border-line/60">
              <button
                type="button"
                onClick={handleMissed}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-xl border border-warning/40 text-warning hover:bg-warning/5 font-semibold text-sm flex items-center justify-center gap-2 active:scale-98"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t('action.missed')}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stockIn' && (
          <div className="py-2 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t('action.addStock')} (Maal aaya)
            </div>
            <QtyChips
              chips={item.chips}
              baseUnit={item.baseUnit}
              onSelect={handleStockInSelect}
            />
          </div>
        )}

        {activeTab === 'count' && (
          <div className="py-2 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {t('action.count')} (Shelf walk count)
            </div>

            <QuantityStepper
              qty={customQty}
              baseUnit={item.baseUnit}
              onChange={setCustomQty}
            />

            <QtyChips
              chips={item.chips}
              baseUnit={item.baseUnit}
              selectedQty={customQty}
              onSelect={setCustomQty}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleKhatam}
                className="min-h-[50px] px-4 py-2.5 rounded-xl border border-danger/40 text-danger hover:bg-danger/5 font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{t('action.markFinished')}</span>
              </button>

              <button
                type="button"
                onClick={handleCountSubmit}
                className="min-h-[50px] px-4 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark flex items-center justify-center gap-2 active:scale-95"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{t('action.save')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
