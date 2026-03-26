'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const SidebarItem = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
        : 'text-zinc-500 hover:bg-black/5 hover:text-zinc-800'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-zinc-400 group-hover:text-amber-500'} transition-colors`}>
      {icon}
    </div>
    <span className={`text-[14px] ${active ? 'font-semibold' : 'font-medium'} tracking-tight`}>{label}</span>
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex h-screen bg-zinc-100 text-zinc-800 overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-black/5 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">W</div>
            <div>
              <h1 className="font-bold text-zinc-800 text-base tracking-tight leading-none">Wiki Bali</h1>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-widest mt-1">Management</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest mb-3 px-4">Overview</p>
            <SidebarItem 
              href="/admin" 
              active={pathname === '/admin'} 
              label="Dashboard" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} 
            />
          </nav>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest mb-3 px-4">Content</p>
            <SidebarItem 
              href="/admin/posts" 
              active={pathname === '/admin/posts' || (pathname.startsWith('/admin/posts') && pathname !== '/admin/posts/new')} 
              label="Destinations" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>} 
            />
            <SidebarItem 
              href="/admin/posts/new" 
              active={pathname === '/admin/posts/new'} 
              label="Upload Content" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>} 
            />
          </nav>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest mb-3 px-4">Database</p>
            <SidebarItem 
              href="/admin/locations" 
              active={pathname.startsWith('/admin/locations')} 
              label="Regencies" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} 
            />
            <SidebarItem 
              href="/admin/hashtags" 
              active={pathname.startsWith('/admin/hashtags')} 
              label="Hashtags" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>} 
            />
          </nav>
        </div>

        <div className="p-6 border-t border-black/5 bg-black/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-600 text-sm">
              {session?.user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-800 truncate">{session?.user?.name || 'Admin'}</p>
              <p className="text-xs text-zinc-500 font-medium truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full py-2.5 bg-black/5 hover:bg-red-500/10 hover:text-red-500 text-zinc-500 font-semibold text-xs rounded-lg transition-all border border-transparent hover:border-red-500/20 flex items-center justify-center gap-2"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 p-8 lg:p-12 scrollbar-thin scrollbar-thumb-zinc-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
