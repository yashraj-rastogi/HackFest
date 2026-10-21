import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item, type Movement } from '../db/schema';
import { recordStockIn, recordCount, recordKhatam, recordMissed, recordSale } from '../db/ledger';
import { getStockState } from '../domain/stock';
import { isLow, isNotMoving, getDaysSinceLastSale } from '../domain/lists';
import { calculateSellRate } from '../domain/sellRate';
import { calculateReorder, type ReorderSuggestion } from '../domain/reorder';
import {
  groupReorderSuggestionsBySupplier,
  formatWhatsAppOrderMessage,
  generateWhatsAppLink,
} from '../domain/share';
import { formatQty } from '../domain/units';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { StatusChip } from '../components/StatusChip';
import { ConfidenceDot } from '../components/ConfidenceDot';
import { QuickActionSheet } from '../components/QuickActionSheet';
import { triggerHaptic } from '../lib/haptics';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';

type ListTab = 'reorder' | 'low' | 'noMovement';

export const Lists: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ListTab>('reorder');
  const [activeSheetItem, setActiveSheetItem] = useState<Item | null>(null);
  const [selectedForOrder, setSelectedForOrder] = useState<Set<string>>(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'noMovement') {
      setActiveTab('noMovement');
    } else if (tabParam === 'low') {
      setActiveTab('low');
    } else if (tabParam === 'reorder') {
      setActiveTab('reorder');
    }
  }, [searchParams]);

  // Live queries
  const items = useLiveQuery(() => db.items.filter((i) => !i.archived).toArray()) || [];
  const movements = useLiveQuery(() => db.movements.toArray()) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];

  // Group movements by itemId
  const movementsByItem = useMemo(() => {
    const map = new Map<string, Movement[]>();
    for (const m of movements) {
      const list = map.get(m.itemId) || [];
      list.push(m);
      map.set(m.itemId, list);
    }
    return map;
  }, [movements]);

  // Map suppliers by id
  const supplierMap = useMemo(() => {
    const map = new Map<string, typeof suppliers[0]>();
    for (const s of suppliers) {
      map.set(s.id, s);
    }
    return map;
  }, [suppliers]);

  // Calculate lists: Reorder Suggestions, Low Stock, and No Movement
  const { reorderSuggestions, lowStockItems, noMovementItems } = useMemo(() => {
    const now = Date.now();
    const suggestions: ReorderSuggestion[] = [];
    const low: { item: Item; moves: Movement[]; state: ReturnType<typeof getStockState> }[] = [];
    const dead: { item: Item; moves: Movement[]; state: ReturnType<typeof getStockState>; days: number }[] = [];

    for (const item of items) {
      const moves = movementsByItem.get(item.id) || [];
      const state = getStockState(moves, now);
      const rate = calculateSellRate(moves, now);
      const sup = item.supplierId ? supplierMap.get(item.supplierId) : undefined;

      // 1. Reorder calculation
      const sug = calculateReorder(item, state, rate, sup);
      if (sug.needsReorder) {
        suggestions.push(sug);
      }

      // 2. Low stock list
      if (isLow(item, state)) {
        low.push({ item, moves, state });
      }

      // 3. No movement list
      if (isNotMoving(item, state, moves, now)) {
        const days = getDaysSinceLastSale(moves, state.baselineAt, now);
        dead.push({ item, moves, state, days });
      }
    }

    return {
      reorderSuggestions: suggestions,
      lowStockItems: low,
      noMovementItems: dead,
    };
  }, [items, movementsByItem, supplierMap]);

  // Initialize selected set for reorder
  useEffect(() => {
    if (reorderSuggestions.length > 0 && selectedForOrder.size === 0) {
      setSelectedForOrder(new Set(reorderSuggestions.map((s) => s.item.id)));
    }
  }, [reorderSuggestions]);

  const toggleSelectOrder = (id: string) => {
    triggerHaptic(8);
    setSelectedForOrder((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group selected suggestions for WhatsApp sharing
  const supplierGroups = useMemo(() => {
    const chosen = reorderSuggestions.filter((s) => selectedForOrder.has(s.item.id));
    return groupReorderSuggestionsBySupplier(chosen, suppliers);
  }, [reorderSuggestions, selectedForOrder, suppliers]);

  return (
    <AppShell headerTitle={t('home.reorder')} headerSubtitle={t('home.reorder.sub')}>
      <div className="space-y-4">
        {/* Three Tab Navigation */}
        <div
          role="tablist"
          aria-label="Reorder lists"
          className="grid grid-cols-3 gap-1 p-1 bg-surface rounded-2xl border border-line shadow-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reorder'}
            onClick={() => setActiveTab('reorder')}
            className={`min-h-[42px] py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              activeTab === 'reorder'
                ? 'bg-lilac text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="truncate">Mangwana hai ({reorderSuggestions.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'low'}
            onClick={() => setActiveTab('low')}
            className={`min-h-[42px] py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              activeTab === 'low'
                ? 'bg-[#8A5000] text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="truncate">Kam ({lowStockItems.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'noMovement'}
            onClick={() => setActiveTab('noMovement')}
            className={`min-h-[42px] py-1.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              activeTab === 'noMovement'
                ? 'bg-blue text-white shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">Ruka hua ({noMovementItems.length})</span>
          </button>
        </div>

        {/* Tab 1: Reorder Suggestions ("Mangwana hai") */}
        {activeTab === 'reorder' && (
          <div className="space-y-3 pb-24">
            {reorderSuggestions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand mx-auto" />
                <h3 className="text-base font-bold text-ink">
                  {t('reorder.empty')}
                </h3>
                <p className="text-xs text-ink-muted">
                  All items are sufficiently stocked based on sales rate and safety thresholds.
                </p>
              </div>
            ) : (
              reorderSuggestions.map((sug) => {
                const { item } = sug;
                const isSelected = selectedForOrder.has(item.id);
                const localizedName = item.names[lang] || item.names.hi || item.names.en;
                const sup = item.supplierId ? supplierMap.get(item.supplierId) : undefined;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl border transition-all duration-150 shadow-xs space-y-3 ${
                      isSelected ? 'bg-surface border-lilac/60 ring-1 ring-lilac/30' : 'bg-surface/80 border-line opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox for batch order */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(item.id)}
                          aria-label={`Select ${localizedName} for reorder`}
                          className="w-5 h-5 rounded-md accent-lilac shrink-0"
                        />

                        <span className="w-11 h-11 rounded-2xl bg-canvas border border-line/40 flex items-center justify-center text-2xl shrink-0 select-none">
                          {item.emoji || '📦'}
                        </span>

                        <div className="truncate">
                          <h4 className="text-base font-bold text-ink truncate leading-tight">
                            {localizedName}
                          </h4>
                          <div className="text-xs text-ink-muted mt-0.5 truncate">
                            {sup ? `Supplier: ${sup.name}` : 'No supplier assigned'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-brand-dark tabular-nums">
                          +{formatQty(sug.suggestedQty, item.baseUnit, lang)}
                        </div>
                        <div className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                          Order Qty
                        </div>
                      </div>
                    </div>

                    {/* Stock reason and basis */}
                    <div className="p-2.5 rounded-2xl bg-canvas flex items-center justify-between text-xs text-ink">
                      <span className="text-danger font-medium">{sug.reason}</span>
                      <span className="text-[11px] text-ink-muted">
                        {sug.basis === 'sales'
                          ? t('basis.sales', { n: sug.basisDays })
                          : t('basis.threshold')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveSheetItem(item)}
                        className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-brand-soft text-brand-dark font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>+ {t('action.addStock')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/stock/${item.id}`)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-canvas border border-line text-ink font-semibold text-xs flex items-center gap-1 active:scale-95"
                      >
                        <span>{t('action.edit')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pinned WhatsApp Reorder Bar */}
            {reorderSuggestions.length > 0 && (
              <div className="fixed bottom-16 left-0 right-0 z-30 bg-surface/98 backdrop-blur-lg border-t border-line p-3 pb-3">
                <div className="max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    disabled={selectedForOrder.size === 0}
                    className="w-full min-h-[52px] py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] disabled:opacity-40 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {t('action.sendWhatsApp')} ({selectedForOrder.size} items)
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Low Stock */}
        {activeTab === 'low' && (
          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand mx-auto" />
                <h3 className="text-base font-bold text-ink">
                  {t('alerts.allGood')}
                </h3>
              </div>
            ) : (
              lowStockItems.map(({ item, state }) => {
                const localizedName = item.names[lang] || item.names.hi || item.names.en;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 h-12 rounded-2xl bg-canvas border border-line/40 flex items-center justify-center text-3xl shrink-0 select-none">
                          {item.emoji || '📦'}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-base font-bold text-ink truncate leading-tight">
                              {localizedName}
                            </h4>
                            <ConfidenceDot confidence={state.confidence} />
                          </div>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {item.names.en}
                          </div>
                        </div>
                      </div>

                      <StatusChip
                        status={state.qty === 0 ? 'out' : 'low'}
                        label={state.qty === 0 ? t('status.out') : t('status.low')}
                      />
                    </div>

                    <div className="p-2.5 rounded-2xl bg-canvas flex items-center justify-between text-xs text-ink">
                      <div>
                        <span className="text-ink-muted">{t('prompt.currentStock')}: </span>
                        <span className="font-bold tabular-nums">
                          {formatQty(state.qty, item.baseUnit, lang)}
                        </span>
                      </div>
                      <div>
                        <span className="text-ink-muted">{t('prompt.minStock')}: </span>
                        <span className="font-bold tabular-nums text-warning">
                          {formatQty(item.minQty, item.baseUnit, lang)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveSheetItem(item)}
                        className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-brand text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>+ {t('action.addStock')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/stock/${item.id}`)}
                        className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-canvas border border-line text-ink font-semibold text-xs flex items-center gap-1 active:scale-95"
                      >
                        <span>{t('action.edit')}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: No Movement */}
        {activeTab === 'noMovement' && (
          <div className="space-y-3">
            {noMovementItems.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface border border-line text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand mx-auto" />
                <h3 className="text-base font-bold text-ink">
                  No dead stock!
                </h3>
              </div>
            ) : (
              noMovementItems.map(({ item, state, days }) => {
                const localizedName = item.names[lang] || item.names.hi || item.names.en;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 h-12 rounded-2xl bg-canvas border border-line/40 flex items-center justify-center text-3xl shrink-0 select-none">
                          {item.emoji || '📦'}
                        </span>
                        <div className="truncate">
                          <h4 className="text-base font-bold text-ink truncate leading-tight">
                            {localizedName}
                          </h4>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {item.names.en}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-blue bg-blue-soft border border-blue/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{days} days</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-canvas flex items-center justify-between text-xs text-ink">
                      <div>
                        <span className="text-ink-muted">Sitting Stock: </span>
                        <span className="font-bold tabular-nums">
                          {formatQty(state.qty, item.baseUnit, lang)}
                        </span>
                      </div>
                      <div className="text-danger font-semibold">
                        {t('msg.noMovement', { n: days })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/stock/${item.id}`)}
                      className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-line bg-canvas hover:bg-line/30 text-ink font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <span>{t('action.review')} (Check shelf)</span>
                      <ChevronRight className="w-4 h-4 text-ink-muted" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Share Group Picker Modal */}
      {shareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-3xl bg-surface p-5 border border-line shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Send WhatsApp Order List
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Grouped by wholesale supplier
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-canvas text-ink-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {supplierGroups.map((group, idx) => {
                const groupTitle = group.supplier ? group.supplier.name : 'General / Other Items';
                const message = formatWhatsAppOrderMessage(group, 'Kirana Store', lang);
                const waLink = generateWhatsAppLink(group.supplier?.whatsapp, message);

                return (
                  <div
                    key={group.supplier?.id || `unassigned-${idx}`}
                    className="p-4 rounded-2xl bg-canvas border border-line space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ink">
                        {groupTitle} ({group.items.length} items)
                      </span>
                      {group.supplier?.whatsapp && (
                        <span className="text-[11px] text-ink-muted">
                          {group.supplier.whatsapp}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-ink-muted line-clamp-3 bg-surface p-2 rounded-xl border border-line/60 font-mono whitespace-pre-wrap">
                      {message}
                    </div>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[46px] rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send to {groupTitle}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Sheet */}
      {activeSheetItem && (
        <QuickActionSheet
          item={activeSheetItem}
          stockState={getStockState(movementsByItem.get(activeSheetItem.id) || [])}
          initialTab="stockIn"
          onClose={() => setActiveSheetItem(null)}
          onRecordSale={async (item, qty) => {
            await recordSale(item.id, qty, 'chips');
          }}
          onRecordStockIn={async (item, qty) => {
            await recordStockIn(item.id, qty, 'chips');
          }}
          onRecordCount={async (item, qty) => {
            await recordCount(item.id, qty, 'chips');
          }}
          onRecordKhatam={async (item) => {
            await recordKhatam(item.id, 'chips');
          }}
          onRecordMissed={async (item) => {
            await recordMissed(item.id, 1, 'chips');
          }}
        />
      )}
    </AppShell>
  );
};
