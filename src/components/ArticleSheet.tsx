'use client';

import React, { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

import type { Prisma } from '@prisma/client';

type Post = Prisma.PostGetPayload<{ include: { images: true } }>;

interface ArticleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

export default function ArticleSheet({ isOpen, onClose, post }: ArticleSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const guidePdfUrl = post?.guidePdfUrl?.trim() || null;

  // Initialize likes and states from post and local storage
  useEffect(() => {
    if (!post) return;

    // eslint/react rule: avoid setState synchronously inside effect.
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]') as number[];
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]') as number[];

    queueMicrotask(() => {
      setLikesCount(post.likes);
      setIsLiked(likedPosts.includes(post.id));
      setIsSaved(savedPosts.includes(post.id));
    });
  }, [post]);

  const handleLike = async () => {
    if (!post || isLiked) return;

    try {
      const res = await fetch(`/api/posts/${post.id}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes);
        setIsLiked(true);
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, post.id]));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleSave = async () => {
    if (!post || isSaved) return;

    try {
      const res = await fetch(`/api/posts/${post.id}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save' }),
      });

      if (res.ok) {
        setIsSaved(true);
        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        localStorage.setItem('savedPosts', JSON.stringify([...savedPosts, post.id]));
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Drag to close
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !isOpen) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#sheet-content')) {
          isDragging = false;
          return;
      }
      startY = e.touches[0].clientY;
      isDragging = true;
      sheet.style.transition = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        sheet.style.transform = `translateY(${diff}px)`;
      }
    };

    const onTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      sheet.style.transition = 'transform 0.5s ease-out';
      const diff = currentY - startY;
      
      if (diff > 100) {
        onClose();
      } else {
        sheet.style.transform = 'translateY(0)';
      }
      startY = 0;
      currentY = 0;
    };

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', onTouchEnd);
    sheet.addEventListener('touchcancel', onTouchEnd);

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
      sheet.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isOpen, onClose]);


  return (
    <div
      ref={sheetRef}
      style={{ transform: isOpen && post ? 'translateY(0)' : 'translateY(100%)' }}
      className={`font-sans fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-2xl z-[300] bg-white text-black rounded-t-[40px] shadow-[0_-10px_60px_rgba(0,0,0,0.25)] max-h-[94vh] flex flex-col overscroll-y-contain transition-transform duration-500 ease-out ${
        isOpen && post ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Drag handle */}
      <div className="w-14 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 mb-2 shrink-0 cursor-grab" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[.05] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold  tracking-[0.2em] text-amber-600 mb-0.5">BaliArchive Guide</span>
            <div className="flex items-center gap-3">
               <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
               >
                 <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                 </svg>
                 <span className="text-xs font-bold tracking-tighter">{likesCount}</span>
               </button>
               <button 
                onClick={handleSave}
                className={`transition-all active:scale-90 ${isSaved ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'}`}
               >
                 <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                   <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
        <button
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-zinc-500 appearance-none outline-none cursor-pointer active:scale-90 transition-transform hover:bg-black/10"
          onClick={onClose}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Content — only render when post exists */}
      {post && (
        <div id="sheet-content" className="flex-1 overflow-y-auto px-8 pb-32 pt-8 lg:px-12 scroll-smooth">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black  tracking-wider rounded-md">
                {post.kabupaten}
              </span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="text-[10px] font-bold text-zinc-400  tracking-widest">
                {post.category}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black leading-[1.1] text-zinc-900 tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg font-medium text-zinc-500 leading-relaxed italic">
              &ldquo;{post.tagline}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-zinc-50/80 border border-black/[0.03] p-5 rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <p className="text-[10px] font-black text-zinc-400  tracking-widest mb-1">Best Time</p>
              <p className="text-sm font-bold text-zinc-800">{post.bestTime}</p>
            </div>
            <div className="bg-zinc-50/80 border border-black/[0.03] p-5 rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-emerald-500 font-bold text-lg">Rp</span>
              </div>
              <p className="text-[10px] font-black text-zinc-400  tracking-widest mb-1">Entrance Cost</p>
              <p className="text-sm font-bold text-zinc-800">{post.cost}</p>
            </div>
            <div className="bg-zinc-50/80 border border-black/[0.03] p-6 rounded-3xl col-span-2 group hover:bg-white hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400  tracking-widest mb-1">How to Get There</p>
                  <p className="text-sm font-bold text-zinc-800 leading-relaxed">{post.howToGet}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="prose prose-zinc max-w-none prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:text-base prose-headings:text-zinc-900 prose-headings:font-black prose-img:rounded-3xl"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body || '') }}
          />

          {guidePdfUrl && (
            <div className="mt-16 bg-zinc-950 text-white rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-amber-500/20 transition-all duration-700" />
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-3 text-white tracking-tight leading-tight">
                  Unlock the Full <br/><span className="text-amber-400">Bali Insider&apos;s Experience</span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-[280px]">
                  Detailed routes, cultural etiquette, and hidden gems curated by local experts.
                </p>
                <a href={guidePdfUrl} download target="_blank" rel="noopener noreferrer" className="w-full block text-center py-4 bg-amber-500 rounded-2xl text-sm font-black text-zinc-950 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer shadow-2xl shadow-amber-500/20">
                  DOWNLOAD GUIDE — Rp. {post.guidePrice}
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
