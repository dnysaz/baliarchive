import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isNum = !isNaN(parseInt(id)) && /^\d+$/.test(id);
    const post = await prisma.post.findUnique({
      where: isNum ? { id: parseInt(id) } : { slug: id },
      include: { images: true, regency: true, hashtags: true }
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
  console.log('PUT /api/posts/[id] called with param:', id);
  try {
    // Require authenticated session for updates
    const session = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!isSessionAdmin(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      regencyId, province, hashtagIds, title, tagline, 
      bestTime, howToGet, cost, body: contentBody, 
      venue, images, guidePdfUrl, lemonSqueezyUrl, guidePrice, googleMapsUrl, isDraft, isAd, advertiserName
    } = body;

    const regency = await prisma.regency.findUnique({ where: { id: parseInt(regencyId) } });
    const validHashtagIds = Array.isArray(hashtagIds) ? hashtagIds.slice(0, 3) : [];

    const isNum = !isNaN(parseInt(id)) && /^\d+$/.test(id);
    const whereClause = isNum ? { id: parseInt(id) } : { slug: id };

    console.log('Looking for post with slug:', id, 'isNum:', isNum);
    const existingPost = await prisma.post.findUnique({
      where: isNum ? { id: parseInt(id) } : { slug: id }
    });
    if (!existingPost) {
      console.log('Post not found for:', id);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    console.log('Found post ID:', existingPost.id, 'title:', existingPost.title);
    const actualId = existingPost.id;

    // IMPORTANT:
    // Endpoint ini sebelumnya selalu menghapus semua gambar lalu menambah lagi
    // berdasarkan `images` dari request body.
    // Jika client tidak mengirim `images` (atau mengirim array kosong),
    // maka gambar lama ikut hilang.
    const mediaItems = (Array.isArray(images) ? images : []).filter(
      (m: any): m is { url: string; type: string } => typeof m.url === 'string' && m.url.trim().length > 0
    );
    const hasMedia = mediaItems.length > 0;
    if (hasMedia) {
      await prisma.image.deleteMany({ where: { postId: actualId } });
    } else {
      console.warn('PUT /api/posts/[id]: images empty, keeping existing images', {
        postId: id,
      });
    }

    const updateData: any = {
      province: province || "Bali",
      title,
      tagline: tagline || "",
      bestTime: bestTime || "",
      howToGet: howToGet || "",
      cost: cost || "",
      body: contentBody || "",
      venue: venue || null,
      guidePdfUrl: guidePdfUrl || null,
      lemonSqueezyUrl: lemonSqueezyUrl || null,
      guidePrice: guidePrice || null,
      googleMapsUrl: googleMapsUrl || null,
      isDraft: isDraft !== undefined ? isDraft : false,
      isAd: isAd !== undefined ? isAd : false,
      advertiserName: advertiserName || null,
      regency: { connect: { id: parseInt(regencyId) } },
      hashtags: { 
        set: [], 
        connect: validHashtagIds.map((id: number) => ({ id: parseInt(id as any) }))
      },
    };

    // Auto update slug if title changed, but handle uniqueness simply
    function generateSlug(text: string) {
      return text.toString().toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (title && title !== existingPost.title) {
      let newSlug = generateSlug(title);
      let found = await prisma.post.findUnique({ where: { slug: newSlug } });
      if (found && found.id !== actualId) {
         newSlug = `${newSlug}-${Date.now()}`;
      }
      updateData.slug = newSlug;
    }

    if (hasMedia) {
      updateData.images = {
        create: mediaItems.map((m: any) => ({ url: m.url, type: m.type || 'IMAGE' })),
      };
    }

    const post = await prisma.post.update({
      where: { id: actualId },
      data: updateData,
      include: { images: true, regency: true, hashtags: true }
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
    // Require authenticated session for deletes
    const session = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!isSessionAdmin(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isNum = !isNaN(parseInt(id)) && /^\d+$/.test(id);
    const whereClause = isNum ? { id: parseInt(id) } : { slug: id };
    
    const existingPost = await prisma.post.findUnique({
      where: isNum ? { id: parseInt(id) } : { slug: id }
    });
    if (!existingPost) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    await prisma.image.deleteMany({ where: { postId: existingPost.id } });
    await prisma.post.delete({ where: { id: existingPost.id } });
    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
