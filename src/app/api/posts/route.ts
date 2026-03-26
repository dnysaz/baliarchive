import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: { 
        images: true,
        location: true,
        hashtag: true
      } as any,
      orderBy: { createdAt: 'desc' } as any
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      locationId, province, hashtagId, title, tagline, 
      likes, bestTime, howToGet, cost, body: contentBody, 
      venue, images, guidePdfUrl, guidePrice 
    } = body;

    // Get names for backward compatibility fields if needed
    const location = await (prisma as any).location.findUnique({ where: { id: locationId } });
    const hashtag = await (prisma as any).hashtag.findUnique({ where: { id: hashtagId } });
    const imageUrls = (Array.isArray(images) ? images : []).filter(
      (u: unknown): u is string => typeof u === 'string' && u.trim().length > 0
    );

    const post = await prisma.post.create({
      data: {
        kabupaten: location?.name || "",
        province: province || "Bali",
        category: hashtag?.name || "",
        title,
        tagline,
        likes: parseInt(likes) || 0,
        saves: 0,
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
        images: imageUrls.length > 0
          ? { create: imageUrls.map((url: string) => ({ url })) }
          : undefined
      } as any,
      include: { images: true, location: true, hashtag: true } as any
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
