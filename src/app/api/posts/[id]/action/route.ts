import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);

  try {
    const { action } = await request.json();

    if (action === 'like') {
      const post = await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({ likes: post.likes });
    }

    if (action === 'save') {
      const post = await prisma.post.update({
        where: { id: postId },
        data: { saves: { increment: 1 } },
      });
      return NextResponse.json({ saves: post.saves });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Action failed:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
