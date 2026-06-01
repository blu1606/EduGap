'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
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
  Copy,
  ExternalLink
} from 'lucide-react';

// Define the core types
interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation: string;
}

interface QuestionSet {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuestionsData {
  sets: QuestionSet[];
}

// Fallback static data to ensure instant render and robustness if fetch fails
const FALLBACK_DATA: QuestionsData = {
  "sets": [
    {
      "id": "react-agent-day3",
      "title": "Thiết Kế ReAct Agent - Day 3",
      "description": "Khảo sát kiến thức chuyên sâu về kiến trúc thiết kế Agent sử dụng mô hình suy nghĩ và hành động (Reasoning and Acting).",
      "questions": [
        {
          "id": 1,
          "question": "Sự học hỏi và khác biệt cốt lõi giữa kỹ thuật thiết kế Reactive Agent và ReAct Agent là gì?",
          "options": {
            "A": "Reactive Agent tự động cập nhật trọng số của mô hình lớn liên tục, trong khi ReAct Agent chỉ hoạt động dựa trên các tham số cấu hình tĩnh.",
            "B": "Reactive Agent phản xạ tức thì từ tín hiệu đầu vào đến hành động mà không lưu lại tư duy trung gian, trong khi ReAct Agent kết hợp suy luận phân tích (Reasoning) và gọi công cụ (Acting).",
            "C": "LLM Chatbot thông thường luôn chính xác và tối ưu về hiệu năng tốt hơn so với ReAct Agent trong mọi bài toán thực tế.",
            "D": "Reactive Agent có khả năng làm việc trực tiếp với các API ngoài mà không cần đến sự hỗ trợ của các mô hình ngôn ngữ lớn làm nền tảng."
          },
          "answer": "B",
          "explanation": "Reactive Agent hoạt động dựa trên phản xạ hoặc quy tắc cố định ánh xạ đầu vào thành hành động mà không có bước lập kế hoạch. Ngược lại, ReAct Agent được dẫn dắt chặt chẽ bởi mô hình ngôn ngữ lớn (LLM) thông qua chu kỳ lặp lại: Suy nghĩ (Thought) để lập luận, Hành động (Action) để gọi công cụ phù hợp, và Quan sát (Observation) kết quả trả về trước khi suy nghĩ bước tiếp theo."
        },
        {
          "id": 2,
          "question": "Trong vòng lặp thực thi của ReAct (Thought -> Action -> Observation), kết quả của bước 'Observation' được lấy từ nguồn nào?",
          "options": {
            "A": "Từ kiến thức được ghi nhớ cố định bên trong các tham số trọng số lúc huấn luyện của mô hình lớn.",
            "B": "Từ phản hồi thực tế của môi trường hoặc kết quả thực thi của các công cụ (Tools) được gọi.",
            "C": "Từ System Prompt mặc định do người phát triển quy định ngay tại lúc khởi động chương trình.",
            "D": "Từ các biến cấu hình cục bộ lưu giữ trạng thái nội bộ của phần mềm."
          },
          "answer": "B",
          "explanation": "Sau khi mô hình lớn đưa ra quyết định sử dụng công cụ (Action), hệ thống sẽ thực thi công cụ đó ngoài môi trường (ví dụ như chạy mã Python, gọi API bên ngoài, hoặc tìm kiếm cơ sở dữ liệu) và trả lại kết quả thô về cho mô hình. Kết quả thực thi trực tiếp này chính là Observation giúp mô hình hiểu thêm bối cảnh để tiếp tục tư duy."
        },
        {
          "id": 3,
          "question": "Tình trạng 'Vòng lặp vô hạn' (Infinite Loop) trong ReAct Agent xảy ra chủ yếu do nguyên nhân nào?",
          "options": {
            "A": "Do người dùng nhập các từ khóa hoặc câu lệnh đầu vào quá ngắn, khiến hệ thống không thể so khớp.",
            "B": "Do mô hình lớn liên tục đưa ra cùng một loại Thought và gọi một công cụ với tham số tương tự vì kết quả nhận về ở bước Observation không đổi và không có cơ chế chặn tháo thoát.",
            "C": "Do phần cứng xử lý bị quá tải và kết nối mạng bị chậm trễ kéo dài trong quá trình truyền tải thông tin.",
            "D": "Do tổng dung lượng Token của phiên làm việc vượt quá ngưỡng dự kiến ban đầu của dịch vụ đám mây."
          },
          "answer": "B",
          "explanation": "Khi kết quả của công cụ trả về (Observation) không giúp ích được gì cho quá trình suy luận hoặc không làm thay đổi phương án hành động của LLM, mô hình có xu hướng lặp đi lặp lại một hành động duy nhất, tạo ra vòng lặp vô tận tiêu tốn tài nguyên hệ thống."
        },
        {
          "id": 4,
          "question": "Phương pháp nào sau đây giúp ngăn chặn hiệu quả nhất tình trạng vòng lặp vô hạn (Infinite Loop) của ReAct Agent?",
          "options": {
            "A": "Sử dụng ít công cụ nhất có thể để hạn chế tối đa các lựa chọn gọi hành động của mô hình.",
            "B": "Thiết lập thuộc tính giới hạn số bước lặp tối đa (Max Iterations) và giám sát lịch sử hành động để tự động dừng khi phát hiện trùng lặp dữ liệu đầu ra.",
            "C": "Thay đổi hoàn toàn sang một mô hình nhỏ và đơn giản hơn để rút ngắn thời gian xử lý phản hồi.",
            "D": "Làm sạch toàn bộ lịch sử trò chuyện của người dùng sau mỗi lần nhận được một kết quả ngoài mong đợi."
          },
          "answer": "B",
          "explanation": "Thiết lập bước giới hạn cứng Max Iterations (thường từ 5 đến 10 vòng) làm phao cứu sinh quan trọng nhất để ngắt tiến trình tự động. Ngoài ra, việc lưu giữ danh sách các hành động trước đó để so sánh và phát hiện trùng lặp tham số giúp Agent chuyển hướng tư duy kịp thời."
        },
        {
          "id": 5,
          "question": "Để ReAct Agent xử lý chuẩn xác kết quả phản hồi của các công cụ tìm kiếm, bước thiết kế System Prompt cần đặc biệt lưu ý điều gì?",
          "options": {
            "A": "Yêu cầu mô hình luôn đưa ra câu trả lời trực tiếp mà bỏ qua tất cả các lời giải thích trung gian.",
            "B": "Định nghĩa rõ ràng cấu trúc định dạng chuẩn cho đầu ra (ví dụ: định dạng JSON hoặc thẻ cú pháp riêng biệt) kèm theo các mẫu hướng dẫn suy luận cụ thể (Few-shot prompting).",
            "C": "Yêu cầu mô hình chỉ được phép viết mã nguồn HTML để kết xuất dữ liệu trực tiếp trên màn hình client.",
            "D": "Hướng dẫn mô hình không được tham chiếu bất cứ thông tin bổ sung nào mà chỉ suy đoán từ cảm quan riêng."
          },
          "answer": "B",
          "explanation": "System Prompt cần đặc tả cụ thể định dạng trả về để các bộ lọc dữ liệu (Parsers) có thể bóc tách tham số gọi công cụ một cách chính xác. Nếu không có định dạng chuẩn hoặc ví dụ làm mẫu, mô hình có thể trả về câu trả lời tự do khiến hệ thống không thể xử lý logic tự động."
        }
      ]
    },
    {
      "id": "prompt-engineering-standard",
      "title": "Nền Tảng Prompt Engineering",
      "description": "Các kỹ thuật cơ bản và quy tắc thiết kế câu lệnh để tối ưu hiệu suất phản hồi của Đại Mô Hình Ngôn Ngữ.",
      "questions": [
        {
          "id": 1,
          "question": "Cơ chế hoạt động chính của kỹ thuật Chain of Thought (CoT) Prompting là gì?",
          "options": {
            "A": "Gia tăng tốc độ sinh từ của mô hình lớn bằng cách kích hoạt nhiều luồng xử lý song song trên máy chủ.",
            "B": "Hướng dẫn mô hình ngôn ngữ chia nhỏ vấn đề phức tạp và trình bày các bước suy luận trung gian rõ ràng trước khi rút ra đáp án cuối cùng.",
            "C": "Loại bỏ hoàn toàn các lỗi sai sót ngữ pháp trong câu văn phản hồi của cả hai bên giao tiếp.",
            "D": "Ép buộc lập trình viên phải lập trình một chuỗi hàm bằng ngôn ngữ cấp thấp để thao tác dữ liệu trực tiếp."
          },
          "answer": "B",
          "explanation": "Kỹ thuật Chain of Thought buộc LLM đi qua các bước suy luận logic từng bước một thay vì đưa ngay đáp án cuối. Việc suy nghĩ tường minh này giúp nâng cao đáng kể độ chính xác đối với các bài toán suy luận logic, toán học và lập kế hoạch."
        },
        {
          "id": 2,
          "question": "Sự khác biệt rõ ràng nhất giữa Zero-shot Prompting và Few-shot Prompting nằm ở khía cạnh nào?",
          "options": {
            "A": "Zero-shot không chạy được trên môi trường di động thông thường, trong khi Few-shot thì có hỗ trợ đầy đủ.",
            "B": "Zero-shot trực tiếp giao nhiệm vụ mà không cung cấp dữ liệu mẫu, trong khi Few-shot đi kèm thêm một hoặc vài ví dụ cụ thể để mô hình học theo cấu trúc mong muốn.",
            "C": "Few-shot chỉ được vận hành trong các nhiệm vụ sinh hình ảnh hoặc tối ưu hóa âm thanh đa phương tiện.",
            "D": "Zero-shot luôn mang lại chất lượng và độ chính xác của phản hồi tốt hơn so với Few-shot vì giữ được tính nguyên bản."
          },
          "answer": "B",
          "explanation": "Zero-shot prompting đưa thẳng yêu cầu để LLM trả lời mà không có dữ liệu dẫn dắt. Few-shot prompting giúp LLM hiểu nhanh cấu trúc, phong cách hoặc văn phong câu trả lời bằng cách cung cấp thêm một vài cặp mẫu đầu vào - đầu ra minh họa rõ nét."
        },
        {
          "id": 3,
          "question": "Kiến trúc RAG (Retrieval-Augmented Generation) thực chất biểu diễn quy trình xử lý nào?",
          "options": {
            "A": "Huấn luyện lại và tinh chỉnh các tham số gốc của mô hình lớn bằng dữ liệu mới của tổ chức.",
            "B": "Tìm kiếm tài liệu liên quan từ nguồn tri thức bên ngoài và nhồi dữ liệu đó vào Prompt làm bối cảnh tham chiếu cho LLM trả lời câu hỏi.",
            "C": "Nén nhỏ dung lượng hoạt động của mô hình để có thể phục vụ mượt mượt trên môi trường máy trạm cấu hình yếu.",
            "D": "Tự động gửi thông tin báo lỗi về hệ thống quản trị trung tâm của nhà cung cấp dịch vụ máy chủ."
          },
          "answer": "B",
          "explanation": "RAG kết nối mô hình ngôn ngữ với nguồn thông tin cập nhật bên ngoài. Quy trình gồm: Tìm kiếm thông tin liên quan (Retrieval) từ kho dữ liệu, Chèn thông tin đó vào Prompt (Augmented), và Chuyển giao cho LLM để tạo ra câu trả lời chuẩn xác (Generation)."
        }
      ]
    }
  ]
};

export default function QuizApp() {
  const [data, setData] = useState<QuestionsData>(FALLBACK_DATA);
  const [activeSetId, setActiveSetId] = useState<string>('react-agent-day3');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answersHistory, setAnswersHistory] = useState<{ [qId: number]: { selected: string, isCorrect: boolean } }>({});
  const [showFinishScreen, setShowFinishScreen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Session survey mapping ID
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

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

  // Supabase submission handlers
  const handlePreQuizSubmit = async () => {
    const rating = preQuizRatings[activeSetId];
    const comment = preQuizComments[activeSetId] || '';
    if (!rating) return;
    
    setPreQuizSubmitted(prev => ({ ...prev, [activeSetId]: true }));
    
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

  // Fetch the data from questions.json
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/questions.json');
        if (response.ok) {
          const fetchedData = await response.json();
          if (fetchedData && fetchedData.sets && fetchedData.sets.length > 0) {
            setData(fetchedData);
            
            // Read "set" parameter from URL query string
            const params = new URLSearchParams(window.location.search);
            const querySet = params.get('set')?.toLowerCase();
            
            let targetSetId = fetchedData.sets[0].id;
            
            if (querySet) {
              const found = fetchedData.sets.find((s: any) => {
                const normalizedTitle = s.title
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[đĐ]/g, 'd')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '');
                
                return (
                  s.id.toLowerCase() === querySet ||
                  normalizedTitle === querySet ||
                  (querySet === 'design-pattern-react' && s.id === 'react-agent-day3')
                );
              });
              
              if (found) {
                targetSetId = found.id;
              }
            }
            
            setActiveSetId(targetSetId);
          }
        }
      } catch (err) {
        console.warn('Yeu cau tai questions.json khong co ket qua, dang xai du lieu du phong.', err);
      }
    }
    loadQuestions();
  }, []);

  const activeSet = data.sets.find(s => s.id === activeSetId) || data.sets[0];
  const totalQuestions = activeSet.questions.length;
  const currentQuestionIdxBounded = Math.min(currentQuestionIdx, totalQuestions - 1);
  const currentQuestion = activeSet.questions[currentQuestionIdxBounded];

  // Derive active question states on-the-fly based on answersHistory
  const currentHistory = currentQuestion ? answersHistory[currentQuestion.id] : undefined;
  const selectedOption = currentHistory ? currentHistory.selected : null;
  const isSubmitted = !!currentHistory;
  const showExplanation = isSubmitted;

  // Selected state update & Instant submission (auto check answer on click)
  const handleSelectOption = (optionKey: string) => {
    if (isSubmitted || !currentQuestion) return;
    
    const isCorrect = optionKey === currentQuestion.answer;
    
    setAnswersHistory(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selected: optionKey,
        isCorrect
      }
    }));
  };

  // Move to next question or show finish details
  const handleNextQuestion = () => {
    if (currentQuestionIdx === totalQuestions - 1) {
      setShowFinishScreen(true);
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  // Reset the current active set
  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setShowFinishScreen(false);
    setSubmissionId(null);
    setWaitlistSubmitted(false);
    setWaitlistEmail('');
    
    // Clear responses pertaining only to the current active set questions to avoid mixing data
    const updatedHistory = { ...answersHistory };
    activeSet.questions.forEach(q => {
      delete updatedHistory[q.id];
    });
    setAnswersHistory(updatedHistory);

    // Clear post-quiz survey for this active set to allow re-submission
    const updatedPostQuiz = { ...postQuizSubmitted };
    delete updatedPostQuiz[activeSetId];
    setPostQuizSubmitted(updatedPostQuiz);
  };

  // Quick switch between sets
  const handleSetChange = (setId: string) => {
    setActiveSetId(setId);
    setCurrentQuestionIdx(0);
    setShowFinishScreen(false);
    setMobileMenuOpen(false);
    setSubmissionId(null);
    setWaitlistSubmitted(false);
    setWaitlistEmail('');

    // Update URL query param to make it shareable
    const slug = setId === 'react-agent-day3' ? 'design-pattern-react' : setId;
    const newUrl = `${window.location.pathname}?set=${slug}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Calculate score for the active set
  const getActiveSetCorrectCount = () => {
    let correct = 0;
    activeSet.questions.forEach(q => {
      if (answersHistory[q.id]?.isCorrect) {
        correct += 1;
      }
    });
    return correct;
  };

  // Find incorrectly answered questions
  const getIncorrectQuestions = () => {
    return activeSet.questions.filter(q => {
      const record = answersHistory[q.id];
      return record && !record.isCorrect;
    });
  };

  // Listen to keyboard shortcuts (1-4 for option selection, Enter for next, ArrowLeft for back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs (like waitlist email or survey feedback)
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const isQuizActive = preQuizSubmitted[activeSetId] && !showFinishScreen;
      if (!isQuizActive) return;

      // 1, 2, 3, 4 -> Select options A, B, C, D
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

      // Enter -> Next question (only when currently submitted)
      if (e.key === 'Enter') {
        if (isSubmitted) {
          handleNextQuestion();
        }
      }

      // ArrowLeft -> Back to previous question
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
    handleSelectOption,
    handleNextQuestion
  ]);

  const scoreText = `Kết quả: ${getActiveSetCorrectCount()} / ${totalQuestions}`;
  const progressPercent = Math.min(100, Math.round(((currentQuestionIdx + (isSubmitted ? 1 : 0)) / totalQuestions) * 100));

  return (
    <div id="quiz-wrapper" className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* Main body with responsiveness - top padding optimized since header is removed */}
      <main id="quiz-main-container" className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
        
        {/* Left Sidebar or Mobile Dropdown overlay */}
        <section 
          id="quiz-sidebar-container" 
          className={`md:col-span-3 space-y-4 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}
        >
          {/* Box selecting set */}
          <div id="set-selector-box" className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-amber-100/80 shadow-md shadow-amber-955/[0.02] space-y-3">
            <div className="flex items-center gap-1.5">
              <ListTodo className="text-amber-600 w-4 h-4" />
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-amber-900/60">
                Lựa Chọn Bộ Đề
              </h2>
            </div>

            <div className="space-y-1.5">
              {data.sets.map(set => {
                const isActive = set.id === activeSetId;
                const setSlug = set.id === 'react-agent-day3' ? 'design-pattern-react' : set.id;
                return (
                  <button
                    key={set.id}
                    id={`btn-set-selector-${set.id}`}
                    onClick={() => handleSetChange(set.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-amber-100/60 border-amber-400 text-amber-950 shadow-sm shadow-amber-900/5' 
                        : 'bg-amber-55/20 border-amber-100/40 text-stone-600 hover:bg-amber-50/50 hover:border-amber-200/60'
                    }`}
                  >
                    <div className="font-semibold text-xs mb-0.5 text-slate-850">{set.title}</div>
                    <div className="text-[11px] text-stone-500 line-clamp-1 tracking-wide leading-relaxed">
                      {set.description}
                    </div>
                    {isActive && (
                      <div className="mt-2 pt-1.5 border-t border-amber-200/40 flex items-center justify-between gap-1 text-[9px] text-amber-800/80 font-mono">
                        <span className="truncate">slug: {setSlug}</span>
                        <span className="px-1 py-0.5 bg-amber-200/30 rounded font-semibold text-amber-900 shrink-0">Active</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Indicator Side widget */}
          <div id="progress-indicator-box" className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-amber-100/80 shadow-md shadow-amber-955/[0.02] space-y-3">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-amber-900/60">
              Tiến Trình Học Tập
            </h2>

            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider font-semibold">
                  Trạng Thái
                </span>
                <span className="text-xs font-mono font-medium text-amber-950">
                  Câu {Math.min(currentQuestionIdx + 1, totalQuestions)} / {totalQuestions}
                </span>
              </div>

              {/* Progress Bar wrapper */}
              <div id="progress-bar-container" className="w-full h-1.5 bg-amber-100/50 rounded-full overflow-hidden border border-amber-200/25">
                <div 
                  id="progress-bar-indicator"
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div id="set-metadata" className="pt-2 border-t border-amber-100/40 space-y-0.5">
                <div className="text-[10px] text-stone-500">Bộ đề đang mở:</div>
                <div className="text-xs font-semibold text-amber-950">{activeSet.title}</div>
              </div>
            </div>
          </div>

          {/* Share Set Box */}
          <div id="share-set-box" className="p-4 rounded-xl bg-white/80 backdrop-blur-md border border-amber-100/80 shadow-md shadow-amber-955/[0.02] space-y-3">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-amber-900/60 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              Chia Sẻ Bộ Đề
            </h2>

            <div className="space-y-2 text-xs">
              <div className="text-[10px] text-stone-500">Đường dẫn học tập:</div>
              <div className="flex items-center gap-1.5 bg-amber-50/50 p-2 rounded-lg border border-amber-150/40">
                <code className="text-[10px] text-amber-900 font-mono select-all truncate flex-1">
                  {typeof window !== 'undefined' 
                    ? `${window.location.origin}${window.location.pathname}?set=${activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId}` 
                    : `?set=${activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId}`
                  }
                </code>
                <button
                  onClick={() => {
                    const slug = activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId;
                    const url = `${window.location.origin}${window.location.pathname}?set=${slug}`;
                    navigator.clipboard.writeText(url);
                    setCopiedShareLink(true);
                    setTimeout(() => setCopiedShareLink(false), 2000);
                  }}
                  className="text-[10px] text-amber-600 hover:text-amber-850 hover:underline font-semibold flex items-center gap-0.5 shrink-0 cursor-pointer"
                >
                  {copiedShareLink ? 'Đã copy' : 'Copy'}
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 border-t border-amber-100/30">
                <span>API Endpoint:</span>
                <a 
                  href={`/api/questions/${activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-850 font-semibold flex items-center gap-0.5"
                >
                  Mở JSON
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace component */}
        <section id="quiz-workspace" className="md:col-span-9 space-y-4">
          
          {/* Mobile Set Selector Pill Row */}
          <div className="block md:hidden bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-amber-100/80 shadow-sm shadow-amber-955/[0.02]">
            <div className="flex items-center gap-1.5 mb-2 px-0.5">
              <ListTodo className="text-amber-600 w-4 h-4" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-900/60 font-mono">
                Chọn bộ đề học tập
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
              {data.sets.map(set => {
                const isActive = set.id === activeSetId;
                return (
                  <button
                    key={set.id}
                    id={`mobile-set-btn-${set.id}`}
                    onClick={() => handleSetChange(set.id)}
                    className={`shrink-0 snap-start text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 text-[11px] font-bold flex flex-col gap-0.5 cursor-pointer max-w-[220px] ${
                      isActive 
                        ? 'bg-amber-100/60 border-amber-400 text-amber-950 shadow-sm' 
                        : 'bg-amber-55/15 border-amber-100/40 text-stone-600 hover:bg-[#FFFDF9]/60'
                    }`}
                  >
                    <span className="line-clamp-1">{set.title}</span>
                    {isActive && (
                      <span className="text-[9px] text-amber-800/80 font-mono font-normal">
                        API: /{set.id === 'react-agent-day3' ? 'design-pattern-react' : set.id}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!showFinishScreen ? (
              !preQuizSubmitted[activeSetId] ? (
                <motion.div
                  key={`pre-survey-${activeSetId}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  id="pre-quiz-survey-card"
                  className="p-5 md:p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-100/80 shadow-lg shadow-amber-955/[0.03] space-y-6 text-center relative"
                >
                  {/* Share button in top-right */}
                  <button
                    onClick={() => {
                      const slug = activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId;
                      const shareUrl = `${window.location.origin}${window.location.pathname}?set=${slug}`;
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 2000);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg border border-amber-250/50 hover:bg-amber-100/50 text-amber-800 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-white/80 shadow-sm"
                    title="Chia sẻ bộ đề này"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShareLink ? 'Đã copy' : 'Chia sẻ'}</span>
                  </button>

                  <div className="w-12 h-12 rounded-full bg-amber-100/50 flex items-center justify-center mx-auto text-amber-600">
                    <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-md md:text-lg font-bold text-amber-950">
                      Khảo sát mức độ tiếp thu
                    </h2>
                    <p className="text-[11px] md:text-xs text-stone-550 leading-relaxed max-w-md mx-auto">
                      Để hệ thống tối ưu hóa lộ trình cá nhân, bạn hãy đánh giá độ hiểu bài hôm nay trên lớp nhé!
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
                            id={`pre-star-${star}`}
                            onClick={() => setPreQuizRatings(prev => ({ ...prev, [activeSetId]: star }))}
                            className="p-1 hover:scale-115 transition-transform duration-100 cursor-pointer"
                          >
                            <Star 
                              className={`w-7 h-7 transition-colors ${
                                star <= rating 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    
                    <p className="text-[11px] font-medium text-amber-700 font-mono min-h-[16px]">
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

                    {/* Tự luận khảo sát trước khi làm bài */}
                    {preQuizRatings[activeSetId] > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-left space-y-2 pt-3 border-t border-amber-100/30 overflow-hidden"
                      >
                        <p className="text-xs font-semibold text-stone-750 block">
                          Cảm nhận của bạn về buổi học & lí do chưa hiểu bài (nếu có):
                        </p>
                        <textarea
                          id="pre-quiz-comment-textarea"
                          value={preQuizComments[activeSetId] || ''}
                          onChange={(e) => setPreQuizComments(prev => ({ ...prev, [activeSetId]: e.target.value }))}
                          placeholder="Chia sẻ ngắn gọn cảm nhận của bạn về buổi học hoặc lý do chưa thực sự nắm rõ kiến thức trên lớp..."
                          className="w-full min-h-[75px] p-2.5 text-xs text-stone-800 bg-[#FDFBF7] border border-stone-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                        />
                        <div className="p-2.5 bg-amber-50/75 border border-amber-200/50 rounded-lg flex items-start gap-1.5 leading-relaxed text-[10px] text-amber-850 font-medium">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>Dữ liệu này rất quý giá giúp chúng mình và nhà trường cải thiện chất lượng giảng dạy và lộ trình.</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      id="start-quiz-btn"
                      disabled={!(preQuizRatings[activeSetId] > 0)}
                      onClick={handlePreQuizSubmit}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
                        preQuizRatings[activeSetId] > 0
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:translate-y-[1px] cursor-pointer'
                          : 'bg-stone-50 border border-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      Bắt đầu làm bài
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`${activeSetId}-${currentQuestion.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  id="question-active-card"
                  className="p-5 md:p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-100/80 shadow-lg shadow-amber-955/[0.03] space-y-5 relative"
                >
                  {/* Header question status info */}
                  <div className="flex justify-between items-center border-b border-amber-100/40 pb-3">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-400/30 text-amber-800 font-mono text-xs rounded-full font-semibold">
                      Câu Hỏi Số {currentQuestionIdx + 1} / {totalQuestions}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {isSubmitted && (
                      <span className={`flex items-center gap-1 text-xs font-mono px-3 py-1 rounded-full ${
                        answersHistory[currentQuestion.id]?.isCorrect 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                      }`}>
                        {answersHistory[currentQuestion.id]?.isCorrect ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Chuẩn xác
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Chưa chính xác
                          </>
                        )}
                      </span>
                    )}

                    <button
                      onClick={() => {
                        const slug = activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId;
                        const shareUrl = `${window.location.origin}${window.location.pathname}?set=${slug}`;
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedShareLink(true);
                        setTimeout(() => setCopiedShareLink(false), 2000);
                      }}
                      className="p-1.5 rounded-lg border border-amber-250/40 hover:bg-amber-100/50 text-amber-800 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-white/80 shadow-sm"
                      title="Chia sẻ bộ đề này"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedShareLink ? 'Đã copy' : 'Chia sẻ'}</span>
                    </button>
                  </div>
                </div>

                  {/* The actual question rendering body */}
                  <h3 className="text-md md:text-lg text-amber-950 font-bold leading-relaxed tracking-wide">
                    {currentQuestion.question}
                  </h3>

                  {/* Option buttons block */}
                  <div id="question-options" className="grid grid-cols-1 gap-3 pt-2">
                    {(Object.keys(currentQuestion.options) as Array<'A' | 'B' | 'C' | 'D'>).map(key => {
                      const optionText = currentQuestion.options[key];
                      const isSelected = selectedOption === key;
                      const isAnswerCorrectKey = currentQuestion.answer === key;
                      
                      // Styling calculations based on submission state and selection status
                      let buttonStyle = 'bg-amber-50/20 border-amber-100/80 text-stone-700 hover:bg-amber-50/60 hover:border-amber-200/80 shadow-inner-white';
                      let badgeStyle = 'bg-amber-100/60 text-amber-800 border-amber-200/60';
                      let indicatorIcon = null;

                      if (!isSubmitted) {
                        if (isSelected) {
                          buttonStyle = 'bg-amber-500/10 border-amber-500 text-amber-950 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20 font-medium';
                          badgeStyle = 'bg-amber-500 text-white border-amber-500';
                        }
                      } else {
                        // After submission
                        if (isSelected) {
                          if (isAnswerCorrectKey) {
                            buttonStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-990 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/30 font-semibold';
                            badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                            indicatorIcon = <Check className="w-4 h-4 text-emerald-600 ml-auto" />;
                          } else {
                            buttonStyle = 'bg-rose-500/10 border-rose-500 text-rose-990 shadow-md shadow-rose-500/5 ring-1 ring-rose-500/30 font-semibold';
                            badgeStyle = 'bg-rose-500 text-white border-rose-500';
                            indicatorIcon = <X className="w-4 h-4 text-rose-600 ml-auto" />;
                          }
                        } else {
                          // Not selected option
                          if (isAnswerCorrectKey) {
                            buttonStyle = 'bg-emerald-50/50 border-emerald-400 text-emerald-950 font-medium ring-1 ring-emerald-555/15';
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
                            id={`option-btn-${key}`}
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(key)}
                            className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all duration-200 group relative overflow-hidden cursor-pointer ${buttonStyle}`}
                          >
                            <span className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center font-mono text-xs border font-bold transition-colors ${badgeStyle}`}>
                              {key}
                            </span>
                            
                            <span className="flex-1 text-xs md:text-sm leading-relaxed">
                              {optionText}
                            </span>

                            {indicatorIcon}
                          </button>

                          {/* Render explanation directly below correct answer */}
                          {isSubmitted && isAnswerCorrectKey && showExplanation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="overflow-hidden"
                            >
                              <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 shadow-inner-white space-y-1.5 pt-3 pb-3">
                                <div className="flex items-center gap-1.5 text-emerald-900/90 text-[10px] font-bold uppercase tracking-wider font-mono">
                                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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

                  {/* Bottom interactive navigation row */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-3 border-t border-amber-100/40">
                    <div className="text-[11px] text-stone-500 font-mono font-medium text-center sm:text-left">
                      {!isSubmitted ? 'Hãy lựa chọn một đáp án phù hợp nhất' : 'Đáp án chính xác & chú giải hiển thị trực quan ở trên'}
                    </div>

                    <div className="w-full sm:w-auto flex flex-row gap-2 justify-end items-center">
                      {currentQuestionIdx > 0 && (
                        <button
                          id="back-question-btn"
                          onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                          className="px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm active:translate-y-[1px] cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Quay lại
                        </button>
                      )}

                      {isSubmitted && (
                        <button
                          id="next-question-btn"
                          onClick={handleNextQuestion}
                          className="px-5 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm active:translate-y-[1px] cursor-pointer"
                        >
                          {currentQuestionIdx === totalQuestions - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] text-stone-500 font-mono border-t border-amber-100/25 pt-3 mt-1.5">
                    <span className="text-stone-400 font-medium">Phím tắt:</span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-200/40 rounded text-amber-900 font-bold shadow-sm">1</kbd>
                      <kbd className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-200/40 rounded text-amber-900 font-bold shadow-sm">2</kbd>
                      <kbd className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-200/40 rounded text-amber-900 font-bold shadow-sm">3</kbd>
                      <kbd className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-200/40 rounded text-amber-900 font-bold shadow-sm">4</kbd>
                      <span>Chọn A-D</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-200/40 rounded text-amber-900 font-bold shadow-sm">Enter</kbd>
                      <span>Tiếp theo</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-amber-50/50 border border-amber-200/40 rounded text-amber-900 font-bold shadow-sm">←</kbd>
                      <span>Lùi lại</span>
                    </span>
                  </div>
                </motion.div>
              )
            ) : (
              // Results dashboard finish screen
              <motion.div
                key="result-dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                id="result-dashboard-card"
                className="p-5 md:p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-100/80 shadow-lg shadow-amber-955/[0.03] space-y-6 relative"
              >
                {/* Share button in top-right */}
                <button
                  onClick={() => {
                    const slug = activeSetId === 'react-agent-day3' ? 'design-pattern-react' : activeSetId;
                    const shareUrl = `${window.location.origin}${window.location.pathname}?set=${slug}`;
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedShareLink(true);
                    setTimeout(() => setCopiedShareLink(false), 2000);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg border border-amber-250/50 hover:bg-amber-100/50 text-amber-800 transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer bg-white/80 shadow-sm"
                  title="Chia sẻ bộ đề này"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShareLink ? 'Đã copy' : 'Chia sẻ'}</span>
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Award className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-amber-950 tracking-tight">
                      Kết quả luyện tập
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                      Chúc mừng bạn đã hoàn thành loạt câu hỏi trắc nghiệm của bộ đề: <span className="font-bold text-amber-900">{activeSet.title}</span>
                    </p>
                  </div>
                </div>

                {/* AI Thực Chiến Intro & Waitlist System */}
                <div id="ai-thuc-chien-waitlist" className="p-5 md:p-6 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-200/60 shadow-sm shadow-amber-955/[0.01] space-y-4 text-left animate-in fade-in duration-500">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-950 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider font-mono w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Cá Nhân Hoá Lộ Trình Học Tập AI Thực Chiến
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-sm md:text-base font-bold text-amber-950 tracking-tight">
                      Bứt phá điểm số & Nắm trọn kiến thức trên lớp bằng Trí Tuệ Nhân Tạo
                    </h3>
                    <p className="text-[11px] md:text-xs text-stone-605 leading-relaxed">
                      Chúng mình đang thiết kế một sản phẩm giáo dục và ôn tập đột phá, giúp tối ưu hóa việc học của từng cá nhân qua lộ trình học tập <span className="font-semibold text-amber-900">AI Thực Chiến</span>. Hệ thống sẽ phân tích điểm hiểu bài và độ hổng kiến thức sau mỗi đề thi trắc nghiệm để gợi ý bài học sát sườn, hỗ trợ bạn ghi nhớ sâu rộng tri thức ngày hôm đó trên lớp.
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-amber-200/20">
                    <p className="text-[10px] md:text-[11px] font-semibold text-amber-900 mb-2.5">
                      Đăng ký nhận thông báo trải nghiệm sớm (Waitlist) khi hệ thống ra mắt:
                    </p>

                    {!waitlistSubmitted ? (
                      <form 
                        onSubmit={handleWaitlistSubmit} 
                        className="flex flex-col sm:flex-row gap-2 max-w-lg"
                      >
                        <div className="relative flex-1 font-sans">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="email"
                            required
                            placeholder="Nhập email học tập của bạn..."
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 text-xs text-stone-800 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all duration-150"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/15 active:translate-y-[1px] hover:shadow-amber-500/25 transition-all duration-150 cursor-pointer shrink-0"
                        >
                          <span>Tham gia Waitlist</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 max-w-lg shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tuyệt vời! Bạn đã ghi danh thành công với email <span className="underline font-bold text-emerald-950">{waitlistEmail}</span>. Tụi mình sẽ gửi thông tin sớm nhất dành riêng cho bạn! 🚀</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Results block showing score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                  <div className="p-5 rounded-xl bg-amber-50/40 border border-amber-200/55 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-amber-900/60 font-semibold tracking-wider uppercase mb-1">
                      Tổng Điểm Số
                    </span>
                    <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
                      {getActiveSetCorrectCount()} / {totalQuestions}
                    </span>
                  </div>

                  <div className="p-5 rounded-xl bg-amber-50/40 border border-amber-200/55 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-amber-900/60 font-semibold tracking-wider uppercase mb-1">
                      Tỷ Lệ Chính Xác
                    </span>
                    <span className="text-3xl font-extrabold text-yellow-600 tracking-tight">
                      {Math.round((getActiveSetCorrectCount() / totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Post-quiz Survey - Interactive Amber Stars */}
                <div id="post-quiz-survey-section" className="p-5 rounded-xl bg-amber-55/35 border border-amber-200/50 space-y-4">
                  <div className="flex items-center gap-2 border-b border-amber-100/40 pb-2">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-300 animate-bounce" />
                    <h3 className="text-xs font-bold tracking-wider uppercase text-amber-900/80 font-mono">
                      Khảo Sát Đánh Giá Đề Bài
                    </h3>
                  </div>

                  {!postQuizSubmitted[activeSetId] ? (
                    <div className="space-y-5 text-left">
                      {/* Q1 */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-800 block">
                          1. Độ hiểu bài của bạn sau khi hoàn thành đề trắc nghiệm:
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex gap-1.5 bg-white/50 p-1.5 rounded-xl border border-amber-100/30">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const val = postRatings[activeSetId]?.understanding || 0;
                              return (
                                <button
                                  key={star}
                                  id={`post-understanding-${star}`}
                                  onClick={() => setPostRatings(prev => ({
                                    ...prev,
                                    [activeSetId]: {
                                      ...(prev[activeSetId] || { understanding: 0, utility: 0, personalized: 0 }),
                                      understanding: star
                                    }
                                  }))}
                                  className="p-1 hover:scale-125 hover:rotate-3 active:scale-95 transition-all duration-150 cursor-pointer"
                                >
                                  <Star 
                                    className={`w-11 h-11 sm:w-13 sm:h-13 transition-all duration-150 ${
                                      star <= val 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-md filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]' 
                                        : 'text-stone-300 hover:text-amber-300/80'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 font-mono bg-amber-100/40 px-2.5 py-1.5 rounded-lg border border-amber-200/30 min-w-[150px] text-center">
                            {(() => {
                              const v = postRatings[activeSetId]?.understanding || 0;
                              if (v === 1) return 'Còn chưa nắm rõ cốt lõi';
                              if (v === 2) return 'Hiểu sơ lược, cần xem lại';
                              if (v === 3) return 'Nắm được dải kiến thức nền';
                              if (v === 4) return 'Hiểu cặn kẽ và ghi nhớ tốt';
                              if (v === 5) return 'Hoàn toàn tự tin áp dụng';
                              return 'Chưa đánh giá';
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Q2 */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-800 block">
                          2. Mức độ hữu ích của quy trình thực hành Q&A trắc nghiệm:
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex gap-1.5 bg-white/50 p-1.5 rounded-xl border border-amber-100/30">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const val = postRatings[activeSetId]?.utility || 0;
                              return (
                                <button
                                  key={star}
                                  id={`post-utility-${star}`}
                                  onClick={() => setPostRatings(prev => ({
                                    ...prev,
                                    [activeSetId]: {
                                      ...(prev[activeSetId] || { understanding: 0, utility: 0, personalized: 0 }),
                                      utility: star
                                    }
                                  }))}
                                  className="p-1 hover:scale-125 hover:rotate-3 active:scale-95 transition-all duration-150 cursor-pointer"
                                >
                                  <Star 
                                    className={`w-11 h-11 sm:w-13 sm:h-13 transition-all duration-150 ${
                                      star <= val 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-md filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]' 
                                        : 'text-stone-300 hover:text-amber-300/80'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 font-mono bg-amber-100/40 px-2.5 py-1.5 rounded-lg border border-amber-200/30 min-w-[150px] text-center">
                            {(() => {
                              const v = postRatings[activeSetId]?.utility || 0;
                              if (v === 1) return 'Chưa thấy thực sự hữu ích';
                              if (v === 2) return 'Ôn luyện ở mức tối thiểu';
                              if (v === 3) return 'Củng cố kiến thức tốt';
                              if (v === 4) return 'Rất hiệu quả ghi nhớ sâu';
                              if (v === 5) return 'Phương án ôn luyện tối ưu';
                              return 'Chưa đánh giá';
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Q3 */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-800 block leading-relaxed md:max-w-xl">
                          3. Khả năng sẵn sàng tham gia hệ thống câu hỏi cá nhân hóa theo năng lực:
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex gap-1.5 bg-white/50 p-1.5 rounded-xl border border-amber-100/30">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const val = postRatings[activeSetId]?.personalized || 0;
                              return (
                                <button
                                  key={star}
                                  id={`post-personalized-${star}`}
                                  onClick={() => setPostRatings(prev => ({
                                    ...prev,
                                    [activeSetId]: {
                                      ...(prev[activeSetId] || { understanding: 0, utility: 0, personalized: 0 }),
                                      personalized: star
                                    }
                                  }))}
                                  className="p-1 hover:scale-125 hover:rotate-3 active:scale-95 transition-all duration-150 cursor-pointer"
                                >
                                  <Star 
                                    className={`w-11 h-11 sm:w-13 sm:h-13 transition-all duration-150 ${
                                      star <= val 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-md filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]' 
                                        : 'text-stone-300 hover:text-amber-300/80'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 font-mono bg-amber-100/40 px-2.5 py-1.5 rounded-lg border border-amber-200/30 min-w-[150px] text-center">
                            {(() => {
                              const v = postRatings[activeSetId]?.personalized || 0;
                              if (v === 1) return 'Không có nhu cầu';
                              if (v === 2) return 'Có thể tham khảo sau';
                              if (v === 3) return 'Muốn dùng thử nghiệm';
                              if (v === 4) return 'Rất hứng thú chờ đợi';
                              if (v === 5) return 'Muốn tham gia đăng ký ngay';
                              return 'Chưa đánh giá';
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Post-quiz Qualitative self-evaluation (Tự luận) */}
                      {(postRatings[activeSetId]?.understanding > 0 ||
                        postRatings[activeSetId]?.utility > 0 ||
                        postRatings[activeSetId]?.personalized > 0) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-3 border-t border-amber-100/30 text-left space-y-2 overflow-hidden"
                        >
                          <p className="text-xs font-semibold text-stone-750 block">
                            Cảm nhận chi tiết của bạn về đề thi hoặc ý kiến cải thiện (nếu có):
                          </p>
                          <textarea
                            id="post-quiz-comment-textarea"
                            value={postQuizComments[activeSetId] || ''}
                            onChange={(e) => setPostQuizComments(prev => ({ ...prev, [activeSetId]: e.target.value }))}
                            placeholder="Nhập cảm nhận của bạn về độ khó, độ vừa vặn của kiến thức học tập hoặc góp ý thêm..."
                            className="w-full min-h-[75px] p-2.5 text-xs text-stone-800 bg-[#FDFBF7] border border-stone-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                          />
                          <div className="p-2.5 bg-amber-50/75 border border-amber-200/50 rounded-lg flex items-start gap-1.5 leading-relaxed text-[10px] text-amber-850 font-medium font-mono">
                            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>Dữ liệu này rất quý giá giúp chúng mình và nhà trường cải thiện chất lượng giảng dạy và lộ trình.</span>
                          </div>
                        </motion.div>
                      )}

                      <div className="pt-2">
                        <button
                          id="submit-post-survey-btn"
                          disabled={
                            !(
                              postRatings[activeSetId]?.understanding > 0 &&
                              postRatings[activeSetId]?.utility > 0 &&
                              postRatings[activeSetId]?.personalized > 0
                            )
                          }
                          onClick={handlePostQuizSubmit}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                            postRatings[activeSetId]?.understanding > 0 &&
                            postRatings[activeSetId]?.utility > 0 &&
                            postRatings[activeSetId]?.personalized > 0
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 cursor-pointer active:translate-y-[1px]'
                              : 'bg-stone-50 border border-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          Gửi phản hồi khảo sát
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center text-emerald-800 text-xs font-semibold">
                      Cực kỳ cảm ơn những đóng góp hữu ích của bạn để cải tiến chất lượng học thuật và lộ trình! 🌟
                    </div>
                  )}
                </div>

                {/* Incorrect questions listing for review */}
                <div id="incorrect-review-system" className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-900/60 border-b border-amber-100/40 pb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Danh sách câu cần ôn tập ({getIncorrectQuestions().length})
                  </div>

                  {getIncorrectQuestions().length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {getIncorrectQuestions().map((q, idx) => {
                        const wrongChoice = answersHistory[q.id]?.selected;
                        return (
                          <div 
                            key={q.id}
                            className="p-4 rounded-xl bg-amber-50/20 border border-amber-200/40 space-y-2.5 text-xs md:text-sm"
                          >
                            <div className="flex justify-between font-semibold text-amber-950">
                              <span>Mục #{q.id} {"->"} {q.question.substring(0, 80)}...</span>
                              <span className="text-rose-600 font-mono font-bold">Lỗi sai</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2 bg-rose-500/5 border border-rose-500/10 text-rose-800 rounded flex gap-2 items-center font-medium">
                                <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                Bạn chọn: {wrongChoice} {"->"} {q.options[wrongChoice as 'A' | 'B' | 'C' | 'D']?.substring(0, 45)}...
                              </div>
                              <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 rounded flex gap-2 items-center font-medium">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                Đáp án đúng: {q.answer} {"->"} {q.options[q.answer as 'A' | 'B' | 'C' | 'D']?.substring(0, 45)}...
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50/10 border border-amber-100/30 rounded-xl text-center text-stone-500 text-sm">
                      Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi của bộ đề này.
                    </div>
                  )}
                </div>

                {/* Reset button action */}
                <div id="results-footer" className="flex justify-center pt-2">
                  <button
                    id="restart-set-btn"
                    onClick={handleRestart}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-all duration-200 shadow-md shadow-amber-500/20 active:translate-y-[1px] cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Làm lại bộ đề
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* Footer copyright block */}
      <footer id="quiz-footer" className="w-full bg-amber-50/40 border-t border-amber-100/60 py-4 text-center text-[11px] font-mono text-stone-500 mt-auto shadow-inner">
        Bản Quyền Đề Bài Thuộc Phòng Phát Triển Thử Nghiệm Agent {"->"} 2026
      </footer>

    </div>
  );
}
