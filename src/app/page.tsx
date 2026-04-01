import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from "@/lib/prisma";
import BaliArchive from "@/components/BaliArchive";

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true, regency: true } }>;

export const dynamic = 'force-dynamic';


interface Props {
  searchParams: Promise<{ post?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { post: postSlug } = await searchParams;
  const settings = await (prisma as any).siteSettings.findFirst({ where: { id: 1 } });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://baliarchive.com';

  if (postSlug) {
    const post = await prisma.post.findFirst({
      where: { slug: postSlug },
      include: { images: true, hashtags: true, regency: true },
    });

    if (post) {
      const ogImage = post.images[0]?.url ?? '/og-default.jpg';
      const absoluteImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

      return {
        title: `${post.title} — ${post.regency?.name || 'BaliArchive'}`,
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

  const globalTitle = settings?.title || 'BaliArchive — Bali, As The Locals Know It';
  const globalDesc = settings?.description || 'Insider guides to temples, culture, and hidden destinations across all 8 regencies.';
  const globalKeywords = settings?.keywords || 'bali, travel, archive';
  const globalOgImage = settings?.ogImage || '/og-default.jpg';
  const absoluteOgImage = globalOgImage.startsWith('http') ? globalOgImage : `${baseUrl}${globalOgImage}`;

  return {
    title: globalTitle,
    description: globalDesc,
    keywords: globalKeywords,
    openGraph: {
      title: globalTitle,
      description: globalDesc,
      images: [{ url: absoluteOgImage, width: 1200, height: 630, alt: 'BaliArchive' }],
      type: 'website',
      siteName: 'BaliArchive',
    },
    twitter: {
      card: 'summary_large_image',
      title: globalTitle,
      description: globalDesc,
      images: [absoluteOgImage],
    },
    icons: settings?.favicon ? {
      icon: settings.favicon,
      shortcut: settings.favicon,
      apple: settings.favicon,
    } : undefined
  };
}

export default async function Home({ searchParams }: Props) {
  const { post: postSlug } = await searchParams;

  // Fetch regular posts
  const regularPosts = await prisma.post.findMany({
    where: { isDraft: false, isAd: false },
    include: { images: true, hashtags: true, regency: true },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch ads via API
  const adsResponse = await fetch(`http://localhost:3000/api/ads`);
  const adsData = await adsResponse.json();
  const ads = Array.isArray(adsData) ? adsData : [];

  // Fetch all regencies for the drawer
  const allRegencies = await prisma.regency.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });

  // Smart interleave ads
  let feedData = getSmartInterleavedPosts(regularPosts, ads, undefined);

  // Ensure requested post exists in feedData
  if (postSlug) {
    const targetPost = await prisma.post.findFirst({
      where: { slug: postSlug },
      include: { images: true, hashtags: true, regency: true },
    });

    if (targetPost && !feedData.some(p => p.id === targetPost.id)) {
      feedData.unshift(targetPost);
    }
  }

  return <BaliArchive initialData={feedData} allRegencies={allRegencies} />;
}

function getSmartInterleavedPosts(posts: Post[], ads: Post[], regency?: string): Post[] {
  if (!ads || ads.length === 0) return posts;

  const regencyAds = regency ? ads.filter(a => a.regency?.name === regency) : [];
  const otherAds = ads.filter(a => !regencyAds.some(ra => ra.id === a.id));
  const availableAds = [...regencyAds, ...otherAds.slice(0, 5)];

  const shuffledAds = [...availableAds].sort(() => Math.random() - 0.5);

  const result = [...posts];
  let adIndex = 0;

  for (let i = 3; i < result.length; i += 4) {
    if (adIndex < shuffledAds.length) {
      result.splice(i, 0, shuffledAds[adIndex]);
      adIndex++;
    }
  }

  if (result.length < 8 && adIndex < shuffledAds.length) {
    result.push(shuffledAds[adIndex]);
  }

  return result;
}

