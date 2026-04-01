import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json({
      termsTitle: settings?.termsTitle || 'Terms & Conditions',
      termsContent: settings?.termsContent || '',
    });
  } catch (error) {
    console.error('Failed to fetch terms settings:', error);
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
    const { termsTitle, termsContent } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        termsTitle: termsTitle || 'Terms & Conditions',
        termsContent: termsContent || '',
      },
      update: {
        termsTitle,
        termsContent,
      },
    });

    return NextResponse.json({
      termsTitle: updated.termsTitle,
      termsContent: updated.termsContent,
    });
  } catch (error) {
    console.error('Failed to update terms settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

