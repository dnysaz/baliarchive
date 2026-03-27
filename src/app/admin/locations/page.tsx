'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function AdminLocations() {
  const { status } = useSession();
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
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

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
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

  const createLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        setNewName('');
        fetchLocations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateLocation = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      if (res.ok) {
        setEditingId(null);
        fetchLocations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteLocation = (id: number, name: string) => {
    handleModalOpen(
      'Delete this Regency?',
      `Are you sure you want to remove "${name}"? This will affect all associated archival entries.`,
      async () => {
        try {
          const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
          if (res.ok) fetchLocations();
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

        <form onSubmit={createLocation} className="flex gap-2 bg-white p-2 rounded-2xl border border-black/5 shadow-xl shadow-black/5 w-full md:w-auto">
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter regency name..."
            className="px-5 py-3 text-sm font-bold text-zinc-800 focus:outline-none min-w-[240px]"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 rounded-xl shrink-0"
          >
            Add
          </button>
        </form>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
        confirmText="Remove Forever"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="group bg-white border border-black/5 p-6 rounded-[32px] hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 relative"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">#{loc.id}</span>
                <div className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {loc._count?.posts || 0} Posts
                </div>
              </div>

              {editingId === loc.id ? (
                <input
                  autoFocus
                  type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => updateLocation(loc.id)}
                  onKeyDown={(e) => e.key === 'Enter' && updateLocation(loc.id)}
                  className="bg-zinc-50 border-2 border-amber-500 rounded-xl px-4 py-2 text-sm text-zinc-800 w-full focus:outline-none font-bold"
                />
              ) : (
                <h3 className="text-xl font-black text-zinc-900 tracking-tight group-hover:text-amber-500 transition-colors mb-6">{loc.name}</h3>
              )}

              <div className="mt-auto flex items-center gap-4 pt-4 border-t border-zinc-50">
                <button
                  onClick={() => { setEditingId(loc.id); setEditName(loc.name); }}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteLocation(loc.id, loc.name)}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {locations.length === 0 && (
          <div className="col-span-full py-20 bg-zinc-50/50 rounded-[40px] border border-dashed border-zinc-200 flex flex-col items-center justify-center">
            <p className="text-zinc-400 font-bold italic">No regencies mapped yet</p>
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-2">Add your first region above</p>
          </div>
        )}
      </div>
    </div>
  );
}
