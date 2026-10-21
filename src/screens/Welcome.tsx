import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import type { Lang } from '../db/schema';
import { triggerHaptic } from '../lib/haptics';
import { Check } from 'lucide-react';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useTranslation();

  const handleSelectLanguage = async (selected: Lang) => {
    triggerHaptic(15);
    await setLang(selected);
    navigate('/setup/type');
  };

  const options: { lang: Lang; title: string; subtitle: string; sample: string }[] = [
    {
      lang: 'hi',
      title: 'हिन्दी',
      subtitle: 'आसान और अपनी भाषा में',
      sample: 'चीनी, आटा, बिक्री, स्टॉक',
    },
    {
      lang: 'hinglish',
      title: 'Hinglish',
      subtitle: 'Daily bolchal ki bhasha',
      sample: 'Cheeni, Atta, Sale, Stock',
    },
    {
      lang: 'en',
      title: 'English',
      subtitle: 'Clear and simple',
      sample: 'Sugar, Flour, Sale, Stock',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Hero */}
      <div className="text-center pt-8 pb-4">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-soft flex items-center justify-center text-4xl shadow-xs border border-brand/20">
          🏪
        </div>
        <h1 className="text-2xl font-bold text-ink mt-5 leading-tight">
          किराना साथी · KiranaSaathi
        </h1>
        <p className="text-sm text-ink-muted mt-2">
          Choose your preferred language / अपनी भाषा चुनें
        </p>
      </div>

      {/* Language Options */}
      <div className="space-y-3.5 my-auto">
        {options.map((opt) => {
          const isSelected = lang === opt.lang;
          return (
            <button
              key={opt.lang}
              type="button"
              onClick={() => handleSelectLanguage(opt.lang)}
              className={`w-full p-4.5 rounded-3xl border text-left transition-all duration-150 flex items-center justify-between gap-3 active:scale-98 ${
                isSelected
                  ? 'bg-surface border-brand ring-2 ring-brand/30 shadow-md'
                  : 'bg-surface border-line hover:border-brand/40 shadow-xs'
              }`}
            >
              <div>
                <div className="text-xl font-bold text-ink flex items-center gap-2">
                  <span>{opt.title}</span>
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {opt.subtitle}
                </div>
                <div className="text-[11px] text-brand-dark font-medium mt-1.5 opacity-90">
                  {opt.sample}
                </div>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? 'bg-brand border-brand text-white'
                    : 'bg-canvas border-line text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center pb-4 text-xs text-ink-muted">
        <span>Offline-first · No internet required · 100% Free</span>
      </div>
    </div>
  );
};
