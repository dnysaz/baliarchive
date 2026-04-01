'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !content) return;
    
    // Check if honey pot is filled
    if (website) {
       setStatus('success'); // Fake success for bots
       return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content, website }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setContent('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Message Sent</h3>
        <p className="text-zinc-500 text-sm font-medium mb-8">We'll get back to you shortly.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Your Email
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full bg-transparent border-b-2 border-zinc-100 py-3 text-lg font-bold text-zinc-900 placeholder:text-zinc-200 focus:outline-none focus:border-zinc-900 transition-all rounded-none"
        />
        
        {/* Honeypot field (hidden from humans) */}
        <div className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true">
           <input 
             type="text" 
             name="website" 
             tabIndex={-1} 
             value={website} 
             onChange={(e) => setWebsite(e.target.value)} 
             autoComplete="off" 
           />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Message
        </label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How can we help you?"
          className="w-full bg-transparent border-b-2 border-zinc-100 py-3 text-lg font-bold text-zinc-900 placeholder:text-zinc-200 focus:outline-none focus:border-zinc-900 transition-all resize-none rounded-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Error sending message. Try again.</p>
      )}

      <button
        disabled={status === 'loading'}
        type="submit"
        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-black/10 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
