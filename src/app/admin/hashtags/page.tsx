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
    if (confirmAction) confirmAction();
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

  const deleteHashtag = (id: number, name: string) => {
    handleModalOpen(
      'Delete this Tag?',
      `Are you sure you want to delete "#${name}"? Any post using this hashtag will lose its category association.`,
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
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-[10px] font-black tracking-[0.2em] uppercase">Syncing Archive</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Hashtag</h1>
        </div>

        <form onSubmit={createHashtag} className="flex gap-2 bg-white p-2 rounded-2xl border border-black/5 shadow-xl shadow-black/5 w-full md:w-auto">
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="#TypeHashtag..."
            className="px-5 py-3 text-sm font-bold text-zinc-900 focus:outline-none min-w-[240px]"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 rounded-xl shrink-0"
          >
            Create
          </button>
        </form>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
        confirmText="Confirm Delete"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {hashtags.map((tag) => (
          <div
            key={tag.id}
            className="group bg-white border border-black/5 p-5 rounded-[28px] hover:border-amber-500/30 hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-amber-500 transition-colors"></span>
                <span className="text-[11px] font-black text-zinc-800">
                  {tag._count?.posts || 0}
                  <span className="text-zinc-400 ml-1 font-bold">Posts</span>
                </span>
              </div>

              {editingId === tag.id ? (
                <input
                  autoFocus
                  type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => updateHashtag(tag.id)}
                  onKeyDown={(e) => e.key === 'Enter' && updateHashtag(tag.id)}
                  className="bg-zinc-50 border-2 border-amber-500 rounded-lg px-3 py-1 text-sm text-zinc-800 w-full focus:outline-none font-bold"
                />
              ) : (
                <h3 className="text-[17px] font-black text-zinc-900 tracking-tight mb-6 truncate">#{tag.name}</h3>
              )}

              <div className="mt-auto flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                  className="text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteHashtag(tag.id, tag.name)}
                  className="text-[10px] font-black uppercase text-zinc-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {hashtags.length === 0 && (
          <div className="col-span-full py-20 bg-zinc-50/50 rounded-[40px] border border-dashed border-zinc-200 flex flex-col items-center justify-center">
            <p className="text-zinc-400 font-bold italic">No hashtags defined</p>
          </div>
        )}
      </div>
    </div>
  );
}
