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
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const regencyCount = kabupatens.filter(k => k.name !== 'All').length;

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
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

  return (
    <div
      ref={drawerRef} className={`font-sans fixed top-0 right-0 bottom-0 z-[300] w-80 bg-white text-black border-l border-black/[.06] flex flex-col shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[.07] pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs font-semibold tracking-wider text-amber-600 mb-1">BaliArchive</p>
          <h2 className="text-2xl font-bold text-zinc-900 leading-none">{regencyCount} Regencies</h2>
        </div>
        <button 
          className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-zinc-500 appearance-none outline-none cursor-pointer pointer-events-auto active:scale-90 transition-transform hover:bg-black/10"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {kabupatens.map(kab => (
          <button 
            key={kab.name}
            className={`flex items-center justify-between px-6 py-3.5 w-full text-left appearance-none outline-none transition-colors cursor-pointer pointer-events-auto active:bg-amber-50/50 ${activeKab === kab.name ? 'bg-amber-50 border-l-4 border-amber-500' : 'hover:bg-zinc-50'}`}
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveKab(kab.name); onClose(); }}
          >
            <div className="flex items-center gap-4 pointer-events-none">
              <div className="p-2.5 bg-amber-100/50 rounded-lg"><PuraIcon /></div>
              <div>
                <p className="text-base font-bold text-zinc-800">{kab.name}</p>
                <p className="text-sm text-zinc-400 font-medium">Explore Destinations</p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md pointer-events-none">{kab.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
