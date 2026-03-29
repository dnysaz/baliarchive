'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function SEOAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
    favicon: ''
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          keywords: data.keywords || '',
          ogImage: data.ogImage || '',
          favicon: data.favicon || ''
        });
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'favicon' | 'ogImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'seoImage'); // Save to public/seoImage

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setForm(prev => ({ ...prev, [field]: data.url }));
    } catch (err: any) {
      setError(err.message || 'Error uploading image');
    } finally {
      setUploadingField(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-[12px] font-black tracking-[0.2em] ">Archiving Metadata</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2">SEO Configuration</h1>
          <p className="text-zinc-500 font-medium lowercase">Master metadata and visual search identity</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="submit"
            form="seo-form"
            disabled={saving || !!uploadingField}
            className="px-8 py-3 bg-amber-500 text-white font-black text-xs hover:bg-amber-600 transition-colors rounded-xl disabled:opacity-50 min-w-[160px] text-center"
          >
            {saving ? 'Updating...' : 'Commit Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          Settings Saved Successfully
        </div>
      )}

      <form id="seo-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32">
        
        {/* Left Column: Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[12px] font-black text-zinc-800">Index Metadata</h2>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-[12px] font-black text-zinc-800 mb-3 ml-1">Archive Site Title</label>
                <input 
                  type="text"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g., Bali Archive — Discover Local Gems"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all placeholder:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[12px] font-black text-zinc-800 mb-3 ml-1">Meta Description</label>
                <textarea 
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Tell search engines what this archive is about..."
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all placeholder:text-zinc-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-black text-zinc-800 mb-3 ml-1">Index Keywords</label>
                <input 
                  type="text"
                  value={form.keywords}
                  onChange={e => setForm({...form, keywords: e.target.value})}
                  placeholder="bali, travel guide, adventure, culture"
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-5 py-4 text-sm font-bold text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all placeholder:text-zinc-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Assets */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[12px] font-black text-zinc-800">Visual Identity</h2>
            </div>
            <div className="p-6 space-y-8">
              
              {/* Favicon Upload */}
              <div>
                <label className="block text-[12px] font-black text-zinc-500 mb-3 ml-1">Browser Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                    {form.favicon ? (
                      <img src={form.favicon} alt="" className="w-10 h-10 object-contain" />
                    ) : (
                      <div className="text-[10px] font-black text-zinc-300 uppercase">None</div>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={!!uploadingField}
                    className="flex-1 py-3 border border-dashed border-zinc-300 rounded-xl text-[11px] font-black text-zinc-500 hover:border-zinc-500 hover:text-zinc-800 transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {uploadingField === 'favicon' ? 'Uploading...' : 'Change Icon'}
                  </button>
                  <input type="file" ref={faviconInputRef} onChange={e => handleFileUpload(e, 'favicon')} accept=".svg,.png,.ico" className="hidden" />
                </div>
              </div>

              {/* OG Image Upload */}
              <div>
                <label className="block text-[12px] font-black text-zinc-500 mb-3 ml-1">Global OG Image (Social Share)</label>
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden relative group">
                    {form.ogImage ? (
                      <>
                        <img src={form.ogImage} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => ogInputRef.current?.click()} className="px-4 py-2 bg-white rounded-lg text-xs font-black text-zinc-900 uppercase">Update Image</button>
                        </div>
                      </>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => ogInputRef.current?.click()}
                        disabled={!!uploadingField}
                        className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">{uploadingField === 'ogImage' ? 'Uploading...' : 'Upload Image'}</span>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={ogInputRef} onChange={e => handleFileUpload(e, 'ogImage')} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-[10px] leading-relaxed text-zinc-400 font-bold uppercase tracking-tight">
                  Note: Site-wide assets are stored in <span className="text-zinc-600">public/seoImage</span>. Recommended OG Image size is 1200x630px.
                </p>
              </div>

            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
