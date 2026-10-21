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
      iconBg: 'bg-lime text-ink',
      title: 'text-ink font-display font-extrabold',
      badge: 'bg-tangy text-white border-1.5 border-ink shadow-[1.5px_1.5px_0px_#141413]',
    },
    blue: {
      iconBg: 'bg-cobalt text-white',
      title: 'text-ink font-display font-extrabold',
      badge: 'bg-cobalt text-white border-1.5 border-ink shadow-[1.5px_1.5px_0px_#141413]',
    },
    lilac: {
      iconBg: 'bg-pink text-ink',
      title: 'text-ink font-display font-extrabold',
      badge: 'bg-pink text-ink border-1.5 border-ink shadow-[1.5px_1.5px_0px_#141413]',
    },
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-3xl comic-card hover:bg-yellow-50/40 transition-all duration-150 flex items-center justify-between gap-3 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#141413] cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border-2 border-ink shadow-[2.5px_2.5px_0px_#141413] ${styles.iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-base leading-tight truncate ${styles.title}`}>
              {title}
            </h3>
            {badge && (
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${styles.badge}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-ink-muted mt-0.5 truncate leading-tight">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="w-9 h-9 rounded-full bg-saffron border-2 border-ink shadow-[2px_2px_0px_#141413] flex items-center justify-center text-ink shrink-0">
        <ChevronRight className="w-5 h-5 stroke-[2.75]" />
      </div>
    </button>
  );
};
