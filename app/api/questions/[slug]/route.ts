import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'public', 'questions.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);

    const targetSlug = slug.toLowerCase();

    // Find the matching question set by id, normalized title, or custom mapping
    const set = data.sets.find((s: any) => {
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
        (targetSlug === 'design-pattern-react' && s.id === 'react-agent-day3')
      );
    });

    if (!set) {
      return NextResponse.json(
        { error: 'Bộ đề không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }

    return NextResponse.json(set);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    );
  }
}
