'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

type Message = {
  id: number;
  email: string;
  content: string;
  createdAt: Date | string;
};

export default function AdminInbox({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(
    messages.length > 0 ? messages[0].id : null
  );
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);

  const selectedMsg = messages.find(m => m.id === selectedId);

  const handleToggleCheck = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedIds(messages.map(m => m.id));
    } else {
      setCheckedIds([]);
    }
  };

  const handleDeleteTrigger = () => {
    if (checkedIds.length === 0) return;
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: checkedIds }),
      });

      if (res.ok) {
        setCheckedIds([]);
        router.refresh();
      }
    } catch (error) {
      console.error('Delete failed');
    } finally {
      setIsDeleting(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm">
      <ConfirmationModal 
        isOpen={isModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${checkedIds.length} selected message(s)? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
        confirmText="Delete"
      />

      {/* Sidebar - List of Senders */}
      <div className="w-80 md:w-96 border-r border-zinc-50 flex flex-col bg-zinc-50/30">
        <div className="p-6 border-b border-zinc-50 bg-white">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-black text-zinc-900 tracking-tight">Recent Inquiries</h2>
             {checkedIds.length > 0 && (
               <button 
                 onClick={handleDeleteTrigger}
                 disabled={isDeleting}
                 className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
               >
                 {isDeleting ? '...' : `Delete (${checkedIds.length})`}
               </button>
             )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {messages.length} Total Messages
            </p>
            {messages.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-amber-500 transition-colors">Select All</span>
                <input 
                  type="checkbox" 
                  checked={checkedIds.length === messages.length && messages.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-zinc-100 text-amber-500 focus:ring-amber-500/20"
                />
              </label>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
          {messages.length === 0 ? (
            <div className="p-10 text-center text-zinc-300 text-xs font-bold">No messages found</div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className={`w-full p-6 text-left transition-all hover:bg-white flex items-start gap-4 ${
                  selectedId === msg.id ? 'bg-white shadow-inner ring-1 ring-zinc-100' : ''
                }`}
              >
                <div 
                  onClick={(e) => handleToggleCheck(msg.id, e)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    checkedIds.includes(msg.id) 
                      ? 'bg-amber-500 border-amber-500 text-white' 
                      : 'bg-white border-zinc-100 group-hover:border-zinc-300'
                  }`}
                >
                  {checkedIds.includes(msg.id) && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-black truncate ${selectedId === msg.id ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {msg.email}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-300 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 font-medium italic">
                    {msg.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel - Message Content */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedMsg ? (
          <>
            {/* Header */}
            <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-lg font-black">
                  {selectedMsg.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    {selectedMsg.email}
                    <a href={`mailto:${selectedMsg.email}`} className="text-blue-500 hover:text-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Received on {new Date(selectedMsg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a 
                   href={`mailto:${selectedMsg.email}`}
                   className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                  Reply Now
                </a>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
               <div className="max-w-2xl">
                 <p className="text-zinc-600 leading-[1.8] text-lg font-medium whitespace-pre-wrap">
                   {selectedMsg.content}
                 </p>
               </div>
            </div>
            
            {/* Quick Footer Info */}
            <div className="p-6 bg-zinc-50/50 border-t border-zinc-50 flex items-center justify-between text-[10px] font-black text-zinc-300 uppercase tracking-widest">
               <span>BaliArchive Messaging System</span>
               <span>Message ID: #MSG-{selectedMsg.id}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-zinc-50 rounded-[32px] flex items-center justify-center mb-8 text-zinc-200">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Select a message</h3>
            <p className="text-zinc-400 font-medium max-w-xs">Click on an email from the left sidebar to view the full message content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
