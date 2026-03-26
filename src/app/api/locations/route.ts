import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await (prisma as any).location.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data lokasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const location = await (prisma as any).location.create({
      data: { name }
    });
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat lokasi' }, { status: 500 });
  }
}
