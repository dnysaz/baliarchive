'use client';

import React from 'react';
import type { Prisma } from '@prisma/client';

const SaveIcon = ({ saved, size = 20 }: { saved: boolean, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? '#f59e0b' : 'none'} stroke={saved ? '#f59e0b' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

type Post = Prisma.PostGetPayload<{ include: { images: true } }>;

interface SavedPageProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosts: Post[];
  onOpenPost: (post: Post) => void;
}

export default function SavedPage({ isOpen, onClose, savedPosts, onOpenPost }: SavedPageProps) {
  return (
    <div className={`font-sans fixed inset-0 z-[300] bg-white text-black flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
      <div className="shrink-0 flex items-center gap-4 px-6 border-b border-black/[.07] pt-[max(20px,env(safe-area-inset-top))] pb-5">
        <button 
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-zinc-500 appearance-none outline-none cursor-pointer pointer-events-auto active:scale-95 transition-transform"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-0.5">BaliArchive</p>
          <h1 className="font-cormorant text-2xl font-bold leading-tight text-zinc-950">Saved Destinations</h1>
        </div>
        <span className="ml-auto text-xs font-bold text-zinc-300">{savedPosts.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 lg:p-10 bg-zinc-50">
        <div className="max-w-3xl mx-auto">
          {savedPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedPosts.map(post => (
                <button 
                  key={post.id} 
                  className="relative group overflow-hidden rounded-[24px] aspect-[3/4] appearance-none outline-none text-left cursor-pointer pointer-events-auto active:scale-[0.98] transition-transform"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onOpenPost(post); }}
                >
                  <img src={post.images[0].url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-4 pointer-events-none">
                    <div>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1">{post.kabupaten}</p>
                      <p className="text-xs text-white font-bold leading-tight line-clamp-2">{post.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 gap-4 text-zinc-300">
              <SaveIcon saved={false} size={64} />
              <p className="text-base font-medium text-center leading-relaxed">Your list is empty.<br /><span className="text-sm opacity-50">Tap the bookmark to save your next adventure.</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
