'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import imageCompression from 'browser-image-compression';

export default function PostForm() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    locationId: '',
    province: 'Bali',
    hashtagId: '',
    venue: '',
    bestTime: '',
    cost: '',
    howToGet: '',
    body: '',
    images: [] as string[] // Store image URLs (uploaded or existing)
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, hashRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/hashtags')
        ]);
        const locData = await locRes.json();
        const hashData = await hashRes.json();
        setLocations(locData);
        setHashtags(hashData);

        if (isEdit && params?.id) {
          const postRes = await fetch(`/api/posts/${params.id}`);
          const postData = await postRes.json();
          if (postData && !postData.error) {
            setFormData({
              ...postData,
              locationId: postData.locationId?.toString() || '',
              hashtagId: postData.hashtagId?.toString() || '',
              images: postData.images?.length > 0 ? postData.images.map((img: any) => img.url) : []
            });
          }
        } else {
          if (locData.length > 0) setFormData(prev => ({ ...prev, locationId: locData[0].id.toString() }));
          if (hashData.length > 0) setFormData(prev => ({ ...prev, hashtagId: hashData[0].id.toString() }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit, params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - formData.images.length;
    if (remainingSlots <= 0) {
      alert('Maksimal 5 gambar diperbolehkan.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Check size (1MB)
        if (file.size > 1024 * 1024) {
          alert(`File ${file.name} terlalu besar (maks 1MB).`);
          return null;
        }

        // Compression options
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        
        const formData = new FormData();
        formData.append('file', compressedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validUrls]
      }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Gagal mengunggah gambar.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert('Mohon unggah setidaknya 1 gambar.');
      return;
    }
    setSubmitting(true);

    try {
      const url = isEdit ? `/api/posts/${params?.id}` : '/api/posts';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          locationId: parseInt(formData.locationId),
          hashtagId: parseInt(formData.hashtagId)
        })
      });

      if (res.ok) {
        router.push('/admin/posts');
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Gagal menyimpan: ${errorData.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-zinc-400">Memuat form...</div>;

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{isEdit ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}</h1>
          <p className="text-zinc-500 font-medium mt-1">Lengkapi detail informasi destinasi BaliArchive.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Nama Destinasi</label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleChange} required
              placeholder="Contoh: Pantai Kelingking"
              className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-bold text-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Tagline Singkat</label>
            <input 
              type="text" name="tagline" value={formData.tagline} onChange={handleChange} required
              placeholder="Contoh: Surga tersembunyi di Nusa Penida"
              className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Kabupaten (Location)</label>
            <div className="relative">
              <select 
                name="locationId" value={formData.locationId} onChange={handleChange} required
                className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-bold appearance-none"
              >
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Kategori (Hashtag)</label>
            <div className="relative">
              <select 
                name="hashtagId" value={formData.hashtagId} onChange={handleChange} required
                className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-bold appearance-none"
              >
                {hashtags.map(hash => <option key={hash.id} value={hash.id}>{hash.name}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Venue Spesifik</label>
            <input 
              type="text" name="venue" value={formData.venue || ''} onChange={handleChange}
              placeholder="Contoh: Nusa Penida Island"
              className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Waktu Terbaik</label>
            <input 
              type="text" name="bestTime" value={formData.bestTime} onChange={handleChange}
              placeholder="Contoh: 07:00 AM — 10:00 AM"
              className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Estimasi Biaya</label>
            <input 
              type="text" name="cost" value={formData.cost} onChange={handleChange}
              placeholder="Contoh: Entry: $1 — Parking: $0.5"
              className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 px-1">Cara Menuju Lokasi</label>
            <input 
              type="text" name="howToGet" value={formData.howToGet} onChange={handleChange}
              placeholder="Contoh: 45 menit kapal dari Sanur"
              className="w-full px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[24px] outline-none focus:border-amber-500 focus:bg-white transition-all text-zinc-900 font-medium"
            />
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-1">Galeri Gambar (Maks 5)</label>
              <p className="text-[10px] text-zinc-400 font-medium mt-1 px-1">Unggah file manual (Maks 1MB per file). Gambar akan dikompresi otomatis.</p>
            </div>
            {formData.images.length < 5 && (
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-50"
              >
                {uploading ? 'Mengunggah...' : '+ More Image'}
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
              multiple 
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {formData.images.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 shadow-sm animate-slideIn">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                >✕</button>
              </div>
            ))}
            {formData.images.length === 0 && !uploading && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-3xl text-zinc-300 cursor-pointer hover:border-amber-500 hover:text-amber-500 transition-all"
              >
                <div className="text-4xl mb-2">📸</div>
                <p className="text-xs font-bold uppercase tracking-widest">Klik untuk unggah gambar</p>
              </div>
            )}
            {uploading && (
              <div className="aspect-square rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100">
          <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4 px-1">Isi Artikel (Support HTML)</label>
          <textarea 
            name="body" value={formData.body} onChange={handleChange} required rows={12}
            placeholder="Tulis panduan lengkap di sini... Gunakan tag HTML seperti <p>, <h3>, <ul> untuk format artikel yang cantik."
            className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[32px] outline-none focus:border-amber-500 focus:bg-white transition-all font-mono text-sm leading-relaxed"
          />
        </div>

        <button 
          type="submit" disabled={submitting || uploading}
          className="w-full py-6 bg-amber-600 hover:bg-amber-700 text-white font-black text-xl rounded-[32px] transition-all shadow-xl shadow-amber-200 disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? 'Sedang Memproses...' : (isEdit ? 'Simpan Perubahan' : 'Terbitkan Destinasi')}
        </button>
      </form>
    </div>
  );
}
