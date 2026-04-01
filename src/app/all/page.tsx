import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AllPostsGrid from '@/components/AllPostsGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Destinations — Bali Archive',
  description: 'Browse all hidden gems, temples, and destinations across Bali, curated by locals.',
};

export default async function AllPage() {
  const [postsPromise, adsPromise] = await Promise.all([
    prisma.post.findMany({
      where: {
        isDraft: false,
        isAd: false,
      },
      include: {
        images: true,
        hashtags: true,
        regency: true
      },
      orderBy: { createdAt: 'desc' },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ads`).then(res => res.json())
  ]);

  const posts = postsPromise;
  const ads = Array.isArray(adsPromise) ? adsPromise : [];

  const stats = {
    totalPosts: posts.length,
    totalLikes: posts.reduce((acc: any, p: any) => acc + (p.likes || 0), 0),
    totalViews: posts.reduce((acc: any, p: any) => acc + (p.views || 0), 0),
  };

  return <AllPostsGrid posts={posts} stats={stats} ads={ads} interleaveAds={true} />;
}

