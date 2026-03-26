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
  activeKab: string;
  setActiveKab: (name: string) => void;
  kabupatens: Kabupaten[];
}

export default function KabupatenDrawer({ isOpen, onClose, activeKab, setActiveKab, kabupatens }: KabupatenDrawerProps) {
  return (
    <div className={`fixed top-0 right-0 bottom-0 z-[300] w-80 bg-white text-black border-l border-black/[.06] flex flex-col shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-black/[.07] pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <p className="text-[9px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">BaliArchive</p>
          <h2 className="font-cormorant text-2xl font-bold text-zinc-900 leading-none">8 Regencies</h2>
        </div>
        <button 
          className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-gray-400 appearance-none outline-none cursor-pointer pointer-events-auto active:scale-95 transition-transform"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {kabupatens.map(kab => (
          <button 
            key={kab.name}
            className={`flex items-center justify-between px-6 py-4 w-full text-left appearance-none outline-none transition-colors cursor-pointer pointer-events-auto active:bg-amber-50/50 ${activeKab === kab.name ? 'bg-amber-50 border-l-4 border-amber-600' : 'hover:bg-zinc-50'}`}
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveKab(kab.name); onClose(); }}
          >
            <div className="flex items-center gap-4 pointer-events-none">
              <div className="p-2.5 bg-amber-100/50 rounded-xl"><PuraIcon /></div>
              <div>
                <p className="text-[15px] font-bold text-zinc-800">{kab.name}</p>
                <p className="text-[11px] text-zinc-400 font-medium tracking-tight">Explore Destinations</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg pointer-events-none">{kab.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
