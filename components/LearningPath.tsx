'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { TileTooltip } from './TileTooltip';
import { motion } from 'motion/react';
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

      <div className="space-y-12">
        {TOPICS.map((topic, topicIdx) => {
          const topicSets = sets.filter(s => s.parent_id === topic.id);
          const style = UNIT_STYLES[topic.id] || UNIT_STYLES.day1;

          return (
            <section key={topic.id} className="space-y-6">
              {/* Unit Header Card */}
              <article className={`rounded-2xl text-white shadow-sm overflow-hidden ${style.bg}`}>
                <header className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black tracking-wide">Unit {topicIdx + 1}: {topic.title.split(':')[1]?.trim() || topic.title}</h3>
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
            </section>
          );
        })}
      </div>
    </div>
  );
};
