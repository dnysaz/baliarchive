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

  if (status === 'loading' || loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-xs font-semibold tracking-widest">Loading Interface</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-800 tracking-tight mb-1">Dashboard</h1>
        <p className="text-zinc-400 font-medium">Overview of your content engine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-12 bg-black/5 border border-black/5 rounded-2xl overflow-hidden">
        <div className="p-8 bg-white hover:bg-zinc-50 transition-colors group">
          <p className="text-sm font-semibold text-zinc-500 mb-4 group-hover:text-amber-600 transition-colors">Total Destinations</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-bold text-zinc-800 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{stats.posts}</h2>
            <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <Link href="/admin/posts" className="mt-6 inline-block text-sm font-semibold text-zinc-400 hover:text-zinc-800 transition-colors">
            Explore Feed →
          </Link>
        </div>

        <div className="p-8 bg-white hover:bg-zinc-50 transition-colors group">
          <p className="text-sm font-semibold text-zinc-500 mb-4 group-hover:text-amber-600 transition-colors">Regencies</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-bold text-zinc-800 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{stats.locations}</h2>
            <span className="text-xs font-semibold text-zinc-500">Districts</span>
          </div>
          <Link href="/admin/locations" className="mt-6 inline-block text-sm font-semibold text-zinc-400 hover:text-zinc-800 transition-colors">
            Manage Areas →
          </Link>
        </div>

        <div className="p-8 bg-white hover:bg-zinc-50 transition-colors group">
          <p className="text-sm font-semibold text-zinc-500 mb-4 group-hover:text-amber-600 transition-colors">Hashtags</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-bold text-zinc-800 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">{stats.hashtags}</h2>
            <span className="text-xs font-semibold text-zinc-500">Tags</span>
          </div>
          <Link href="/admin/hashtags" className="mt-6 inline-block text-sm font-semibold text-zinc-400 hover:text-zinc-800 transition-colors">
            Manage SEO →
          </Link>
        </div>
      </div>

      <div className="bg-amber-500 p-10 text-white relative overflow-hidden group cursor-pointer rounded-2xl shadow-xl shadow-amber-500/20">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Upload New Story</h2>
          <p className="text-amber-100 text-sm leading-relaxed mb-6 max-w-md">Sync new cultural gems and high-res photography to the BaliArchive cloud.</p>
          <Link 
            href="/admin/posts/new" 
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-amber-600 font-semibold text-sm hover:bg-zinc-100 transition-all active:scale-[0.98] rounded-lg shadow-lg"
          >
            Start Upload
          </Link>
        </div>
      </div>
    </div>
  );
}
