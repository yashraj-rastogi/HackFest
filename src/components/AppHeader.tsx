import React, { useState } from 'react';
import { Store, Settings as SettingsIcon, Languages, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { OfflinePill } from './OfflinePill';
import type { Lang } from '../db/schema';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const langLabels: Record<Lang, string> = {
    hi: 'हिन्दी',
    en: 'English',
    hinglish: 'Hinglish',
  };

  const handleLangSelect = (selected: Lang) => {
    setLang(selected);
    setLangMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/95 backdrop-blur-md border-b border-line/70 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand / Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-dark flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 stroke-[2.25]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-ink leading-tight truncate">
              {title || t('app.title')}
            </h1>
            <p className="text-[11px] text-ink-muted leading-tight truncate">
              {subtitle || t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2 shrink-0">
          <OfflinePill />

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="h-8.5 px-2 rounded-xl bg-canvas hover:bg-line/40 border border-line text-xs font-semibold text-ink flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Languages className="w-3.5 h-3.5 text-brand-dark" />
              <span>{langLabels[lang]}</span>
              <ChevronDown className="w-3 h-3 text-ink-muted" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-surface rounded-2xl shadow-xl border border-line p-1 z-50 animate-scale-in">
                {(['hi', 'en', 'hinglish'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLangSelect(l)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between ${
                      lang === l ? 'bg-brand-soft text-brand-dark' : 'text-ink hover:bg-canvas'
                    }`}
                  >
                    <span>{langLabels[l]}</span>
                    {lang === l && <span className="text-brand-dark">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {rightAction || (
            <button
              type="button"
              onClick={() => navigate('/more')}
              aria-label="Settings and More"
              className="w-8.5 h-8.5 rounded-xl bg-canvas hover:bg-line/40 border border-line flex items-center justify-center text-ink-muted hover:text-ink active:scale-90"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
