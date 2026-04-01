import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }

    const { id } = await context.params;
    const { name, slug } = await request.json();
    const regencyId = parseInt(id);
    const regency = await prisma.regency.update({
      where: { id: regencyId },
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
    return NextResponse.json({ error: 'Failed to update regency' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!isSessionAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }

    const { id } = await context.params;
    const regencyId = parseInt(id);
    await prisma.regency.delete({
      where: { id: regencyId }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete regency' }, { status: 500 });
  }
}

