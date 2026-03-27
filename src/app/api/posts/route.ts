import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const posts = await prisma.post.findMany({
      where: admin === 'true' ? {} : { isDraft: false },
      include: { 
        images: true,
        location: true,
        hashtags: true
      } as any,
      orderBy: { createdAt: 'desc' } as any
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

function generateSlug(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_-]+/g, '-') // swap spaces and underscores for hyphens
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      locationId, province, hashtagIds, title, tagline, 
      likes, bestTime, howToGet, cost, body: contentBody, 
      venue, images, guidePdfUrl, guidePrice, googleMapsUrl, isDraft 
    } = body;

    // Get names for backward compatibility fields if needed
    const location = await (prisma as any).location.findUnique({ where: { id: locationId } });
    
    // Support multiple hashtags (limit to 3 for safety even if UI allows more)
    const validHashtagIds = Array.isArray(hashtagIds) ? hashtagIds.slice(0, 3) : [];
    
    const imageUrls = (Array.isArray(images) ? images : []).filter(
      (u: unknown): u is string => typeof u === 'string' && u.trim().length > 0
    );

    let slug = generateSlug(title);
    let existingSlug = await prisma.post.findUnique({ where: { slug } as any });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        kabupaten: location?.name || "",
        province: province || "Bali",
        title,
        slug,
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
        googleMapsUrl: googleMapsUrl || null,
        isDraft: isDraft || false,
        // Use relation connect to avoid runtime mismatch with scalar fields.
        location: { connect: { id: locationId } },
        hashtags: { 
          connect: validHashtagIds.map((id: number) => ({ id })) 
        },
        images: imageUrls.length > 0
          ? { create: imageUrls.map((url: string) => ({ url })) }
          : undefined
      } as any,
      include: { images: true, location: true, hashtags: true } as any
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
