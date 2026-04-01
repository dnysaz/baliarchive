import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const hashtags = await (prisma as any).hashtag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(hashtags);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data hashtag' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }

    const { name } = await request.json();
    const hashtag = await (prisma as any).hashtag.create({
      data: { name }
    });
    return NextResponse.json(hashtag);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat hashtag' }, { status: 500 });
  }
}
