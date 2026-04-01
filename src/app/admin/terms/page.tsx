'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Link as TipTapLink } from '@tiptap/extension-link';

const ToolbarButton = ({ onClick, isActive = false, title, children }: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
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

export default function AdminTermsPage() {
  const [termsTitle, setTermsTitle] = useState('');
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
        placeholder: 'Enter terms & conditions content...',
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
      const res = await fetch('/api/settings/terms');
      const data = await res.json();
      setTermsTitle(data.termsTitle || '');
      if (editor) {
        editor.commands.setContent(data.termsContent || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!termsTitle.trim()) {
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
      const res = await fetch('/api/settings/terms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          termsTitle, 
          termsContent: editor.getHTML() 
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
      <div className="flex items-center justify-center min-h-[600px] animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-[12px] font-black tracking-[0.2em] uppercase">Syncing Archive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-0">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2">
            Terms & Conditions Settings
          </h1>
          <p className="text-zinc-500 font-medium">
            Customize the content displayed on the public T&C page
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="px-5 py-2.5 bg-zinc-100 text-zinc-600 font-bold text-xs hover:bg-zinc-200 transition-colors rounded-xl"
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
            className="px-6 py-2.5 bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors rounded-xl disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <label className="block text-[12px] font-black text-zinc-800 mb-3 ml-1 uppercase tracking-wider">Terms Title</label>
          <input
            type="text"
            value={termsTitle}
            onChange={(e) => setTermsTitle(e.target.value)}
            placeholder="Enter T&C page title..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-lg font-black text-zinc-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
            <h2 className="text-[12px] font-black text-zinc-800 uppercase tracking-wider">Rich Content Editor</h2>
          </div>
          
          {editor && (
            <>
              <div className="border-b border-zinc-100">
                <div className="px-3 py-3 flex flex-wrap gap-1 bg-white">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1 2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </ToolbarButton>
                  <div className="ml-auto flex gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 14l5 5-5 5" /><path d="M20 16h-8.5a4.5 4.5 0 0 1-4.5-4.5v0a4.5 4.5 0 0 1 4.5-4.5H16" /></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 14 5-5-5-5" /><path d="M20 16h-8.5a4.5 4.5 0 0 1-4.5-4.5v0a4.5 4.5 0 0 1 4.5-4.5H16" /></svg>
                    </ToolbarButton>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="p-6 min-h-[400px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl border animate-in slide-in-from-bottom duration-300 ${
            messageType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-amber-500 text-white font-black text-sm uppercase tracking-wide hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl shadow-lg hover:shadow-amber-500/25"
          >
            {saving ? 'Saving...' : 'Save Terms & Conditions'}
          </button>
        </div>
      </div>
    </div>
  );
}

