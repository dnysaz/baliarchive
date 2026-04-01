import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';
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
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch regencies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }

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
    console.error(error);
    return NextResponse.json({ error: 'Failed to create regency' }, { status: 500 });
  }
}
