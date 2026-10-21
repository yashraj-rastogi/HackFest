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
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/98 backdrop-blur-lg border-t border-line/80 pb-[env(safe-area-inset-bottom)]"
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
                `flex flex-col items-center justify-center gap-1 transition-colors touch-target-secondary select-none ${
                  isActive
                    ? 'text-brand-dark font-bold'
                    : 'text-ink-muted hover:text-ink font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-xl transition-transform ${
                      isActive ? 'bg-brand-soft/70 scale-105' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.25]" />
                  </div>
                  <span className="text-[11px] tracking-tight leading-none">
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
