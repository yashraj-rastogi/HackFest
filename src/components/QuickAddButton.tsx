import React from 'react';
import { Plus } from 'lucide-react';

interface QuickAddButtonProps {
  onClick: (e: React.MouseEvent) => void;
  ariaLabel?: string;
  size?: 'normal' | 'compact';
  className?: string;
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  onClick,
  ariaLabel = 'Quick Sale',
  size = 'normal',
  className = '',
}) => {
  const dimensions = size === 'normal' ? 'w-14 h-14' : 'w-11 h-11';
  const iconSize = size === 'normal' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center shrink-0 ${dimensions} rounded-2xl bg-tangy hover:bg-orange text-white btn-comic font-black cursor-pointer ${className}`}
    >
      <Plus className={`${iconSize} stroke-[3]`} />
    </button>
  );
};
