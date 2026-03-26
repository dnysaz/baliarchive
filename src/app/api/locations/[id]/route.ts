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
  const locationId = parseInt(id);

  try {
    // Find the fallback location, e.g., "Denpasar"
    const fallbackLocation = await (prisma as any).location.findFirst({
      where: { name: 'Denpasar' },
      select: { id: true },
    });

    if (!fallbackLocation) {
      return NextResponse.json({ error: 'Fallback location not found' }, { status: 500 });
    }

    if (locationId === fallbackLocation.id) {
      return NextResponse.json({ error: 'Cannot delete the fallback location' }, { status: 400 });
    }

    // Update all posts associated with the location to be deleted
    await (prisma as any).post.updateMany({
      where: { locationId: locationId },
      data: { locationId: fallbackLocation.id },
    });

    // Delete the location
    await (prisma as any).location.delete({ where: { id: locationId } });

    return NextResponse.json({ message: 'Lokasi dihapus dan postingan dialihkan' });
  } catch (error) {
    console.error("Failed to delete location:", error);
    return NextResponse.json({ error: 'Gagal hapus lokasi' }, { status: 500 });
  }
}
