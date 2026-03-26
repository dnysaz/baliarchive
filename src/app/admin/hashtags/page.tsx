'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminHashtags() {
  const { status } = useSession();
  const router = useRouter();
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const fetchHashtags = async () => {
    try {
      const res = await fetch('/api/hashtags');
      const data = await res.json();
      if (Array.isArray(data)) {
        setHashtags(data);
      } else {
        setHashtags([]);
      }
    } catch (err) {
      console.error(err);
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHashtags();
  }, []);

  const createHashtag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        setNewName('');
        fetchHashtags();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateHashtag = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/hashtags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      if (res.ok) {
        setEditingId(null);
        fetchHashtags();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHashtag = async (id: number) => {
    if (!confirm('Delete this hashtag? This will affect linked posts.')) return;
    try {
      const res = await fetch(`/api/hashtags/${id}`, { method: 'DELETE' });
      if (res.ok) fetchHashtags();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-zinc-600 text-[11px] uppercase tracking-widest">Loading data...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white tracking-tight">Hashtags</h1>
        <p className="text-zinc-500 text-[11px] font-medium mt-1">Manage destination categories and tags.</p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
        <h2 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1">Add New Hashtag</h2>
        <form onSubmit={createHashtag} className="flex gap-3">
          <input 
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Nature"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-[13px] text-white focus:outline-none focus:border-zinc-600 transition-all"
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all active:scale-[0.98]"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                <th className="px-6 py-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ID</th>
                <th className="px-6 py-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Tag Name</th>
                <th className="px-6 py-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {hashtags.map((tag) => (
                <tr key={tag.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 text-[11px] font-mono text-zinc-600">#{tag.id}</td>
                  <td className="px-6 py-4">
                    {editingId === tag.id ? (
                      <input 
                        autoFocus
                        type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => updateHashtag(tag.id)}
                        onKeyDown={(e) => e.key === 'Enter' && updateHashtag(tag.id)}
                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[13px] text-white w-full max-w-xs focus:outline-none focus:border-white"
                      />
                    ) : (
                      <span className="text-[13px] font-medium text-zinc-200">#{tag.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                        className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button 
                        onClick={() => deleteHashtag(tag.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hashtags.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-zinc-600 text-[11px] font-medium">No hashtags found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
