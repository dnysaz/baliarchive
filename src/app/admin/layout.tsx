'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const SidebarItem = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-zinc-800 text-white shadow-sm' 
        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
      {icon}
    </div>
    <span className="font-medium text-[13px] tracking-tight">{label}</span>
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-zinc-700">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold text-lg">W</div>
            <div>
              <h1 className="font-bold text-white text-[13px] tracking-tight leading-none uppercase">Wiki Bali</h1>
              <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mt-1">Management</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          <nav className="space-y-1">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3 px-3">Main Menu</p>
            <SidebarItem 
              href="/admin" 
              active={pathname === '/admin'} 
              label="Dashboard" 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} 
            />
            <SidebarItem 
              href="/admin/posts" 
              active={pathname === '/admin/posts' || (pathname.startsWith('/admin/posts') && pathname !== '/admin/posts/new')} 
              label="Destinations" 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>} 
            />
            <SidebarItem 
              href="/admin/posts/new" 
              active={pathname === '/admin/posts/new'} 
              label="Add New Post" 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>} 
            />
          </nav>

          <nav className="space-y-1">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-3 px-3">Settings</p>
            <SidebarItem 
              href="/admin/locations" 
              active={pathname.startsWith('/admin/locations')} 
              label="Regencies" 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>} 
            />
            <SidebarItem 
              href="/admin/hashtags" 
              active={pathname.startsWith('/admin/hashtags')} 
              label="Hashtags" 
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>} 
            />
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-[10px]">
              {session?.user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-zinc-200 truncate">{session?.user?.name || 'Admin'}</p>
              <p className="text-[9px] text-zinc-500 font-medium truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-[10px] rounded-lg transition-all border border-zinc-800 flex items-center justify-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
