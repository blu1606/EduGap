import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const targetSlug = slug.toLowerCase();

    // Read the manifest file to find the matching set ID
    const manifestPath = path.join(process.cwd(), 'public', 'quiz-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json(
        { error: 'Hệ thống chưa được cấu hình manifest' },
        { status: 500 }
      );
    }
    
    const manifestData = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestData);

    // Find the matching set metadata
    const matchedMetadata = manifest.sets.find((s: any) => {
      const normalizedTitle = s.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      return (
        s.id.toLowerCase() === targetSlug ||
        normalizedTitle === targetSlug ||
        (targetSlug === 'design-pattern-react' && s.id === 'react-loop-basics') ||
        (targetSlug === 'react-agent-day3' && s.id === 'react-loop-basics') ||
        (targetSlug === 'day1-basics' && s.id === 'react-loop-basics')
      );
    });

    if (!matchedMetadata) {
      return NextResponse.json(
        { error: 'Bộ đề không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }

    // Read the actual quiz set data containing the questions
    const quizFilePath = path.join(
      process.cwd(), 
      'public', 
      'quizzes', 
      matchedMetadata.parent_id || '', 
      `${matchedMetadata.id}.json`
    );
    if (!fs.existsSync(quizFilePath)) {
      return NextResponse.json(
        { error: 'Tập tin câu hỏi không tồn tại' },
        { status: 404 }
      );
    }

    const quizFileData = fs.readFileSync(quizFilePath, 'utf8');
    const quizSet = JSON.parse(quizFileData);

    return NextResponse.json(quizSet);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    );
  }
}
