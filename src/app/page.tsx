import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import BaliArchive from "@/components/BaliArchive";

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

  // Fetch all ads
  const ads = await prisma.post.findMany({
    where: { isDraft: false, isAd: true },
    include: { images: true, hashtags: true, regency: true },
  });

  // Fetch all regencies for the drawer
  const allRegencies = await prisma.regency.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });

  // Interleave ads into regular posts
  let feedData = [...regularPosts];
  if (ads.length > 0) {
    // If there are very few regular posts, just add one ad at the end or random spot safely
    if (feedData.length < 5) {
      feedData.splice(Math.floor(Math.random() * (feedData.length + 1)), 0, ads[Math.floor(Math.random() * ads.length)]);
    } else {
      let insertIndex = Math.floor(Math.random() * 5) + 5; // First ad at index 5-10
      let adIndex = 0;
      const shuffledAds = [...ads].sort(() => 0.5 - Math.random());
  
      while (insertIndex <= feedData.length) {
        feedData.splice(insertIndex, 0, shuffledAds[adIndex % shuffledAds.length]);
        adIndex++;
        insertIndex += Math.floor(Math.random() * 6) + 5; 
      }
    }
  }

  // Ensure requested post exists in feedData
  if (postSlug) {
    const isNum = !isNaN(Number(postSlug));
    const targetPost = await prisma.post.findFirst({
      where: { slug: postSlug },
      include: { images: true, hashtags: true, regency: true },
    });

    if (targetPost && !feedData.some(p => p.id === targetPost.id)) {
      feedData.unshift(targetPost); // Inject requested post so it's not "Missing"
    }
  }

  return <BaliArchive initialData={feedData} allRegencies={allRegencies} />;
}
