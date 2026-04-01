import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const count = await (prisma as any).message.count();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
