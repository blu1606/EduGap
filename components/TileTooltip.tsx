'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, Trophy, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TileTooltipProps {
  isOpen: boolean;
  title: string;
  description: string;
  difficulty?: string;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETE';
  onStart: () => void;
  onClose: () => void;
  activeColorClass: string; // bg-emerald-500, bg-amber-500, etc.
}

export const TileTooltip: React.FC<TileTooltipProps> = ({
  isOpen,
  title,
  description,
  difficulty,
  status,
  onStart,
  onClose,
  activeColorClass,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use capture phase to ensure it runs before any other scroll/click handlers toggle state
    window.addEventListener('click', handleClickOutside, true);
    return () => window.removeEventListener('click', handleClickOutside, true);
  }, [isOpen, onClose]);

  // Determine button text and styles based on status
  let buttonContent = null;
  let bgClass = 'bg-white border-2 border-stone-200';
  let textClass = 'text-stone-800';
  let arrowBgClass = 'bg-white border-l border-t border-stone-200';

  if (status === 'ACTIVE') {
    bgClass = `${activeColorClass} text-white`;
    textClass = 'text-white';
    arrowBgClass = `${activeColorClass}`;
    buttonContent = (
      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border-b-4 border-black/20 bg-white p-3 text-xs font-bold uppercase tracking-wider text-amber-900 shadow-sm transition hover:brightness-95 active:translate-y-[1px] cursor-pointer"
      >
        <span>Bắt đầu +10 XP</span>
        <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-500" />
      </button>
    );
  } else if (status === 'COMPLETE') {
    bgClass = 'bg-yellow-400 border border-yellow-500';
    textClass = 'text-yellow-950';
    arrowBgClass = 'bg-yellow-400';
    buttonContent = (
      <button
        onClick={onStart}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border-b-4 border-yellow-600 bg-white p-3 text-xs font-bold uppercase tracking-wider text-yellow-600 shadow-sm transition hover:brightness-95 active:translate-y-[1px] cursor-pointer"
      >
        <span>Luyện tập +5 XP</span>
        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
      </button>
    );
  } else {
    bgClass = 'bg-stone-100 border border-stone-200';
    textClass = 'text-stone-400';
    arrowBgClass = 'bg-stone-100 border-l border-t border-stone-200';
    buttonContent = (
      <button
        disabled
        className="w-full rounded-xl bg-stone-200 p-3 text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center justify-center gap-1.5 cursor-not-allowed"
      >
        <Lock className="h-3.5 w-3.5" />
        <span>Chưa mở khóa</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={tooltipRef}
          className="relative h-0 w-full z-40"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`absolute left-1/2 -translate-x-1/2 top-4 flex w-[280px] flex-col gap-3.5 rounded-2xl p-4.5 font-bold shadow-xl ${bgClass}`}
          >
            {/* Tooltip Point Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 -top-1.5 h-3 w-3 rotate-45 ${arrowBgClass}`}
            />

            {/* Content Header */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider font-mono opacity-80 ${
                  status === 'ACTIVE' ? 'text-white' : 'text-stone-500'
                }`}>
                  {difficulty || 'Lý thuyết & Luyện tập'}
                </span>
                {status === 'COMPLETE' && (
                  <span className="rounded-md bg-yellow-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-yellow-950">
                    Hoàn thành
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black leading-snug tracking-tight truncate">{title}</h4>
              <p className={`text-[11px] font-medium leading-relaxed line-clamp-2 ${
                status === 'ACTIVE' ? 'text-white/90' : 'text-stone-500'
              }`}>
                {description}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-1">{buttonContent}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
