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
      venue, images, guidePdfUrl, guidePrice 
    } = body;

    const location = await (prisma as any).location.findUnique({ where: { id: locationId } });
    const hashtag = await (prisma as any).hashtag.findUnique({ where: { id: hashtagId } });

    // IMPORTANT:
    // Endpoint ini sebelumnya selalu menghapus semua gambar lalu menambah lagi
    // berdasarkan `images` dari request body.
    // Jika client tidak mengirim `images` (atau mengirim array kosong),
    // maka gambar lama ikut hilang.
    const imageUrls = (Array.isArray(images) ? images : []).filter(
      (u: unknown): u is string => typeof u === 'string' && u.trim().length > 0
    );
    const hasNewImages = imageUrls.length > 0;
    if (hasNewImages) {
      await prisma.image.deleteMany({ where: { postId: parseInt(id) } });
    } else {
      console.warn('PUT /api/posts/[id]: images empty, keeping existing images', {
        postId: id,
      });
    }

    const updateData: any = {
      kabupaten: location?.name || "",
      province: province || "Bali",
      category: hashtag?.name || "",
      title,
      tagline,
      bestTime,
      howToGet,
      cost,
      body: contentBody,
      venue,
      // Store guide fields if provided. Convert '' to null so the UI can use truthy checks.
      guidePdfUrl: guidePdfUrl || null,
      guidePrice: guidePrice || null,
      // Use relation connect to avoid runtime mismatch with scalar fields.
      location: { connect: { id: locationId } },
      hashtag: { connect: { id: hashtagId } },
    };

    if (hasNewImages) {
      updateData.images = {
        create: imageUrls.map((url: string) => ({ url })),
      };
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: updateData as any,
      include: { images: true, location: true, hashtag: true } as any
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('PUT /api/posts/[id] failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    );
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
