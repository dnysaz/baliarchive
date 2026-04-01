import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json(settings || {
      id: 1,
      aboutTitle: 'Welcome to Bali Archive',
      aboutContent: '',
    });
  } catch (error) {
    console.error('Failed to fetch about settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { aboutTitle, aboutContent } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        aboutTitle: aboutTitle || 'Welcome to Bali Archive',
        aboutContent: aboutContent || '',
      },
      update: {
        aboutTitle: aboutTitle || undefined,
        aboutContent: aboutContent || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update about settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
