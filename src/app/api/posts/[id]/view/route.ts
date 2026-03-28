import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
      select: { views: true },
    });

    return NextResponse.json({ views: post.views });
  } catch (error) {
    console.error('Failed to increment view:', error);
    return NextResponse.json({ error: 'Failed to increment view' }, { status: 500 });
  }
}
