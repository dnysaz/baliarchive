import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import BaliArchive from "@/components/BaliArchive";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ post?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { post: postSlug } = await searchParams;

  if (postSlug) {
    const post = await prisma.post.findFirst({
      where: { OR: [{ slug: postSlug }, { id: isNaN(Number(postSlug)) ? -1 : Number(postSlug) }] },
      include: { images: true, hashtags: true, location: true },
    });

    if (post) {
      const ogImage = post.images[0]?.url ?? '/og-default.jpg';
      const absoluteImage = ogImage.startsWith('http') ? ogImage : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://baliarchive.com'}${ogImage}`;

      return {
        title: `${post.title} — ${post.location?.name || 'BaliArchive'}`,
        description: post.tagline,
        openGraph: {
          title: post.title,
          description: post.tagline,
          images: [{ url: absoluteImage, width: 1200, height: 630, alt: post.title }],
          type: 'article',
          locale: 'en_ID',
          siteName: 'BaliArchive',
        },
        twitter: {
          card: 'summary_large_image',
          title: post.title,
          description: post.tagline,
          images: [absoluteImage],
        },
      };
    }
  }

  return {
    title: 'BaliArchive — Bali, As The Locals Know It',
    description: 'Insider guides to temples, culture, and hidden destinations across all 8 regencies.',
    openGraph: {
      title: 'BaliArchive',
      description: 'Bali as the locals know it.',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'BaliArchive' }],
      type: 'website',
      siteName: 'BaliArchive',
    },
  };
}

export default async function Home({ searchParams }: Props) {
  const posts = await prisma.post.findMany({
    where: { isDraft: false },
    include: { images: true, hashtags: true, location: true },
    orderBy: { createdAt: 'desc' },
  });

  return <BaliArchive initialData={posts} />;
}
