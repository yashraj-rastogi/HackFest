import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Package, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../i18n';
import { triggerHaptic } from '../lib/haptics';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const tabs = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/sale', label: t('nav.sale'), icon: ShoppingBag },
    { to: '/stock', label: t('nav.stock'), icon: Package },
    { to: '/more', label: t('nav.more'), icon: MoreHorizontal },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-[2.5px] border-ink pb-[env(safe-area-inset-bottom)] shadow-[0px_-3px_0px_#141413]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={() => triggerHaptic(8)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-all touch-target-secondary select-none ${
                  isActive
                    ? 'text-ink font-black scale-[1.02]'
                    : 'text-ink-muted hover:text-ink font-bold'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-full transition-transform ${
                      isActive
                        ? 'bg-saffron border-2 border-ink shadow-[2px_2px_0px_#141413] px-3'
                        : 'p-1 hover:bg-yellow-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className={`text-[11px] tracking-tight leading-none ${isActive ? 'font-display font-black text-ink' : 'font-bold text-ink-muted'}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
