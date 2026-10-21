import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import type { ShopType as ShopTypeEnum } from '../db/schema';
import { setSetting } from '../db/repos';
import { triggerHaptic } from '../lib/haptics';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const ShopType: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [shopName, setShopName] = useState('');
  const [selectedType, setSelectedType] = useState<ShopTypeEnum>('kirana');

  const shopTypes: { id: ShopTypeEnum; emoji: string; titleKey: string; sub: string }[] = [
    {
      id: 'kirana',
      emoji: '🏪',
      titleKey: 'shopType.kirana',
      sub: 'Atta, Daal, Cheeni, Spices, Dairy, Soap',
    },
    {
      id: 'stationery',
      emoji: '✏️',
      titleKey: 'shopType.stationery',
      sub: 'Copies, Registers, Pens, Craft & Office',
    },
    {
      id: 'hardware',
      emoji: '🔧',
      titleKey: 'shopType.hardware',
      sub: 'Tools, Fasteners, Wire, Screws, Bulbs',
    },
    {
      id: 'general',
      emoji: '📦',
      titleKey: 'shopType.general',
      sub: 'Mixed Daily Essentials & Packaged Goods',
    },
  ];

  const handleSelect = async (type: ShopTypeEnum) => {
    setSelectedType(type);
    triggerHaptic(12);
  };

  const handleProceed = async () => {
    triggerHaptic(15);
    await setSetting('shopType', selectedType);
    if (shopName.trim()) {
      await setSetting('shopName', shopName.trim());
    }
    navigate('/setup/pick');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-5 max-w-md mx-auto">
      <div>
        {/* Back and Title */}
        <div className="flex items-center gap-3 pt-2 pb-4">
          <button
            type="button"
            onClick={() => navigate('/welcome')}
            className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-ink-muted hover:text-ink active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink leading-tight">
              {t('prompt.selectShopType')}
            </h1>
            <p className="text-xs text-ink-muted">Step 2 of 4</p>
          </div>
        </div>

        {/* Optional Shop Name */}
        <div className="mb-5 bg-surface p-4 rounded-3xl border border-line shadow-xs">
          <label
            htmlFor="shopNameInput"
            className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider"
          >
            {t('settings.storeName')} (Optional)
          </label>
          <input
            id="shopNameInput"
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Gupta General Store"
            className="w-full min-h-[46px] px-3.5 rounded-xl bg-canvas border border-line text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Shop Type Tiles */}
        <div className="grid grid-cols-1 gap-3">
          {shopTypes.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleSelect(type.id)}
                className={`p-4 rounded-3xl border text-left flex items-center gap-3.5 transition-all duration-150 active:scale-98 ${
                  isSelected
                    ? 'bg-surface border-brand ring-2 ring-brand/30 shadow-md'
                    : 'bg-surface border-line hover:border-brand/40 shadow-xs'
                }`}
              >
                <div className="w-13 h-13 rounded-2xl bg-canvas border border-line/40 flex items-center justify-center text-3xl shrink-0">
                  {type.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-ink leading-tight">
                    {t(type.titleKey)}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5 truncate">
                    {type.sub}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-transparent'
                  }`}
                >
                  {isSelected && <span className="text-[10px] font-bold">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="pt-4 pb-2">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full min-h-[56px] py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-base tracking-wide shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>{t('action.proceed')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
