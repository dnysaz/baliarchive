'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import type { Prisma } from '@prisma/client';

const SearchIcon = ({ size = 14, color = "white" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true } }>;

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allPosts: Post[];
  onSelectPost: (post: Post) => void;
}

export default function SearchOverlay({ isOpen, onClose, searchQuery, setSearchQuery, allPosts, onSelectPost }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened — works on mobile too
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (searchQuery.length < 1) return [];
    return allPosts.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.venue && p.venue.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8);
  }, [searchQuery, allPosts]);

  const popularPosts = useMemo(() => {
    return [...allPosts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 5);
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
          <button
            className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0 appearance-none outline-none cursor-pointer active:scale-90 hover:bg-zinc-200 transition-all"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); setSearchQuery(''); }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Results area — fills remaining height */}
        <div className="flex-1 overflow-y-auto bg-zinc-50">
          {/* STATE: HAS RESULTS */}
          {searchQuery.length >= 1 && results.length > 0 && (
            <div className="divide-y divide-black/5">
              <p className="px-6 pt-5 pb-2 text-xs font-black tracking-widest text-zinc-400 uppercase">Results</p>
              {results.map(post => (
                <button
                  key={post.id}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-black/5 text-left transition-all cursor-pointer active:bg-black/10 group"
                  onClick={() => { onSelectPost(post); onClose(); }}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-black/5 group-hover:border-amber-600/30 transition-colors">
                    {post.images[0] && <img src={post.images[0].url} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt="" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-800 truncate group-hover:text-amber-600 transition-colors">{post.title}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-1">{post.kabupaten}</p>
                  </div>
                  <div className="text-zinc-300 group-hover:text-amber-600 transition-colors shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
                  </div>
                </button>
              ))}
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
            <div className="p-5">
              <div className="flex flex-col gap-0.5">
                {popularPosts.map((post, i) => (
                  <button 
                  key={post.id} 
                  onClick={() => { onSelectPost(post); onClose(); }}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-100"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-100 border border-black/5">
                    {post.images?.[0] ? (
                      <img src={post.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                    <h3 className="text-sm font-bold text-zinc-900 truncate tracking-tight">{post.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">{post.kabupaten}</p>
                  </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      <span className="text-xs font-black text-zinc-400">{post.likes ?? 0}</span>
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
