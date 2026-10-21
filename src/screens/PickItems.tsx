import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import type { ShopType } from '../db/schema';
import { getSetting } from '../db/repos';
import { getCatalogueForShopType, convertCatalogueToItem, type CatalogueItem } from '../catalogue';
import { db } from '../db/schema';
import { triggerHaptic } from '../lib/haptics';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export const PickItems: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useTranslation();
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSetting<ShopType>('shopType', 'kirana').then((type) => {
      const items = getCatalogueForShopType(type);
      setCatalogue(items);
      // Preselect the first 25 items by default so the user isn't starting from scratch
      const defaultSet = new Set(items.slice(0, 25).map((i) => i.id));
      setSelectedIds(defaultSet);
      setLoading(false);
    });
  }, []);

  const toggleItem = (id: string) => {
    triggerHaptic(8);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleCategory = (catItems: CatalogueItem[]) => {
    triggerHaptic(12);
    const allSelected = catItems.every((item) => selectedIds.has(item.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      catItems.forEach((item) => {
        if (allSelected) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
      });
      return next;
    });
  };

  const handleProceed = async () => {
    triggerHaptic(15);
    const chosenItems = catalogue
      .filter((cat) => selectedIds.has(cat.id))
      .map((cat) => convertCatalogueToItem(cat));

    if (chosenItems.length > 0) {
      await db.items.bulkPut(chosenItems);
    }

    navigate('/setup/walk');
  };

  // Group catalogue items by category
  const categoriesMap = catalogue.reduce<Record<string, CatalogueItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md px-4 py-3 border-b border-line shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/setup/type')}
              className="w-9 h-9 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink-muted hover:text-ink active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-ink leading-tight">
                {t('prompt.pickItems')}
              </h1>
              <p className="text-[11px] text-ink-muted">
                {selectedIds.size} items selected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Catalogue List grouped by category */}
      <div className="flex-1 p-4 pb-28 space-y-6 overflow-y-auto">
        {Object.entries(categoriesMap).map(([catKey, items]) => {
          const allSelected = items.every((i) => selectedIds.has(i.id));

          return (
            <div key={catKey} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-ink capitalize tracking-tight">
                  {catKey.replace('_', ' & ')} ({items.length})
                </h2>
                <button
                  type="button"
                  onClick={() => toggleCategory(items)}
                  className="text-xs font-semibold text-brand-dark hover:underline py-1 px-2 rounded-lg active:bg-brand-soft/50"
                >
                  {allSelected ? t('action.deselectAll') : t('action.selectAll')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const name = item.names[lang] || item.names.hi || item.names.en;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`relative p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all duration-100 active:scale-95 ${
                        isSelected
                          ? 'bg-surface border-brand ring-2 ring-brand/20 shadow-xs'
                          : 'bg-surface/70 border-line/70 opacity-75'
                      }`}
                    >
                      <div className="text-2xl shrink-0 select-none">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="text-xs font-bold text-ink truncate leading-tight">
                          {name}
                        </div>
                        <div className="text-[10px] text-ink-muted truncate mt-0.5">
                          {item.names.en}
                        </div>
                      </div>

                      <div
                        className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-brand border-brand text-white'
                            : 'bg-canvas border-line text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/98 backdrop-blur-lg border-t border-line p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleProceed}
            disabled={selectedIds.size === 0}
            className="w-full min-h-[56px] py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>
              {t('action.proceed')} ({selectedIds.size})
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
