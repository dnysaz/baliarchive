'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const SidebarItem = ({ href, icon, label, active, badge }: { href: string; icon: React.ReactNode; label: string; active: boolean; badge?: number }) => (
  <Link
    href={href}
    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
        : 'text-zinc-500 hover:bg-black/5 hover:text-zinc-800'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`${active ? 'text-white' : 'text-zinc-400 group-hover:text-amber-500'} transition-colors`}>
        {icon}
      </div>
      <span className={`text-[14px] ${active ? 'font-semibold' : 'font-medium'} tracking-tight`}>{label}</span>
    </div>
    {badge !== undefined && badge > 0 && !active && (
      <div className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
        {badge > 99 ? '99+' : badge}
      </div>
    )}
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [messageCount, setMessageCount] = React.useState<number>(0);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/messages/count');
        const data = await res.json();
        if (data.count !== undefined) setMessageCount(data.count);
      } catch (e) {
        console.error('Failed to fetch count');
      }
    };

    fetchCount();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  // Block access if mobile
  if (mounted && isMobile) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8 text-center font-sans">
        <div className="max-w-xs w-full animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-8 shadow-xl shadow-amber-500/30">B</div>
          <h1 className="text-xl font-black text-white leading-tight mb-4 tracking-tight">Desktop Access Required</h1>
          <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-10 px-4">
            Bali Archive Dashboard is optimized for larger screens to ensure Content Management precision. 
            Please log in from a desktop or laptop device.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-white/10 text-white rounded-xl text-[11px] font-bold hover:bg-white/20 transition-all active:scale-95">
            Back to Public View
          </Link>
          <div className="mt-12 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            Bali Archive Dashboard
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100 text-zinc-800 overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-black/5 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 active:scale-95 transition-transform"
            suppressHydrationWarning
          >
            <div 
              className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20"
              suppressHydrationWarning
            >
              {mounted ? 'B' : '...'}
            </div>
            <div suppressHydrationWarning>
              <h1 className="font-bold text-zinc-800 text-base tracking-tight leading-none" suppressHydrationWarning>
                {mounted ? 'Bali Archive' : 'Loading...'}
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Management</p>
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
            <SidebarItem 
              href="/admin/ads" 
              active={pathname === '/admin/ads' || (pathname.startsWith('/admin/ads') && pathname !== '/admin/ads/new')} 
              label="Advertisements" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>} 
            />
            <SidebarItem 
              href="/admin/ads/new" 
              active={pathname === '/admin/ads/new'} 
              label="Upload Ad" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>} 
            />
          </nav>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest mb-3 px-4">Database</p>
            <SidebarItem 
              href="/admin/regencies" 
              active={pathname.startsWith('/admin/regencies')} 
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

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest mb-3 px-4">Interactions</p>
            <SidebarItem 
              href="/admin/messages" 
              active={pathname.startsWith('/admin/messages')} 
              label="User Inbox" 
              badge={messageCount}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} 
            />
          </nav>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest mb-3 px-4">Configuration</p>
            <SidebarItem 
              href="/admin/about" 
              active={pathname.startsWith('/admin/about')} 
              label="About Page" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} 
            />
            <SidebarItem 
              href="/admin/terms" 
              active={pathname.startsWith('/admin/terms')} 
              label="T&C Page" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>} 
            />
            <SidebarItem 
              href="/admin/contact" 
              active={pathname.startsWith('/admin/contact')} 
              label="Contact Page" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 1 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} 
            />
            <SidebarItem 
              href="/admin/seo" 
              active={pathname.startsWith('/admin/seo')} 
              label="SEO Settings" 
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} 
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
