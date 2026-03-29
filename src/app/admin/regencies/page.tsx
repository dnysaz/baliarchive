'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminRegencies() {
  const router = useRouter();
  const [regencies, setRegencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const fetchRegencies = async () => {
    try {
      const res = await fetch('/api/regencies');
      const data = await res.json();
      setRegencies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRegencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegencies();
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

  const createRegency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const slug = newName.toLowerCase().replace(/\s+/g, '-').trim();
      const res = await fetch('/api/regencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), slug })
      });
      if (res.ok) {
        setNewName('');
        fetchRegencies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateRegency = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const slug = editName.toLowerCase().replace(/\s+/g, '-').trim();
      const res = await fetch(`/api/regencies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), slug })
      });
      if (res.ok) {
        setEditingId(null);
        fetchRegencies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRegency = (id: number, name: string) => {
    handleModalOpen(
      'Delete this Regency?',
      `Are you sure you want to delete "${name}"? Any post using this regency will lose its association.`,
      async () => {
        try {
          const res = await fetch(`/api/regencies/${id}`, { method: 'DELETE' });
          if (res.ok) fetchRegencies();
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
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Regency</h1>
        </div>

        <form onSubmit={createRegency} className="flex gap-2 bg-white p-2 rounded-2xl border border-black/5 shadow-xl shadow-black/5 w-full md:w-auto">
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Add Regency Name..."
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
        {regencies.map((reg) => (
          <div
            key={reg.id}
            className="group bg-white border border-black/5 p-5 rounded-[28px] hover:border-amber-500/30 hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-amber-500 transition-colors"></span>
                <span className="text-[11px] font-black text-zinc-800">
                  {reg._count?.posts || 0}
                  <span className="text-zinc-400 ml-1 font-bold">Posts</span>
                </span>
              </div>

              {editingId === reg.id ? (
                <input
                  autoFocus
                  type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => updateRegency(reg.id)}
                  onKeyDown={(e) => e.key === 'Enter' && updateRegency(reg.id)}
                  className="bg-zinc-50 border-2 border-amber-500 rounded-lg px-3 py-1 text-sm text-zinc-800 w-full focus:outline-none font-bold"
                />
              ) : (
                <>
                  <h3 className="text-[17px] font-black text-zinc-900 tracking-tight truncate">{reg.name}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6">/{reg.slug}</p>
                </>
              )}

              <div className="mt-auto flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingId(reg.id); setEditName(reg.name); }}
                  className="text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRegency(reg.id, reg.name)}
                  className="text-[10px] font-black uppercase text-zinc-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {regencies.length === 0 && (
          <div className="col-span-full py-20 bg-zinc-50/50 rounded-[40px] border border-dashed border-zinc-200 flex flex-col items-center justify-center">
            <p className="text-zinc-400 font-bold italic">No regencies defined</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center">
        <button onClick={() => router.push('/admin')} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
