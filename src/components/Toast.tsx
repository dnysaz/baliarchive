'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  icon?: 'save' | 'unsave' | 'like' | 'unlike' | 'share' | 'success' | 'error';
}

const ICONS: Record<string, React.ReactNode> = {
  save: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  unsave: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  like: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  unlike: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  share: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), 2400);
    const removeTimer = setTimeout(() => onRemove(toast.id), 2800);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-3.5 bg-zinc-900/90 backdrop-blur-xl 
        rounded-2xl border border-white/10 pointer-events-auto
        transition-all duration-400 ease-out
        ${isExiting ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}
      `}
      style={{
        animation: isExiting ? undefined : 'toastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="shrink-0">
        {ICONS[toast.icon || 'success']}
      </div>
      <span className="text-[13px] font-bold text-white/90 leading-tight">{toast.text}</span>
    </div>
  );
}

// ---- Hook for external usage ---- 
let globalShowToast: ((text: string, icon?: ToastMessage['icon']) => void) | null = null;

export function showToast(text: string, icon?: ToastMessage['icon']) {
  globalShowToast?.(text, icon);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, icon?: ToastMessage['icon']) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev.slice(-2), { id, text, icon }]); // Keep max 3
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Register the global function
  useEffect(() => {
    globalShowToast = addToast;
    return () => { globalShowToast = null; };
  }, [addToast]);

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes toastSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-0 right-0 z-[600] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
}
