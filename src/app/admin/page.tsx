'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ posts: 0, locations: 0, hashtags: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, locationsRes, hashtagsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/locations'),
          fetch('/api/hashtags')
        ]);
        const posts = await postsRes.json();
        const locations = await locationsRes.json();
        const hashtags = await hashtagsRes.json();
        
        setStats({ 
          posts: Array.isArray(posts) ? posts.length : 0, 
          locations: Array.isArray(locations) ? locations.length : 0, 
          hashtags: Array.isArray(hashtags) ? hashtags.length : 0 
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (status === 'loading' || loading) return <div className="p-8 text-center font-bold text-zinc-600 text-[11px] uppercase tracking-widest">Loading Dashboard...</div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white tracking-tight mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-[11px] font-medium">Monitor and manage your BaliArchive content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition-all duration-300 group">
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 mb-4 group-hover:bg-white group-hover:text-black transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Posts</p>
          <h2 className="text-2xl font-bold text-white">{stats.posts}</h2>
          <Link href="/admin/posts" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">View All <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition-all duration-300 group">
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 mb-4 group-hover:bg-white group-hover:text-black transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Regencies</p>
          <h2 className="text-2xl font-bold text-white">{stats.locations}</h2>
          <Link href="/admin/locations" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">Manage Areas <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition-all duration-300 group">
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 mb-4 group-hover:bg-white group-hover:text-black transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
          </div>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Hashtags</p>
          <h2 className="text-2xl font-bold text-white">{stats.hashtags}</h2>
          <Link href="/admin/hashtags" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">Manage Tags <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 text-black relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-lg font-bold mb-2 tracking-tight">Start Adding New Content</h2>
          <p className="text-zinc-500 text-[12px] leading-relaxed mb-6 font-medium">Upload destination photos, write cultural guide articles, and let the world explore Bali through your eyes.</p>
          <Link 
            href="/admin/posts/new" 
            className="inline-flex items-center justify-center px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all active:scale-[0.98]"
          >
            + Create New Post
          </Link>
        </div>
        <div className="absolute right-[-80px] bottom-[-80px] w-64 h-64 bg-zinc-100 rounded-full"></div>
      </div>
    </div>
  );
}
