'use client';

import React from 'react';
import { Flame, Sparkles, Award, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RightBarProps {
  xp: number;
  streak: number;
  completedSetsCount: number;
  totalSetsCount: number;
  waitlistEmail: string;
  setWaitlistEmail: (email: string) => void;
  waitlistSubmitted: boolean;
  handleWaitlistSubmit: (e: React.FormEvent) => Promise<void>;
}

export const RightBar: React.FC<RightBarProps> = ({
  xp,
  streak,
  completedSetsCount,
  totalSetsCount,
  waitlistEmail,
  setWaitlistEmail,
  waitlistSubmitted,
  handleWaitlistSubmit,
}) => {
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  return (
    <aside className="hidden lg:flex w-80 flex-col gap-6 p-5 border-l border-amber-100 bg-[#FDFBF7]/50 z-20">
      {/* Top Header Row for Stats */}
      <div className="flex items-center justify-between gap-4 p-1">
        {/* Streak Flame */}
        <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-500/5 px-4 py-2 hover:bg-orange-500/10 transition-colors cursor-default" title="Chuỗi ngày học liên tục">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-400 animate-bounce" />
          <span className="text-sm font-extrabold text-orange-850 font-mono">{streak} Ngày</span>
        </div>

        {/* XP Points */}
        <div className="flex items-center gap-2 rounded-2xl border border-yellow-100 bg-yellow-500/5 px-4 py-2 hover:bg-yellow-500/10 transition-colors cursor-default" title="Điểm tích lũy kinh nghiệm">
          <Award className="h-5 w-5 text-yellow-650 fill-yellow-400" />
          <span className="text-sm font-extrabold text-yellow-850 font-mono">{xp} XP</span>
        </div>
      </div>

      {/* Progress Map Card */}
      <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900/80">Tiến độ tổng quát</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end text-xs font-semibold text-stone-700">
            <span>Đã hoàn thành</span>
            <span className="font-mono text-amber-900 font-bold">{completedSetsCount}/{totalSetsCount} bộ đề</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-stone-100 border border-stone-200/40 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
            />
          </div>
          <div className="text-[10px] text-right font-mono text-stone-500 font-bold">
            Tỷ lệ hoàn thành: {progressPercent}%
          </div>
        </div>
      </div>

      {/* Waitlist Box (If not submitted) */}
      <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-950 border border-amber-500/25 text-[9px] font-bold uppercase tracking-wider font-mono w-fit">
          <Sparkles className="h-3 w-3 text-amber-600 animate-pulse" />
          Lộ Trình AI Cá Nhân Hóa
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-amber-950 leading-snug">
            Khám phá lỗ hổng kiến thức qua AI trợ giảng
          </h4>
          <p className="text-[10px] text-stone-600 leading-relaxed">
            Nhận gợi lý thuyết, bài thi cá nhân hóa sau mỗi lượt kiểm tra để củng cố tri thức nhanh chóng.
          </p>
        </div>

        {!waitlistSubmitted ? (
          <form onSubmit={handleWaitlistSubmit} className="space-y-2 pt-1">
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="email"
                required
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Nhập email học tập..."
                className="w-full pl-8 pr-2 py-2 text-[10px] text-stone-850 bg-white border border-stone-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-1 shadow-sm active:translate-y-[1px] cursor-pointer transition-colors"
            >
              <span>Tham gia Waitlist</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 rounded-xl text-[10px] font-semibold flex items-start gap-2 shadow-sm leading-normal">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Đăng ký thành công với email {waitlistEmail}! Cảm ơn bạn! 🚀</span>
          </div>
        )}
      </div>
    </aside>
  );
};
