import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { triggerHaptic } from '../lib/haptics';

export interface UndoPayload {
  movementId: string;
  message: string;
  durationMs?: number;
}

interface UndoSnackbarProps {
  payload: UndoPayload | null;
  onUndo: (movementId: string) => void;
  onDismiss: () => void;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  payload,
  onUndo,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!payload) {
      setProgress(100);
      return;
    }

    const duration = payload.durationMs || 8000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    setProgress(100);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [payload, onDismiss]);

  if (!payload) return null;

  const handleUndoClick = () => {
    triggerHaptic(20);
    onUndo(payload.movementId);
  };

  return (
    <aside
      aria-label="Undo action"
      className="fixed left-3 right-3 bottom-22 z-40 max-w-md mx-auto animate-slide-up shadow-xl"
    >
      <div className="relative overflow-hidden rounded-2xl bg-ink text-white p-3.5 flex items-center justify-between gap-3 border border-white/10">
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-brand transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold truncate leading-snug">
            {payload.message}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUndoClick}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-sm tracking-wide flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{t('action.undo')}</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:text-white active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
