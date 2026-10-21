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
      className="comic-pill px-2.5 py-1 bg-saffron text-ink text-xs font-black flex items-center gap-1.5 animate-fade-in"
      role="status"
      aria-label={t('state.offline')}
    >
      <WifiOff className="w-3.5 h-3.5 text-ink stroke-[2.5]" />
      <span className="text-[11px] font-black">{t('state.offline')}</span>
    </div>
  );
};

