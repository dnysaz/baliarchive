'use client';

import React, { useMemo } from 'react';
import type { Prisma } from '@prisma/client';

const SearchIcon = ({ size = 14, color = "white" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);

type Post = Prisma.PostGetPayload<{ include: { images: true } }>;

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allPosts: Post[];
  onSelectPost: (post: Post) => void;
}

export default function SearchOverlay({ isOpen, onClose, searchQuery, setSearchQuery, allPosts, onSelectPost }: SearchOverlayProps) {
  const results = useMemo(() => {
    if (searchQuery.length < 1) return [];
    return allPosts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.venue && p.venue.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8);
  }, [searchQuery, allPosts]);

  return (
    <div className={`fixed inset-0 z-[999] transition-all duration-500 ease-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      {/* Blur Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`relative mt-[max(12px,env(safe-area-inset-top))] mx-3 lg:mx-auto lg:max-w-lg bg-white border border-black/10 rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 ${isOpen ? 'translate-y-0' : '-translate-y-10'}`}>
        <div className="relative border-b border-black/5 flex items-center bg-black/5">
          <div className="pl-6 text-amber-600"><SearchIcon size={22} color="currentColor" /></div>
          <input 
            type="text" 
            placeholder="Search destinations, districts…" 
            autoFocus={isOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-lg text-zinc-800 py-7 px-5 font-semibold placeholder:text-zinc-400"
          />
          <button 
            className="mr-6 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-zinc-500 appearance-none outline-none cursor-pointer active:scale-90 transition-transform hover:bg-black/10"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); setSearchQuery(''); }}
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto no-scrollbar bg-zinc-50">
          {/* STATE: HAS SEARCH QUERY & RESULTS */}
          {searchQuery.length >= 1 && results.length > 0 && (
            <div className="divide-y divide-black/5">
              <p className="px-6 pt-5 pb-2 text-xs font-semibold tracking-wider text-amber-600/60">Search Results</p>
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
                    <p className="text-base font-bold text-zinc-800 truncate group-hover:text-amber-600 transition-colors">{post.title}</p>
                    <p className="text-sm text-zinc-500 font-medium mt-1">{post.kabupaten}</p>
                  </div>
                  <div className="text-zinc-400 group-hover:text-amber-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STATE: HAS SEARCH QUERY & NO RESULTS */}
          {searchQuery.length >= 1 && results.length === 0 && (
            <div className="px-8 py-16 text-center">
              <p className="text-sm text-zinc-500 font-semibold">No results found</p>
            </div>
          )}

          {/* STATE: NO SEARCH QUERY (SHOW SUGGESTIONS) */}
          {searchQuery.length === 0 && (
            <div className="p-6">
              <p className="text-xs font-semibold tracking-wider text-amber-600/60 mb-4">Popular Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {['Kelingking Cliff', 'Tirta Empul', 'Monkey Forest', 'Tanah Lot', 'Amed', 'Kintamani', 'Nusa Penida', 'Ubud'].map(tag => (
                  <button 
                    key={tag} 
                    className="px-4 py-2 rounded-lg bg-black/5 text-zinc-800 text-sm font-semibold border border-black/10 hover:bg-black/10 hover:border-amber-600/50 hover:text-amber-600 appearance-none outline-none cursor-pointer pointer-events-auto active:scale-95 transition-all"
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setSearchQuery(tag); }}
                  >
                    {tag}
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
