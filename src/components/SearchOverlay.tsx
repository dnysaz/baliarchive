'use client';

import React, { useMemo } from 'react';

const SearchIcon = ({ size = 14, color = "white" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);

interface Image {
  id: number;
  url: string;
}

interface Post {
  id: number;
  kabupaten: string;
  province: string;
  category: string;
  title: string;
  tagline: string;
  likes: string;
  bestTime: string;
  howToGet: string;
  cost: string;
  body: string;
  venue?: string | null;
  images: Image[];
}

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
    if (searchQuery.length < 2) return [];
    return allPosts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.venue && p.venue.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [searchQuery, allPosts]);

  return (
    <div className={`fixed inset-0 z-[400] transition-all duration-500 ease-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
      {/* Blur Background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative mt-[max(12px,env(safe-area-inset-top))] mx-3 lg:mx-auto lg:max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${isOpen ? 'translate-y-0' : '-translate-y-10'}`}>
        <div className="relative border-b border-black/[.07] flex items-center">
          <div className="pl-4 text-gray-400"><SearchIcon size={18} color="currentColor" /></div>
          <input 
            type="text" 
            placeholder="Search destinations, districts…" 
            autoFocus={isOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[16px] text-[#111] py-5 px-3"
          />
          <button 
            className="mr-3 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 appearance-none outline-none cursor-pointer pointer-events-auto active:scale-95 transition-transform"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); setSearchQuery(''); }}
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Autocomplete Results */}
          {searchQuery.length >= 2 && results.length > 0 && (
            <div className="border-b border-black/[.05]">
              <p className="px-5 pt-4 pb-2 text-[9px] font-extrabold uppercase tracking-widest text-amber-600">Search Results</p>
              {results.map(post => (
                <button 
                  key={post.id} 
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-zinc-50 text-left transition-colors cursor-pointer active:bg-zinc-100"
                  onPointerDown={() => { onSelectPost(post); onClose(); }}
                >
                  <img src={post.images[0].url} className="w-12 h-12 rounded-lg object-cover bg-zinc-100 pointer-events-none" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{post.title}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{post.kabupaten}</p>
                  </div>
                  <SearchIcon size={14} color="#d1d5db" />
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && results.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-zinc-400 font-medium">No destinations found for "{searchQuery}"</p>
            </div>
          )}

          {/* Popular Suggestions */}
          <div className="px-5 py-6">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 mb-4">Most Popular</p>
            <div className="flex flex-wrap gap-2">
              {['Kelingking Cliff', 'Tirta Empul', 'Monkey Forest', 'Tanah Lot', 'Amed', 'Kintamani', 'Nusa Penida', 'Ubud'].map(tag => (
                <button 
                  key={tag} 
                  className="px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-100 hover:bg-amber-100 appearance-none outline-none cursor-pointer pointer-events-auto active:scale-95 transition-transform"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setSearchQuery(tag); }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
