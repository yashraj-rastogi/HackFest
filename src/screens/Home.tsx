import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { getStockState } from '../domain/stock';
import { isLow, isNotMoving } from '../domain/lists';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { ActionCard } from '../components/ActionCard';
import { getSetting } from '../db/repos';
import {
  ShoppingBag,
  Package,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [shopName, setShopName] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  // Check onboarding and request durable storage on mount
  useEffect(() => {
    // Request durable storage (FR-1.17)
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }

    const installHandler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', installHandler);

    getSetting<boolean>('onboardingDone', false).then((done) => {
      if (!done) {
        // If not onboarded and no items exist, navigate to welcome
        db.items.count().then((count) => {
          if (count === 0) {
            navigate('/welcome');
          }
        });
      }
    });

    getSetting<string>('shopName', '').then((name) => {
      if (name) setShopName(name);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', installHandler);
    };
  }, [navigate]);

  // Reactive Dexie query for items and movements
  const items = useLiveQuery(() => db.items.filter((i) => !i.archived).toArray()) || [];
  const movements = useLiveQuery(() => db.movements.toArray()) || [];

  // Group movements by itemId
  const movementsByItem = React.useMemo(() => {
    const map = new Map<string, typeof movements>();
    for (const m of movements) {
      const list = map.get(m.itemId) || [];
      list.push(m);
      map.set(m.itemId, list);
    }
    return map;
  }, [movements]);

  // Compute live stock states and list counts
  const { lowStockCount, noMovementCount } = React.useMemo(() => {
    const now = Date.now();
    let lowCount = 0;
    let deadCount = 0;

    for (const item of items) {
      const itemMoves = movementsByItem.get(item.id) || [];
      const state = getStockState(itemMoves, now);

      if (isLow(item, state)) {
        lowCount++;
      }
      if (isNotMoving(item, state, itemMoves, now)) {
        deadCount++;
      }
    }

    return { lowStockCount: lowCount, noMovementCount: deadCount };
  }, [items, movementsByItem]);

  return (
    <AppShell headerSubtitle={shopName || t('app.subtitle')}>
      <div className="space-y-5">
        {/* Warm Greeting with Contained Illustration */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-soft/80 via-sky/60 to-surface border border-line/70 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 z-10">
              <h2 className="text-xl font-bold text-ink leading-tight">
                {t('home.greeting')}
              </h2>
              <p className="text-xs text-ink-muted mt-1 leading-snug">
                {t('home.greetingSub')}
              </p>
            </div>

            {/* Contained Shop Illustration */}
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-surface/90 border border-brand/20 flex items-center justify-center text-4xl shadow-xs select-none">
              🏪
            </div>
          </div>
        </div>

        {/* PWA Install Banner */}
        {installPrompt && !dismissedInstall && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-soft to-surface border border-brand/30 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">📲</span>
              <div className="truncate">
                <h4 className="text-xs font-bold text-ink truncate leading-tight">Install KiranaSaathi</h4>
                <p className="text-[10px] text-ink-muted truncate">Works offline on home screen</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  if (installPrompt) {
                    installPrompt.prompt();
                    const { outcome } = await installPrompt.userChoice;
                    if (outcome === 'accepted') setInstallPrompt(null);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-brand text-white font-bold text-xs active:scale-95 shadow-xs"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setDismissedInstall(true)}
                className="w-7 h-7 rounded-lg text-ink-muted hover:text-ink flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Alerts Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {t('alerts.title')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Low Stock Alert */}
            <button
              type="button"
              onClick={() => navigate('/lists?tab=low')}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-150 active:scale-98 ${
                lowStockCount > 0
                  ? 'bg-[#FFF5E5] border-[#FFE0B2] text-[#8A5000] shadow-xs hover:border-[#FFD08A]'
                  : 'bg-surface border-line text-ink-muted'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  lowStockCount > 0 ? 'bg-[#FFE8CC] text-[#8A5000]' : 'bg-canvas text-ink-muted'
                }`}
              >
                <AlertTriangle className="w-5 h-5 stroke-[2.25]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold leading-tight tabular-nums">
                  {lowStockCount}
                </div>
                <div className="text-[11px] font-semibold truncate leading-tight mt-0.5">
                  {t('status.low')}
                </div>
              </div>
            </button>

            {/* No Movement Alert */}
            <button
              type="button"
              onClick={() => navigate('/lists?tab=noMovement')}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-150 active:scale-98 ${
                noMovementCount > 0
                  ? 'bg-sky/60 border-sky-strong/30 text-ink shadow-xs hover:border-sky-strong/50'
                  : 'bg-surface border-line text-ink-muted'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  noMovementCount > 0 ? 'bg-sky text-ink' : 'bg-canvas text-ink-muted'
                }`}
              >
                <Clock className="w-5 h-5 stroke-[2.25]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold leading-tight tabular-nums">
                  {noMovementCount}
                </div>
                <div className="text-[11px] font-semibold truncate leading-tight mt-0.5">
                  {t('status.noMovement')}
                </div>
              </div>
            </button>
          </div>

          {lowStockCount === 0 && noMovementCount === 0 && (
            <div className="p-3 rounded-2xl bg-surface border border-line flex items-center gap-2.5 text-xs text-ink-muted">
              <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
              <span>{t('alerts.allGood')}</span>
            </div>
          )}
        </div>

        {/* Hero Core Action Cards */}
        <div className="space-y-3 pt-1">
          {/* 1. Record Sale */}
          <ActionCard
            title={t('home.recordSale')}
            subtitle={t('home.recordSale.sub')}
            icon={<ShoppingBag className="w-6 h-6 stroke-[2.25]" />}
            onClick={() => navigate('/sale')}
            variant="green"
          />

          {/* 2. Manage Stock */}
          <ActionCard
            title={t('home.manageStock')}
            subtitle={t('home.manageStock.sub')}
            icon={<Package className="w-6 h-6 stroke-[2.25]" />}
            onClick={() => navigate('/stock')}
            variant="blue"
          />

          {/* 3. What Should I Reorder? */}
          <ActionCard
            title={t('home.reorder')}
            subtitle={t('home.reorder.sub')}
            icon={<Sparkles className="w-6 h-6 stroke-[2.25]" />}
            onClick={() => navigate('/lists')}
            variant="lilac"
            badge={lowStockCount > 0 ? `${lowStockCount} items` : undefined}
          />
        </div>

        {/* Empty state prompt if 0 items */}
        {items.length === 0 && (
          <div className="p-6 rounded-3xl bg-surface border border-dashed border-brand/40 text-center space-y-3">
            <PlusCircle className="w-10 h-10 text-brand mx-auto" />
            <h4 className="text-base font-bold text-ink">
              {t('empty.firstProduct')}
            </h4>
            <p className="text-xs text-ink-muted">
              Run the setup to pick common kirana products or add your custom items.
            </p>
            <button
              type="button"
              onClick={() => navigate('/welcome')}
              className="min-h-[48px] px-6 py-2 rounded-xl bg-brand text-white font-bold text-sm shadow-sm active:scale-95"
            >
              Start Quick Setup
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};
