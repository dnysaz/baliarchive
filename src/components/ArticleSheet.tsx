'use client';

import React, { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

import type { Prisma } from '@prisma/client';

type Post = Prisma.PostGetPayload<{ include: { images: true, location: true, hashtags: true } }>;

interface ArticleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onFilter: (type: 'regency' | 'tag', value: string) => void;
}

export default function ArticleSheet({ isOpen, onClose, post, onFilter }: ArticleSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const guidePdfUrl = post?.guidePdfUrl?.trim() || null;
  const lemonSqueezyUrl = (post as any)?.lemonSqueezyUrl?.trim() || null;
  // Paid guide takes priority; free PDF is shown only if no paid link exists
  const hasPaidGuide = !!lemonSqueezyUrl;
  const hasFreeGuide = !!guidePdfUrl && !hasPaidGuide;

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

  // Track views when opened
  useEffect(() => {
    if (isOpen && post?.id) {
      fetch(`/api/posts/${post.id}/view`, { method: 'POST' }).catch(console.error);
    }
  }, [isOpen, post?.id]);

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
      className={`font-sans fixed bottom-0 left-0 right-0 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-2xl z-[300] bg-white text-black rounded-t-[32px] shadow-[0_-10px_60px_rgba(0,0,0,0.25)] max-h-[94vh] flex flex-col overscroll-y-contain transition-transform duration-500 ease-out ${isOpen && post ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
    >
      {/* Drag handle */}
      <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mt-4 mb-1 shrink-0 cursor-grab flex-shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0 flex-shrink-0">
        <span className="text-[8px] font-black tracking-[0.15em] text-zinc-400 normal-case">BaliArchive Guide</span>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95 transition-all outline-none cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Content — only render when post exists */}
      {post && (
        <div id="sheet-content" className="flex-1 min-h-0 overflow-y-auto px-6 pb-20 pt-1 lg:px-10 scroll-smooth">
          <div className="mb-7">
            <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
              <button 
                onClick={() => post.location?.name && onFilter('regency', post.location.name)}
                className="text-[12px] font-black text-amber-600 tracking-tighter normal-case hover:underline active:scale-95 transition-all text-left"
              >
                {post.location?.name || post.kabupaten}
              </button>
              {(post as any).hashtags?.map((hash: any, i: number) => (
                <React.Fragment key={hash.id || i}>
                  <span className="w-0.5 h-0.5 bg-zinc-200 rounded-full" />
                  <button 
                    onClick={() => onFilter('tag', hash.name)}
                    className="text-[12px] font-bold text-zinc-400 tracking-tighter normal-case hover:text-zinc-600 hover:underline active:scale-95 transition-all text-left"
                  >
                    #{hash.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-xl md:text-2xl font-black leading-[1.05] text-zinc-900 tracking-tight mb-3.5">
              {post.title}
            </h1>
            <div className="h-0.5 w-6 bg-amber-500/20 rounded-full mb-3.5" />
            <p className="text-xs md:text-sm font-medium text-zinc-500 leading-relaxed italic">
              &ldquo;{post.tagline}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-7">
            <div className="bg-zinc-50/50 px-4 py-3 rounded-[16px] border border-black/[0.01]">
              <p className="text-[8px] font-black text-zinc-400 tracking-tight mb-0.5 normal-case">Best time</p>
              <p className="text-[8px] font-medium text-zinc-800 leading-tight">{post.bestTime}</p>
            </div>
            <div className="bg-zinc-50/50 px-4 py-3 rounded-[16px] border border-black/[0.01]">
              <p className="text-[8px] font-black text-zinc-400 tracking-tight mb-0.5 normal-case">Entrance</p>
              <p className="text-[8px] font-medium text-zinc-800 leading-tight">{post.cost}</p>
            </div>
            <div className="col-span-2 bg-zinc-50/50 px-4 py-3 rounded-[16px] border border-black/[0.01]">
              <p className="text-[8px] font-black text-zinc-400 tracking-tight mb-0.5 normal-case">Access</p>
              <p className="text-[8px] font-medium text-zinc-800 leading-normal">{post.howToGet}</p>
            </div>
          </div>

          <div
            className="prose prose-zinc max-w-none prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:text-[11px] prose-headings:text-zinc-900 prose-headings:font-black prose-img:rounded-lg prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-amber-500/20 prose-blockquote:bg-zinc-50/50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:italic"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.body || '')
            }}
          />          {/* Paid Guide: LemonSqueezy Buy Button */}
          {hasPaidGuide && (
            <div className="mt-12 bg-amber-50/40 rounded-[32px] p-6 sm:p-8 border border-amber-200/50 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="flex-1 flex flex-col items-start leading-none">
                  <span className="mb-3 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest">Premium Guide</span>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight mb-2">
                    Unlock the deep {post.title} insider&apos;s experience
                  </h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[280px]">
                    Exclusive routes, local etiquette, and hidden spots curated for the curious traveler.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-5">
                  {post.guidePrice && (
                    <div className="flex items-center gap-2 sm:justify-end leading-none">
                      <span className="text-[14px] font-medium text-amber-900/60">Price</span>
                      <span className="px-2.5 py-1.5 bg-white border border-amber-200 rounded-xl text-base font-bold text-zinc-900 tracking-tighter shadow-sm">
                        {post.guidePrice}
                      </span>
                    </div>
                  )}
                  <a
                    href={lemonSqueezyUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4.5 bg-amber-500 text-white rounded-2xl text-[11px] font-black hover:bg-amber-600 active:scale-95 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 group whitespace-nowrap"
                  >
                    <span>Buy Premium Guide</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Free Guide: Direct PDF Download */}
          {hasFreeGuide && (
            <div className="mt-12 bg-zinc-50 border border-black/[0.03] rounded-[32px] p-6 sm:p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="flex-1 flex flex-col items-start leading-none">
                  <span className="mb-3 px-2 py-0.5 bg-zinc-900 text-white text-[8px] font-black rounded-full uppercase tracking-widest">Free Guide</span>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight mb-2">
                    Unlock the deep {post.title} insider&apos;s experience
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[280px]">
                    Exclusive routes, local etiquette, and hidden spots curated for the curious traveler.
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href={guidePdfUrl!}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4.5 bg-zinc-900 text-white rounded-2xl text-[11px] font-black hover:bg-black active:scale-95 transition-all shadow-xl shadow-zinc-900/30 flex items-center justify-center gap-2.5 group whitespace-nowrap"
                  >
                    <span>Download Free Guide</span>
                    <svg className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {(post as any).googleMapsUrl && (
            <div className="mt-6 bg-blue-50/30 rounded-[24px] border border-blue-100/50 overflow-hidden flex flex-col">
              {/* Interactive Iframe Map */}
              <div className="w-full h-[250px] sm:h-[300px] relative bg-zinc-100 pointer-events-auto">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    post.venue || post.title
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full"
                  title={`Map showing ${post.title}`}
                />
              </div>

              {/* Bottom Actions */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-5 h-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center leading-none">
                    <span className="text-sm font-black text-zinc-900 tracking-tight block">
                      View Location
                    </span>
                    <span className="text-[10px] text-zinc-500 block -mt-[1px]">
                      Open pinning directly in Google Maps
                    </span>
                  </div>
                </div>
                <a
                  href={(post as any).googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 text-center sm:w-auto w-full flex items-center justify-center gap-2 group"
                >
                  <span>Open Maps</span>
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="mt-8 pt-6 border-t border-black/[0.04] flex items-center justify-between px-1">
            <p className="text-[6px] font-medium text-gray-400">
              Posted {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            {new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime() + 60000 && (
              <p className="text-[6px] font-medium text-gray-400 text-right">
                Updated {new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
