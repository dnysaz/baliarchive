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
      venue, images 
    } = body;

    // Get names for backward compatibility fields if needed
    const location = await (prisma as any).location.findUnique({ where: { id: locationId } });
    const hashtag = await (prisma as any).hashtag.findUnique({ where: { id: hashtagId } });

    const post = await prisma.post.create({
      data: {
        locationId,
        kabupaten: location?.name || "",
        province: province || "Bali",
        hashtagId,
        category: hashtag?.name || "",
        title,
        tagline,
        likes: likes || "0",
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
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
