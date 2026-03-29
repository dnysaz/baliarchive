'use client';

import React from 'react';
import type { Prisma } from '@prisma/client';

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true, regency: true } }>;

interface SavedPageProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosts: Post[];
  onOpenPost: (post: Post) => void;
  ads?: Post[];
}

export default function SavedPage({ isOpen, onClose, savedPosts, onOpenPost, ads = [] }: SavedPageProps) {
  const displayAd = React.useMemo(() => {
    if (!ads || ads.length === 0) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  }, [isOpen, ads]);

  return (
    <div className={`font-sans fixed inset-0 z-[600] bg-zinc-50 flex flex-col transition-all duration-500 ease-out ${isOpen ? 'translate-y-0 opacity-100 visible pointer-events-auto' : 'translate-y-full opacity-0 invisible pointer-events-none'}`}>
      
      {/* Header - Matching Search Styles */}
      <div className="shrink-0 flex items-center justify-between px-6 bg-white border-b-2 border-amber-500 pt-[max(20px,env(safe-area-inset-top))] pb-6 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">Saved Archive</h1>
          <p className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-amber-500">{savedPosts.length} Places Bookmarked</p>
        </div>
        <button 
          type="button"
          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95 transition-all outline-none cursor-pointer [touch-action:manipulation]"
          onClick={() => onClose()}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Grid Content - Matching Search Styles */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 p-6 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {savedPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {savedPosts.map(post => (
                <button 
                  key={post.id} 
                  className="relative group overflow-hidden rounded-[24px] aspect-[3/4] bg-white appearance-none outline-none text-left cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPost(post); }}
                >
                  {post.images[0]?.type === 'VIDEO' ? (
                    <video src={post.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" playsInline muted loop autoPlay preload="metadata" />
                  ) : (
                    <img 
                      src={post.images[0]?.url || ''} 
                      alt="" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                    />
                  )}
                  
                  {/* Gradient Overlay - Matching Search Styles */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 transition-all duration-300">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 truncate">
                        {post.regency?.name || 'Bali'}
                    </span>
                    <h3 className="text-white text-[11px] lg:text-sm font-bold leading-tight drop-shadow-md truncate group-hover:text-amber-400 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-sm mx-auto text-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/[0.05]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Empty Archive</h3>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                  You haven&apos;t saved any destinations yet. Tap the bookmark icon on any post to keep it here for later reference.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Docked Google Style Ad Banner */}
      {displayAd && (
        <div className="shrink-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-stretch">
            <div className="px-3 py-1.5 bg-gray-50/80 flex sm:flex-col items-center justify-between sm:justify-center shrink-0 w-full sm:w-auto">
              <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase sm:-rotate-180 sm:[writing-mode:vertical-rl] block">Sponsored</span>
            </div>
            <button 
              className="flex-1 flex items-stretch text-left hover:bg-gray-50 transition-colors h-20 sm:h-24 outline-none appearance-none"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPost(displayAd); onClose(); }}
            >
              <div className="w-24 sm:w-32 bg-gray-100 shrink-0 relative overflow-hidden h-full">
                {displayAd.images?.[0] ? (
                  displayAd.images[0].type === 'VIDEO' ? (
                    <video src={displayAd.images[0].url} className="w-full h-full object-cover" muted loop autoPlay playsInline preload="metadata" />
                  ) : (
                    <img src={displayAd.images[0].url} className="w-full h-full object-cover" alt="" />
                  )
                ) : null}
              </div>
              <div className="flex-1 p-3 px-4 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 leading-tight truncate">{displayAd.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 leading-snug">{displayAd.tagline}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{displayAd.advertiserName || 'Ad'}</span>
                  <span className="text-blue-600 text-[10px] font-black">Explore &rarr;</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
