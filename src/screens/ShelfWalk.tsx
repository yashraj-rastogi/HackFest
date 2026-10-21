import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { getAllItems, getSetting, setSetting } from '../db/repos';
import { recordCount } from '../db/ledger';
import type { Item } from '../db/schema';
import { QtyChips } from '../components/QtyChips';
import { QuantityStepper } from '../components/QuantityStepper';
import { triggerHaptic } from '../lib/haptics';
import { CheckCircle2, FastForward, Home } from 'lucide-react';

export const ShelfWalk: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customQty, setCustomQty] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllItems(),
      getSetting<number>('shelfWalkIndex', 0),
    ]).then(([fetchedItems, savedIndex]) => {
      setItems(fetchedItems);
      const safeIndex = Math.min(savedIndex, Math.max(0, fetchedItems.length - 1));
      setCurrentIndex(safeIndex);
      if (fetchedItems[safeIndex]) {
        setCustomQty(fetchedItems[safeIndex].defaultSaleQty);
      }
      setLoading(false);
    });
  }, []);

  const currentItem: Item | undefined = items[currentIndex];

  const advance = async (nextIndex: number) => {
    if (nextIndex >= items.length) {
      // Completed shelf walk
      await setSetting('onboardingDone', true);
      await setSetting('shelfWalkIndex', items.length);
      navigate('/');
    } else {
      setCurrentIndex(nextIndex);
      await setSetting('shelfWalkIndex', nextIndex);
      if (items[nextIndex]) {
        setCustomQty(items[nextIndex].defaultSaleQty);
      }
    }
  };

  const handleChipSelect = async (qty: number) => {
    if (!currentItem) return;
    triggerHaptic(12);
    await recordCount(currentItem.id, qty, 'shelfwalk');
    await advance(currentIndex + 1);
  };

  const handleCustomSave = async () => {
    if (!currentItem) return;
    triggerHaptic(15);
    await recordCount(currentItem.id, customQty, 'shelfwalk');
    await advance(currentIndex + 1);
  };

  const handleSkip = async () => {
    triggerHaptic(8);
    await advance(currentIndex + 1);
  };

  const handleFinishLater = async () => {
    triggerHaptic(12);
    await setSetting('onboardingDone', true);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentItem || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-canvas">
        <CheckCircle2 className="w-16 h-16 text-brand mb-4" />
        <h2 className="text-xl font-bold text-ink">Setup Complete!</h2>
        <p className="text-sm text-ink-muted mt-1 mb-6">
          Your shop is ready to record sales and track stock.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-[56px] px-8 rounded-2xl bg-brand text-white font-bold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const localizedName = currentItem.names[lang] || currentItem.names.hi || currentItem.names.en;
  const progressPercent = Math.round(((currentIndex + 1) / items.length) * 100);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Bar with Progress */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
            {t('prompt.shelfWalk')}
          </span>
          <span className="text-xs font-semibold text-ink-muted">
            {currentIndex + 1} / {items.length} ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-line rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Item Card */}
        <div className="bg-surface rounded-3xl p-6 border border-line text-center shadow-xs">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-canvas border border-line/50 flex items-center justify-center text-5xl shadow-inner select-none">
            {currentItem.emoji || '📦'}
          </div>

          <h2 className="text-2xl font-bold text-ink mt-4 leading-tight">
            {localizedName}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {currentItem.names.en} • {currentItem.category.replace('_', ' ')}
          </p>

          <div className="text-sm font-semibold text-brand-dark mt-4">
            {t('prompt.howMany')}
          </div>

          {/* Quick Choice Chips */}
          <div className="mt-4 flex justify-center">
            <QtyChips
              chips={currentItem.chips}
              baseUnit={currentItem.baseUnit}
              onSelect={handleChipSelect}
              className="justify-center"
            />
          </div>

          {/* Stepper for custom quantity */}
          <div className="mt-6 pt-5 border-t border-line/60">
            <QuantityStepper
              qty={customQty}
              baseUnit={currentItem.baseUnit}
              onChange={setCustomQty}
            />

            <button
              type="button"
              onClick={handleCustomSave}
              className="w-full mt-3 min-h-[48px] py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark active:scale-98 transition-transform"
            >
              {t('action.save')}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-2 gap-3 pt-6 pb-2">
        <button
          type="button"
          onClick={handleSkip}
          className="min-h-[52px] py-3 px-4 rounded-2xl border border-line bg-surface text-ink hover:bg-line/20 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <FastForward className="w-4 h-4 text-ink-muted" />
          <span>{t('action.dontKnow')}</span>
        </button>

        <button
          type="button"
          onClick={handleFinishLater}
          className="min-h-[52px] py-3 px-4 rounded-2xl border border-line bg-surface text-ink hover:bg-line/20 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Home className="w-4 h-4 text-ink-muted" />
          <span>{t('action.later')}</span>
        </button>
      </div>
    </div>
  );
};
