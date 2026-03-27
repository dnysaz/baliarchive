'use client';

import React from 'react';

const PuraIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="13" y="22" width="6" height="6" rx=".5" />
    <path d="M8 22h16M10 18h12M12 14h8M14 10h4M16 6v4" />
  </svg>
);

interface Kabupaten {
  name: string;
  count: number;
}

interface KabupatenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeKab: string | null;
  setActiveKab: (name: string | null) => void;
  kabupatens: Kabupaten[];
}

export default function KabupatenDrawer({ isOpen, onClose, activeKab, setActiveKab, kabupatens }: KabupatenDrawerProps) {
  const regencyCount = kabupatens.filter(k => k.name !== 'All').length;

  return (
    <div className={`font-sans fixed inset-0 z-[300] bg-zinc-50 flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'}`}>
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 bg-white border-b border-black/[0.04] pt-[max(24px,env(safe-area-inset-top))] pb-5 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">Explore by Region</h1>
          <p className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-amber-500">{regencyCount} Regencies Available</p>
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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {kabupatens.map(kab => (
              <button 
                key={kab.name}
                className={`relative group overflow-hidden bg-white p-6 rounded-3xl border border-black/5 flex flex-col items-start hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98] transition-all duration-300 text-left outline-none cursor-pointer ${activeKab === kab.name ? 'ring-2 ring-amber-500 bg-amber-50/30' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveKab(kab.name); onClose(); }}
              >
                <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center group-hover:bg-amber-100 transition-colors mb-2">
                  <PuraIcon />
                </div>
                <div className="text-left w-full">
                  <h3 className="text-lg font-black text-zinc-900 drop-shadow-sm mb-1 truncate">{kab.name}</h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 tracking-widest uppercase">{kab.count} {kab.count === 1 ? 'place' : 'places'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
