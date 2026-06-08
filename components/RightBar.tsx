'use client';

import React, { useState } from 'react';
import { Sparkles, Award, Mail, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import dayjs from 'dayjs';
import { Calendar } from './Calendar';
import { FireSvg, EmptyFireSvg } from './Svgs';

interface RightBarProps {
  xp: number;
  streak: number;
  completedSetsCount: number;
  totalSetsCount: number;
  waitlistEmail: string;
  setWaitlistEmail: (email: string) => void;
  waitlistSubmitted: boolean;
  handleWaitlistSubmit: (e: React.FormEvent) => Promise<void>;
  activeDays?: string[];
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
  activeDays = [],
}) => {
  const [streakShown, setStreakShown] = useState(false);
  const [now, setNow] = useState(dayjs());
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  const todayStr = dayjs().format('YYYY-MM-DD');
  const hasStudiedToday = activeDays.includes(todayStr);

  const getWeekDaysStatus = (days: string[]) => {
    const today = dayjs();
    const currentDayOfWeek = today.day(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = today.add(daysToMonday, 'day');
    
    const weekDays = [];
    const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    let activeCount = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = monday.add(i, 'day').format('YYYY-MM-DD');
      const isActive = days.includes(dateStr);
      if (isActive) activeCount++;
      weekDays.push({
        label: labels[i],
        isActive,
        isToday: dateStr === today.format('YYYY-MM-DD')
      });
    }
    
    return { weekDays, activeCount };
  };

  const { weekDays, activeCount } = getWeekDaysStatus(activeDays);

  return (
    <aside className="hidden lg:flex w-80 flex-col gap-6 p-5 border-l border-amber-100 bg-[#FDFBF7]/50 z-20">
      {/* Top Header Row for Stats */}
      <div className="flex items-center justify-between gap-4 p-1">
        {/* Streak Flame */}
        <span
          className="relative flex items-center gap-2 rounded-xl p-3 font-bold text-orange-500 hover:bg-gray-100 cursor-pointer select-none"
          onMouseEnter={() => setStreakShown(true)}
          onMouseLeave={() => {
            setStreakShown(false);
            setNow(dayjs());
          }}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            setStreakShown((x) => !x);
            setNow(dayjs());
          }}
          role="button"
          tabIndex={0}
        >
          <div className="pointer-events-none">
            {streak > 0 ? <FireSvg /> : <EmptyFireSvg />}
          </div>
          <span className={streak > 0 ? "text-orange-500 font-mono text-sm" : "text-stone-300 font-mono text-sm"}>
            {streak}
          </span>

          {/* Popover Streak Info (Light Theme - Project Match) */}
          <div
            className="absolute top-[80%] right-0 z-30 pt-3 transition-all duration-200"
            style={{
              width: 320,
              display: streakShown ? "block" : "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner styled popover container */}
            <div className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white p-5 text-stone-850 shadow-xl">
              {/* Header section with large flame */}
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col gap-1.5 text-left max-w-[210px]">
                  <h2 className="text-lg font-black text-amber-955">{streak} ngày streak</h2>
                  <p className="text-[10px] text-stone-650 font-semibold leading-relaxed">
                    {hasStudiedToday 
                      ? "Bạn đã học ngày hôm nay! Hãy tiếp tục duy trì nhé." 
                      : "Học một bài học ngay hôm nay để bắt đầu chuỗi streak mới nào!"}
                  </p>
                </div>
                <div className="scale-[1.8] origin-top-right shrink-0 opacity-[0.08] mr-1 mt-1">
                  <FireSvg />
                </div>
              </div>

              {/* Weekly progress tracker box */}
              <div className="bg-amber-500/5 border border-amber-100/70 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-black tracking-wide">
                  {weekDays.map((day, i) => (
                    <span 
                      key={i} 
                      className={day.isActive 
                        ? "text-amber-650" 
                        : day.isToday 
                          ? "text-amber-955 underline decoration-amber-500 decoration-2 underline-offset-4" 
                          : "text-stone-400"
                      }
                    >
                      {day.label}
                    </span>
                  ))}
                </div>
                
                <div className="relative w-full h-4 bg-stone-100 rounded-full flex items-center pr-1 border border-stone-200/40 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, (activeCount / 7) * 100)}%` }}
                  />
                  <div className="absolute right-1 w-5 h-5 flex items-center justify-center scale-75">
                    <div className="scale-[0.6] origin-center">
                      {activeCount > 0 ? <FireSvg /> : <EmptyFireSvg />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Society Lock Section */}
              <div className="border border-amber-100/70 rounded-2xl p-4 flex gap-4 items-center bg-amber-500/5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                  {streak >= 7 ? (
                    <Sparkles className="h-6 w-6 text-amber-600 fill-amber-400" />
                  ) : (
                    <Lock className="h-6 w-6 stroke-[2]" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 text-left">
                  <h3 className="text-xs font-extrabold text-amber-955">Hội Streak</h3>
                  <p className="text-[9px] text-stone-600 font-semibold leading-normal">
                    {streak >= 7 
                      ? "Tuyệt vời! Bạn đã gia nhập Hội Streak thành công và nhận được đặc quyền."
                      : "Đạt 7 ngày streak để gia nhập Hội Streak và nhận những phần thưởng độc quyền."}
                  </p>
                </div>
              </div>

              {/* Action button */}
              <button
                type="button"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:translate-y-[2px] active:border-b-[2px] border-b-4 border-amber-700 rounded-2xl text-white font-black text-xs tracking-wider transition-all text-center uppercase cursor-pointer"
              >
                Xem thêm
              </button>
            </div>
          </div>
        </span>

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
