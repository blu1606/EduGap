'use client';

import React from 'react';
import { BookOpen, Trophy, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export type TabType = 'learn' | 'leaderboard' | 'profile';

interface LeftBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const LeftBar: React.FC<LeftBarProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'learn', name: 'Học tập', icon: BookOpen },
    { id: 'leaderboard', name: 'Xếp hạng', icon: Trophy },
    { id: 'profile', name: 'Cá nhân', icon: User },
  ] as const;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-64 flex-col border-r border-amber-100 bg-[#FDFBF7]/80 backdrop-blur-md p-5 md:flex z-20">
        <div className="mb-8 flex items-center gap-2 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-amber-955 tracking-tight">EduGap</h1>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800/60 font-mono">AI Thực Chiến</span>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-extrabold uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'border-b-4 border-amber-500 bg-amber-500/10 text-amber-950'
                        : 'text-stone-500 hover:bg-stone-100/60 hover:text-stone-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeLeftTab"
                        className="absolute inset-0 rounded-xl border border-amber-300/40"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={`h-5 w-5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto px-2 py-4 border-t border-amber-100/40 text-[10px] font-mono text-stone-400">
          <span>EduGap &copy; 2026</span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-amber-100 bg-[#FDFBF7]/95 backdrop-blur-md px-2 py-1 flex items-center justify-around md:hidden z-30 shadow-lg shadow-stone-900/10">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl flex-1 text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                isActive ? 'text-amber-950 font-black' : 'text-stone-500'
              }`}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTabIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-amber-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
              </div>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
