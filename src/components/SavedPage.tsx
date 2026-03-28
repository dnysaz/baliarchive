'use client';

import React from 'react';
import type { Prisma } from '@prisma/client';

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true } }>;

interface SavedPageProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosts: Post[];
  onOpenPost: (post: Post) => void;
}

export default function SavedPage({ isOpen, onClose, savedPosts, onOpenPost }: SavedPageProps) {
  return (
    <div className={`font-sans fixed inset-0 z-[300] bg-zinc-50 flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'}`}>
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 bg-white border-b border-black/[0.04] pt-[max(24px,env(safe-area-inset-top))] pb-5 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">Saved Destinations</h1>
          <p className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-amber-500">{savedPosts.length} {savedPosts.length === 1 ? 'Place' : 'Places'} Archived</p>
        </div>
        <button 
          type="button"
          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95 transition-all outline-none cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {savedPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {savedPosts.map(post => (
                <button 
                  key={post.id} 
                  className="relative group overflow-hidden rounded-3xl aspect-[3/4] bg-white border border-black/5 hover:border-amber-500/50 appearance-none outline-none text-left cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPost(post); }}
                >
                  <img src={post.images[0]?.url || ''} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                    
                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5 translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black tracking-wider uppercase rounded-full shadow-lg">
                        {post.kabupaten}
                      </span>
                      <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[9px] font-bold tracking-wide rounded-full">
                        {post.cost === 'Free' || post.cost.toLowerCase().includes('free') ? 'Free' : 'Ticket' }
                      </span>
                    </div>
                    
                    {/* Titles */}
                    <h3 className="text-white text-sm lg:text-base font-semibold leading-tight drop-shadow-md truncate">{post.title}</h3>
                    <p className="text-[9px] text-zinc-300 font-medium mt-1 truncate group-hover:text-amber-400 transition-colors drop-shadow-md">{post.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-sm mx-auto text-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/[0.05] border border-black/[0.02]">
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
    </div>
  );
}
