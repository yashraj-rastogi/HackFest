import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { recordCount, recordKhatam, recordMissed } from '../db/ledger';
import { getStockState } from '../domain/stock';
import { getDaysSinceLastSale } from '../domain/lists';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { QuantityStepper } from '../components/QuantityStepper';
import { QtyChips } from '../components/QtyChips';
import { StatusChip, type StatusType } from '../components/StatusChip';
import { ConfidenceDot } from '../components/ConfidenceDot';
import { triggerHaptic } from '../lib/haptics';
import { ArrowLeft, Save, AlertOctagon, HelpCircle, Trash2 } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t } = useTranslation();

  const item = useLiveQuery(() => (id ? db.items.get(id) : undefined), [id]);
  const movements = useLiveQuery(
    () => (id ? db.movements.where('itemId').equals(id).sortBy('at') : []),
    [id]
  ) || [];

  const stockState = React.useMemo(() => getStockState(movements), [movements]);

  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];
  const [currentQty, setCurrentQty] = useState<number>(0);
  const [minQty, setMinQty] = useState<number>(1000);
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (stockState?.qty !== null && stockState?.qty !== undefined) {
      setCurrentQty(stockState.qty);
    } else if (item) {
      setCurrentQty(item.defaultSaleQty);
    }
    if (item) {
      setMinQty(item.minQty);
      setSupplierId(item.supplierId);
    }
  }, [item, stockState?.qty]);

  if (!item) {
    return (
      <AppShell>
        <div className="text-center py-20 text-ink-muted">
          Product not found
        </div>
      </AppShell>
    );
  }

  const localizedName = item.names[lang] || item.names.hi || item.names.en;
  const daysSinceSale = getDaysSinceLastSale(movements, stockState.baselineAt);

  let status: StatusType = 'inStock';
  if (stockState.qty === 0) status = 'out';
  else if (stockState.qty !== null && stockState.qty <= minQty) status = 'low';

  const handleUpdateStock = async () => {
    triggerHaptic(15);
    // 1. Record COUNT movement with new stock
    await recordCount(item.id, currentQty, 'shelfwalk');

    // 2. Update item minQty and supplierId if modified
    await db.items.update(item.id, {
      minQty,
      supplierId: supplierId || undefined,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      navigate(-1);
    }, 600);
  };

  const handleKhatam = async () => {
    triggerHaptic(20);
    await recordKhatam(item.id, 'chips');
    setCurrentQty(0);
  };

  const handleMissed = async () => {
    triggerHaptic(12);
    await recordMissed(item.id, item.defaultSaleQty, 'chips');
  };

  const handleArchive = async () => {
    if (window.confirm('Hata dein? (Archive this item?)')) {
      await db.items.update(item.id, { archived: true });
      navigate('/stock');
    }
  };

  return (
    <AppShell
      headerTitle={t('stock.editProduct')}
      headerRightAction={
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8.5 h-8.5 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink-muted active:scale-90"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-5 pb-20">
        {/* Product Identity Banner */}
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-canvas border border-line/60 flex items-center justify-center text-4xl shrink-0">
            {item.emoji || '📦'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-ink leading-tight truncate">
                {localizedName}
              </h2>
              <ConfidenceDot confidence={stockState.confidence} />
            </div>
            <p className="text-xs text-ink-muted mt-0.5 truncate">
              {item.names.en} • {item.category.replace('_', ' ')}
            </p>
            <div className="mt-2">
              <StatusChip status={status} />
            </div>
          </div>
        </div>

        {/* Current Stock Section */}
        <div className="p-5 rounded-3xl bg-surface border border-line space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {t('prompt.currentStock')}
            </span>
            <span className="text-xs font-semibold text-brand-dark">
              {formatQty(currentQty, item.baseUnit, lang)}
            </span>
          </div>

          <QuantityStepper
            qty={currentQty}
            baseUnit={item.baseUnit}
            onChange={setCurrentQty}
          />

          <QtyChips
            chips={item.chips}
            baseUnit={item.baseUnit}
            selectedQty={currentQty}
            onSelect={setCurrentQty}
          />
        </div>

        {/* Minimum Stock Alert Threshold */}
        <div className="p-5 rounded-3xl bg-surface border border-line space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {t('prompt.minStock')}
            </span>
            <span className="text-xs font-semibold text-warning">
              {formatQty(minQty, item.baseUnit, lang)}
            </span>
          </div>

          <QuantityStepper
            qty={minQty}
            baseUnit={item.baseUnit}
            onChange={setMinQty}
          />

          <QtyChips
            chips={item.chips}
            baseUnit={item.baseUnit}
            selectedQty={minQty}
            onSelect={setMinQty}
          />
        </div>

        {/* Assigned Supplier */}
        <div className="p-5 rounded-3xl bg-surface border border-line space-y-2 shadow-xs">
          <label
            htmlFor="supplierSelect"
            className="block text-xs font-bold text-ink-muted uppercase tracking-wider"
          >
            Assigned Supplier (सप्लायर)
          </label>
          <select
            id="supplierSelect"
            value={supplierId || ''}
            onChange={(e) => setSupplierId(e.target.value || undefined)}
            className="w-full min-h-[46px] px-3.5 rounded-xl bg-canvas border border-line text-sm font-semibold text-ink focus:outline-none focus:border-brand"
          >
            <option value="">No supplier assigned (General)</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.whatsapp || 'No WhatsApp'})
              </option>
            ))}
          </select>
        </div>

        {/* Sales History Info */}
        <div className="p-4 rounded-2xl bg-canvas border border-line/70 text-xs text-ink-muted space-y-1">
          <div>
            {daysSinceSale > 0 ? (
              <span>
                {t('stock.lastSold', { date: `${daysSinceSale} days ago` })}
              </span>
            ) : (
              <span>{t('stock.neverSold')}</span>
            )}
          </div>
          <div>Default sale tap: {formatQty(item.defaultSaleQty, item.baseUnit, lang)}</div>
        </div>

        {/* Quick Stock Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleKhatam}
            className="min-h-[48px] px-3.5 py-2.5 rounded-2xl border border-danger/40 text-danger hover:bg-danger/5 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{t('action.markFinished')}</span>
          </button>

          <button
            type="button"
            onClick={handleMissed}
            className="min-h-[48px] px-3.5 py-2.5 rounded-2xl border border-warning/40 text-warning hover:bg-warning/5 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('action.missed')}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleArchive}
          className="w-full text-center text-xs text-danger/80 hover:text-danger py-2 flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hata do (Archive product)</span>
        </button>
      </div>

      {/* Pinned Bottom Primary Button (56px target) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/98 backdrop-blur-lg border-t border-line p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleUpdateStock}
            className={`w-full min-h-[56px] py-3.5 px-6 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all ${
              isSaved
                ? 'bg-success text-white'
                : 'bg-brand hover:bg-brand-dark text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            <span>{isSaved ? 'Saved on this device!' : t('action.updateStock')}</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
};
