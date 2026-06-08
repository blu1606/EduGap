'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { trackQuizEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import posthog from 'posthog-js';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  AlertTriangle, 
  ChevronDown, 
  ListTodo, 
  Check, 
  X,
  Info,
  Star,
  ChevronLeft,
  Mail,
  Sparkles,
  Share2,
  Calendar,
  Zap,
  Flame,
  ArrowUpRight
} from 'lucide-react';

// Import our new components
import { LeftBar, TabType } from '@/components/LeftBar';
import { RightBar } from '@/components/RightBar';
import { LearningPath } from '@/components/LearningPath';

// Define the core types
type QuizDifficulty = 'dễ' | 'bình thường' | 'khó';

interface Question {
  id: number;
  question: string;
  options?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    [key: string]: string | undefined;
  };
  answer?: string;
  explanation?: string;
  expected_answer?: string;
  evaluation_points?: string[];
  sfia_level?: string;
  competency?: string;
}

interface QuestionSet {
  id: string;
  parent_id?: string;
  topic_title?: string;
  title: string;
  description: string;
  difficulty?: QuizDifficulty;
  questions: Question[];
}

interface QuestionsData {
  sets: QuestionSet[];
}

// Fallback static data to ensure instant render and robustness if fetch fails
const FALLBACK_DATA: QuestionsData = {
  "sets": [
    {
      "id": "day1-basics",
      "parent_id": "day1",
      "topic_title": "Day 1: AI & LLM Foundation",
      "title": "Phần 1: Khái niệm cơ bản LLM",
      "description": "Lý thuyết nền tảng về Transformer, Tokenization và mô hình ngôn ngữ lớn.",
      "difficulty": "dễ",
      "questions": [
        {
          "id": 1,
          "question": "Kiến trúc nền tảng đứng sau sự bùng nổ của các Đại mô hình ngôn ngữ (LLM) hiện nay là gì?",
          "options": {
            "A": "Kiến trúc mạng nơ-ron tích chập (CNN).",
            "B": "Kiến trúc mạng nơ-ron hồi quy (RNN).",
            "C": "Kiến trúc Transformer giới thiệu cơ chế Self-Attention.",
            "D": "Kiến trúc mạng bộ nhớ dài-ngắn (LSTM)."
          },
          "answer": "C",
          "explanation": "Kiến trúc Transformer giới thiệu cơ chế Self-Attention năm 2017 là nền móng cốt lõi cho các mô hình GPT, Claude, Gemini ngày nay nhờ khả năng xử lý song song và học ngữ cảnh vượt trội."
        }
      ]
    }
  ]
};

const TOPICS = [
  { id: 'day1', title: 'Day 1: AI & LLM Foundation' },
  { id: 'day2', title: 'Day 2: Xác định Bài toán cho AI' },
  { id: 'day3', title: 'Day 3: Design Pattern ReAct' },
  { id: 'day4', title: 'Day 4: Prompt Engineering & Tool Calling' },
  { id: 'day5', title: 'Day 5: Thiết kế sản phẩm AI cho sự không chắc chắn' },
  { id: 'day6', title: 'Day 6: Hackathon Day' },
  { id: 'day7', title: 'Day 7: Data Foundations - Embedding & Vector Store' },
  { id: 'week1', title: 'Week 1: Ôn Tập Tổng Hợp' }
];

export default function QuizApp() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  // Guidebook inline states
  const [activeGuidebookDayId, setActiveGuidebookDayId] = useState<string | null>(null);
  const [guidebookHtml, setGuidebookHtml] = useState<string>('');
  const [isLoadingGuidebook, setIsLoadingGuidebook] = useState<boolean>(false);

  // Gamified progression state (persisted in LocalStorage)
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [completedSets, setCompletedSets] = useState<string[]>([]);
  const [devMode, setDevMode] = useState<boolean>(false);

  // Core quiz state
  const [data, setData] = useState<QuestionsData>(FALLBACK_DATA);
  const [activeSetId, setActiveSetId] = useState<string>('day1-basics');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answersHistory, setAnswersHistory] = useState<{ [setId: string]: { [qId: number]: { selected?: string, essayAnswer?: string, checkedPoints?: string[], isCorrect: boolean } } }>({});
  const [showFinishScreen, setShowFinishScreen] = useState<boolean>(false);
  const [essayInput, setEssayInput] = useState<string>('');

  // Loading state for quiz questions
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Session survey mapping ID
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Fetch guidebook content inline
  const handleSelectGuidebook = async (dayId: string) => {
    setActiveGuidebookDayId(dayId);
    setIsLoadingGuidebook(true);
    setGuidebookHtml('');
    try {
      const response = await fetch(`/api/guidebook/${dayId}`);
      if (response.ok) {
        const resData = await response.json();
        setGuidebookHtml(resData.html || '');
      } else {
        console.error('Failed to fetch guidebook content');
      }
    } catch (err) {
      console.error('Error fetching guidebook:', err);
    } finally {
      setIsLoadingGuidebook(false);
    }
  };

  const handleCloseGuidebook = () => {
    setActiveGuidebookDayId(null);
    setGuidebookHtml('');
  };

  // Survey states linked by activeSetId
  const [preQuizRatings, setPreQuizRatings] = useState<{ [setId: string]: number }>({});
  const [preQuizSubmitted, setPreQuizSubmitted] = useState<{ [setId: string]: boolean }>({});
  
  // Post-quiz survey states linked by activeSetId
  const [postRatings, setPostRatings] = useState<{
    [setId: string]: {
      understanding: number;
      utility: number;
      personalized: number;
    }
  }>({});
  const [postQuizSubmitted, setPostQuizSubmitted] = useState<{ [setId: string]: boolean }>({});
  const [preQuizComments, setPreQuizComments] = useState<{ [setId: string]: string }>({});
  const [postQuizComments, setPostQuizComments] = useState<{ [setId: string]: string }>({});
  const [waitlistEmail, setWaitlistEmail] = useState<string>('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState<boolean>(false);
  const [showPreComment, setShowPreComment] = useState<boolean>(false);

  // Leaderboard toggle
  const [leaderboardScope, setLeaderboardScope] = useState<'daily' | 'global'>('daily');

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedXp = localStorage.getItem('edugap_xp');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedXp) setXp(parseInt(savedXp, 10));

      const savedCompleted = localStorage.getItem('edugap_completed_sets');
      if (savedCompleted) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCompletedSets(JSON.parse(savedCompleted));
        } catch (e) {
          console.error('Failed to parse completed sets:', e);
        }
      }

      const savedDevMode = localStorage.getItem('edugap_dev_mode');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedDevMode) setDevMode(savedDevMode === 'true');

      // Load answers history to restore user session progress if any
      const savedHistory = localStorage.getItem('edugap_answers_history');
      if (savedHistory) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAnswersHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse answers history:', e);
        }
      }

      // Restore pre-quiz submission states based on completed sets
      const savedPreSubmitted = localStorage.getItem('edugap_pre_submitted');
      if (savedPreSubmitted) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPreQuizSubmitted(JSON.parse(savedPreSubmitted));
        } catch (e) {
          console.error(e);
        }
      }

      // Streak tracking & calculation
      const savedStreak = localStorage.getItem('edugap_streak');
      const lastActive = localStorage.getItem('edugap_last_active');
      let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 1;

      if (lastActive) {
        const lastActiveDate = new Date(lastActive);
        const today = new Date();

        lastActiveDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          currentStreak = 1; // streak reset
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreak(currentStreak);
      localStorage.setItem('edugap_streak', currentStreak.toString());
      localStorage.setItem('edugap_last_active', new Date().toISOString());
    }
  }, []);

  // Reset guidebook view when switching tabs
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveGuidebookDayId(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuidebookHtml('');
  }, [activeTab]);

  const activeSet = data.sets.find(s => s.id === activeSetId) || data.sets[0];
  const questionsList = activeSet?.questions || [];
  const totalQuestions = questionsList.length;
  const currentQuestionIdxBounded = totalQuestions > 0 ? Math.min(currentQuestionIdx, totalQuestions - 1) : 0;
  const currentQuestion = questionsList[currentQuestionIdxBounded];

  // Derive active question states on-the-fly based on answersHistory
  const currentHistory = currentQuestion && activeSetId ? answersHistory[activeSetId]?.[currentQuestion.id] : undefined;
  const selectedOption = currentHistory ? currentHistory.selected : null;
  const isSubmitted = !!currentHistory;
  const showExplanation = isSubmitted;
  const isEssayCompleted = currentQuestion && (!currentQuestion.options || currentQuestion.expected_answer)
    ? (selectedOption === 'essay_correct' || selectedOption === 'essay_incorrect')
    : true;

  const getCompactQuizAnalyticsProperties = useCallback(() => ({
    set_id: activeSetId,
    difficulty: activeSet?.difficulty || null,
    question_count: totalQuestions
  }), [activeSet, activeSetId, totalQuestions]);

  const getShareUrl = () => {
    const slug = activeSetId === 'react-loop-basics' ? 'design-pattern-react' : activeSetId;
    return `${window.location.origin}${window.location.pathname}?set=${slug}`;
  };

  const handleCopyShareLink = (source: string) => {
    navigator.clipboard.writeText(getShareUrl());
    trackQuizEvent('share_link_copied', {
      set_id: activeSetId,
      source
    });
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  // Toggle Developer mode
  const handleToggleDevMode = () => {
    const nextDevMode = !devMode;
    setDevMode(nextDevMode);
    localStorage.setItem('edugap_dev_mode', nextDevMode.toString());
  };

  // Supabase submission handlers
  const handlePreQuizSubmit = async () => {
    const rating = preQuizRatings[activeSetId];
    const comment = preQuizComments[activeSetId] || '';
    if (!rating) return;
    
    trackQuizEvent('pre_quiz_submitted', {
      ...getCompactQuizAnalyticsProperties(),
      rating_pre: rating,
      has_comment: comment.trim().length > 0
    });
    trackQuizEvent('quiz_started', getCompactQuizAnalyticsProperties());
    
    const updatedPre = { ...preQuizSubmitted, [activeSetId]: true };
    setPreQuizSubmitted(updatedPre);
    localStorage.setItem('edugap_pre_submitted', JSON.stringify(updatedPre));
    
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          set_id: activeSetId,
          rating_pre: rating,
          comment_pre: comment
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Failed to submit pre-quiz survey to Supabase:', error);
      } else if (data) {
        setSubmissionId(data.id);
      }
    } catch (err) {
      console.error('Failed to submit pre-quiz survey to Supabase:', err);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) return;
    
    trackQuizEvent('waitlist_submitted', {
      set_id: activeSetId,
      has_email: true
    });
    setWaitlistSubmitted(true);
    
    try {
      if (submissionId) {
        const { error } = await supabase
          .from('surveys')
          .update({
            email: waitlistEmail
          })
          .eq('id', submissionId);
          
        if (error) {
          console.error('Failed to update waitlist email in Supabase:', error);
        }
      } else {
        const { data, error } = await supabase
          .from('surveys')
          .insert({
            set_id: activeSetId,
            email: waitlistEmail
          })
          .select('id')
          .single();
          
        if (error) {
          console.error('Failed to insert waitlist email to Supabase:', error);
        } else if (data) {
          setSubmissionId(data.id);
        }
      }
    } catch (err) {
      console.error('Failed to submit waitlist email to Supabase:', err);
    }
  };

  const handlePostQuizSubmit = async () => {
    const ratings = postRatings[activeSetId];
    const comment = postQuizComments[activeSetId] || '';
    if (!ratings || !ratings.understanding || !ratings.utility || !ratings.personalized) return;
    
    trackQuizEvent('post_quiz_submitted', {
      set_id: activeSetId,
      understanding: ratings.understanding,
      utility: ratings.utility,
      personalized: ratings.personalized,
      has_comment: comment.trim().length > 0
    });
    setPostQuizSubmitted(prev => ({ ...prev, [activeSetId]: true }));
    
    try {
      if (submissionId) {
        const { error } = await supabase
          .from('surveys')
          .update({
            rating_understanding: ratings.understanding,
            rating_utility: ratings.utility,
            rating_personalized: ratings.personalized,
            comment_post: comment
          })
          .eq('id', submissionId);
          
        if (error) {
          console.error('Failed to update post-quiz survey in Supabase:', error);
        }
      } else {
        const { data, error } = await supabase
          .from('surveys')
          .insert({
            set_id: activeSetId,
            rating_understanding: ratings.understanding,
            rating_utility: ratings.utility,
            rating_personalized: ratings.personalized,
            comment_post: comment
          })
          .select('id')
          .single();
          
        if (error) {
          console.error('Failed to insert post-quiz survey to Supabase:', error);
        } else if (data) {
          setSubmissionId(data.id);
        }
      }
    } catch (err) {
      console.error('Failed to submit post-quiz survey to Supabase:', err);
    }
  };

  // Fetch the data from quiz-manifest.json
  useEffect(() => {
    async function loadManifest() {
      try {
        const response = await fetch('/quiz-manifest.json');
        if (response.ok) {
          const fetchedData = await response.json();
          if (fetchedData && fetchedData.sets && fetchedData.sets.length > 0) {
            const setsWithEmptyQuestions = fetchedData.sets.map((s: any) => ({
              ...s,
              questions: s.questions || []
            }));
            setData({ sets: setsWithEmptyQuestions });
            
            // Read "set" parameter from URL query string
            const params = new URLSearchParams(window.location.search);
            const querySet = params.get('set')?.toLowerCase();
            
            let targetSetId = fetchedData.sets[0].id;
            let shouldTriggerQuiz = false;
            
            if (querySet) {
              const searchSlug = querySet === 'day1-basics' ? 'react-loop-basics' : querySet;
              const found = fetchedData.sets.find((s: any) => {
                const normalizedTitle = s.title
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[đĐ]/g, 'd')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '');
                
                return (
                  s.id.toLowerCase() === searchSlug ||
                  normalizedTitle === searchSlug ||
                  (searchSlug === 'design-pattern-react' && s.id === 'react-loop-basics') ||
                  (searchSlug === 'react-agent-day3' && s.id === 'react-loop-basics')
                );
              });
              
              if (found) {
                targetSetId = found.id;
                shouldTriggerQuiz = true;
              }
            }
            
            setActiveSetId(targetSetId);
            if (shouldTriggerQuiz) {
              setIsQuizMode(true);
            }
          }
        }
      } catch (err) {
        console.warn('Yeu cau tai quiz-manifest.json khong co ket qua, dang xai du lieu du phong.', err);
      }
    }
    loadManifest();
  }, []);

  // Load questions for the active set dynamically based on parent directory
  useEffect(() => {
    if (!activeSetId || !data.sets || data.sets.length === 0) return;

    const currentSet = data.sets.find(s => s.id === activeSetId);
    if (currentSet && currentSet.questions && currentSet.questions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingQuestions(false);
      return;
    }

    let isMounted = true;
    async function fetchQuestions() {
      setIsLoadingQuestions(true);
      try {
        const parentId = currentSet?.parent_id || 'day1';
        const response = await fetch(`/quizzes/${parentId}/${activeSetId}.json`);
        if (!response.ok) {
          trackQuizEvent('quiz_questions_load_failed', {
            set_id: activeSetId,
            parent_id: parentId
          });
        }
        if (response.ok && isMounted) {
          const quizSet = await response.json();
          setData(prev => ({
            sets: prev.sets.map(s =>
              s.id === activeSetId
                ? { ...s, ...quizSet, questions: quizSet.questions }
                : s
            )
          }));
        }
      } catch (err) {
        trackQuizEvent('quiz_questions_load_failed', {
          set_id: activeSetId,
          parent_id: currentSet?.parent_id || 'day1'
        });
        console.error('Error fetching questions:', err);
      } finally {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    }

    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [activeSetId, data.sets]);

  const renderDifficultyBadge = (difficulty?: QuizDifficulty) => {
    if (!difficulty) return null;

    return (
      <span className="shrink-0 rounded-full border border-amber-200/70 bg-amber-50/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-800">
        {difficulty}
      </span>
    );
  };

  // Selected state update & Instant submission (auto check answer on click)
  const handleSelectOption = useCallback((optionKey: string) => {
    if (isSubmitted || !currentQuestion || !currentQuestion.options) return;

    const isCorrect = optionKey === currentQuestion.answer;

    posthog.capture('question_answered', {
      set_id: activeSetId,
      question_id: currentQuestion.id,
      question_index: currentQuestionIdx,
      is_correct: isCorrect,
      selected_option: optionKey,
    });

    const nextHistory = {
      ...answersHistory,
      [activeSetId]: {
        ...(answersHistory[activeSetId] || {}),
        [currentQuestion.id]: {
          selected: optionKey,
          isCorrect
        }
      }
    };
    setAnswersHistory(nextHistory);
    localStorage.setItem('edugap_answers_history', JSON.stringify(nextHistory));
  }, [activeSetId, currentQuestion, currentQuestionIdx, isSubmitted, answersHistory]);

  // Submit the essay text
  const handleSubmitEssay = () => {
    if (isSubmitted || !currentQuestion || !essayInput.trim()) return;

    posthog.capture('essay_submitted', {
      set_id: activeSetId,
      question_id: currentQuestion.id,
      question_index: currentQuestionIdx,
      answer_length: essayInput.trim().length,
    });

    const nextHistory = {
      ...answersHistory,
      [activeSetId]: {
        ...(answersHistory[activeSetId] || {}),
        [currentQuestion.id]: {
          essayAnswer: essayInput,
          isCorrect: false, // Default false until graded
          selected: 'essay_submitted',
          checkedPoints: []
        }
      }
    };
    setAnswersHistory(nextHistory);
    localStorage.setItem('edugap_answers_history', JSON.stringify(nextHistory));
  };

  // Grade the essay (user clicks Correct or Incorrect)
  const handleGradeEssay = (isCorrect: boolean) => {
    if (!currentQuestion || !currentHistory) return;

    posthog.capture('essay_graded', {
      set_id: activeSetId,
      question_id: currentQuestion.id,
      question_index: currentQuestionIdx,
      is_correct: isCorrect,
      checked_points_count: currentHistory.checkedPoints?.length ?? 0,
    });

    const nextHistory = {
      ...answersHistory,
      [activeSetId]: {
        ...(answersHistory[activeSetId] || {}),
        [currentQuestion.id]: {
          ...answersHistory[activeSetId][currentQuestion.id],
          isCorrect,
          selected: isCorrect ? 'essay_correct' : 'essay_incorrect'
        }
      }
    };
    setAnswersHistory(nextHistory);
    localStorage.setItem('edugap_answers_history', JSON.stringify(nextHistory));
  };

  // Toggle checklist for evaluation points
  const handleToggleEvaluationPoint = (point: string) => {
    if (!currentQuestion || !currentHistory) return;

    const currentPoints = currentHistory.checkedPoints || [];
    const newPoints = currentPoints.includes(point)
      ? currentPoints.filter(p => p !== point)
      : [...currentPoints, point];

    const nextHistory = {
      ...answersHistory,
      [activeSetId]: {
        ...(answersHistory[activeSetId] || {}),
        [currentQuestion.id]: {
          ...answersHistory[activeSetId][currentQuestion.id],
          checkedPoints: newPoints
        }
      }
    };
    setAnswersHistory(nextHistory);
    localStorage.setItem('edugap_answers_history', JSON.stringify(nextHistory));
  };

  // Move to next question or show finish details
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIdx === totalQuestions - 1) {
      // Quiz Finished! Save progress and reward XP
      const setHistory = answersHistory[activeSetId] || {};
      const correctCount = activeSet.questions.reduce(
        (correct, question) => correct + (setHistory[question.id]?.isCorrect ? 1 : 0),
        0
      );
      trackQuizEvent('quiz_completed', {
        ...getCompactQuizAnalyticsProperties(),
        score_percent: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
        correct_count: correctCount
      });

      // Update LocalStorage stats on complete
      const isNewCompletion = !completedSets.includes(activeSetId);
      let nextCompleted = [...completedSets];
      
      if (isNewCompletion) {
        nextCompleted.push(activeSetId);
        setCompletedSets(nextCompleted);
        localStorage.setItem('edugap_completed_sets', JSON.stringify(nextCompleted));
      }

      // Calculate new XP
      const rewardXp = isNewCompletion ? 10 : 5; // +10 for first complete, +5 for review/practice
      const nextXp = xp + rewardXp;
      setXp(nextXp);
      localStorage.setItem('edugap_xp', nextXp.toString());

      // Update Streak
      const lastActive = localStorage.getItem('edugap_last_active');
      let currentStreak = streak;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastActive) {
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - lastActiveDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Increment streak on consecutive day study completion
          currentStreak += 1;
          setStreak(currentStreak);
          localStorage.setItem('edugap_streak', currentStreak.toString());
        }
      }
      localStorage.setItem('edugap_last_active', new Date().toISOString());

      setShowFinishScreen(true);
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  }, [activeSet, activeSetId, answersHistory, currentQuestionIdx, getCompactQuizAnalyticsProperties, totalQuestions, completedSets, xp, streak]);

  // Reset the current active set
  const handleRestart = () => {
    posthog.capture('quiz_restarted', {
      set_id: activeSetId,
      difficulty: activeSet.difficulty ?? null,
      question_count: totalQuestions,
    });

    setCurrentQuestionIdx(0);
    setShowFinishScreen(false);
    setSubmissionId(null);
    setWaitlistSubmitted(false);
    setWaitlistEmail('');
    setShowPreComment(false);
    
    // Clear responses pertaining only to the current active set questions to avoid mixing data
    const nextHistory = { ...answersHistory };
    delete nextHistory[activeSetId];
    setAnswersHistory(nextHistory);
    localStorage.setItem('edugap_answers_history', JSON.stringify(nextHistory));

    // Clear post-quiz survey for this active set to allow re-submission
    const updatedPostQuiz = { ...postQuizSubmitted };
    delete updatedPostQuiz[activeSetId];
    setPostQuizSubmitted(updatedPostQuiz);
  };

  // Triggered when a tile is clicked on the serpentine path
  const handleSelectQuizFromPath = (setId: string) => {
    trackQuizEvent('quiz_set_changed', {
      from_set_id: activeSetId,
      to_set_id: setId
    });
    setActiveSetId(setId);
    setCurrentQuestionIdx(0);
    setShowFinishScreen(false);
    setSubmissionId(null);
    setWaitlistSubmitted(false);
    setWaitlistEmail('');
    setShowPreComment(false);

    // Enter Quiz mode
    setIsQuizMode(true);

    // Update URL query param to make it shareable
    const slug = setId === 'react-loop-basics' ? 'design-pattern-react' : setId;
    const newUrl = `${window.location.pathname}?set=${slug}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Calculate score for the active set
  function getActiveSetCorrectCount() {
    let correct = 0;
    const setHistory = answersHistory[activeSetId] || {};
    activeSet?.questions.forEach(q => {
      if (setHistory[q.id]?.isCorrect) {
        correct += 1;
      }
    });
    return correct;
  }

  // Find incorrectly answered questions
  const getIncorrectQuestions = () => {
    const setHistory = answersHistory[activeSetId] || {};
    return activeSet?.questions.filter(q => {
      const record = setHistory[q.id];
      return record && !record.isCorrect;
    }) || [];
  };

  // Listen to keyboard shortcuts (1-4 for option selection, Enter for next, ArrowLeft for back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const isQuizActive = preQuizSubmitted[activeSetId] && !showFinishScreen && isQuizMode;
      if (!isQuizActive) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        if (!isSubmitted) {
          const keyMap: { [key: string]: 'A' | 'B' | 'C' | 'D' } = {
            '1': 'A',
            '2': 'B',
            '3': 'C',
            '4': 'D'
          };
          handleSelectOption(keyMap[e.key]);
        }
      }

      if (e.key === 'Enter') {
        if (isSubmitted && isEssayCompleted) {
          handleNextQuestion();
        }
      }

      if (e.key === 'ArrowLeft') {
        if (currentQuestionIdx > 0) {
          setCurrentQuestionIdx(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeSetId,
    preQuizSubmitted,
    showFinishScreen,
    isSubmitted,
    currentQuestionIdx,
    isQuizMode,
    isEssayCompleted,
    handleSelectOption,
    handleNextQuestion
  ]);

  const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round(((currentQuestionIdx + (isSubmitted ? 1 : 0)) / totalQuestions) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-850 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* 1. Distraction-Free Quiz Mode */}
      {isQuizMode ? (
        <div className="flex-1 flex flex-col w-full bg-[#FDFBF7] animate-in fade-in duration-300">
          {/* Top Focused Header */}
          <header className="sticky top-0 bg-[#FDFBF7] border-b border-amber-100 px-4 py-4 md:py-5 flex items-center justify-between gap-4 max-w-4xl mx-auto w-full z-20">
            {/* Close Button */}
            <button
              onClick={() => setIsQuizMode(false)}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all cursor-pointer"
              title="Quay lại lộ trình"
            >
              <X className="h-5.5 w-5.5 stroke-[2.5]" />
            </button>

            {/* Title & Progress Bar Row */}
            <div className="flex-1 flex items-center gap-4">
              {preQuizSubmitted[activeSetId] && !showFinishScreen && !isLoadingQuestions && (
                <>
                  <div className="hidden sm:block text-[10px] font-mono text-amber-700 uppercase tracking-wider font-extrabold shrink-0">
                    Bài thi
                  </div>
                  <div className="flex-1 h-3 bg-stone-100 rounded-full border border-stone-200/40 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-stone-600 shrink-0">
                    {Math.min(currentQuestionIdx + 1, totalQuestions)}/{totalQuestions}
                  </div>
                </>
              )}
              {!preQuizSubmitted[activeSetId] && !isLoadingQuestions && (
                <span className="text-xs font-bold text-stone-500 font-mono tracking-wider truncate">
                  Khảo Sát Khởi Động: {activeSet?.title}
                </span>
              )}
              {showFinishScreen && (
                <span className="text-xs font-bold text-stone-500 font-mono tracking-wider truncate">
                  Kết Quả Đạt Được: {activeSet?.title}
                </span>
              )}
            </div>

            {/* Dev Badge indicator */}
            {devMode && (
              <span className="rounded bg-amber-50 border border-amber-300 text-[8px] font-extrabold px-1.5 py-0.5 text-amber-800 uppercase font-mono">
                DEV
              </span>
            )}
          </header>

          {/* Main Quiz Content */}
          <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 md:py-10">
            <AnimatePresence mode="wait">
              {isLoadingQuestions ? (
                <motion.div
                  key="loading-questions"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full p-8 md:p-12 rounded-2xl bg-white border border-amber-100 shadow-sm flex flex-col items-center justify-center space-y-4 text-center min-h-[350px]"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-2 bg-amber-50 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-955">Đang tải câu hỏi...</h3>
                    <p className="text-[10px] text-stone-400 font-mono">Hệ thống đang nạp dữ liệu bài học</p>
                  </div>
                </motion.div>
              ) : !showFinishScreen ? (
                // Pre Quiz Survey
                !preQuizSubmitted[activeSetId] ? (
                  <motion.div
                    key={`pre-survey-${activeSetId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 md:p-6 rounded-2xl bg-white border border-amber-100 shadow-sm space-y-6 text-center relative"
                  >
                    {/* Share */}
                    <button
                      onClick={() => handleCopyShareLink('pre_quiz')}
                      className="absolute top-4 right-4 p-2 rounded-lg border border-amber-200/50 hover:bg-amber-50 text-amber-800 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-white shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedShareLink ? 'Đã copy' : 'Chia sẻ'}</span>
                    </button>

                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
                      <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-md md:text-lg font-bold text-amber-950">Khảo sát mức độ tiếp thu</h2>
                      <p className="text-[11px] md:text-xs text-stone-550 leading-relaxed max-w-md mx-auto">
                        Để hệ thống tối ưu hóa lộ trình cá nhân, bạn hãy đánh giá độ hiểu bài hôm nay trên lớp nhé!
                      </p>
                    </div>

                    <div className="max-w-lg mx-auto rounded-xl border border-amber-100/50 bg-amber-50/20 p-4 text-left space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-amber-950 truncate">{activeSet?.title}</h3>
                        {renderDifficultyBadge(activeSet?.difficulty)}
                      </div>
                      <p className="text-[11px] text-stone-605 leading-relaxed">
                        {activeSet?.description}
                      </p>
                      <p className="text-[10px] text-amber-800/80 font-mono font-bold">
                        {totalQuestions} câu hỏi
                      </p>
                    </div>

                    <div className="py-4 border-y border-amber-100/40 space-y-3">
                      <p className="text-xs font-semibold text-stone-700">
                        Bạn tự đánh giá độ hiểu bài học này trên lớp của mình như thế nào?
                      </p>
                      
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = preQuizRatings[activeSetId] || 0;
                          return (
                            <button
                              key={star}
                              onClick={() => setPreQuizRatings(prev => ({ ...prev, [activeSetId]: star }))}
                              className="p-1 hover:scale-115 transition-transform duration-100 cursor-pointer"
                            >
                              <Star 
                                className={`w-8 h-8 transition-colors ${
                                  star <= rating 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-stone-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      
                      <p className="text-[11px] font-medium text-amber-705 font-mono min-h-[16px]">
                        {(() => {
                          const r = preQuizRatings[activeSetId] || 0;
                          if (r === 1) return 'Rất mơ hồ - Cần củng cố tri thức cơ bản nhất';
                          if (r === 2) return 'Chỉ mới hiểu sơ bộ / Mới chạm lý thuyết';
                          if (r === 3) return 'Hiểu mức độ trung bình - Đủ giải các câu hỏi cơ bản';
                          if (r === 4) return 'Hiểu tương đối tốt - Cần rèn luyện củng cố thêm';
                          if (r === 5) return 'Cực kỳ hiểu sâu rộng - Rất tự tin chinh phục nội dung';
                          return 'Vui lòng chọn số sao đánh giá';
                        })()}
                      </p>

                      {preQuizRatings[activeSetId] > 0 && !showPreComment && (
                        <div className="pt-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => setShowPreComment(true)}
                            className="text-[11px] text-amber-600 hover:text-amber-800 hover:underline font-semibold cursor-pointer"
                          >
                            ✍️ Thêm phản hồi/góp ý khác (không bắt buộc)
                          </button>
                        </div>
                      )}

                      {preQuizRatings[activeSetId] > 0 && showPreComment && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-left space-y-2 pt-3 border-t border-amber-100/30 overflow-hidden"
                        >
                          <textarea
                            value={preQuizComments[activeSetId] || ''}
                            onChange={(e) => setPreQuizComments(prev => ({ ...prev, [activeSetId]: e.target.value }))}
                            placeholder="Chia sẻ ngắn gọn cảm nhận của bạn về buổi học hoặc lý do chưa thực sự nắm rõ kiến thức trên lớp..."
                            className="w-full min-h-[75px] p-2.5 text-xs text-stone-800 bg-[#FDFBF7] border border-stone-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        disabled={!(preQuizRatings[activeSetId] > 0)}
                        onClick={handlePreQuizSubmit}
                        className={`px-8 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                          preQuizRatings[activeSetId] > 0
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:translate-y-[1px] cursor-pointer'
                            : 'bg-stone-50 border border-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        Bắt đầu làm bài
                      </button>
                    </div>
                  </motion.div>
                ) : currentQuestion ? (
                  // Active Question View
                  <motion.div
                    key={`${activeSetId}-${currentQuestion.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 md:p-6 rounded-2xl bg-white border border-amber-100 shadow-sm space-y-5 relative"
                  >
                    <div className="flex justify-between items-center border-b border-amber-100/40 pb-3">
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-400/30 text-amber-800 font-mono text-xs rounded-full font-semibold">
                        Câu {currentQuestionIdx + 1}/{totalQuestions}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {isSubmitted && (
                          <span className={`flex items-center gap-1 text-xs font-mono px-3 py-1 rounded-full ${
                            currentHistory?.isCorrect 
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                          }`}>
                            {currentHistory?.isCorrect ? 'Chuẩn xác' : 'Chưa chính xác'}
                          </span>
                        )}
                        <button
                          onClick={() => handleCopyShareLink('question')}
                          className="p-1.5 rounded-lg border border-amber-200/50 hover:bg-amber-50 text-amber-800 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-white shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-md md:text-lg text-amber-950 font-bold leading-relaxed">
                      {currentQuestion.question}
                    </h3>

                    {/* Question Content: Essay or Options */}
                    {!currentQuestion.options || currentQuestion.expected_answer ? (
                      <div className="space-y-4 pt-2">
                        {(currentQuestion.sfia_level || currentQuestion.competency) && (
                          <div className="flex flex-wrap gap-2 items-center">
                            {currentQuestion.sfia_level && (
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-400/20 text-amber-800 text-[9px] uppercase font-bold tracking-wider font-mono rounded">
                                {currentQuestion.sfia_level}
                              </span>
                            )}
                            {currentQuestion.competency && (
                              <span className="text-[10px] text-stone-500 italic">
                                Năng lực: {currentQuestion.competency}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-amber-900/60 uppercase tracking-wider font-mono">
                            Bài làm tự luận ngắn của bạn:
                          </label>
                          <textarea
                            disabled={isSubmitted}
                            value={essayInput}
                            onChange={(e) => setEssayInput(e.target.value)}
                            placeholder="Trình bày giải pháp của bạn cho tình huống trên..."
                            className="w-full min-h-[140px] p-3 text-xs md:text-sm text-stone-850 bg-[#FDFBF7] border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 rounded-xl focus:outline-none transition-all leading-relaxed shadow-sm"
                          />
                        </div>

                        {!isSubmitted && (
                          <div className="flex justify-end">
                            <button
                              disabled={!essayInput.trim()}
                              onClick={handleSubmitEssay}
                              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                essayInput.trim()
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10'
                                  : 'bg-stone-50 border border-stone-200 text-stone-400 cursor-not-allowed'
                              }`}
                            >
                              <span>Nộp bài & Đối chiếu</span>
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {isSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pt-1"
                          >
                            <div className="p-4 rounded-xl bg-amber-50/20 border border-amber-200/50 space-y-2">
                              <div className="flex items-center gap-1 text-amber-900 text-[10px] font-bold uppercase tracking-wider font-mono">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                                Đáp án tham chiếu đề xuất
                              </div>
                              <p className="text-stone-800 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                                {currentQuestion.expected_answer}
                              </p>
                            </div>

                            {/* Checklist criteria */}
                            {currentQuestion.evaluation_points && currentQuestion.evaluation_points.length > 0 && (
                              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                                <div className="flex items-center gap-1.5 text-stone-650 text-[10px] font-bold uppercase tracking-wider font-mono">
                                  <ListTodo className="w-3.5 h-3.5 text-amber-600" />
                                  Tự kiểm tra tiêu chí đạt được (Checklist):
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {currentQuestion.evaluation_points.map((point, idx) => {
                                    const isChecked = currentHistory?.checkedPoints?.includes(point);
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => handleToggleEvaluationPoint(point)}
                                        className={`flex items-start text-left gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                                          isChecked
                                            ? 'bg-amber-500/5 border-amber-300 text-amber-950 font-medium'
                                            : 'bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-50'
                                        }`}
                                      >
                                        <span className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border text-[9px] mt-0.5 ${
                                          isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-stone-300 bg-white'
                                        }`}>
                                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                        </span>
                                        <span className="text-[11px] leading-normal">{point}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Rubrics grade */}
                            <div className="p-4 rounded-xl bg-amber-50/10 border border-amber-100 space-y-3 text-center sm:text-left">
                              <div className="text-xs font-bold text-stone-850">
                                Đánh giá mức độ khớp câu trả lời của bạn so với đáp án mẫu:
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <button
                                  onClick={() => handleGradeEssay(true)}
                                  className={`px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                    selectedOption === 'essay_correct'
                                      ? 'bg-emerald-500 border border-emerald-500 text-white shadow-md'
                                      : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-800'
                                  }`}
                                >
                                  <span>Khớp đáp án (Đạt chuẩn)</span>
                                </button>
                                <button
                                  onClick={() => handleGradeEssay(false)}
                                  className={`px-4.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                    selectedOption === 'essay_incorrect'
                                      ? 'bg-rose-500 border border-rose-500 text-white shadow-md'
                                      : 'bg-rose-500/10 border border-rose-500/25 text-rose-800'
                                  }`}
                                >
                                  <span>Chưa chính xác (Cần ôn tập)</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      // MCQ Options
                      <div className="grid grid-cols-1 gap-3 pt-2">
                        {(Object.keys(currentQuestion.options!) as Array<'A' | 'B' | 'C' | 'D'>).map(key => {
                          const optionText = currentQuestion.options![key];
                          const isSelected = selectedOption === key;
                          const isAnswerCorrectKey = currentQuestion.answer === key;
                          
                          let buttonStyle = 'bg-amber-50/10 border-amber-100/60 text-stone-700 hover:bg-amber-50/40 hover:border-amber-200/60 shadow-sm';
                          let badgeStyle = 'bg-amber-100/50 text-amber-800 border-amber-200/50';
                          let indicatorIcon = null;

                          if (!isSubmitted) {
                            if (isSelected) {
                              buttonStyle = 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold ring-1 ring-amber-500/20';
                              badgeStyle = 'bg-amber-500 text-white border-amber-500';
                            }
                          } else {
                            if (isSelected) {
                              if (isAnswerCorrectKey) {
                                  buttonStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500/20';
                                  badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                                  indicatorIcon = <Check className="w-4 h-4 text-emerald-600 ml-auto" />;
                              } else {
                                  buttonStyle = 'bg-rose-500/10 border-rose-500 text-rose-900 font-semibold ring-1 ring-rose-500/20';
                                  badgeStyle = 'bg-rose-500 text-white border-rose-500';
                                  indicatorIcon = <X className="w-4 h-4 text-rose-600 ml-auto" />;
                              }
                            } else {
                              if (isAnswerCorrectKey) {
                                  buttonStyle = 'bg-emerald-50/40 border-emerald-400 text-emerald-950 font-medium';
                                  badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                                  indicatorIcon = <Check className="w-4 h-4 text-emerald-600 ml-auto" />;
                              } else {
                                  buttonStyle = 'opacity-40 bg-stone-100/30 border-transparent text-stone-400 cursor-not-allowed';
                                  badgeStyle = 'bg-stone-200/50 text-stone-500 border-transparent';
                              }
                            }
                          }

                          return (
                            <div key={key} className="space-y-2">
                              <button
                                disabled={isSubmitted}
                                onClick={() => handleSelectOption(key)}
                                className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${buttonStyle}`}
                              >
                                <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-mono text-xs border font-bold transition-colors ${badgeStyle}`}>
                                  {key}
                                </span>
                                <span className="flex-1 text-xs md:text-sm leading-relaxed">{optionText}</span>
                                {indicatorIcon}
                              </button>

                              {isSubmitted && isAnswerCorrectKey && showExplanation && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-250/30 space-y-1">
                                    <div className="flex items-center gap-1.5 text-emerald-900 text-[10px] font-bold uppercase tracking-wider font-mono">
                                      <Info className="w-3.5 h-3.5 text-emerald-600" />
                                      Giải thích đáp án đúng ({currentQuestion.answer})
                                    </div>
                                    <p className="text-stone-750 text-xs leading-relaxed font-medium">
                                      {currentQuestion.explanation}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bottom Navigation Buttons */}
                    <div className="pt-3 border-t border-amber-100/40 flex flex-col sm:flex-row gap-3 justify-between items-center z-10">
                      <div className="text-[10px] text-stone-400 font-mono text-center sm:text-left">
                        {currentQuestion.options ? 'Shortcuts: 1, 2, 3, 4 to select options | Enter to proceed' : 'Fill details and self-evaluate'}
                      </div>

                      <div className="w-full sm:w-auto flex gap-2 justify-end">
                        {currentQuestionIdx > 0 && (
                          <button
                            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                            className="px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Lùi lại</span>
                          </button>
                        )}

                        {isSubmitted && isEssayCompleted && (
                          <button
                            onClick={handleNextQuestion}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                          >
                            <span>{currentQuestionIdx === totalQuestions - 1 ? 'Xem kết quả' : 'Tiếp tục'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-amber-100 text-center text-stone-400 font-mono text-xs">
                    Không tìm thấy câu hỏi.
                  </div>
                )
              ) : (
                // Results screen
                <motion.div
                  key="result-dashboard"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 md:p-6 rounded-2xl bg-white border border-amber-100 shadow-sm space-y-6 relative"
                >
                  <button
                    onClick={() => handleCopyShareLink('results')}
                    className="absolute top-4 right-4 p-2 rounded-lg border border-amber-200/50 hover:bg-amber-50 text-amber-800 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-white shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShareLink ? 'Đã copy' : 'Chia sẻ'}</span>
                  </button>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Award className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-amber-955 tracking-tight">Ghi Nhận Tiến Độ</h2>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm leading-relaxed">
                        Bạn đã học xong bộ đề <span className="font-bold text-amber-900">{activeSet?.title}</span>! +XP đã được ghi nhận.
                      </p>
                    </div>
                  </div>

                  {/* Stats comparison */}
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 rounded-xl bg-amber-50/20 border border-amber-200/40 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-amber-900/60 font-bold tracking-wider uppercase mb-1">Điểm số</span>
                      <span className="text-2xl font-black text-amber-600 tracking-tight">
                        {getActiveSetCorrectCount()} / {totalQuestions}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/20 border border-amber-200/40 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-amber-900/60 font-bold tracking-wider uppercase mb-1">Độ chính xác</span>
                      <span className="text-2xl font-black text-yellow-600 tracking-tight">
                        {totalQuestions > 0 ? Math.round((getActiveSetCorrectCount() / totalQuestions) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Feedback survey box */}
                  <div className="p-5 rounded-xl bg-amber-50/10 border border-amber-200/40 space-y-4 text-left">
                    <div className="flex items-center gap-1.5 border-b border-amber-105 pb-2">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-300" />
                      <h3 className="text-xs font-bold tracking-wider uppercase text-amber-900/80 font-mono">
                        Khảo Sát Đánh Giá Đề Bài
                      </h3>
                    </div>

                    {!postQuizSubmitted[activeSetId] ? (
                      <div className="space-y-4">
                        {/* Survey Questions */}
                        {[
                          { key: 'understanding', label: '1. Bạn hiểu nội dung đề này ở mức độ nào?' },
                          { key: 'utility', label: '2. Quy trình làm bài trắc nghiệm hữu ích thế nào?' },
                          { key: 'personalized', label: '3. Bạn muốn học các câu hỏi cá nhân hóa tiếp theo?' }
                        ].map((q) => {
                          const val = (postRatings[activeSetId] as any)?.[q.key] || 0;
                          return (
                            <div key={q.key} className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-stone-850 block">{q.label}</label>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1 bg-white p-1 rounded-lg border border-amber-100/50">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setPostRatings(prev => ({
                                        ...prev,
                                        [activeSetId]: {
                                          ...(prev[activeSetId] || { understanding: 0, utility: 0, personalized: 0 }),
                                          [q.key]: star
                                        }
                                      }))}
                                      className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                                    >
                                      <Star className={`w-6 h-6 transition-colors ${
                                        star <= val ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                      }`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Qualitative comment */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-stone-850 block">Góp ý cải thiện (không bắt buộc):</label>
                          <textarea
                            value={postQuizComments[activeSetId] || ''}
                            onChange={(e) => setPostQuizComments(prev => ({ ...prev, [activeSetId]: e.target.value }))}
                            placeholder="Nhập cảm nhận của bạn để tụi mình cải tiến đề tốt hơn..."
                            className="w-full min-h-[60px] p-2.5 text-xs text-stone-800 bg-[#FDFBF7] border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <button
                          disabled={
                            !(
                              postRatings[activeSetId]?.understanding > 0 &&
                              postRatings[activeSetId]?.utility > 0 &&
                              postRatings[activeSetId]?.personalized > 0
                            )
                          }
                          onClick={handlePostQuizSubmit}
                          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:bg-stone-50 disabled:border disabled:border-stone-200 disabled:text-stone-400 cursor-pointer"
                        >
                          Gửi khảo sát phản hồi
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 rounded-lg text-center text-xs font-semibold leading-relaxed">
                        Cực kỳ cảm ơn những đóng góp hữu ích của bạn để cải tiến chất lượng học thuật và lộ trình! 🌟
                      </div>
                    )}
                  </div>

                  {/* Incorrect questions listing */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-amber-900/60 border-b border-amber-100/40 pb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Câu hỏi cần ôn tập thêm ({getIncorrectQuestions().length})
                    </div>

                    {getIncorrectQuestions().length > 0 ? (
                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {getIncorrectQuestions().map((q) => {
                          const history = answersHistory[activeSetId]?.[q.id];
                          const wrongChoice = history?.selected;
                          const isEssay = !q.options || q.expected_answer;
                          
                          return (
                            <div key={q.id} className="p-3.5 rounded-xl bg-amber-50/10 border border-amber-250/20 space-y-2 text-xs">
                              <p className="font-bold text-amber-955 leading-relaxed">#{q.id} {"->"} {q.question}</p>
                              
                              {isEssay ? (
                                <div className="space-y-1.5 pl-2">
                                  <p className="text-[10px] text-stone-605">Bài làm của bạn: <span className="italic">&quot;{history?.essayAnswer}&quot;</span></p>
                                  <p className="text-[10px] text-emerald-800 font-semibold font-mono">Đáp án mẫu: {q.expected_answer}</p>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <span className="text-[10px] text-rose-800 bg-rose-50 border border-rose-100 rounded px-2 py-0.5">Lựa chọn: {wrongChoice}</span>
                                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">Đáp án đúng: {q.answer}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center text-stone-500 text-xs">
                        Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi.
                      </div>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleRestart}
                      className="px-5 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại đề</span>
                    </button>

                    <button
                      onClick={() => setIsQuizMode(false)}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/15 cursor-pointer"
                    >
                      <span>Quay lại lộ trình</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      ) : (
        // 2. Learning Dashboard Mode (3-Columns Layout)
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
          {/* Navigation Sidebar */}
          <LeftBar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Center Main Tab View */}
          <main className="flex-1 min-h-screen pt-4 md:pt-6 pb-20 md:ml-64 lg:pr-5">
            <AnimatePresence mode="wait">
              {activeTab === 'learn' && (
                <motion.div
                  key={activeGuidebookDayId ? `guidebook-${activeGuidebookDayId}` : 'learn-tab'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {activeGuidebookDayId ? (
                    <div className="w-full max-w-2xl mx-auto pb-24 md:py-6 px-4 space-y-6">
                      {/* Back button */}
                      <button
                        onClick={handleCloseGuidebook}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors py-1 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4 stroke-[3]" />
                        <span>Trở về</span>
                      </button>
                      
                      {/* Separator line */}
                      <hr className="border-stone-200" />
                      
                      {/* Title Card / Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-amber-100 p-5 rounded-2xl shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
                          <BookOpen className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-md md:text-lg font-black text-amber-955 uppercase tracking-tight">
                            Hướng dẫn {TOPICS.find(t => t.id === activeGuidebookDayId)?.title.split(':')[0] || activeGuidebookDayId}
                          </h3>
                          <p className="text-xs text-stone-505 font-semibold leading-relaxed">
                            {TOPICS.find(t => t.id === activeGuidebookDayId)?.title.split(':')[1]?.trim() || ''}
                          </p>
                        </div>
                      </div>
                      
                      {/* Guidebook Notes content */}
                      {isLoadingGuidebook ? (
                        <div className="bg-white border border-amber-100 p-12 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-4">
                          <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border-4 border-amber-500/10 border-t-amber-500 animate-spin" />
                          </div>
                          <p className="text-xs font-bold text-stone-500 font-mono animate-pulse">Đang tải tài liệu hướng dẫn...</p>
                        </div>
                      ) : guidebookHtml ? (
                        <div 
                          className="bg-white border border-amber-100 p-6 md:p-8 rounded-2xl shadow-sm prose max-w-none text-stone-850 prose-headings:text-amber-955 prose-strong:text-stone-900 prose-code:text-amber-900 overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: guidebookHtml }}
                        />
                      ) : (
                        <div className="bg-white border border-amber-100 p-8 md:p-12 rounded-2xl shadow-sm text-center space-y-6">
                          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-base font-bold text-amber-955">Tài liệu học tập đang được soạn thảo</h3>
                            <p className="text-xs text-stone-550 leading-relaxed">
                              Tài liệu tóm tắt kiến thức cho ngày học này đang được chuẩn bị. Bạn có thể tiến hành làm các bộ đề trắc nghiệm và tự luận để củng cố và kiểm tra tri thức ngay bây giờ!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <LearningPath
                      sets={data.sets}
                      completedSets={completedSets}
                      onSelectQuiz={handleSelectQuizFromPath}
                      devMode={devMode}
                      onToggleDevMode={handleToggleDevMode}
                      onSelectGuidebook={handleSelectGuidebook}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-xl mx-auto px-4 py-4 space-y-6"
                >
                  {/* Leaderboard Header */}
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-black text-amber-955 uppercase tracking-wide">Bảng Xếp Hạng</h2>
                    <p className="text-xs text-stone-500">Cạnh tranh lành mạnh cùng các học viên AI Thực Chiến.</p>
                    
                    {/* Scope Switcher */}
                    <div className="flex bg-stone-100/50 p-1.5 rounded-xl border border-amber-100/30 w-fit">
                      <button
                        onClick={() => setLeaderboardScope('daily')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          leaderboardScope === 'daily' ? 'bg-white shadow-sm text-amber-950 font-extrabold' : 'text-stone-500'
                        }`}
                      >
                        Hôm nay
                      </button>
                      <button
                        onClick={() => setLeaderboardScope('global')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          leaderboardScope === 'global' ? 'bg-white shadow-sm text-amber-955 font-extrabold' : 'text-stone-500'
                        }`}
                      >
                        Chung cuộc
                      </button>
                    </div>
                  </div>

                  {/* Leaderboard Stack */}
                  <div className="bg-white border border-amber-100 rounded-2xl shadow-sm divide-y divide-stone-100 overflow-hidden">
                    {[
                      { name: 'Nguyễn Minh Trí', xp: 580, avatar: 'MT', badge: '🥇' },
                      { name: 'Hoàng Hải Nam', xp: 510, avatar: 'HN', badge: '🥈' },
                      { name: 'Trần Quỳnh Anh', xp: 460, avatar: 'QA', badge: '🥉' },
                      { name: 'Bạn (Học viên)', xp: xp, avatar: 'HV', isSelf: true, badge: '⭐' },
                      { name: 'Phạm Minh Đức', xp: 320, avatar: 'MD' },
                      { name: 'Lê Thu Trang', xp: 270, avatar: 'TT' },
                      { name: 'Đặng Tuấn Kiệt', xp: 210, avatar: 'TK' },
                      { name: 'Ngô Gia Bảo', xp: 150, avatar: 'GB' },
                      { name: 'Vũ Thảo Vy', xp: 90, avatar: 'TV' },
                      { name: 'Lê Minh Quân', xp: 40, avatar: 'MQ' },
                    ]
                      .sort((a, b) => b.xp - a.xp)
                      .map((user, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                            user.isSelf ? 'bg-amber-500/10 border-y border-amber-400/20' : 'hover:bg-stone-50/50'
                          }`}
                        >
                          {/* Position Rank */}
                          <span className="w-5 text-center text-xs font-bold text-stone-500 font-mono">
                            {idx + 1}
                          </span>

                          {/* Avatar Circle */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.isSelf ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {user.avatar}
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs truncate ${user.isSelf ? 'font-black text-amber-955' : 'font-semibold text-stone-850'}`}>
                              {user.name}
                            </h4>
                          </div>

                          {/* XP value */}
                          <div className="flex items-center gap-1.5 text-right shrink-0">
                            {user.badge && <span className="text-xs">{user.badge}</span>}
                            <span className="text-xs font-bold text-stone-700 font-mono">{user.xp} XP</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-xl mx-auto px-4 py-4 space-y-6"
                >
                  {/* User details header card */}
                  <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                      HV
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-md md:text-lg font-black text-amber-955 tracking-tight">Học Viên AI Thực Chiến</h2>
                      <p className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-wider">Hội viên EduGap Pro</p>
                      <div className="flex items-center gap-3.5 pt-1 text-[11px] text-stone-550 font-bold">
                        <span className="flex items-center gap-0.5"><Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" /> {streak} Ngày</span>
                        <span className="flex items-center gap-0.5"><Award className="w-3.5 h-3.5 text-yellow-600 fill-yellow-400" /> {xp} XP</span>
                        <span className="flex items-center gap-0.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {completedSets.length} Đề</span>
                      </div>
                    </div>
                  </div>

                  {/* Contribution heatmap */}
                  <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4.5 w-4.5 text-amber-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900/80">Lịch sử chuyên cần</h3>
                      </div>
                      <span className="text-[10px] text-stone-400 font-semibold font-mono">30 ngày gần nhất</span>
                    </div>

                    {/* Grid of days (similar to GitHub contribution graph) */}
                    <div className="grid grid-cols-10 gap-2 p-2 rounded-xl bg-stone-50/50 border border-stone-200/50 justify-items-center">
                      {Array.from({ length: 30 }).map((_, idx) => {
                        // shade cells randomly to look authentic
                        const opacityVal = idx % 5 === 0 ? 'bg-emerald-500/10' : idx % 3 === 0 ? 'bg-emerald-500/30' : idx % 7 === 0 ? 'bg-emerald-500/60' : 'bg-stone-200/40';
                        const isToday = idx === 29;
                        
                        return (
                          <div
                            key={idx}
                            className={`h-7 w-7 rounded-md transition-all flex items-center justify-center ${
                              isToday ? 'bg-amber-500 border border-amber-600 text-white font-black animate-pulse shadow-sm' : opacityVal
                            }`}
                            title={isToday ? 'Hôm nay' : `Ngày thứ ${idx + 1}`}
                          >
                            <span className="text-[8px] font-mono font-bold opacity-60">
                              {idx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skill level details based on manifestation */}
                  <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4.5 w-4.5 text-amber-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900/80">Bản đồ năng lực AI</h3>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        { title: 'AI & LLM Foundation', day: 'day1', pct: 90 },
                        { title: 'Định hình Bài toán cho AI', day: 'day2', pct: 75 },
                        { title: 'Design Pattern ReAct', day: 'day3', pct: 60 },
                        { title: 'Prompt & Tool Calling', day: 'day4', pct: 45 },
                        { title: 'Sự không chắc chắn & ROI', day: 'day5', pct: 30 },
                        { title: 'RAG & Vector Database', day: 'day7', pct: 15 },
                      ].map((skill, index) => {
                        const daySets = data.sets.filter(s => s.parent_id === skill.day);
                        const completedCount = daySets.filter(s => completedSets.includes(s.id)).length;
                        const totalCount = daySets.length;
                        
                        // Live calculate completion rate
                        const livePct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                              <span>{skill.title}</span>
                              <span className="font-mono text-amber-900">{livePct}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden border border-stone-200/30">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                style={{ width: `${livePct}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                              <span>Đã làm: {completedCount}/{totalCount} bộ đề</span>
                              <span>Mức độ: {livePct >= 80 ? 'Thành thạo' : livePct >= 50 ? 'Khá' : livePct > 0 ? 'Mới bắt đầu' : 'Chưa học'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings Box info */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-stone-600">
                    <Info className="w-4.5 h-4.5 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-700">Cách hoạt động:</p>
                      <p>Hệ thống tự động đồng bộ kết quả làm bài trắc nghiệm của bạn và cập nhật Bản đồ năng lực thời gian thực. Hãy hoàn thành các bộ đề tiếp theo để nâng cao thứ hạng!</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Desktop Right Sidebar stats display */}
          <RightBar
            xp={xp}
            streak={streak}
            completedSetsCount={completedSets.length}
            totalSetsCount={data.sets.length}
            waitlistEmail={waitlistEmail}
            setWaitlistEmail={setWaitlistEmail}
            waitlistSubmitted={waitlistSubmitted}
            handleWaitlistSubmit={handleWaitlistSubmit}
          />
        </div>
      )}

      {/* Footer copyright */}
      <footer className="w-full bg-amber-50/30 border-t border-amber-100/50 py-4 text-center text-[10px] font-mono text-stone-400 mt-auto">
        EduGap AI Thực Chiến &copy; 2026 {"->"} Nền tảng học tập cá nhân hóa
      </footer>

    </div>
  );
}
