import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const regencies = await prisma.regency.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(regencies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug } = await request.json();
    const regency = await prisma.regency.create({
      data: { name, slug },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    return NextResponse.json(regency);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


