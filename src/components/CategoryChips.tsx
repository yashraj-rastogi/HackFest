import React from 'react';
import { useTranslation } from '../i18n';

interface CategoryOption {
  id: string;
  label: { en: string; hi: string; hinglish: string };
  emoji?: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: { en: 'All', hi: 'सभी', hinglish: 'Sab' }, emoji: '✨' },
  { id: 'staples', label: { en: 'Staples', hi: 'राशन / आटा-चावल', hinglish: 'Ration' }, emoji: '🌾' },
  { id: 'oil_ghee', label: { en: 'Oil & Ghee', hi: 'तेल और घी', hinglish: 'Tel-Ghee' }, emoji: '🧈' },
  { id: 'pulses', label: { en: 'Pulses / Dal', hi: 'दालें', hinglish: 'Daal' }, emoji: '🟡' },
  { id: 'spices', label: { en: 'Spices', hi: 'मसाले', hinglish: 'Masale' }, emoji: '🌶️' },
  { id: 'snacks', label: { en: 'Snacks', hi: 'नमकीन / स्नैक्स', hinglish: 'Snacks' }, emoji: '🍿' },
  { id: 'biscuits', label: { en: 'Biscuits', hi: 'बिस्कुट / बेकरी', hinglish: 'Biscuits' }, emoji: '🍪' },
  { id: 'beverages', label: { en: 'Tea & Drinks', hi: 'चाय / पेय', hinglish: 'Chai-Drinks' }, emoji: '☕' },
  { id: 'dairy', label: { en: 'Dairy', hi: 'दूध / दही', hinglish: 'Doodh-Dahi' }, emoji: '🥛' },
  { id: 'personal_care', label: { en: 'Personal Care', hi: 'साबुन / शैम्पू', hinglish: 'Sabun-Care' }, emoji: '🧼' },
  { id: 'household', label: { en: 'Cleaning', hi: 'सफाई / डिटर्जेंट', hinglish: 'Safai-Surf' }, emoji: '🧺' },
  { id: 'stationery_paper', label: { en: 'Notebooks', hi: 'कॉपी / रजिस्टर', hinglish: 'Copy-Register' }, emoji: '📓' },
  { id: 'stationery_writing', label: { en: 'Pens & Tools', hi: 'पेन / पेंसिल', hinglish: 'Pen-Pencil' }, emoji: '🖊️' },
  { id: 'hardware_fasteners', label: { en: 'Fasteners', hi: 'कील / पेच / फेविक्विक', hinglish: 'Kheel-Pech' }, emoji: '🔩' },
  { id: 'hardware_tools', label: { en: 'Tools', hi: 'टूल्स / औजार', hinglish: 'Tools' }, emoji: '🔧' },
  { id: 'electrical', label: { en: 'Electrical', hi: 'बल्ब / स्विच / तार', hinglish: 'Bijli Samaan' }, emoji: '💡' },
];

interface CategoryChipsProps {
  selected: string;
  onSelect: (id: string) => void;
  availableCategories?: string[];
  className?: string;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selected,
  onSelect,
  availableCategories,
  className = '',
}) => {
  const { lang } = useTranslation();

  const options = availableCategories
    ? CATEGORIES.filter((c) => c.id === 'all' || availableCategories.includes(c.id))
    : CATEGORIES;

  return (
    <div
      role="tablist"
      aria-label="Filter by category"
      className={`flex gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar -mx-4 px-4 ${className}`}
    >
      {options.map((cat) => {
        const isSelected = selected === cat.id;
        const label = cat.label[lang] || cat.label.en;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 min-h-[42px] px-3.5 py-1.5 rounded-full text-sm font-extrabold whitespace-nowrap transition-all duration-100 shrink-0 border-2 border-ink cursor-pointer ${
              isSelected
                ? 'bg-tangy text-white shadow-[2.5px_2.5px_0px_#141413]'
                : 'bg-white text-ink shadow-[2px_2px_0px_#141413] hover:bg-yellow-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_#141413]'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
