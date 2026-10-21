import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import type { Lang, ShopType } from '../db/schema';
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
  Bell,
  BellRing,
  Store,
} from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  isNotificationSupported,
} from '../services/notifications';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useTranslation();
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState<ShopType>('kirana');
  const [demoStatus, setDemoStatus] = useState<string>('');
  const [isPersisted, setIsPersisted] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<string>('');
  const [isNotifSupported, setIsNotifSupported] = useState<boolean>(true);
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [testStatus, setTestStatus] = useState<string>('');

  useEffect(() => {
    getSetting<string>('shopName', '').then(setShopName);
    getSetting<ShopType>('shopType', 'kirana').then(setShopType);
    setIsNotifSupported(isNotificationSupported());
    setNotifPermission(getNotificationPermission());

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

  const handleShopTypeChange = async (type: ShopType) => {
    triggerHaptic(12);
    setShopType(type);
    await setSetting('shopType', type);
  };

  const handleLangChange = async (newLang: Lang) => {
    triggerHaptic(12);
    await setLang(newLang);
  };

  const handleSeedDemo = async (targetType?: ShopType) => {
    const typeToSeed = targetType || shopType;
    triggerHaptic(20);
    setShopType(typeToSeed);
    setDemoStatus(`Seeding 60 days of demo transactions for ${typeToSeed}...`);
    await generateDemoData(typeToSeed);
    triggerSuccessHaptic();
    setDemoStatus(`${t('settings.demoSeeded')} (${typeToSeed})`);
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

  const handleRequestNotification = async () => {
    triggerHaptic(15);
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const handleTestNotification = async () => {
    triggerHaptic(15);
    const success = await sendTestNotification(lang);
    if (success) {
      setTestStatus(t('settings.notificationsActive'));
    } else {
      setTestStatus(t('settings.notificationsBlocked'));
    }
    setNotifPermission(getNotificationPermission());
    setTimeout(() => setTestStatus(''), 4000);
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
                className={`min-h-[46px] px-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${lang === l.id
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-canvas text-ink border-line hover:border-brand/30'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Store Category & Type */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
              <Store className="w-4 h-4 text-brand-dark" />
              <span>Store Category & Type</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-soft text-brand-dark uppercase tracking-wider">
              {shopType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'kirana', emoji: '🏪', label: t('shopType.kirana') },
              { id: 'stationery', emoji: '✏️', label: t('shopType.stationery') },
              { id: 'hardware', emoji: '🔧', label: t('shopType.hardware') },
              { id: 'general', emoji: '📦', label: t('shopType.general') },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleShopTypeChange(item.id as ShopType)}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  shopType === item.id
                    ? 'bg-brand-soft border-brand text-brand-dark font-bold shadow-xs'
                    : 'bg-canvas border-line text-ink font-medium hover:border-brand/30'
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <div className="text-xs leading-snug">
                  <div className="font-bold">{item.label}</div>
                </div>
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

        {/* Stock Alerts & Push Notifications */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
              <BellRing className="w-4 h-4 text-brand-dark" />
              <span>{t('settings.notifications')}</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                !isNotifSupported
                  ? 'bg-ink-muted/10 text-ink-muted'
                  : notifPermission === 'granted'
                  ? 'bg-success/10 text-success'
                  : notifPermission === 'denied'
                  ? 'bg-danger/10 text-danger'
                  : 'bg-warning/10 text-warning'
              }`}
            >
              {!isNotifSupported
                ? 'N/A'
                : notifPermission === 'granted'
                ? t('settings.notificationsActive')
                : notifPermission === 'denied'
                ? 'Blocked'
                : 'Off'}
            </span>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            {t('settings.notificationsDesc')}
          </p>

          <div className="pt-1">
            {notifPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestNotification}
                className="w-full min-h-[46px] px-3 py-2.5 rounded-xl bg-brand text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 shadow-xs"
              >
                <Bell className="w-4 h-4" />
                <span>{t('settings.enableNotifications')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTestNotification}
                className="w-full min-h-[46px] px-3 py-2.5 rounded-xl border border-line bg-canvas hover:bg-line/20 text-ink font-semibold text-xs flex items-center justify-center gap-2 active:scale-95"
              >
                <BellRing className="w-4 h-4 text-brand-dark" />
                <span>{t('settings.testNotification')}</span>
              </button>
            )}
          </div>

          {testStatus && (
            <div className="p-2.5 rounded-xl bg-brand-soft text-brand-dark text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testStatus}</span>
            </div>
          )}
        </div>

        {/* Demo Data Management */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
              <Database className="w-4 h-4 text-blue" />
              <span>{t('settings.demoData')}</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-soft text-brand-dark uppercase tracking-wider">
              {shopType}
            </span>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Generate 60 days of realistic sales, restocks, suppliers, and dead stock matched to your shop category.
          </p>

          {/* Quick Category Seed Selection */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Seed Specific Category:</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'kirana', emoji: '🏪', label: 'Kirana' },
                { id: 'stationery', emoji: '✏️', label: 'Books' },
                { id: 'hardware', emoji: '🔧', label: 'Hardware' },
                { id: 'general', emoji: '📦', label: 'General' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSeedDemo(cat.id as ShopType)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    shopType === cat.id
                      ? 'bg-brand text-white border-brand shadow-xs font-bold'
                      : 'bg-canvas text-ink border-line hover:border-brand/30 font-medium'
                  }`}
                >
                  <div className="text-base">{cat.emoji}</div>
                  <div className="text-[10px] mt-0.5 leading-tight">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleSeedDemo(shopType)}
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
            MuneemJi is a phone-first, offline-first companion replacing the shopkeeper's notebook. Built for the GDG on Campus SRMCEM × MLH Hackfest (Track 1: The Kirana Problem & Best Use of Gemma 4).
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
