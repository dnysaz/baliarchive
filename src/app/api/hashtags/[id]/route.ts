import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name } = await request.json();
    const hashtag = await (prisma as any).hashtag.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    return NextResponse.json(hashtag);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update hashtag' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await (prisma as any).hashtag.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Hashtag dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus hashtag' }, { status: 500 });
  }
}
