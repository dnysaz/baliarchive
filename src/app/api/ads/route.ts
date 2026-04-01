import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regencyId = searchParams.get('regencyId');

    const where: any = {
      isDraft: false,
      isAd: true
    };

    if (regencyId) {
      where.regencyId = parseInt(regencyId);
    }

    const ads = await prisma.post.findMany({
      where,
      include: {
        images: true,
        hashtags: true,
        regency: true
      },
      orderBy: { views: 'desc' },
      take: 8, // Max 8 ads
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

