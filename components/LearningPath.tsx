'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Sparkles, Lock } from 'lucide-react';
import { TileTooltip } from './TileTooltip';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  ActiveBookSvg,
  LockedBookSvg,
  CheckmarkSvg,
  LockedDumbbellSvg,
  GoldenBookSvg,
  GoldenDumbbellSvg,
  GoldenTrophySvg,
  LessonCompletionSvg0,
  LessonCompletionSvg1,
  LessonCompletionSvg2,
  LessonCompletionSvg3,
  LockSvg,
  StarSvg,
  LockedTrophySvg,
  ActiveTrophySvg,
  ActiveDumbbellSvg,
} from './Svgs';

// Mascot Svg drawing a cute Robot AI Tutor in warm amber theme
const MascotSvg = ({ pose }: { pose: 'hello' | 'starting' | 'lock' }) => {
  return (
    <svg className="w-20 h-20 sm:w-24 sm:h-24 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="50" height="40" rx="15" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
      <rect x="32" y="32" width="36" height="24" rx="8" fill="#78350f" />
      {pose === 'hello' ? (
        <>
          <path d="M36 44C36 44 38 41 40 44" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 44C56 44 58 41 60 44" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : pose === 'lock' ? (
        <>
          <path d="M35 44H41" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M55 44H61" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="41" cy="43" r="3.5" fill="#fbbf24" />
          <circle cx="59" cy="43" r="3.5" fill="#fbbf24" />
        </>
      )}
      {pose === 'hello' ? (
        <path d="M46 51C48 53 52 53 54 51" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      ) : pose === 'lock' ? (
        <path d="M47 50H53" stroke="#9ca3af" strokeWidth="2" />
      ) : (
        <path d="M46 50C48 52 52 52 54 50" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      )}
      <rect x="44" y="65" width="12" height="8" rx="2" fill="#d97706" />
      <path d="M22 82C22 75 28 72 40 72H60C72 72 78 75 78 82V90H22V82Z" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
      <rect x="36" y="77" width="28" height="9" rx="3" fill="#78350f" />
      <line x1="50" y1="25" x2="50" y2="12" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="10" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    </svg>
  );
};

const WEEKS = [
  {
    id: 'week1_sect',
    title: 'Tuần 1',
    subtitle: 'Nền Tảng AI & LLM',
    desc: 'Nắm vững Transformer, Tokenization, xác định bài toán cho AI, Prompt Engineering, và thiết kế Agent ReAct.',
    topics: ['day1', 'day2', 'day3', 'day4', 'day5'],
    mascotSpeech: 'Chào mừng bạn đến với tuần đầu tiên! Hãy học tập thật tốt nhé.',
    mascotPose: 'hello' as const
  },
  {
    id: 'week2_sect',
    title: 'Tuần 2',
    subtitle: 'AI Prototyping & RAG',
    desc: 'Xây dựng sản phẩm mẫu (Prototype), Data Foundations, Vector Indexing (HNSW, IVF) và Đề Ôn Tập Tổng Hợp.',
    topics: ['day6', 'day7', 'week1'],
    mascotSpeech: 'Học cách xây dựng Vector Database và RAG thực tế trong tuần này!',
    mascotPose: 'starting' as const
  }
];

// Topic metadata matching quiz-manifest.json
const TOPICS = [
  { id: 'day1', title: 'Day 1: AI & LLM Foundation', desc: 'Nắm vững Transformer, Tokenization, Embeddings và Inference Dynamics.' },
  { id: 'day2', title: 'Day 2: Xác định Bài toán cho AI', desc: 'Định hình bài toán, đánh giá tính khả thi, chiến lược dữ liệu và đo lường chất lượng.' },
  { id: 'day3', title: 'Day 3: Design Pattern ReAct', desc: 'Vòng lặp ReAct, Function Schema, an ninh Agent (Guardrails) và trace debugging.' },
  { id: 'day4', title: 'Day 4: Prompt Engineering & Tool Calling', desc: 'Context Engineering, Token Budget, JIT context và bảo mật Tool Calling.' },
  { id: 'day5', title: 'Day 5: Thiết kế sản phẩm AI cho sự không chắc chắn', desc: 'Thiết kế UX/UI cho sự bất định, Augmentation vs Automation, và bài toán tối ưu ROI.' },
  { id: 'day6', title: 'Day 6: Hackathon Day & Prototyping', desc: 'Lộ trình xây dựng sản phẩm mẫu (Prototype), tài liệu đặc tả và kỹ năng Demo Pitch.' },
  { id: 'day7', title: 'Day 7: Data Foundations - Embedding & Vector Store', desc: 'Kiến trúc bộ nhớ Agent, Embedding, Vector Indexing (HNSW, IVF) và thực hành RAG.' },
  { id: 'week1', title: 'Week 1: Ôn Tập Tổng Hợp', desc: 'Đề ôn tập tổng hợp toàn diện các nội dung đã học trong tuần thứ nhất.' }
];

// Color palette mapping (strictly compliance with the Purple Ban)
const UNIT_STYLES: { [dayId: string]: { bg: string; border: string; text: string; lightBg: string } } = {
  day1: { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-50' },
  day2: { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-600', lightBg: 'bg-amber-50' },
  day3: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50' },
  day4: { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-600', lightBg: 'bg-rose-50' },
  day5: { bg: 'bg-teal-500', border: 'border-teal-600', text: 'text-teal-600', lightBg: 'bg-teal-55' },
  day6: { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-orange-600', lightBg: 'bg-orange-50' },
  day7: { bg: 'bg-zinc-600', border: 'border-zinc-700', text: 'text-zinc-600', lightBg: 'bg-zinc-100' },
  week1: { bg: 'bg-sky-500', border: 'border-sky-600', text: 'text-sky-600', lightBg: 'bg-sky-50' },
};

const HoverLabel = ({
  text,
  textColor,
}: {
  text: string;
  textColor: string;
}) => {
  const hoverElement = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(72);

  useEffect(() => {
    if (hoverElement.current) {
      setWidth(hoverElement.current.clientWidth);
    }
    // eslint-disable-next-line react-hooks/refs
  }, [hoverElement.current?.clientWidth]);

  return (
    <div
      className={`absolute z-10 w-max animate-bounce rounded-lg border-2 border-gray-250 bg-white px-3 py-2 font-bold uppercase ${textColor}`}
      style={{
        top: "-25%",
        left: `calc(50% - ${width / 2}px)`,
      }}
      ref={hoverElement}
    >
      {text}
      <div
        className="absolute h-3 w-3 rotate-45 border-b-2 border-r-2 border-gray-255 bg-white"
        style={{ left: "calc(50% - 8px)", bottom: "-8px" }}
      ></div>
    </div>
  );
};

const LessonCompletionSvg = ({
  status,
}: {
  status: "LOCKED" | "ACTIVE" | "COMPLETE";
}) => {
  if (status !== "ACTIVE") {
    return null;
  }
  return <LessonCompletionSvg0 />;
};

const TileIcon = ({
  tileType,
  status,
}: {
  tileType: "star" | "book" | "dumbbell" | "trophy";
  status: "LOCKED" | "ACTIVE" | "COMPLETE";
}) => {
  switch (tileType) {
    case "star":
      return status === "COMPLETE" ? (
        <CheckmarkSvg />
      ) : status === "ACTIVE" ? (
        <StarSvg />
      ) : (
        <LockSvg />
      );
    case "book":
      return status === "COMPLETE" ? (
        <GoldenBookSvg />
      ) : status === "ACTIVE" ? (
        <ActiveBookSvg />
      ) : (
        <LockedBookSvg />
      );
    case "dumbbell":
      return status === "COMPLETE" ? (
        <GoldenDumbbellSvg />
      ) : status === "ACTIVE" ? (
        <ActiveDumbbellSvg />
      ) : (
        <LockedDumbbellSvg />
      );
    case "trophy":
      return status === "COMPLETE" ? (
        <GoldenTrophySvg />
      ) : status === "ACTIVE" ? (
        <ActiveTrophySvg />
      ) : (
        <LockedTrophySvg />
      );
    default:
      return null;
  }
};

const getTileColors = (
  tileType: string,
  status: "LOCKED" | "ACTIVE" | "COMPLETE",
  defaultColors: string
) => {
  switch (status) {
    case "LOCKED":
      return "border-[#b7b7b7] bg-[#e5e5e5] text-stone-400";
    case "COMPLETE":
      return "border-yellow-500 bg-yellow-400 text-yellow-955";
    case "ACTIVE":
      return defaultColors;
  }
};

// Define structure of quiz set matching manifest
interface QuestionSet {
  id: string;
  parent_id?: string;
  title: string;
  description: string;
  difficulty?: 'dễ' | 'bình thường' | 'khó';
}

interface LearningPathProps {
  sets: QuestionSet[];
  completedSets: string[];
  onSelectQuiz: (setId: string) => void;
  devMode: boolean;
  onToggleDevMode: () => void;
  onSelectGuidebook: (dayId: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  sets,
  completedSets,
  onSelectQuiz,
  devMode,
  onToggleDevMode,
  onSelectGuidebook,
}) => {
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [userExpandedWeekId, setUserExpandedWeekId] = useState<string | null>(null);

  // Close tooltip on scroll
  useEffect(() => {
    const handleScroll = () => setSelectedTileId(null);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Map all sets across all topics to determine progression
  const allSets = TOPICS.flatMap(topic => sets.filter(s => s.parent_id === topic.id));
  const firstUncompletedSet = allSets.find(s => !completedSets.includes(s.id));
  const activeSetId = firstUncompletedSet ? firstUncompletedSet.id : null;

  // Helper to get week progress details
  const getWeekProgress = (week: typeof WEEKS[0]) => {
    const weekSets = week.topics.flatMap(topicId => sets.filter(s => s.parent_id === topicId));
    const completedInWeek = weekSets.filter(s => completedSets.includes(s.id)).length;
    const totalInWeek = weekSets.length;
    const progressPercent = totalInWeek > 0 ? Math.round((completedInWeek / totalInWeek) * 100) : 0;
    const isCompleted = completedInWeek === totalInWeek && totalInWeek > 0;
    return { completedInWeek, totalInWeek, progressPercent, isCompleted };
  };

  // Determine if a week is unlocked
  const isWeekUnlocked = (weekIdx: number) => {
    if (weekIdx === 0 || devMode) return true;
    const prevWeek = WEEKS[weekIdx - 1];
    return getWeekProgress(prevWeek).isCompleted;
  };

  // Find the active week ID based on progress
  const getActiveWeekId = () => {
    const activeWeekIndex = WEEKS.findIndex((week, idx) => {
      if (idx === 0) return !getWeekProgress(week).isCompleted;
      const prevWeekCompleted = getWeekProgress(WEEKS[idx - 1]).isCompleted;
      return prevWeekCompleted && !getWeekProgress(week).isCompleted;
    });
    const defaultIndex = activeWeekIndex === -1 ? 0 : activeWeekIndex;
    return WEEKS[defaultIndex].id;
  };

  const expandedWeekId = userExpandedWeekId !== null
    ? (userExpandedWeekId === 'none' ? null : userExpandedWeekId)
    : getActiveWeekId();

  // Calculate the horizontal serpentine offset for snaking
  const getHorizontalOffset = (index: number) => {
    // Left-to-right serpentine offsets (pixels)
    const offsets = [0, -32, -56, -32, 0, 32, 56, 32];
    return offsets[index % offsets.length];
  };

  // Determine icon type for the tile based on set position and difficulty
  const getTileIcon = (index: number, total: number, difficulty?: string): "star" | "book" | "dumbbell" | "trophy" => {
    if (index === total - 1) return "trophy"; // final review is trophy
    if (difficulty === 'khó') return "dumbbell"; // hard sets are practice / dumbbell
    if (index % 2 === 1) return "book";
    return "star";
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 md:py-6 px-4">
      {/* Unified top header */}
      <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-sm md:text-md font-black text-amber-955 uppercase tracking-tight">Lộ Trình Học Tập</h2>
        </div>
        
        {/* Toggle Dev Mode */}
        <button
          onClick={onToggleDevMode}
          className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm active:translate-y-[1px] cursor-pointer border ${
            devMode
              ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
              : 'bg-white hover:bg-stone-50 text-stone-500 border-stone-200'
          }`}
          title="Bypass linear progression for testing"
        >
          {devMode ? '🔧 Dev Mode: ON' : '🔧 Dev Mode: OFF'}
        </button>
      </div>

      <div className="space-y-6">
        {WEEKS.map((week, weekIdx) => {
          const { totalInWeek, progressPercent, isCompleted } = getWeekProgress(week);
          const isUnlocked = isWeekUnlocked(weekIdx);
          const isExpanded = expandedWeekId === week.id;

          return (
            <div key={week.id} className="space-y-4">
              {/* Week Section Card */}
              <article 
                onClick={() => isUnlocked && setUserExpandedWeekId(isExpanded ? 'none' : week.id)}
                className={`rounded-2xl border-2 p-5 text-stone-850 bg-white transition-all shadow-sm ${
                  isUnlocked 
                    ? 'border-stone-200 hover:border-stone-300 cursor-pointer' 
                    : 'border-stone-200 bg-stone-50/50 opacity-90 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Column: Title, Progress, Action Button */}
                  <div className="flex-1 space-y-4 text-left">
                    <div>
                      <h3 className="text-lg font-black text-amber-955 tracking-wide">
                        {week.title}: {week.subtitle}
                      </h3>
                      <p className="text-xs text-stone-500 font-semibold mt-1 leading-relaxed">
                        {week.desc}
                      </p>
                    </div>

                    {isUnlocked ? (
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-40 bg-stone-100 rounded-full overflow-hidden border border-stone-200 relative">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-stone-500">
                          {progressPercent}%
                        </span>
                        {isCompleted && (
                          <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                            <GoldenTrophySvg />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-stone-400 tracking-wider font-mono">
                        <Lock className="h-3.5 w-3.5" />
                        <span>{totalInWeek} bài học bị khóa</span>
                      </div>
                    )}

                    <div onClick={(e) => e.stopPropagation()}>
                      {isUnlocked ? (
                        <button
                          onClick={() => setUserExpandedWeekId(isExpanded ? 'none' : week.id)}
                          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 active:translate-y-[2px] active:border-b-[2px] border-b-4 border-amber-700 rounded-2xl text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          {isExpanded ? 'Thu gọn' : 'Tiếp tục'}
                        </button>
                      ) : devMode ? (
                        <button
                          onClick={() => setUserExpandedWeekId(week.id)}
                          className="px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 active:translate-y-[2px] active:border-b-[2px] border-b-4 border-amber-500/30 rounded-2xl text-amber-700 font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-amber-200/40"
                        >
                          Nhảy tới {week.title}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-5 py-3 bg-stone-200 border-b-4 border-stone-300 rounded-2xl text-stone-400 font-black text-xs uppercase tracking-wider cursor-not-allowed"
                        >
                          Bị khóa
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Mascot & Speech Bubble */}
                  <div className="flex items-center gap-4 shrink-0 self-start md:self-end">
                    {/* Speech Bubble */}
                    <div className="relative bg-white border-2 border-stone-200/80 rounded-2xl px-4 py-2.5 max-w-[180px] shadow-sm">
                      <p className="text-[10px] text-stone-700 font-bold leading-normal text-left">
                        {isUnlocked ? week.mascotSpeech : `Hãy hoàn thành ${WEEKS[weekIdx - 1]?.title || 'tuần trước'} để mở khóa nhé!`}
                      </p>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-2 h-2 rotate-45 border-t-2 border-r-2 border-stone-200/80 bg-white" />
                    </div>
                    
                    {/* Mascot */}
                    <MascotSvg pose={isUnlocked ? (isExpanded ? 'starting' : 'hello') : 'lock'} />
                  </div>
                </div>
              </article>

              {/* Collapsible Serpentine Day Nodes accordion layout */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden w-full pl-0 md:pl-6 border-l-2 border-dashed border-amber-200/40 space-y-10 py-4"
                  >
                    {week.topics.map((topicId, topicIdx) => {
                      const topic = TOPICS.find(t => t.id === topicId);
                      if (!topic) return null;
                      
                      const topicSets = sets.filter(s => s.parent_id === topic.id);
                      const style = UNIT_STYLES[topic.id] || UNIT_STYLES.day1;

                      return (
                        <div key={topic.id} className="space-y-6">
                          {/* Unit Header Card */}
                          <article className={`rounded-2xl text-white shadow-sm overflow-hidden ${style.bg}`}>
                            <header className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <h3 className="text-lg font-black tracking-wide">Unit: {topic.title.split(':')[1]?.trim() || topic.title}</h3>
                                <p className="text-xs font-semibold text-white/90 leading-relaxed max-w-xl">{topic.desc}</p>
                              </div>

                              {/* Guidebook Button */}
                              <button
                                onClick={() => onSelectGuidebook(topic.id)}
                                className={`flex items-center gap-2 rounded-2xl border-2 border-b-4 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:brightness-105 active:translate-y-[1px] active:border-b-2 shrink-0 ${style.border} cursor-pointer`}
                              >
                                <BookOpen className="h-4 w-4 stroke-[3]" />
                                <span>Guidebook</span>
                              </button>
                            </header>
                          </article>

                          {/* Serpentine Nodes */}
                          <div className="relative py-4 flex flex-col items-center gap-5 min-h-[120px]">
                            {topicSets.length > 0 ? (
                              topicSets.map((set, i) => {
                                const isCompleted = completedSets.includes(set.id);
                                const isActive = set.id === activeSetId || devMode;
                                const isLocked = !isCompleted && !isActive;

                                const status = isCompleted ? 'COMPLETE' : isActive ? 'ACTIVE' : 'LOCKED';
                                const tileType = getTileIcon(i, topicSets.length, set.difficulty);

                                const xOffset = getHorizontalOffset(i);
                                const isTooltipOpen = selectedTileId === set.id;

                                return (
                                  <div
                                    key={set.id}
                                    className={`relative flex flex-col items-center ${isTooltipOpen ? 'z-30' : 'z-0'}`}
                                    style={{ transform: `translateX(${xOffset}px)` }}
                                  >
                                    <div className="relative -mb-4 h-[93px] w-[98px]">
                                      {/* active bouncing indicator */}
                                      {isActive && !isCompleted && !isTooltipOpen && (
                                        <HoverLabel text="Start" textColor={style.text} />
                                      )}

                                      {/* concentric progress circle */}
                                      <LessonCompletionSvg status={status} />

                                      {/* tile button */}
                                      <button
                                        onClick={() => setSelectedTileId(isTooltipOpen ? null : set.id)}
                                        className={[
                                          "absolute m-3 rounded-full border-b-8 p-4 transition-all duration-150 ease-out cursor-pointer",
                                          isActive && !isLocked
                                            ? "hover:translate-y-0.5 hover:border-b-6 active:translate-y-1.5 active:border-b-2"
                                            : "",
                                          getTileColors(
                                            tileType,
                                            status,
                                            `${style.border} ${style.bg}`
                                          ),
                                        ].join(" ")}
                                        disabled={isLocked}
                                        style={{
                                          outline: 'none',
                                        }}
                                      >
                                        <TileIcon tileType={tileType} status={status} />
                                        <span className="sr-only">Show lesson</span>
                                      </button>
                                    </div>

                                    {/* Tile details tooltip */}
                                    <TileTooltip
                                      isOpen={isTooltipOpen}
                                      title={set.title}
                                      description={set.description}
                                      difficulty={set.difficulty}
                                      status={status}
                                      onStart={() => {
                                        setSelectedTileId(null);
                                        onSelectQuiz(set.id);
                                      }}
                                      onClose={() => setSelectedTileId(null)}
                                      activeColorClass={style.bg}
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              // Coming Soon Node
                              <div className="flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full bg-stone-100 border-b-6 border-stone-300 flex items-center justify-center text-stone-400 cursor-default" title="Bài học sẽ sớm ra mắt!">
                                  <LockSvg />
                                </div>
                                <span className="text-[10px] font-bold text-stone-400 mt-2 font-mono italic">Sắp ra mắt</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
