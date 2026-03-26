'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminHashtags() {
  const { status } = useSession();
  const router = useRouter();
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  const fetchHashtags = async () => {
    try {
      const res = await fetch('/api/hashtags');
      const data = await res.json();
      setHashtags(Array.isArray(data) ? data : []);
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

  const deleteHashtag = (id: number) => {
    handleModalOpen(
      'Confirm Deletion',
      'Are you sure you want to delete this hashtag? This action cannot be undone and may affect linked posts.',
      async () => {
        try {
          const res = await fetch(`/api/hashtags/${id}`, { method: 'DELETE' });
          if (res.ok) fetchHashtags();
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-xs font-semibold tracking-widest">Indexing Tags</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-zinc-800 tracking-tight mb-1">Hashtags</h1>
        <p className="text-zinc-400 font-medium">Taxonomy management</p>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
        confirmText="Delete"
      />

      <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden mb-8 shadow-sm">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-sm font-semibold text-zinc-800">Add New Hashtag</h2>
        </div>
        <form onSubmit={createHashtag} className="p-6 flex gap-4">
          <input 
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Culture"
            className="flex-1 bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
          />
          <button 
            type="submit"
            className="px-8 py-3 bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all active:scale-[0.98] rounded-lg shadow-lg shadow-amber-500/30"
          >
            Create
          </button>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 tracking-wider">Hashtag</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {hashtags.map((tag) => (
              <tr key={tag.id} className="hover:bg-black/[0.02] transition-colors duration-200 group">
                <td className="px-6 py-4 text-sm font-medium text-zinc-400">#{tag.id}</td>
                <td className="px-6 py-4">
                  {editingId === tag.id ? (
                    <input 
                      autoFocus
                      type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => updateHashtag(tag.id)}
                      onKeyDown={(e) => e.key === 'Enter' && updateHashtag(tag.id)}
                      className="bg-white border border-amber-500 rounded-md px-3 py-2 text-sm text-zinc-800 w-full max-w-xs focus:outline-none font-semibold"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-zinc-800 group-hover:text-amber-600 transition-colors">#{tag.name}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                      className="text-sm font-semibold text-zinc-400 hover:text-zinc-800 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteHashtag(tag.id)}
                      className="text-sm font-semibold text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {hashtags.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center text-zinc-400 text-sm font-semibold">Index is empty</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
