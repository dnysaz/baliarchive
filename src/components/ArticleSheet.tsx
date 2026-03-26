'use client';

import React from 'react';

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

interface ArticleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

export default function ArticleSheet({ isOpen, onClose, post }: ArticleSheetProps) {
  // FIX: render the shell always so transition works correctly;
  // only bail on content when post is truly null AND not open
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[300] bg-white text-black rounded-t-[40px] shadow-[0_-10px_60px_rgba(0,0,0,0.25)] max-h-[94vh] flex flex-col transition-transform duration-500 ease-out ${
        isOpen && post ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'
      }`}
    >
      {/* Drag handle */}
      <div className="w-14 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-black/[.05] shrink-0">
        <span className="text-[10px] font-extrabold tracking-[.25em] uppercase text-amber-600">BaliArchive Guide</span>
        <button
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-gray-400 appearance-none outline-none cursor-pointer active:scale-95 transition-transform"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Content — only render when post exists */}
      {post && (
        <div className="flex-1 overflow-y-auto px-8 pb-24 pt-10 lg:px-16">
          <h1 className="font-cormorant text-[clamp(28px,7vw,42px)] font-bold leading-tight text-zinc-950 mb-4">
            {post.title}
          </h1>
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[.2em] italic border-l-4 border-amber-500 pl-4 mb-10">
            {post.tagline}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-zinc-50 p-5 rounded-2xl">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">Best Time</p>
              <p className="text-[14px] font-semibold text-zinc-700">{post.bestTime}</p>
            </div>
            <div className="bg-zinc-50 p-5 rounded-2xl">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">Estimated Cost</p>
              <p className="text-[14px] font-semibold text-zinc-700">{post.cost}</p>
            </div>
            <div className="bg-zinc-50 p-5 rounded-2xl md:col-span-2">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">How to Get There</p>
              <p className="text-[14px] font-semibold text-zinc-700 leading-relaxed">{post.howToGet}</p>
            </div>
          </div>

          <div
            id="sheet-content"
            className="prose prose-zinc max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body || '' }}
          />

          <div className="mt-16 bg-zinc-950 text-white rounded-[32px] p-10">
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-400 mb-3">Premium Hospitality Insight</p>
            <h3 className="font-cormorant text-3xl font-bold mb-4">The Bali Insider&apos;s Guide</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-8">
              Access hidden routes, detailed Pura etiquette, and local language tips curated by Balinese cultural experts.
            </p>
            <button className="w-full py-5 bg-amber-600 rounded-2xl text-[11px] font-extrabold tracking-[.2em] uppercase hover:bg-amber-700 active:scale-95 transition-all cursor-pointer">
              Download Guide — $15
            </button>
          </div>
        </div>
      )}
    </div>
  );
}