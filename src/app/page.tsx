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
  const { post: postSlug } = await searchParams;

  // Fetch regular posts
  const regularPosts = await prisma.post.findMany({
    where: { isDraft: false, isAd: false },
    include: { images: true, hashtags: true, location: true },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch all ads
  const ads = await prisma.post.findMany({
    where: { isDraft: false, isAd: true },
    include: { images: true, hashtags: true, location: true },
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
      where: { OR: [{ slug: postSlug }, { id: isNum ? Number(postSlug) : -1 }] },
      include: { images: true, hashtags: true, location: true },
    });

    if (targetPost && !feedData.some(p => p.id === targetPost.id)) {
      feedData.unshift(targetPost); // Inject requested post so it's not "Missing"
    }
  }

  return <BaliArchive initialData={feedData} />;
}
