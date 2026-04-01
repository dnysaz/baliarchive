'use client';

import React from 'react';
import type { Prisma } from '@prisma/client';
import Link from 'next/link';

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true, regency: true } }>;

interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
}

interface AllPostsGridProps {
  posts: Post[];
  stats: Stats;
  ads?: Post[];
  regency?: string;
  interleaveAds?: boolean;
}

const PuraIcon = () => (
  <svg width="38" height="38" viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="13" y="22" width="6" height="6" rx=".5" />
    <path d="M8 22h16M10 18h12M12 14h8M14 10h4M16 6v4" />
  </svg>
);

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function getSmartInterleavedPosts(posts: Post[], ads: Post[], regency?: string): Post[] {
  if (!ads || ads.length === 0) return posts;

  // Filter regency ads first, then random others
  const regencyAds = ads.filter(a => regency && a.regency?.name === regency);
  const otherAds = ads.filter(a => !regencyAds.some(ra => ra.id === a.id));
  const availableAds = [...regencyAds, ...otherAds.slice(0, 4)]; // Max 4 ads

  if (availableAds.length === 0) return posts;

  // Shuffle ads for rotation
  const shuffledAds = [...availableAds].sort(() => Math.random() - 0.5);

  const result = [...posts];
  let adIndex = 0;

  for (let i = 3; i < result.length; i += 4) {
    if (adIndex < shuffledAds.length) {
      result.splice(i, 0, shuffledAds[adIndex]);
      adIndex++;
      i++; // Skip next slot
    }
  }

  // Add final ad if few posts
  if (result.length < 8 && adIndex < shuffledAds.length) {
    result.push(shuffledAds[adIndex]);
  }

  return result;
}

export default function AllPostsGrid({ posts, stats, ads = [], regency, interleaveAds = false }: AllPostsGridProps) {
  const displayPosts = interleaveAds ? getSmartInterleavedPosts(posts, ads, regency) : posts;

  // Pick cover image from most-liked post
  const coverPost = [...displayPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  const coverImage = coverPost?.images[0];

  return (
    <div className="h-[100dvh] overflow-y-auto bg-zinc-950 font-sans text-white scrollbar-thin">

      {/* ── HERO COVER ─────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {/* Background media */}
        {coverImage ? (
          coverImage.type === 'VIDEO' ? (
            <video
              src={coverImage.url}
              className="absolute inset-0 w-full h-full object-cover scale-110"
              muted loop autoPlay playsInline
            />
          ) : (
            <img
              src={coverImage.url}
              alt="Bali Archive"
              className="absolute inset-0 w-full h-full object-cover scale-110"
            />
          )
        ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-zinc-950" />

        {/* Back button */}
        <div className="absolute top-[max(16px,env(safe-area-inset-top))] left-4 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white text-sm font-bold hover:bg-black/60 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            Feed
          </Link>
        </div>
      </div>

      {/* ── PROFILE SECTION ─────────────────────────────── */}
      <div className="relative px-5 sm:px-8 -mt-12 pb-6">
        {/* Avatar circle */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-900 via-amber-700 to-amber-500 flex items-center justify-center border-4 border-zinc-950 mb-4">
          <PuraIcon />
        </div>

        {/* Name */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none mb-0.5">
          All Destinations
        </h1>
        <p className="text-sm font-bold tracking-widest uppercase text-amber-400 mb-4">
          Across Bali
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-xl font-black text-white">{formatNumber(stats.totalPosts)}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Posts</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-center">
            <p className="text-xl font-black text-white">{formatNumber(stats.totalViews)}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Views</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-center">
            <p className="text-xl font-black text-white">{formatNumber(stats.totalLikes)}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Likes</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
          Discover all hidden gems, sacred temples, and untouched nature across Bali — curated by locals.
        </p>
      </div>

      {/* ── DIVIDER ─────────────────────────────────────── */}
      <div className="border-t border-zinc-800 mx-5 sm:mx-8" />

      {/* ── GRID LABEL ──────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 sm:px-8 py-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span className="text-[11px] font-black text-zinc-400 tracking-widest uppercase">All Destinations</span>
      </div>

      {/* ── TIKTOK-STYLE GRID ───────────────────────────── */}
      {displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
            <PuraIcon />
          </div>
          <h3 className="text-lg font-black text-white mb-1">No Destinations Yet</h3>
          <p className="text-zinc-500 text-sm font-medium">Check back soon — content is being added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-zinc-800">
          {displayPosts.map(post => (
            <Link
              key={post.id}
              href={`/?post=${post.slug}`}
              className="relative aspect-9/16 bg-zinc-900 overflow-hidden group outline-none touch-manipulation cursor-pointer"
            >
              {/* Media */}
              {post.images[0]?.type === 'VIDEO' ? (
                <video
                  src={post.images[0].url}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted 
                  loop 
                  autoPlay 
                  playsInline
                  preload="metadata"
                />
              ) : post.images[0]?.url ? (
                <img
                  src={post.images[0].url}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <PuraIcon />
                </div>
              )}

              {/* Ad Badge */}
              {post.isAd && (
                <div className="absolute top-2 left-2 inline-block bg-amber-500/90 backdrop-blur text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-lg z-10">
                  Ad
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Bottom section: Title + Stats */}
              <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col gap-1.5">
                {/* Title */}
                <p className="text-white text-[11px] font-bold leading-tight line-clamp-2 drop-shadow">{post.title}</p>

                {/* Stats row */}
                <div className="flex items-center gap-1.5 justify-between w-full">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-xl border border-white/10">
                    {(post.views || 0) > 0 && (
                      <div className="flex items-center gap-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span className="text-white text-[8px] font-black">{formatNumber(post.views || 0)}</span>
                      </div>
                    )}
                    {(post.views || 0) > 0 && (post.likes || 0) > 0 && <div className="w-px h-3 bg-white/20" />}
                    {(post.likes || 0) > 0 && (
                      <div className="flex items-center gap-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span className="text-white text-[8px] font-black">{formatNumber(post.likes || 0)}</span>
                      </div>
                    )}
                  </div>
                  {post.images[0]?.type === 'VIDEO' && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black/50 backdrop-blur-xl border border-white/10">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}

