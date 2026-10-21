import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../services/online';
import { useTranslation } from '../i18n';

export const OfflinePill: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/10 border border-ink/20 text-ink text-xs font-medium tracking-tight animate-fade-in"
      role="status"
      aria-label={t('state.offline')}
    >
      <WifiOff className="w-3.5 h-3.5 text-ink-muted" />
      <span>{t('state.offline')}</span>
    </div>
  );
};
