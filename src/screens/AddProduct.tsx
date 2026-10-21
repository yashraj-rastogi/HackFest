import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db, type Item, type BaseUnit, type Category } from '../db/schema';
import { generateId } from '../lib/uuid';
import { linkBarcode } from '../db/repos';
import { useTranslation } from '../i18n';
import { AppShell } from '../components/AppShell';
import { triggerHaptic } from '../lib/haptics';
import { ArrowLeft, Plus, Sparkles, Loader2, ScanBarcode } from 'lucide-react';
import { suggestItem } from '../services/gemmaClient';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const barcodeParam = searchParams.get('barcode');
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('staples');
  const [emoji, setEmoji] = useState('📦');
  const [baseUnit, setBaseUnit] = useState<BaseUnit>('g');
  const [defaultSaleQty, setDefaultSaleQty] = useState<number>(1000);
  const [minQty, setMinQty] = useState<number>(5000);
  const [suggesting, setSuggesting] = useState(false);
  const [namesI18n, setNamesI18n] = useState<{ hi?: string; en?: string; hinglish?: string }>({});

  const emojiList = ['🌾', '🍬', '🍚', '🧈', '🥫', '🟡', '🌶️', '🍿', '🍪', '☕', '🥛', '🧼', '🧺', '📓', '🖊️', '🔩', '🔧', '💡', '📦'];

  const handleUnitChange = (u: BaseUnit) => {
    setBaseUnit(u);
    if (u === 'pcs') {
      setDefaultSaleQty(1);
      setMinQty(10);
    } else if (u === 'g' || u === 'ml') {
      setDefaultSaleQty(1000);
      setMinQty(5000);
    }
  };

  const handleSmartSuggest = async () => {
    if (!name.trim()) return;
    triggerHaptic(10);
    setSuggesting(true);
    try {
      const data = await suggestItem(name.trim());
      if (data) {
        if (data.category) setCategory(data.category as Category);
        if (data.base_unit) handleUnitChange(data.base_unit as BaseUnit);
        if (data.names) {
          setNamesI18n(data.names);
        }
      }
    } finally {
      setSuggesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic(15);
    const chips =
      baseUnit === 'pcs'
        ? [1, 2, 5, 10, 12]
        : [250, 500, 1000, 2000, 5000];

    const newItem: Item = {
      id: generateId(),
      shopId: 'local',
      names: {
        hi: namesI18n.hi || name.trim(),
        en: namesI18n.en || name.trim(),
        hinglish: namesI18n.hinglish || name.trim(),
      },
      aliases: [name.trim().toLowerCase()],
      category,
      emoji,
      baseUnit,
      defaultSaleQty,
      chips,
      minQty,
      createdAt: Date.now(),
    };

    await db.items.put(newItem);

    // Link barcode if this item was created from an unknown barcode scan
    if (barcodeParam) {
      await linkBarcode(barcodeParam, newItem.id);
    }

    navigate('/stock');
  };

  return (
    <AppShell
      headerTitle={t('stock.addProduct')}
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
      <form onSubmit={handleSave} className="space-y-4 pb-20">
        {/* Barcode Link Badge */}
        {barcodeParam && (
          <div className="p-3.5 rounded-2xl bg-brand-soft border border-brand/30 flex items-center gap-2.5">
            <ScanBarcode className="w-5 h-5 text-brand shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-ink">Linking Barcode: </span>
              <span className="font-mono font-semibold text-brand-dark">{barcodeParam}</span>
            </div>
          </div>
        )}
        {/* Name input */}
        <div className="p-4 rounded-3xl bg-surface border border-line space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
              Product Name (सामान का नाम) *
            </label>
            {name.trim().length > 2 && (
              <button
                type="button"
                onClick={handleSmartSuggest}
                disabled={suggesting}
                className="text-[11px] font-bold text-lilac flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                {suggesting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Gemma Auto-Fill</span>
              </button>
            )}
          </div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mustard Oil 1L / सरसों का तेल"
            className="w-full min-h-[48px] px-3.5 rounded-xl bg-canvas border border-line text-base text-ink focus:outline-none focus:border-brand"
          />
        </div>

        {/* Category dropdown */}
        <div className="p-4 rounded-3xl bg-surface border border-line space-y-2">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
            Category (विभाग)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full min-h-[46px] px-3.5 rounded-xl bg-canvas border border-line text-sm font-semibold text-ink focus:outline-none focus:border-brand capitalize"
          >
            {[
              'staples', 'oil_ghee', 'pulses', 'spices', 'snacks', 'biscuits',
              'beverages', 'dairy', 'personal_care', 'household',
              'stationery_paper', 'stationery_writing',
              'hardware_tools', 'hardware_fasteners', 'electrical', 'other'
            ].map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Emoji Selector */}
        <div className="p-4 rounded-3xl bg-surface border border-line space-y-2">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
            Choose Icon ({emoji})
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {emojiList.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center shrink-0 border ${
                  emoji === e ? 'border-brand bg-brand-soft ring-2 ring-brand/30' : 'border-line bg-canvas'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selector */}
        <div className="p-4 rounded-3xl bg-surface border border-line space-y-2">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
            Unit of Measurement
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'g', label: 'Grams / kg' },
              { id: 'ml', label: 'Milliliters / L' },
              { id: 'pcs', label: 'Pieces / Dozen' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleUnitChange(u.id as BaseUnit)}
                className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  baseUnit === u.id
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-canvas text-ink border-line'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default Sale & Minimum Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl bg-surface border border-line space-y-2">
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
              Default Tap ({baseUnit})
            </label>
            <input
              type="number"
              min="1"
              value={defaultSaleQty}
              onChange={(e) => setDefaultSaleQty(Number(e.target.value))}
              className="w-full min-h-[46px] px-3 rounded-xl bg-canvas border border-line text-sm font-bold text-ink"
            />
          </div>

          <div className="p-4 rounded-3xl bg-surface border border-line space-y-2">
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
              Min Stock ({baseUnit})
            </label>
            <input
              type="number"
              min="0"
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value))}
              className="w-full min-h-[46px] px-3 rounded-xl bg-canvas border border-line text-sm font-bold text-ink"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface/98 backdrop-blur-lg border-t border-line p-4 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full min-h-[56px] py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-dark disabled:opacity-40 text-white font-bold text-base shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{t('action.save')}</span>
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
};
