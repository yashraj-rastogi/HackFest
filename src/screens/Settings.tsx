import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import type { Lang } from '../db/schema';
import { getSetting, setSetting } from '../db/repos';
import { generateDemoData, clearDemoData } from '../seed/generateDemo';
import { AppShell } from '../components/AppShell';
import { triggerHaptic, triggerSuccessHaptic } from '../lib/haptics';
import {
  Languages,
  Database,
  Info,
  Heart,
  HardDrive,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useTranslation();
  const [shopName, setShopName] = useState('');
  const [demoStatus, setDemoStatus] = useState<string>('');
  const [isPersisted, setIsPersisted] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<string>('');

  useEffect(() => {
    getSetting<string>('shopName', '').then(setShopName);

    // Check storage persistence
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.persisted) {
        navigator.storage.persisted().then(setIsPersisted);
      }
      if (navigator.storage.estimate) {
        navigator.storage.estimate().then((est) => {
          if (est.usage) {
            const kb = Math.round(est.usage / 1024);
            setStorageUsage(`${kb} KB`);
          }
        });
      }
    }
  }, []);

  const handleNameBlur = async () => {
    await setSetting('shopName', shopName.trim());
  };

  const handleLangChange = async (newLang: Lang) => {
    triggerHaptic(12);
    await setLang(newLang);
  };

  const handleSeedDemo = async () => {
    triggerHaptic(20);
    setDemoStatus('Seeding 60 days of demo transactions...');
    await generateDemoData();
    triggerSuccessHaptic();
    setDemoStatus(t('settings.demoSeeded'));
    setTimeout(() => setDemoStatus(''), 4000);
  };

  const handleClearDemo = async () => {
    if (window.confirm('Demo data hata dein? (Clear demo data?) Real records will not be deleted.')) {
      triggerHaptic(20);
      await clearDemoData();
      setDemoStatus(t('settings.demoCleared'));
      setTimeout(() => setDemoStatus(''), 4000);
    }
  };

  const handleRequestPersistence = async () => {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      const granted = await navigator.storage.persist();
      setIsPersisted(granted);
      triggerHaptic(10);
    }
  };

  return (
    <AppShell headerTitle={t('settings.title')}>
      <div className="space-y-4 pb-20">
        {/* Store Profile */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <span>🏪</span>
            <span>{t('settings.storeProfile')}</span>
          </div>

          <div>
            <label htmlFor="settingsStoreName" className="text-xs text-ink-muted block mb-1">
              {t('settings.storeName')}
            </label>
            <input
              id="settingsStoreName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="e.g. Radhe Kirana Store"
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-canvas border border-line text-sm font-semibold text-ink focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Language Selection */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <Languages className="w-4 h-4 text-brand-dark" />
            <span>{t('settings.language')}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'hi', label: 'हिन्दी' },
              { id: 'hinglish', label: 'Hinglish' },
              { id: 'en', label: 'English' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => handleLangChange(l.id as Lang)}
                className={`min-h-[46px] px-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  lang === l.id
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-canvas text-ink border-line hover:border-brand/30'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wholesale Suppliers Shortcut */}
        <button
          type="button"
          onClick={() => navigate('/settings/suppliers')}
          className="w-full p-4 rounded-3xl bg-surface border border-line shadow-xs flex items-center justify-between text-left active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-dark flex items-center justify-center">
              <span>🚚</span>
            </div>
            <div>
              <div className="text-sm font-bold text-ink">Suppliers & Wholesale Contacts</div>
              <div className="text-xs text-ink-muted">Set distributor WhatsApp numbers and lead times</div>
            </div>
          </div>
          <span className="text-brand-dark font-bold text-xs">Manage →</span>
        </button>

        {/* Demo Data Management */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue" />
            <span>{t('settings.demoData')}</span>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Generate 60 days of realistic sales, fast movers, dead stock, and suppliers for testing.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSeedDemo}
              className="min-h-[48px] px-3 py-2.5 rounded-xl bg-brand text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
            >
              <span>+ {t('settings.seedDemo')}</span>
            </button>

            <button
              type="button"
              onClick={handleClearDemo}
              className="min-h-[48px] px-3 py-2.5 rounded-xl border border-line bg-canvas hover:bg-line/20 text-ink font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-ink-muted" />
              <span>{t('settings.clearDemo')}</span>
            </button>
          </div>

          {demoStatus && (
            <div className="p-2.5 rounded-xl bg-brand-soft text-brand-dark text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{demoStatus}</span>
            </div>
          )}
        </div>

        {/* Storage & Offline Status */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <HardDrive className="w-4 h-4 text-ink-muted" />
            <span>On-Device Storage</span>
          </div>

          <div className="flex items-center justify-between text-xs text-ink">
            <span>Storage Used:</span>
            <span className="font-bold tabular-nums">{storageUsage || 'Active (IndexedDB)'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-ink">
            <span>Persistent Protection:</span>
            <span className={isPersisted ? 'text-success font-bold' : 'text-warning font-semibold'}>
              {isPersisted ? 'Guaranteed ✓' : 'Standard'}
            </span>
          </div>

          {!isPersisted && (
            <button
              type="button"
              onClick={handleRequestPersistence}
              className="text-xs font-semibold text-brand-dark hover:underline pt-1 block"
            >
              Protect database from browser cleanup →
            </button>
          )}
        </div>

        {/* About & Open Source Credits */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <Info className="w-4 h-4 text-ink-muted" />
            <span>{t('settings.about')}</span>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            KiranaSaathi is a phone-first, offline-first companion replacing the shopkeeper's notebook. Built for the GDG on Campus SRMCEM × MLH Hackfest (Track 1: The Kirana Problem & Best Use of Gemma 4).
          </p>

          <div className="pt-2 border-t border-line/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink mb-1.5">
              <Heart className="w-3.5 h-3.5 text-danger" />
              <span>{t('settings.credits')}</span>
            </div>
            <p className="text-[11px] text-ink-muted leading-normal">
              React 19, Tailwind CSS v4, Dexie.js (IndexedDB), Fuse.js, Lucide Icons, Vite PWA, Inter & Noto Sans Devanagari. Licensed under Apache 2.0.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
