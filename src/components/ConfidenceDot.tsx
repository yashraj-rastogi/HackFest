import React from 'react';
import type { Confidence } from '../db/schema';
import { useTranslation } from '../i18n';

interface ConfidenceDotProps {
  confidence: Confidence;
  className?: string;
}

export const ConfidenceDot: React.FC<ConfidenceDotProps> = ({ confidence, className = '' }) => {
  const { t } = useTranslation();

  if (confidence === 'counted') {
    return (
      <span
        title={t('confidence.counted')}
        className={`inline-block w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-brand-soft ${className}`}
        aria-label={t('confidence.counted')}
      />
    );
  }

  if (confidence === 'estimated') {
    return (
      <span
        title={t('confidence.estimated')}
        className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-blue bg-blue/30 ${className}`}
        aria-label={t('confidence.estimated')}
      />
    );
  }

  return (
    <span
      title={t('confidence.unknown')}
      className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-line bg-transparent ${className}`}
      aria-label={t('confidence.unknown')}
    />
  );
};
