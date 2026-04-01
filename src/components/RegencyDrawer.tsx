'use client';

import React from 'react';
import Link from 'next/link';

const PuraIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="13" y="22" width="6" height="6" rx=".5" />
    <path d="M8 22h16M10 18h12M12 14h8M14 10h4M16 6v4" />
  </svg>
);

import type { Prisma } from '@prisma/client';

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true, regency: true } }>;

interface Regency {
  name: string;
  count: number;
}

interface RegencyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeKab: string | null;
  setActiveKab: (name: string | null) => void;
  regencies: Regency[];
  ads?: Post[];
  onSelectAd?: (post: Post) => void;
}

export default function RegencyDrawer({ isOpen, onClose, activeKab, setActiveKab, regencies, ads = [], onSelectAd }: RegencyDrawerProps) {
  const regencyCount = regencies.filter(k => k.name !== 'All').length;

  const [displayAd, setDisplayAd] = React.useState<Post | null>(null);
  // scroll persistence
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const saveTimer = React.useRef<number | null>(null);
  const STORAGE_KEY = 'explore:scroll';

  const saveScroll = (pos?: number) => {
    if (typeof window === 'undefined') return;
    const value = typeof pos === 'number' ? pos : scrollRef.current?.scrollTop || 0;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(value));
    } catch (e) {
      // ignore
    }
  };

  const handleScroll = () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    // debounce write
    // @ts-ignore - window.setTimeout returns number in browser
    saveTimer.current = window.setTimeout(() => {
      saveScroll();
      saveTimer.current = null;
    }, 120);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;
    // restore
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const pos = stored ? parseInt(stored, 10) : 0;
    if (scrollRef.current && pos > 0) {
      // restore after a tick to ensure content rendered
      requestAnimationFrame(() => {
        try { scrollRef.current!.scrollTo({ top: pos }); } catch (e) { /* ignore */ }
      });
    }

    return () => {
      // save on unmount
      saveScroll();
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [isOpen]);
  const closedRef = React.useRef(false);
  const handleClose = (e?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
    // Reset after transition
    setTimeout(() => { closedRef.current = false; }, 500);
  };

  React.useEffect(() => {
    if (isOpen && ads && ads.length > 0) {
      setDisplayAd(ads[Math.floor(Math.random() * ads.length)]);
    }
  }, [isOpen, ads]);

  return (
    <div className={`font-sans fixed inset-0 z-[600] bg-zinc-50 flex flex-col transition-all duration-500 ease-out ${isOpen ? 'translate-y-0 opacity-100 visible pointer-events-auto' : 'translate-y-full opacity-0 invisible pointer-events-none'}`}>
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 bg-white border-b-2 border-amber-500 pt-[max(24px,env(safe-area-inset-top))] pb-6 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">Explore by Region</h1>
          <p className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-amber-500">{regencyCount} {regencyCount === 1 ? 'Regency' : 'Regencies'} Available</p>
        </div>
        <button 
          type="button"
          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 active:scale-95 transition-all outline-none cursor-pointer [touch-action:manipulation]"
          onClick={handleClose}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') handleClose(e as any); }}
          aria-label="Close explore"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Grid Content */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {regencies.map(kab => (
              /* Card = Link ke halaman regency */
              <div key={kab.name} className="relative group">
                <Link
                  href={`/${kab.name.toLowerCase()}`}
                  className={`relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm flex flex-col items-start hover:shadow-md hover:shadow-amber-500/10 active:scale-[0.98] transition-all duration-300 text-left block w-full ${activeKab === kab.name ? 'ring-2 ring-amber-500 bg-amber-50/30' : ''}`}
                >
                  <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center group-hover:bg-amber-100 transition-colors mb-3">
                    <PuraIcon />
                  </div>
                  <div className="text-left w-full">
                    <h3 className="text-lg font-black text-zinc-900 mb-1 truncate">{kab.name}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">{kab.count} {kab.count === 1 ? 'place' : 'places'}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-amber-500">
                    <span className="text-[10px] font-black uppercase tracking-widest">View Profile</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>

                {/* Filter feed button — pojok kanan atas */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveKab(kab.name); onClose(); }}
                  className="absolute top-3 right-3 w-7 h-7 rounded-xl bg-zinc-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
                  title={`Filter by ${kab.name}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectAd && onSelectAd(displayAd); }}
            >
              <div className="w-24 sm:w-32 bg-gray-100 shrink-0 relative overflow-hidden h-full">
                {displayAd.images?.[0] ? (
                  displayAd.images[0].type === 'VIDEO' ? (
                    <video src={displayAd.images[0].url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
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
