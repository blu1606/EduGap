import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (_, lang, code) => {
    return `<pre class="bg-stone-50 border border-stone-200 p-4 rounded-xl overflow-x-auto text-xs font-mono my-4 text-stone-850"><code class="language-${lang}">${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-xs font-mono text-amber-900">$1</code>');

  // Headers
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-xl font-black text-amber-955 mt-6 mb-3 border-b border-amber-100 pb-1.5">$1</h1>');
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-lg font-black text-amber-955 mt-5 mb-2.5">$1</h2>');
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-sm font-bold text-amber-900 mt-4 mb-2">$1</h3>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-stone-950">$1</strong>');

  // Blockquotes
  html = html.replace(/^\>\s+(.*)$/gm, '<blockquote class="border-l-4 border-amber-500 pl-4 py-1.5 italic bg-amber-50/50 my-4 text-stone-700">$1</blockquote>');

  // Bullet lists
  html = html.replace(/^\s*[\*\-]\s+(.*)$/gm, '<li class="ml-4 list-disc text-stone-800 leading-relaxed my-1.5">$1</li>');

  // Paragraphs
  const lines = html.split('\n\n');
  const processedLines = lines.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<li') || trimmed.startsWith('<blockquote')) {
      return trimmed;
    }
    return `<p class="leading-relaxed text-stone-800 text-xs md:text-sm my-3">$1</p>`.replace('$1', trimmed);
  });
  
  return processedLines.join('\n');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const normalizedSlug = slug.toLowerCase();
    
    const filePaths = GUIDEBOOK_FILES[normalizedSlug] || [];

    let contentHtml = '';

    if (filePaths.length > 0) {
      const contents = await Promise.all(
        filePaths.map(async (relativeFilePath) => {
          const absolutePath = path.join(process.cwd(), relativeFilePath);
          if (fs.existsSync(absolutePath)) {
            const fileContent = await fs.promises.readFile(absolutePath, 'utf8');
            const parsed = parseMarkdown(fileContent);
            return `
              <div class="mb-10 border-b border-stone-100 pb-6 last:border-b-0">
                <div class="flex items-center gap-1.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider font-mono mb-2">
                  📄 Hướng dẫn: ${path.basename(relativeFilePath)}
                </div>
                ${parsed}
              </div>
            `;
          }
          return '';
        })
      );
      contentHtml = contents.join('\n');
    }

    return NextResponse.json({ html: contentHtml });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
