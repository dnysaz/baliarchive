import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';

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
    // Require authenticated session for creating posts
    const session = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    // Only admins can create posts
    if (!isSessionAdmin(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      regencyId, province, hashtagIds, title, tagline, 
      likes, bestTime, howToGet, cost, body: contentBody, 
      venue, images, guidePdfUrl, lemonSqueezyUrl, guidePrice, googleMapsUrl, isDraft, isAd, advertiserName 
    } = body;

    // Basic server-side validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (title.length > 300) {
      return NextResponse.json({ error: 'Title too long' }, { status: 400 });
    }
    const rid = parseInt(regencyId);
    if (isNaN(rid)) {
      return NextResponse.json({ error: 'Invalid regencyId' }, { status: 400 });
    }
    const regency = await prisma.regency.findUnique({ where: { id: rid } });
    if (!regency) {
      return NextResponse.json({ error: 'Regency not found' }, { status: 400 });
    }

    // Validate images array (if provided)
    const media = Array.isArray(images) ? images.filter((m: any) => m && typeof m.url === 'string' && (m.url.startsWith('/') || m.url.startsWith('http'))) : [];
    const validHashtagIds = Array.isArray(hashtagIds) ? hashtagIds.map((id: any) => parseInt(id)).filter((n: number) => !isNaN(n)).slice(0,3) : [];

    // Support multiple hashtags
  // (we already built validHashtagIds above)

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
