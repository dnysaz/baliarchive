import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    await (prisma as any).message.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete messages error:', error);
    return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
  }
}
