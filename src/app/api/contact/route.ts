import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, content, website } = body;

    // BOT TRAP: If honeypot is filled, silent success
    if (website) {
       return NextResponse.json({ success: true, note: 'Human check bypassed' });
    }

    if (!email || !content) {
      return NextResponse.json({ error: 'Email and content are required' }, { status: 400 });
    }

    const message = await (prisma as any).message.create({
      data: {
        email,
        content
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
