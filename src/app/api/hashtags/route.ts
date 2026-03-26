import { NextResponse } from 'next/server';
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
    const { name } = await request.json();
    const hashtag = await (prisma as any).hashtag.create({
      data: { name }
    });
    return NextResponse.json(hashtag);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat hashtag' }, { status: 500 });
  }
}
