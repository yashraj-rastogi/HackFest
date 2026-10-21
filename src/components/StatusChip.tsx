import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from '../i18n';

export type StatusType = 'inStock' | 'low' | 'out' | 'noMovement';

interface StatusChipProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className = '' }) => {
  const { t } = useTranslation();

  switch (status) {
    case 'inStock':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-success bg-[#DDF5E9] border border-[#B5E9D2] ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{label || t('status.inStock')}</span>
        </span>
      );

    case 'low':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#8A5000] bg-[#FFF5E5] border border-[#FFE0B2] ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{label || t('status.low')}</span>
        </span>
      );

    case 'out':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#A8322A] bg-[#FDEEED] border border-[#F8CBC8] ${className}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>{label || t('status.out')}</span>
        </span>
      );

    case 'noMovement':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-ink bg-sky border border-sky-strong/30 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-ink-muted" />
          <span>{label || t('status.noMovement')}</span>
        </span>
      );
  }
};
