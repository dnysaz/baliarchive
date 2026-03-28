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
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const locationId = parseInt(id);

  try {
    // Find the fallback location, using "Bali" as the primary fallback
    const fallbackLocation = await (prisma as any).location.findFirst({
      where: { name: 'Bali' },
      select: { id: true },
    });

    if (!fallbackLocation) {
      return NextResponse.json({ error: 'Fallback regency ("Bali") not found in database. Please create a regency named "Bali" first.' }, { status: 404 });
    }

    if (locationId === fallbackLocation.id) {
      return NextResponse.json({ error: 'Cannot delete the primary fallback regency ("Bali").' }, { status: 400 });
    }

    // Update all posts associated with the location to be deleted
    await (prisma as any).post.updateMany({
      where: { locationId: locationId },
      data: { locationId: fallbackLocation.id },
    });

    // Delete the location
    await (prisma as any).location.delete({ where: { id: locationId } });

    return NextResponse.json({ message: 'Location deleted and posts redirected' });
  } catch (error) {
    console.error("Failed to delete location:", error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
