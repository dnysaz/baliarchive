'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import imageCompression from 'browser-image-compression';

import ConfirmationModal from '@/components/ConfirmationModal';

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
    images: [] as string[],
    guidePdfUrl: '',
    guidePrice: ''
  });

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const handleModalOpen = (title: string, message: string, onConfirm?: () => void) => {
    setModalContent({ title, message });
    setConfirmAction(onConfirm ? () => onConfirm : null);
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
      handleModalOpen('Upload Limit Reached', 'You can only upload a maximum of 5 images.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Show immediate preview while uploading.
    // We'll replace these object URLs with uploaded URLs once upload completes.
    const previewUrls = filesToUpload.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }));

    const newUploads: Record<string, number> = {};
    filesToUpload.forEach(file => {
      newUploads[file.name] = 0;
    });
    setUploadProgress(prev => ({ ...prev, ...newUploads }));

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        if (file.size > 1024 * 1024 * 2) { // 2MB limit
          handleModalOpen('File Too Large', `Image ${file.name} exceeds the 2MB size limit.`);
          setUploadProgress(prev => { const newState = { ...prev }; delete newState[file.name]; return newState; });
          return null;
        }

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          onProgress: (p: number) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: p }));
          }
        };

        const compressedFile = await imageCompression(file, options);
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', compressedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await res.json();
        const isValidUrl =
          res.ok &&
          typeof data?.url === 'string' &&
          data.url.trim().length > 0 &&
          data.url.startsWith('/uploads/');

        // Always clear progress for this file when done.
        setUploadProgress((prev) => {
          const newState = { ...prev };
          delete newState[file.name];
          return newState;
        });

        // Only accept valid app URLs. If upload fails, return null.
        if (!isValidUrl) {
          return null;
        }
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(
        (url): url is string => typeof url === 'string' && url.trim().length > 0 && url.startsWith('/uploads/')
      );

      // If uploads failed entirely, keep the preview URLs visible.
      if (validUrls.length === 0) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        // Replace temporary object URLs with uploaded URLs
        images: [
          ...prev.images.filter((url) => !previewUrls.includes(url)),
          ...validUrls,
        ],
      }));

      // Only revoke previews once we've replaced them with real uploaded URLs.
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    } catch (err) {
      console.error('Upload failed:', err);
      handleModalOpen('Upload Failed', 'There was an error uploading your images. Please try again.');
      // Keep previews; user can retry upload.
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      setFormData(prev => ({ ...prev, guidePdfUrl: data.url }));
    } catch (err) {
      console.error('PDF upload failed:', err);
      handleModalOpen('Upload Failed', 'There was an error uploading your PDF. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = (Array.isArray(formData.images) ? formData.images : []).filter(
      (u): u is string => typeof u === 'string' && u.trim().length > 0
    );

    const hasPendingObjectPreviews = images.some((u) => u.startsWith('blob:'));
    if (hasPendingObjectPreviews) {
      handleModalOpen('Upload In Progress', 'Silakan tunggu proses upload gambar selesai sebelum Save.');
      return;
    }

    const validImages = images.filter((u) => u.startsWith('/uploads/'));
    if (validImages.length === 0) {
      handleModalOpen('Image Required', 'Silakan upload minimal 1 gambar yang berhasil tersimpan.');
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
          // Be explicit: guide fields come from a separate upload handler
          // so we normalize them before sending.
          guidePdfUrl: formData.guidePdfUrl?.trim() || null,
          guidePrice: formData.guidePrice?.trim() || null,
          // Prevent sending invalid image values (e.g. null) to the API.
          images: validImages,
          locationId: parseInt(formData.locationId),
          hashtagId: parseInt(formData.hashtagId)
        })
      });

      if (res.ok) {
        router.push('/admin/posts');
        router.refresh();
      } else {
        const errorData = await res.json();
        handleModalOpen('Save Failed', errorData.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error(error);
      handleModalOpen('Connection Error', 'Could not save the post. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-xs font-semibold tracking-widest">Syncing Engine</p>
      </div>
    </div>
  );

  const uploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-800 tracking-tight mb-1">
            {isEdit ? 'Edit Post' : 'Create Post'}
          </h1>
          <p className="text-zinc-400 font-medium">
            {isEdit ? 'Update content details' : 'Add a new destination to the archive'}
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-black/5 text-zinc-600 font-semibold text-sm hover:bg-black/10 hover:text-zinc-800 transition-all rounded-lg border border-black/5"
        >
          Cancel
        </button>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={handleConfirm}
        onCancel={handleModalClose}
        confirmText={confirmAction ? 'Confirm' : 'OK'}
        cancelText={confirmAction ? 'Cancel' : ''}
      />

      <form onSubmit={handleSubmit} className="space-y-8 pb-32">
        {/* Basic Info Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-black/5">
            <h2 className="text-sm font-semibold text-zinc-800">Core Details</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Title</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange} required
                  placeholder="e.g. Tegalalang Rice Terrace"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Tagline</label>
                <input 
                  type="text" name="tagline" value={formData.tagline} onChange={handleChange} required
                  placeholder="A short, captivating description"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Guide PDF</label>
                <input 
                  type="file" name="guidePdf" onChange={handlePdfUpload} 
                  accept=".pdf"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
                {formData.guidePdfUrl && (
                  <p className="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    Guide PDF ready:{" "}
                    <a
                      href={formData.guidePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-emerald-800"
                    >
                      open file
                    </a>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Guide Price</label>
                <input 
                  type="text" name="guidePrice" value={formData.guidePrice} onChange={handleChange} 
                  placeholder="e.g. 15000"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Regency</label>
                <select 
                  name="locationId" value={formData.locationId} onChange={handleChange} required
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold appearance-none"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id} className="bg-zinc-100 font-semibold">{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Province</label>
                <input 
                  type="text" value="Bali" disabled
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-500 font-semibold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Hashtag</label>
                <select 
                  name="hashtagId" value={formData.hashtagId} onChange={handleChange} required
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold appearance-none"
                >
                  {hashtags.map(hash => (
                    <option key={hash.id} value={hash.id} className="bg-zinc-100 font-semibold">#{hash.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Visual Assets</h2>
            <span className="text-xs font-semibold text-zinc-400 tracking-wider">{formData.images.length} / 5 uploaded</span>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {formData.images.map((url, idx) => (
              <div key={idx} className="relative aspect-square bg-zinc-100 rounded-lg group overflow-hidden border border-black/5">
                <img src={url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}

            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="relative aspect-square bg-zinc-100 rounded-lg overflow-hidden border border-black/5 flex flex-col items-center justify-center text-center p-2">
                <p className="text-xs font-semibold text-zinc-500 truncate w-full">{fileName}</p>
                <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ))}
            
            {formData.images.length + Object.keys(uploadProgress).length < 5 && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={Object.keys(uploadProgress).length > 0}
                className="aspect-square border-2 border-dashed border-zinc-200 rounded-lg hover:border-amber-500 hover:bg-white transition-all flex flex-col items-center justify-center gap-2 group disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="w-6 h-6 text-zinc-300 group-hover:text-amber-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div className="text-xs font-semibold text-zinc-400 group-hover:text-amber-500 transition-colors">Upload</div>
              </button>
            )}
          </div>
          <input 
            type="file" ref={fileInputRef} onChange={handleImageUpload} 
            accept="image/*" multiple className="hidden" 
          />
        </div>

        {/* Detailed Info Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-black/5">
            <h2 className="text-sm font-semibold text-zinc-800">Additional Info</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Best Time to Visit</label>
                <input 
                  type="text" name="bestTime" value={formData.bestTime} onChange={handleChange} required
                  placeholder="e.g. 06:00 AM"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Entrance Cost</label>
                <input 
                  type="text" name="cost" value={formData.cost} onChange={handleChange} required
                  placeholder="e.g. Free or IDR 50,000"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Venue Name (Optional)</label>
                <input 
                  type="text" name="venue" value={formData.venue || ''} onChange={handleChange}
                  placeholder="Specific venue name"
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">How to Get There</label>
                <textarea 
                  name="howToGet" value={formData.howToGet} onChange={handleChange} required
                  rows={3}
                  placeholder="Transportation details..."
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-2">Main Article</label>
                <textarea 
                  name="body" value={formData.body} onChange={handleChange} required
                  rows={10}
                  placeholder="Tell the full story here..."
                  className="w-full bg-black/5 border-2 border-transparent rounded-lg px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all font-semibold placeholder:text-zinc-400 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4 justify-end">
          <button 
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="px-6 py-2.5 bg-black/5 text-zinc-600 font-semibold text-sm hover:bg-black/10 hover:text-zinc-800 transition-all rounded-lg border border-black/5"
          >
            Discard
          </button>
          <button 
            type="submit"
            disabled={submitting || uploading}
            className="px-8 py-2.5 bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all active:scale-[0.98] rounded-lg shadow-lg shadow-amber-500/30 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
