'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminPosts() {
  const { status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?admin=true');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
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

  const handleModalOpen = (title: string, message: string, onConfirm: () => void) => {
    setModalContent({ title, message });
    setConfirmAction(() => onConfirm);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setConfirmAction(null);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    handleModalClose();
  };

  const deletePost = (id: number) => {
    handleModalOpen(
      'Confirm Deletion',
      'Are you sure you want to delete this destination? This action cannot be undone.',
      async () => {
        try {
          const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
          if (res.ok) fetchPosts();
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-[10px] font-black tracking-[0.2em] uppercase">Syncing Archive</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-zinc-800 tracking-tight mb-1">Destinations</h1>
          <p className="text-zinc-400 font-medium">Archive management feed</p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all active:scale-[0.98] rounded-lg shadow-lg shadow-amber-500/30"
        >
          Add New Post
        </Link>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
        confirmText="Delete"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {posts.map(post => (
          <div key={post.id} className="relative aspect-[3/4] bg-white rounded-2xl group overflow-hidden border border-black/5 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10">
            {post.images[0] ? (
              <img src={post.images[0].url} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            )}
            
            {post.isDraft ? (
              <div className="absolute inset-0 z-0 cursor-not-allowed" title="Draft posts cannot be viewed publicly yet" />
            ) : (
              <Link href={`/?post=${post.slug || post.id}`} className="absolute inset-0 z-0 cursor-pointer" />
            )}
            
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {post.isDraft && (
                  <span className="px-2 py-0.5 bg-zinc-800 text-white text-[9px] font-bold rounded-full shadow-lg">
                    DRAFT
                  </span>
                )}
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-lg transition-transform active:scale-95">
                  #{post.hashtags?.[0]?.name || 'Untagged'}
                  {post.hashtags?.length > 1 && ` +${post.hashtags.length - 1}`}
                </span>
              </div>
              <h3 className="text-white text-base font-bold leading-tight truncate">{post.title}</h3>
              
              <div className="pointer-events-auto flex items-center gap-2 mt-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <Link 
                  href={`/admin/posts/edit/${post.slug || post.id}`}
                  className="flex-1 py-2 bg-white text-zinc-800 text-xs font-semibold text-center hover:bg-amber-500 hover:text-white transition-all rounded-md shadow-lg"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => deletePost(post.id)}
                  className="w-9 h-9 bg-white/20 backdrop-blur-md border border-white/20 rounded-md flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all active:scale-90 shadow-lg"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {posts.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
            <h3 className="text-xl font-semibold text-zinc-400">Feed is Empty</h3>
            <Link 
              href="/admin/posts/new" 
              className="mt-6 inline-block text-sm font-semibold text-amber-600 hover:underline"
            >
              Upload first content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
