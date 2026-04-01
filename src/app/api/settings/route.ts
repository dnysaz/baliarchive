import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await (prisma as any).siteSettings.findFirst({
      where: { id: 1 }
    });
    return NextResponse.json(settings || {
      title: 'Bali Archive',
      description: 'Discover the hidden gems of Bali',
      keywords: 'bali, travel, archive',
      ogImage: '',
      favicon: '/favicon.ico'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, keywords, ogImage, favicon } = body;

    const settings = await (prisma as any).siteSettings.upsert({
      where: { id: 1 },
      update: {
        title,
        description,
        keywords,
        ogImage,
        favicon
      },
      create: {
        id: 1,
        title,
        description,
        keywords,
        ogImage,
        favicon
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
