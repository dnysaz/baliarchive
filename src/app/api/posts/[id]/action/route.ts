import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Very small in-memory rate limiter to slow down bot abuse for like/save actions.
// Note: in serverless or multi-instance deployments this won't be global — consider
// replacing with Redis or other shared store for production.
const RATE_LIMIT_WINDOW_MS = 3000; // 3 seconds per user per action
const lastAction: Map<string, number> = new Map();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);

  try {
    const { action } = await request.json();

    // Require authenticated session to perform actions (like/save)
    const session = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const uid = (session as any).user?.id || (session as any).user?.email || 'anon';
    const key = `${uid}::${action}`;
    const last = lastAction.get(key) || 0;
    const now = Date.now();
    if (now - last < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    lastAction.set(key, now);

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
