import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { BookOpen, ChevronLeft, Sparkles, AlertTriangle } from 'lucide-react';

const TOPICS_MAP: { [key: string]: string } = {
  day1: 'Day 1: AI & LLM Foundation',
  day2: 'Day 2: Xác định Bài toán cho AI',
  day3: 'Day 3: Design Pattern ReAct',
  day4: 'Day 4: Prompt Engineering & Tool Calling',
  day5: 'Day 5: Thiết kế sản phẩm AI cho sự không chắc chắn',
  day6: 'Day 6: Hackathon Day & Prototyping',
  day7: 'Day 7: Data Foundations - Embedding & Vector Store',
  week1: 'Week 1: Ôn Tập Tổng Hợp'
};

const GUIDEBOOK_FILES: { [slug: string]: string[] } = {
  day4: [
    'knowledge/day-04-prompt-tool-calling/note.md',
    'knowledge/day-04-prompt-tool-calling/effective-context-engineering.md',
    'knowledge/day-04-prompt-tool-calling/tool.md'
  ],
  day5: [
    'knowledge/day-05/pre-note.md',
    'knowledge/day-05/note.md',
    'knowledge/day-05/sum-ai.md'
  ],
  day6: [
    'knowledge/day-06/pre-note.md'
  ],
  day7: [
    'knowledge/day-07/pre-note.md',
    'knowledge/day-07/note.md',
    'knowledge/day-07/embedding-vector-store.md',
    'knowledge/day-07/retrieval-pipeline-lab.md'
  ]
};

function parseMarkdown(md: string): string {
  // Escape HTML characters
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```javascript ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (_, lang, code) => {
    return `<pre class="bg-stone-50 border border-stone-200 p-4 rounded-xl overflow-x-auto text-xs font-mono my-4 text-stone-850"><code class="language-${lang}">${code}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-xs font-mono text-amber-900">$1</code>');

  // Headers: # Header
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-2xl font-black text-amber-955 mt-8 mb-4 border-b border-amber-100 pb-2">$1</h1>');
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-xl font-black text-amber-955 mt-6 mb-3">$1</h2>');
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-md font-bold text-amber-900 mt-5 mb-2">$1</h3>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-stone-950">$1</strong>');

  // Blockquotes: > quote
  html = html.replace(/^\>\s+(.*)$/gm, '<blockquote class="border-l-4 border-amber-500 pl-4 py-1.5 italic bg-amber-50/50 my-4 text-stone-700">$1</blockquote>');

  // Bullet lists: * item or - item
  html = html.replace(/^\s*[\*\-]\s+(.*)$/gm, '<li class="ml-4 list-disc text-stone-800 leading-relaxed my-1.5">$1</li>');

  // Paragraphs
  const lines = html.split('\n\n');
  const processedLines = lines.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<li') || trimmed.startsWith('<blockquote')) {
      return trimmed;
    }
    return `<p class="leading-relaxed text-stone-800 text-xs md:text-sm my-3.5">${trimmed}</p>`;
  });
  
  return processedLines.join('\n');
}

export default async function GuidebookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  
  const title = TOPICS_MAP[normalizedSlug] || 'Tài Liệu Ôn Tập';
  const filePaths = GUIDEBOOK_FILES[normalizedSlug] || [];

  let contentHtml = '';
  let errorMsg = '';

  if (filePaths.length > 0) {
    try {
      const contents = await Promise.all(
        filePaths.map(async (relativeFilePath) => {
          const absolutePath = path.join(process.cwd(), relativeFilePath);
          if (fs.existsSync(absolutePath)) {
            const fileContent = await fs.promises.readFile(absolutePath, 'utf8');
            const parsed = parseMarkdown(fileContent);
            return `
              <div class="mb-12 border-b border-stone-100 pb-8 last:border-b-0">
                <div class="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Nội dung: ${path.basename(relativeFilePath)}
                </div>
                ${parsed}
              </div>
            `;
          }
          return '';
        })
      );
      contentHtml = contents.join('\n');
    } catch (e) {
      console.error('Error reading guidebook files:', e);
      errorMsg = 'Lỗi hệ thống khi tải tài liệu học tập.';
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-850 flex flex-col font-sans selection:bg-amber-500/20">
      {/* Top Header */}
      <header className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-amber-100 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Lộ trình học</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-sm font-black text-amber-955 uppercase tracking-wider">EduGap Guidebook</h1>
          </div>

          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-10">
        {/* Title Card */}
        <div className="bg-gradient-to-tr from-amber-500 to-yellow-500 rounded-2xl p-6 md:p-8 text-white shadow-md mb-8">
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 font-mono">
            Tài liệu hướng dẫn & Tóm tắt kiến thức
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-1.5 tracking-wide">{title}</h2>
        </div>

        {/* Notes Content */}
        {contentHtml ? (
          <div 
            className="bg-white border border-amber-100 p-6 md:p-10 rounded-2xl shadow-sm prose max-w-none text-stone-800"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <div className="bg-white border border-amber-100 p-8 md:p-12 rounded-2xl shadow-sm text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-base font-bold text-amber-950">Tài liệu học tập đang được soạn thảo</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tài liệu tóm tắt kiến thức cho ngày học này đang được chuẩn bị. Bạn có thể tiến hành làm các bộ đề trắc nghiệm và tự luận để củng cố và kiểm tra tri thức ngay bây giờ!
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition shadow-md shadow-amber-500/15"
            >
              Vào làm đề ôn luyện
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-amber-50/30 border-t border-amber-100/50 py-4 text-center text-[10px] font-mono text-stone-400 mt-auto">
        EduGap AI Thực Chiến &copy; 2026
      </footer>
    </div>
  );
}
