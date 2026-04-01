'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Link as TipTapLink } from '@tiptap/extension-link';

export default function AdminAboutPage() {
  const [aboutTitle, setAboutTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-semibold',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Tell your story here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none focus:outline-none min-h-[500px] p-6 text-sm text-zinc-800',
      },
    },
    onUpdate: ({ editor }) => {
      // Content updates automatically
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    fetchSettings();
  }, [editor]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/about');
      const data = await res.json();
      setAboutTitle(data.aboutTitle || '');
      if (editor) {
        editor.commands.setContent(data.aboutContent || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!aboutTitle.trim()) {
      setMessageType('error');
      setMessage('Title is required');
      return;
    }
    if (!editor || editor.isEmpty) {
      setMessageType('error');
      setMessage('Content is required');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings/about', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aboutTitle, 
          aboutContent: editor.getHTML() 
        }),
      });

      if (res.ok) {
        setMessageType('success');
        setMessage('✓ Success! Changes saved.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessageType('error');
        setMessage('✗ Error! Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setMessageType('error');
      setMessage('✗ Error! Connection failed');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100 animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-[12px] font-black tracking-[0.2em]">Syncing Archive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-0 relative">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2">
            About Page Settings
          </h1>
          <p className="text-zinc-500 font-medium">
            Customize the content displayed on the public about page
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="px-5 py-2.5 bg-zinc-100 text-zinc-600 font-bold text-xs hover:bg-zinc-200 transition-colors rounded-xl border border-transparent"
          >
            Back
          </Link>

          <button
            onClick={fetchSettings}
            disabled={saving}
            className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors rounded-xl disabled:opacity-50"
          >
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors rounded-xl disabled:opacity-50 min-w-35 text-center"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title Input */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden p-6 text-zinc-800">
          <label className="block text-[12px] font-black text-zinc-800 mb-3 ml-1">About Title</label>
          <input
            type="text"
            value={aboutTitle}
            onChange={(e) => setAboutTitle(e.target.value)}
            placeholder="Enter about page title..."
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-lg font-black text-zinc-900 focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all placeholder:text-zinc-200"
          />
        </div>

        {/* Content Card - Rich Editor */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <h2 className="text-[12px] font-black text-zinc-800">
              About Content
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
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} isActive={false} title="Undo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} isActive={false} title="Redo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" /></svg>
                </ToolbarButton>
              </div>
            </div>
          )}

          <div className="flex-1 bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-sm font-bold border animate-in fade-in duration-300 flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border-green-200 shadow-lg shadow-green-500/10'
              : 'bg-red-50 text-red-700 border-red-200 shadow-lg shadow-red-500/10'
          }`}>
            {messageType === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Link Input Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-black text-zinc-900 mb-4">Insert Link</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[12px] font-black text-zinc-500 mb-2">Text Link</label>
                <input type="text" value={linkData.text} onChange={e => setLinkData(p => ({ ...p, text: e.target.value }))} placeholder="Visible text" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow" />
              </div>
              <div>
                <label className="block text-[12px] font-black text-zinc-500 mb-2">URL Link</label>
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
    </div>
  );
}

const ToolbarButton = ({ onClick, isActive, title, children }: { onClick: () => void; isActive: boolean; title: string; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all active:scale-95 ${
      isActive ? "bg-amber-100 text-amber-600" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
    }`}
  >
    {children}
  </button>
);
