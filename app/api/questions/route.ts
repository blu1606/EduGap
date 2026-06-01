import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'quiz-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json(
        { error: 'Hệ thống chưa được cấu hình manifest' },
        { status: 500 }
      );
    }
    const manifestData = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestData);

    const fullSets = manifest.sets.map((setMetadata: any) => {
      const quizFilePath = path.join(
        process.cwd(), 
        'public', 
        'quizzes', 
        setMetadata.parent_id || '', 
        `${setMetadata.id}.json`
      );
      if (fs.existsSync(quizFilePath)) {
        try {
          const quizFileData = fs.readFileSync(quizFilePath, 'utf8');
          return JSON.parse(quizFileData);
        } catch (e) {
          console.error(`Failed to parse quiz file for ${setMetadata.id}:`, e);
        }
      }
      return {
        ...setMetadata,
        questions: []
      };
    });

    return NextResponse.json({ sets: fullSets });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
