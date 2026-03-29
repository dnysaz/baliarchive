import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regencyId = searchParams.get('regencyId');
  const hashtagId = searchParams.get('hashtagId');
  const isDraft = searchParams.get('isDraft');

  try {
    const where: any = {};
    if (regencyId) where.regencyId = parseInt(regencyId);
    if (isDraft !== null) where.isDraft = isDraft === 'true';
    if (hashtagId) {
      where.hashtags = {
        some: { id: parseInt(hashtagId) },
      };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        images: true,
        hashtags: true,
        regency: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      regencyId, province, hashtagIds, title, tagline, 
      likes, bestTime, howToGet, cost, body: contentBody, 
      venue, images, guidePdfUrl, lemonSqueezyUrl, guidePrice, googleMapsUrl, isDraft, isAd, advertiserName 
    } = body;

    // Support multiple hashtags
    const validHashtagIds = Array.isArray(hashtagIds) ? hashtagIds.slice(0, 3) : [];

    // Helper to generate slug from title
    const slugify = (text: string) => {
      const baseSlug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const randomId = Math.random().toString(36).substring(2, 6);
      return `${baseSlug}-${randomId}`;
    };

    const newSlug = slugify(title || 'untitled');

    const post = await prisma.post.create({
      data: {
        title,
        slug: newSlug,
        tagline: tagline || '',
        body: contentBody || '',
        province: province || 'Bali',
        regencyId: parseInt(regencyId),
        bestTime: bestTime || '',
        howToGet: howToGet || '',
        cost: cost || '',
        venue: venue || null,
        guidePdfUrl,
        guidePrice,
        googleMapsUrl,
        isDraft: Boolean(isDraft),
        isAd: Boolean(isAd),
        advertiserName: isAd ? advertiserName : null,
        lemonSqueezyUrl,
        likes: parseInt(likes) || 0,
        images: {
          create: images && Array.isArray(images) ? images.map((img: { url: string; type: string }) => ({
            url: img.url,
            type: img.type || 'IMAGE',
          })) : [],
        },
        hashtags: {
          connect: validHashtagIds.map((id: number) => ({ id })),
        },
      },
      include: {
        images: true,
        hashtags: true,
        regency: true
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
