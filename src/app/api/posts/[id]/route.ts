import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { images: true, location: true, hashtag: true } as any
    });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { 
      locationId, province, hashtagId, title, tagline, 
      bestTime, howToGet, cost, body: contentBody, 
      venue, images 
    } = body;

    const location = await (prisma as any).location.findUnique({ where: { id: locationId } });
    const hashtag = await (prisma as any).hashtag.findUnique({ where: { id: hashtagId } });

    // Delete existing images and recreate
    await prisma.image.deleteMany({ where: { postId: parseInt(id) } });

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        locationId,
        kabupaten: location?.name || "",
        province: province || "Bali",
        hashtagId,
        category: hashtag?.name || "",
        title,
        tagline,
        bestTime,
        howToGet,
        cost,
        body: contentBody,
        venue,
        images: {
          create: images.map((url: string) => ({ url }))
        }
      } as any,
      include: { images: true, location: true, hashtag: true } as any
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.image.deleteMany({ where: { postId: parseInt(id) } });
    await prisma.post.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
