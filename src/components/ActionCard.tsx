import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'green' | 'blue' | 'lilac';
  badge?: string;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  onClick,
  variant = 'green',
  badge,
  className = '',
}) => {
  const styles = {
    green: {
      card: 'bg-surface hover:border-brand/50 border-line/80',
      iconBg: 'bg-brand-soft text-brand-dark',
      title: 'text-ink',
      badge: 'bg-brand-soft text-brand-dark',
    },
    blue: {
      card: 'bg-surface hover:border-blue/50 border-line/80',
      iconBg: 'bg-blue-soft text-blue',
      title: 'text-ink',
      badge: 'bg-blue-soft text-blue',
    },
    lilac: {
      card: 'bg-surface hover:border-lilac/50 border-line/80',
      iconBg: 'bg-[#F2EFFF] text-lilac',
      title: 'text-ink',
      badge: 'bg-[#F2EFFF] text-lilac',
    },
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-3xl border shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 active:scale-[0.98] ${styles.card} ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-bold leading-tight truncate ${styles.title}`}>
              {title}
            </h3>
            {badge && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-0.5 truncate leading-tight">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-canvas flex items-center justify-center text-ink-muted shrink-0">
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </div>
    </button>
  );
};
