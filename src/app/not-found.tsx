'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-amber-500 rounded-[32%_68%_55%_45%_/_52%_33%_67%_48%] flex items-center justify-center text-white font-black text-4xl mx-auto mb-10 shadow-2xl shadow-amber-500/30">
          B
        </div>
        
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-4">You&apos;ve Drifted Away</h1>
        <p className="text-zinc-500 font-medium leading-relaxed mb-10 px-4">
          The page you are looking for doesn&apos;t exist in our current archive. 
          But don&apos;t worry, Bali has plenty more to explore.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-10 py-4 bg-zinc-900 text-white rounded-2xl text-[13px] font-black hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/10 tracking-tight"
        >
          Return to Archive
        </Link>
        
        <div className="mt-16 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
          Error 404 — Bali Archive
        </div>
      </div>
    </div>
  );
}
