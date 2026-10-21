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
    <header className="sticky top-0 z-30 w-full bg-cream border-b-[2.5px] border-ink px-4 py-2.5 shadow-[0px_3px_0px_#141413]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand / Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-saffron text-ink border-2 border-ink shadow-[2px_2px_0px_#141413] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-display font-extrabold text-ink leading-tight truncate">
              {title || t('app.title')}
            </h1>
            <p className="text-[11px] font-bold text-ink-muted leading-tight truncate">
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
              className="h-8.5 px-2.5 rounded-full bg-white hover:bg-yellow-50 border-2 border-ink shadow-[2px_2px_0px_#141413] text-xs font-extrabold text-ink flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#141413] transition-all"
            >
              <Languages className="w-3.5 h-3.5 text-tangy stroke-[2.5]" />
              <span>{langLabels[lang]}</span>
              <ChevronDown className="w-3 h-3 text-ink stroke-[2.5]" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-2xl shadow-[4px_4px_0px_#141413] border-2 border-ink p-1 z-50 animate-scale-in">
                {(['hi', 'en', 'hinglish'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLangSelect(l)}
                    className={`w-full text-left px-3 py-2 text-xs font-extrabold rounded-xl flex items-center justify-between ${
                      lang === l ? 'bg-saffron text-ink border-1.5 border-ink shadow-[1px_1px_0px_#141413]' : 'text-ink hover:bg-yellow-50'
                    }`}
                  >
                    <span>{langLabels[l]}</span>
                    {lang === l && <span className="text-ink font-black">✓</span>}
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
              className="w-8.5 h-8.5 rounded-xl bg-white hover:bg-yellow-50 border-2 border-ink shadow-[2px_2px_0px_#141413] flex items-center justify-center text-ink active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#141413] transition-all"
            >
              <SettingsIcon className="w-4 h-4 stroke-[2.25]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
