'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPosts() {
  const { status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-zinc-600 text-xs">Loading data...</div>;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Destinations</h1>
          <p className="text-zinc-500 text-xs font-medium mt-1">Manage all your BaliArchive content here.</p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="inline-flex items-center justify-center px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          + Add New
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {posts.map(post => (
          <div key={post.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center gap-5 group hover:border-zinc-700 transition-all">
            <div className="w-full md:w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
              {post.images[0] && (
                <img src={post.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] font-bold uppercase tracking-widest rounded-md border border-zinc-700">
                  #{post.hashtag?.name || post.category}
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  {post.location?.name || post.kabupaten}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate">{post.title}</h3>
              <p className="text-[11px] text-zinc-500 font-medium line-clamp-1 mt-0.5">{post.tagline}</p>
            </div>
            <div className="flex items-center gap-2 md:border-l md:border-zinc-800 md:pl-5">
              <Link 
                href={`/admin/posts/edit/${post.id}`}
                className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
                title="Edit Post"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </Link>
              <button 
                onClick={() => deletePost(post.id)}
                className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-red-950 hover:text-red-400 transition-all"
                title="Delete Post"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-24 bg-zinc-900 rounded-3xl border border-zinc-800">
            <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">No posts found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
