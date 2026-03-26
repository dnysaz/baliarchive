'use client';

import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Process',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in-fast">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-scale-in-fast">
        <div className="p-8">
          <h2 className="text-xl font-bold text-zinc-800 mb-2">{title}</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="bg-zinc-50 px-6 py-4 flex justify-end items-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-black/5 text-zinc-700 font-semibold text-sm hover:bg-black/10 hover:text-zinc-900 transition-all rounded-lg border border-black/5"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all active:scale-[0.98] rounded-lg shadow-lg shadow-amber-500/30"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
