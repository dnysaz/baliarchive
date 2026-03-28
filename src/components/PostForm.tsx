'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import ConfirmationModal from '@/components/ConfirmationModal';
import ArticleSheet from '@/components/ArticleSheet';

// --- Toolbar Button Component ---
const ToolbarButton = ({
  onClick,
  isActive = false,
  children,
  title
}: {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all active:scale-95 ${isActive
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
      }`}
  >
    {children}
  </button>
);

export default function PostForm({ isAdForm = false }: { isAdForm?: boolean }) {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const storageKey = isAdForm ? 'baliarchive_draft_ad' : 'baliarchive_draft_post';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    locationId: '',
    province: 'Bali',
    hashtagIds: [] as string[],
    venue: '',
    bestTime: '',
    cost: '',
    howToGet: '',
    body: '',
    images: [] as { url: string; type: string }[], // Changed to handle both image/video metadata
    guidePdfUrl: '',
    lemonSqueezyUrl: '',
    guidePrice: '',
    googleMapsUrl: '',
    isDraft: false,
    isAd: isAdForm,
    advertiserName: ''
  });

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // --- External Modals State ---
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Link Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });

  // Discard Modal
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

  // General Alert Modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // --- Editor Setup ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-semibold',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Tell the full story here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none focus:outline-none min-h-[730px] p-6 text-sm text-zinc-800',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, body: html }));
    },
    immediatelyRender: false,
  });

  // --- Autosave ---
  useEffect(() => {
    if (!loading && !isEdit) {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }
  }, [formData, loading, isEdit, storageKey]);

  // --- Unload Warning ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
    if (confirmAction) confirmAction();
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
              hashtagIds: postData.hashtags?.length > 0 ? postData.hashtags.map((h: any) => h.id.toString()) : [],
              images: postData.images?.length > 0 ? postData.images.map((img: any) => ({ url: img.url, type: img.type || 'IMAGE' })) : [],
              googleMapsUrl: postData.googleMapsUrl || '',
              isDraft: postData.isDraft || false,
              isAd: postData.isAd || isAdForm,
              advertiserName: postData.advertiserName || ''
            });
            if (editor && postData.body) {
              editor.commands.setContent(postData.body);
            }
          }
        } else {
          // Check local storage
          const savedDraft = localStorage.getItem(storageKey);
          let parsedDraft: any = null;
          if (savedDraft) {
            try {
              parsedDraft = JSON.parse(savedDraft);
              setFormData({ ...parsedDraft, isAd: isAdForm });
              if (editor && parsedDraft.body) {
                editor.commands.setContent(parsedDraft.body);
              }
            } catch (e) { }
          }

          if (locData.length > 0 && (!parsedDraft || !parsedDraft.locationId)) {
            setFormData(prev => ({ ...prev, locationId: locData[0].id.toString() }));
          }
          if (hashData.length > 0 && (!parsedDraft || !parsedDraft.hashtagIds)) {
            setFormData(prev => ({ ...prev, hashtagIds: [] }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit, params?.id, editor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // RULE: If video already exists, or if images exist and trying to upload video, alert.
    // User requested: "jika foto, foto saja. jika video, video saja ga boleh gabung"
    const hasVideo = formData.images.some(m => m.type === 'VIDEO');
    const hasImages = formData.images.some(m => m.type === 'IMAGE');

    const incomingFiles = Array.from(files);
    const incomingVideos = incomingFiles.filter(f => f.type.startsWith('video/'));
    const incomingImages = incomingFiles.filter(f => f.type.startsWith('image/'));

    if (incomingVideos.length > 0 && (hasImages || incomingImages.length > 0)) {
      handleModalOpen('Content Mismatch', 'You cannot mix photos and videos in a single post.');
      return;
    }
    if (incomingImages.length > 0 && hasVideo) {
      handleModalOpen('Content Mismatch', 'You cannot mix photos and videos in a single post.');
      return;
    }
    if (incomingVideos.length > 1 || (hasVideo && incomingVideos.length > 0)) {
      handleModalOpen('Limit Reached', 'You can only upload a maximum of 1 video.');
      return;
    }

    // New: If already has video, do nothing
    if (hasVideo) return;

    const remainingSlots = hasImages ? 5 - formData.images.length : (incomingVideos.length > 0 ? 1 : 5);
    if (remainingSlots <= 0) {
      handleModalOpen('Limit Reached', 'You have reached the maximum media limit.');
      return;
    }

    const filesToUpload = incomingFiles.slice(0, remainingSlots);
    const mediaToUpload = filesToUpload.map(file => ({
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      file
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...mediaToUpload.map(m => ({ url: m.preview, type: m.type }))],
    }));

    const newUploads: Record<string, number> = {};
    mediaToUpload.forEach((m) => {
      newUploads[m.preview] = 0;
    });
    setUploadProgress(prev => ({ ...prev, ...newUploads }));

    try {
      const uploadPromises = mediaToUpload.map(async (media) => {
        const currentPreviewUrl = media.preview;
        const file = media.file;

        if (media.type === 'VIDEO') {
          if (file.size > 1024 * 1024 * 10) { // 10MB max for video
            handleModalOpen('File Too Large', `Video exceeds the 10MB limit.`);
            setUploadProgress(prev => { const newState = { ...prev }; delete newState[currentPreviewUrl]; return newState; });
            return null;
          }
        } else {
          if (file.size > 1024 * 1024 * 2) {
            handleModalOpen('File Too Large', `Image ${file.name} exceeds the 2MB size limit.`);
            setUploadProgress(prev => { const newState = { ...prev }; delete newState[currentPreviewUrl]; return newState; });
            return null;
          }
        }

        let fileToUpload: File | Blob = file;
        
        // Only compress images
        if (media.type === 'IMAGE') {
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, onProgress: (p: number) => setUploadProgress(prev => ({ ...prev, [currentPreviewUrl]: p })) };
          fileToUpload = await imageCompression(file, options);
        } else {
          setUploadProgress(prev => ({ ...prev, [currentPreviewUrl]: 50 }));
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', fileToUpload);

        const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
        let data;
        try {
          data = await res.json();
        } catch(e) {
           throw new Error('Server returned invalid JSON on upload.');
        }

        setUploadProgress((prev) => {
          const newState = { ...prev };
          delete newState[currentPreviewUrl];
          return newState;
        });

        if (!res.ok) {
           throw new Error(data?.error || `Upload failed with status ${res.status}`);
        }
        return { url: data.url, type: media.type };
      });

      const uploadedResults = await Promise.all(uploadPromises.map(p => p.catch(e => {
        console.error("Individual upload error:", e);
        return null;
      })));
      
      const validResults = uploadedResults.filter((res): res is { url: string; type: string } => 
        res !== null && typeof res.url === 'string' && res.url.startsWith('/uploads/')
      );

      const previewUrls = mediaToUpload.map(m => m.preview);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images.filter((m) => !previewUrls.includes(m.url)), ...validResults],
      }));
      previewUrls.forEach((u) => URL.revokeObjectURL(u));

    } catch (err) {
      console.error('Upload process failed:', err);
      const previewUrls = mediaToUpload.map(m => m.preview);
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((m) => !previewUrls.includes(m.url)),
      }));
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      handleModalOpen('Upload Failed', err instanceof Error ? err.message : 'Error uploading media.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
      const data = await res.json();
      setFormData(prev => ({ ...prev, guidePdfUrl: data.url }));
    } catch (err) {
      console.error('PDF upload failed:', err);
      handleModalOpen('Upload Failed', 'There was an error uploading your PDF.');
    } finally {
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const removePdf = () => {
    setFormData(prev => ({ ...prev, guidePdfUrl: '' }));
  };

  const submitPost = async (asDraft: boolean) => {
    const media = (Array.isArray(formData.images) ? formData.images : []).filter(m => typeof m.url === 'string' && m.url.trim().length > 0);
    if (media.some((m) => m.url.startsWith('blob:'))) {
      handleModalOpen('Upload In Progress', 'Please wait until media upload finishes.');
      return;
    }
    const validMedia = media.filter((m) => !m.url.startsWith('blob:'));
    if (validMedia.length === 0) {
      handleModalOpen('Media Required', 'Please upload at least 1 image or video.');
      return;
    }

    if (!formData.title.trim()) {
      handleModalOpen('Validation Error', 'Title is required.');
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
          body: editor?.getHTML() || formData.body,
          guidePdfUrl: formData.guidePdfUrl?.trim() || null,
          lemonSqueezyUrl: formData.lemonSqueezyUrl?.trim() || null,
          guidePrice: formData.guidePrice?.trim() || null,
          googleMapsUrl: formData.googleMapsUrl?.trim() || null,
          isDraft: asDraft,
          isAd: formData.isAd,
          advertiserName: formData.advertiserName?.trim() || null,
          images: validMedia, // Sends array of {url, type} objects
          locationId: parseInt(formData.locationId),
          hashtagIds: formData.hashtagIds.map(id => parseInt(id))
        })
      });

      if (res.ok) {
        localStorage.removeItem(storageKey);
        router.push(isAdForm ? '/admin/ads' : '/admin/posts');
        router.refresh();
      } else {
        const errorData = await res.json();
        handleModalOpen('Save Failed', errorData.error || 'Unknown error.');
      }
    } catch (error) {
      console.error(error);
      handleModalOpen('Connection Error', 'Could not save the post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPost(false);
  };

  const handleSaveDraft = () => submitPost(true);

  const handleCancelClick = () => {
    setIsQuitModalOpen(true);
  };

  const confirmQuit = () => {
    setIsQuitModalOpen(false);
    router.back();
  };

  // --- External Link Modal Implementation ---
  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const selection = editor.state.selection;
    const selectedText = selection.empty ? '' : editor.state.doc.textBetween(selection.from, selection.to);

    setLinkData({ text: selectedText, url: previousUrl });
    setIsLinkModalOpen(true);
  };

  const submitLinkModal = () => {
    if (!editor) return;
    if (!linkData.url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const selection = editor.state.selection;
      if (selection.empty && linkData.text.trim()) {
        const url = linkData.url.startsWith('http') ? linkData.url : `https://${linkData.url}`;
        editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${linkData.text}</a>`).run();
      } else {
        const url = linkData.url.startsWith('http') ? linkData.url : `https://${linkData.url}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    }
    setIsLinkModalOpen(false);
  };

  // --- Generate Dummy Post for Preview ---
  const generatePreviewPost = () => {
    const selectedHashtags = hashtags.filter(h => formData.hashtagIds.includes(h.id.toString()));
    const selectedLocation = locations.find(l => l.id.toString() === formData.locationId);

    return {
      id: 0,
      title: formData.title || 'Untitled Archive',
      tagline: formData.tagline || 'Tagline will appear here',
      category: selectedHashtags.length > 0 ? selectedHashtags[0].name : 'Category',
      kabupaten: selectedLocation?.name || 'Location',
      province: formData.province,
      hashtagIds: formData.hashtagIds.map(id => parseInt(id)),
      locationId: parseInt(formData.locationId) || 0,
      hashtags: selectedHashtags,
      location: selectedLocation,
      bestTime: formData.bestTime || '-',
      cost: formData.cost || 'Free',
      howToGet: formData.howToGet || '-',
      body: editor?.getHTML() || formData.body || '<p>Content will appear here.</p>',
      guidePdfUrl: formData.guidePdfUrl,
      lemonSqueezyUrl: formData.lemonSqueezyUrl,
      guidePrice: formData.guidePrice,
      googleMapsUrl: formData.googleMapsUrl,
      images: formData.images.map((m, i) => ({ id: i, url: m.url, type: m.type, postId: 0 })),
      likes: 0,
      saves: 0,
      venue: null,
      isDraft: formData.isDraft,
      isAd: formData.isAd,
      advertiserName: formData.advertiserName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-[12px] font-black tracking-[0.2em] ">Syncing Archive</p>
      </div>
    </div>
  );

  const uploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-0 relative">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2">
            {isEdit ? (isAdForm ? 'Edit Advertisement' : 'Edit Archive') : (isAdForm ? 'New Advertisement' : 'New Archive Entry')}
          </h1>
          <p className="text-zinc-500 font-medium lowercase">
            {isEdit ? 'Refine the story' : (isAdForm ? 'Create a sponsored destination feature' : 'Document a new piece of Bali\'s heritage')}
          </p>
        </div>

        {/* Flat Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-5 py-2.5 bg-zinc-100 text-zinc-600 font-bold text-xs hover:bg-zinc-200 transition-colors rounded-xl border border-transparent"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors rounded-xl"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={submitting || uploading}
            className="px-5 py-2.5 bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-900 transition-colors rounded-xl disabled:opacity-50 min-w-[112px] text-center"
          >
            {submitting ? 'Saving...' : 'Draft'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="px-6 py-2.5 bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors rounded-xl disabled:opacity-50 min-w-[140px] text-center"
          >
            {submitting ? 'Archiving...' : isEdit ? 'Update' : 'Publish Entry'}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen} title={modalContent.title} message={modalContent.message}
        onConfirm={handleConfirm} onCancel={handleModalClose}
        confirmText={confirmAction ? 'Confirm' : 'OK'} cancelText={confirmAction ? 'Cancel' : ''}
      />

      {/* Discard Warning Modal */}
      {isQuitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-black text-zinc-900 mb-2">Save this post before quit?</h3>
            <p className="text-sm text-zinc-500 mb-6">You have unsaved changes. Do you want to save it as a draft or discard entirely?</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setIsQuitModalOpen(false); handleSaveDraft(); }} className="w-full py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">Save as Draft</button>
              <button onClick={confirmQuit} className="w-full py-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors">Discard Changes</button>
              <button onClick={() => setIsQuitModalOpen(false)} className="w-full py-3 bg-white text-zinc-500 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-colors border border-zinc-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Input Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-black text-zinc-900 mb-4">Insert Link</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2">Text Link</label>
                <input type="text" value={linkData.text} onChange={e => setLinkData(p => ({ ...p, text: e.target.value }))} placeholder="Visible text" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow" />
              </div>
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2">URL Link</label>
                <input type="url" value={linkData.url} onChange={e => setLinkData(p => ({ ...p, url: e.target.value }))} placeholder="https://" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsLinkModalOpen(false)} className="flex-1 py-3 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors">Cancel</button>
              <button onClick={submitLinkModal} className="flex-1 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">Insert</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32">
        {/* Left Column: Editor & Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Regular Size Title Input at the top */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden p-6 text-zinc-800">
            <label className="block text-[12px] font-black text-zinc-800   mb-3 ml-1">Archive Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter destination title..."
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-lg font-black text-zinc-900 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all placeholder:text-zinc-200"
            />
          </div>

          {/* Flat Card: Article Content */}
          <div className={isFullscreen
            ? "fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-in fade-in duration-200"
            : "bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col"
          }>
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h2 className="text-[12px] font-black text-zinc-800 ">
                {isFullscreen ? "Fullscreen Mode" : "Article Body"}
              </h2>
              <span className="text-[12px] font-bold text-zinc-400 capitalize">Rich Text Enabled</span>
            </div>

            {/* TipTap Toolbar */}
            {editor && (
              <div className="px-3 py-3 border-b border-zinc-100 flex flex-wrap gap-1 bg-white sticky top-0 z-20">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>
                </ToolbarButton>
                <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1">
                  <span className="text-xs font-black">H1</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2">
                  <span className="text-xs font-black">H2</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3">
                  <span className="text-xs font-black">H3</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="H4">
                  <span className="text-xs font-black">H4</span>
                </ToolbarButton>
                <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>
                </ToolbarButton>
                <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />
                <ToolbarButton onClick={openLinkModal} isActive={editor.isActive('link')} title="Link">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </ToolbarButton>
                <div className="ml-auto flex gap-1 items-center">
                  <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />
                  <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></svg>
                  </ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" /></svg>
                  </ToolbarButton>

                  <div className="w-px h-6 bg-zinc-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                    className={`p-2 rounded-lg transition-all active:scale-95 ${isFullscreen ? "bg-amber-100 text-amber-600" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      }`}
                  >
                    {isFullscreen ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className={`flex-1 bg-white ${isFullscreen ? "overflow-y-auto max-w-4xl mx-auto w-full px-4 mt-8 pb-32" : ""}`}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Flat Card: Media & Images */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h2 className="text-[12px] font-black text-zinc-800 ">Visual Assets</h2>
              <span className="text-[12px] font-bold text-zinc-400 capitalize">{formData.images.length} / 5 Images</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {formData.images.map((media, idx) => {
                  const url = typeof media === 'string' ? media : media.url;
                  const type = typeof media === 'string' ? 'IMAGE' : media.type;
                  const isUploading = url.startsWith('blob:');
                  const progress = uploadProgress[url];

                  return (
                    <div key={idx} className="relative aspect-square bg-zinc-50 rounded-xl group overflow-hidden border border-zinc-200">
                      {type === 'VIDEO' ? (
                        <video src={url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      )}

                      {isUploading && progress !== undefined ? (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <span className="text-xl font-black text-zinc-900 tracking-tighter">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      ) : (
                        <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[12px] font-black   backdrop-blur-sm">
                          Remove
                        </button>
                      )}
                      
                      {type === 'VIDEO' && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[8px] font-black rounded uppercase">Video</div>
                      )}
                    </div>
                  );
                })}
                {/* Limit Logic: Hide add button if 1 video exists OR 5 photos exist */}
                {!(formData.images.some(m => m.type === 'VIDEO')) && formData.images.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border border-dashed border-zinc-300 rounded-xl hover:border-zinc-500 hover:bg-zinc-50 transition-colors flex flex-col items-center justify-center gap-2 group">
                    <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                    <span className="text-[12px] font-black text-zinc-400 group-hover:text-zinc-600 ">Add Media</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleMediaUpload} accept="image/*,video/mp4" multiple className="hidden" />
              <p className="mt-3 text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-relaxed">
                * RULE: 5 Photos <span className="text-zinc-300 mx-1">OR</span> 1 Video (Max 10MB/1min)<br/>
                <span className="text-amber-500">Mixing photos and videos is NOT allowed.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">

          {/* Flat Card: Core Details */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[12px] font-black text-zinc-800  ">Details</h2>
            </div>
            <div className="p-6 space-y-5">
              {isAdForm && (
                <div>
                  <label className="block text-[12px] font-black text-zinc-500 mb-2 ml-1">Advertiser Name</label>
                  <input type="text" name="advertiserName" value={formData.advertiserName} onChange={handleChange} required placeholder="e.g. Bali Resort & Spa" className="w-full bg-white border border-amber-500 text-amber-900 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors placeholder:text-amber-500/50" />
                </div>
              )}
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1">Tagline</label>
                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} required placeholder="Short catchphrase" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1">Regency</label>
                  <select name="locationId" value={formData.locationId} onChange={handleChange} required className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors appearance-none p-r-8">
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1 flex items-center justify-between">
                    Hashtags
                    <span className="text-zinc-400 normal-case font-bold">{formData.hashtagIds.length}/3 tags</span>
                  </label>

                  <div className="min-h-[54px] w-full bg-white border border-zinc-200 rounded-xl p-2 flex flex-wrap gap-2 items-center focus-within:border-zinc-400 transition-colors">
                    {/* Selected Tags Chips */}
                    {formData.hashtagIds.map(id => {
                      const tag = hashtags.find(h => h.id.toString() === id);
                      return tag ? (
                        <div key={id} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 animate-in zoom-in-50 duration-200">
                          #{tag.name}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, hashtagIds: prev.hashtagIds.filter(tid => tid !== id) }))}
                            className="w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}

                    {/* Input Select if < 3 */}
                    {formData.hashtagIds.length < 3 ? (
                      <select
                        className="flex-1 min-w-[120px] bg-transparent text-sm font-bold text-zinc-900 outline-none p-1 cursor-pointer"
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !formData.hashtagIds.includes(val)) {
                            setFormData(prev => ({ ...prev, hashtagIds: [...prev.hashtagIds, val] }));
                          }
                        }}
                      >
                        <option value="" disabled>Add hashtag...</option>
                        {hashtags.filter(h => !formData.hashtagIds.includes(h.id.toString())).map(hash => (
                          <option key={hash.id} value={hash.id}>#{hash.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-[12px] font-bold text-zinc-300 px-2">Limit reached</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flat Card: Logistics */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[12px] font-black text-zinc-800  ">Travel Logistics</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1">Best Time</label>
                  <input type="text" name="bestTime" value={formData.bestTime} onChange={handleChange} required placeholder="e.g. 06:00" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300" />
                </div>
                <div>
                  <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1">Cost</label>
                  <input type="text" name="cost" value={formData.cost} onChange={handleChange} required placeholder="Entry Fee" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1">Access Instructions</label>
                <textarea name="howToGet" value={formData.howToGet} onChange={handleChange} required rows={3} placeholder="How to get there?" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors resize-none placeholder:text-zinc-300" />
              </div>
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1 flex items-center gap-1.5">
                  Google Maps URL <span className="text-zinc-400 font-semibold lowercase ml-auto">(optional)</span>
                </label>
                <input type="url" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/..." className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300" />
              </div>
            </div>
          </div>

          {/* Flat Card: Insider Guide (PDF) - Standardized Colors */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <h2 className="text-[12px] font-black text-zinc-800  ">Insider Guide</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Option 1: Free PDF (direct upload) */}
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black">FREE</span>
                  Guide Document (PDF Upload)
                </label>
                {!formData.guidePdfUrl ? (
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                    </div>
                    <span className="text-[12px] font-black text-zinc-500 group-hover:text-zinc-700  tracking-wide transition-colors">Upload Free PDF</span>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <span className="text-[12px] font-bold text-zinc-800 truncate">Free PDF Uploaded</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={formData.guidePdfUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors" title="View PDF">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      </a>
                      <button type="button" onClick={removePdf} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Remove PDF">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                )}
                <input type="file" ref={pdfInputRef} onChange={handlePdfUpload} accept=".pdf" className="hidden" />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-100" />
                <span className="text-[12px] font-black text-zinc-300  ">or</span>
                <div className="flex-1 h-px bg-zinc-100" />
              </div>

              {/* Option 2: Paid via LemonSqueezy */}
              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black">PAID</span>
                  LemonSqueezy Checkout URL
                </label>
                <input
                  type="url"
                  name="lemonSqueezyUrl"
                  value={formData.lemonSqueezyUrl}
                  onChange={handleChange}
                  placeholder="https://yourstore.lemonsqueezy.com/buy/..."
                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-300"
                />
                <p className="text-[12px] text-zinc-400 mt-1.5 ml-1">If set, visitors will see a &quot;Buy Guide&quot; button linking to your LemonSqueezy checkout.</p>
              </div>

              <div>
                <label className="block text-[12px] font-black text-zinc-500  mb-2 ml-1">Guide Price (Display)</label>
                <input type="text" name="guidePrice" value={formData.guidePrice} onChange={handleChange} placeholder="e.g. $9 or Rp 15.000" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300" />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* --- LIVE PREVIEW OVERLAY --- */}
      {isPreviewOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity"
            onClick={() => setIsPreviewOpen(false)}
          />
          <ArticleSheet isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} post={generatePreviewPost() as any} onFilter={() => {}} />
        </>
      )}
    </div>
  );
}
