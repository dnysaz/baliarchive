import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import RegencyProfile from '@/components/RegencyProfile';

export const dynamic = 'force-dynamic';


interface Props {
  params: Promise<{ regency: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regency: regencySlug } = await params;

  const regencyData = await prisma.regency.findUnique({
    where: { slug: regencySlug.toLowerCase() }
  });

  if (!regencyData) return { title: 'Not Found' };

  return {
    title: `${regencyData.name} — Bali Destinations | BaliArchive`,
    description: `Explore all hidden gems, temples, and destinations in ${regencyData.name} regency, curated by locals.`,
  };
}

export default async function RegencyPage({ params }: Props) {
  const { regency: regencySlug } = await params;

  // Find regency by slug in DB
  const regencyData = await prisma.regency.findUnique({
    where: { slug: regencySlug.toLowerCase() }
  });

  if (!regencyData) notFound();

  const [postsPromise, adsPromise] = await Promise.all([
    prisma.post.findMany({
      where: {
        isDraft: false,
        isAd: false,
        regencyId: regencyData.id
      },
      include: {
        images: true,
        hashtags: true,
        regency: true
      },
      orderBy: { createdAt: 'desc' },
    }),
    fetch(`http://localhost:3000/api/ads?regencyId=${regencyData.id}`).then(res => res.json())
  ]);

  const posts = postsPromise;
  const ads = Array.isArray(adsPromise) ? adsPromise : [];

  const stats = {
    totalPosts: posts.length,
    totalLikes: posts.reduce((acc: any, p: any) => acc + (p.likes || 0), 0),
    totalViews: posts.reduce((acc: any, p: any) => acc + (p.views || 0), 0),
  };

  return <RegencyProfile regency={regencyData.name} posts={posts} stats={stats} ads={ads} interleaveAds={true} />;
}

