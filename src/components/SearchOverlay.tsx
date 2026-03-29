'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Prisma } from '@prisma/client';

const SearchIcon = ({ size = 14, color = "white" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true, regency: true } }>;

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allPosts: Post[];
  onSelectPost: (post: Post) => void;
}

export default function SearchOverlay({ isOpen, onClose, allPosts, onSelectPost, searchQuery, setSearchQuery }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Auto-focus input when opened — works on mobile too
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (searchQuery.length < 1) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const cleanTagQuery = lowerQuery.startsWith('#') ? lowerQuery.slice(1) : lowerQuery;

    return allPosts.filter(p =>
      !p.isAd && (
        p.title.toLowerCase().includes(lowerQuery) ||
        (p.regency?.name && p.regency.name.toLowerCase().includes(lowerQuery)) ||
        p.tagline.toLowerCase().includes(lowerQuery) ||
        (p.venue && p.venue.toLowerCase().includes(lowerQuery)) ||
        (p.hashtags && p.hashtags.some((h: any) => h.name.toLowerCase().includes(cleanTagQuery)))
      )
    ).slice(0, 8);
  }, [searchQuery, allPosts]);

  const popularPosts = useMemo(() => {
    return [...allPosts].filter(p => !p.isAd).sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 5);
  }, [allPosts]);

  return (
    <div className={`fixed inset-0 z-[999] flex flex-col transition-all duration-400 ease-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      {/* Fullscreen white container - slides down from top */}
      <div className={`relative flex flex-col h-full bg-white transition-transform duration-400 ease-out ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>

        {/* Search Input Bar */}
        <div className="shrink-0 flex items-center gap-3 px-5 bg-white border-b-2 border-amber-500 pt-[max(20px,env(safe-area-inset-top))] pb-6">
          <div className="text-amber-600 shrink-0"><SearchIcon size={20} color="currentColor" /></div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search destinations, districts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-800 py-2 font-semibold placeholder:text-zinc-400"
          />
          <Link
            href={pathname === '/' ? '/' : pathname}
            onClick={(e) => { e.preventDefault(); onClose(); }}
            className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0 appearance-none outline-none cursor-pointer active:scale-90 hover:bg-zinc-200 transition-all [touch-action:manipulation]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Link>
        </div>

        {/* Results area — fills remaining height */}
        <div className="flex-1 overflow-y-auto bg-zinc-50">
          {/* STATE: HAS RESULTS */}
          {searchQuery.length >= 1 && results.length > 0 && (
            <div className="p-4 lg:p-8">
              <p className="px-2 pb-4 text-[10px] font-black tracking-widest text-zinc-400 uppercase">Results</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
                {results.map(post => (
                  <button
                    key={post.id}
                    className="relative group overflow-hidden rounded-[24px] aspect-[3/4] bg-white border border-black/5 appearance-none outline-none text-left cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-sm"
                    onClick={() => { onSelectPost(post); onClose(); }}
                  >
                    {post.images[0]?.type === 'VIDEO' ? (
                      <video src={post.images[0].url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" playsInline muted loop autoPlay preload="metadata" />
                     ) : (
                      <img 
                        src={post.images[0]?.url || ''} 
                        alt="" 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                      />
                    )}
                    
                    {/* Gradient Overlay */}
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
            </div>
          )}

          {/* STATE: NO RESULTS */}
          {searchQuery.length >= 1 && results.length === 0 && (
            <div className="px-8 py-20 text-center">
              <p className="text-sm text-zinc-400 font-semibold">No results found for &quot;{searchQuery}&quot;</p>
            </div>
          )}

          {/* STATE: EMPTY QUERY — show top 5 popular */}
          {searchQuery.length === 0 && (
            <div className="p-5 lg:p-10">
              <div className="mb-6 flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Most Popular
                </h3>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Trending now</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {popularPosts.map((post, i) => (
                  <button 
                  key={post.id} 
                  onClick={() => { onSelectPost(post); onClose(); }}
                  className="w-full flex items-center gap-4 py-3 px-2 rounded-2xl bg-transparent transition-all group active:scale-[0.98]"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-100 border border-black/[0.03]">
                    {post.images?.[0] ? (
                      post.images[0].type === 'VIDEO' ? (
                        <video src={post.images[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" playsInline muted loop autoPlay preload="metadata" />
                      ) : (
                        <img src={post.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">#{post.hashtags?.[0]?.name || 'Untagged'}</span>
                    </div>
                    <h3 className="text-[13px] font-bold text-zinc-900 truncate tracking-tight">{post.title}</h3>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{post.regency?.name || 'Bali'}</p>
                  </div>
                    <div className="flex items-center gap-1.5 shrink-0 bg-zinc-100/50 px-3 py-1.5 rounded-full">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#f43f5e" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      <span className="text-[11px] font-black text-zinc-900">{post.likes ?? 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
