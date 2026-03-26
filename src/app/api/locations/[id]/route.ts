import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name } = await request.json();
    const location = await (prisma as any).location.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update lokasi' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await (prisma as any).location.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Lokasi dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus lokasi' }, { status: 500 });
  }
}
