'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    title: string;
    tagline: string;
    slug?: string | null;
    id: number;
  } | null;
}

function ShareSheetContent({ isOpen, onClose, post }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = post
    ? `${window.location.origin}/?post=${post.slug}`
    : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    // Try modern clipboard API first, fallback for non-HTTPS
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl).catch(() => fallbackCopy(shareUrl));
    } else {
      fallbackCopy(shareUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const socialLinks = post ? [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.553 4.175 1.605 6.009L0 24l6.111-1.604a11.845 11.845 0 005.935 1.597h.005c6.605 0 12.039-5.44 12.041-12.045a11.821 11.821 0 00-3.415-8.419" />
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${post.tagline} ${shareUrl}`)}`,
      bgColor: '#25D366',
    },
    {
      name: 'Facebook',
      icon: (
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      bgColor: '#1877F2',
    },
    {
      name: 'X',
      icon: (
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post.title} - ${post.tagline}`)}&url=${encodeURIComponent(shareUrl)}`,
      bgColor: '#000000',
    },
    {
      name: 'TikTok',
      icon: (
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.81a8.18 8.18 0 004.78 1.52V6.85a4.85 4.85 0 01-1.01-.16z"/>
        </svg>
      ),
      url: `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post?.title ?? '')}`,
      bgColor: '#010101',
    },
  ] : [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 2147483646, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', transition: 'opacity 0.3s', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          background: 'white',
          borderRadius: '40px 40px 0 0',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.3)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{ padding: '16px 32px 48px', maxWidth: '672px', margin: '0 auto' }}>
          {/* Handle */}
          <div style={{ width: 48, height: 4, background: '#e4e4e7', borderRadius: 9999, margin: '0 auto 24px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#09090b', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 4 }}>Share Archive</h2>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{post?.title}</p>
            </div>
            <button
              onClick={onClose}
              style={{ width: 40, height: 40, minWidth: 40, borderRadius: '50%', background: '#f4f4f5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', flexShrink: 0 }}
            >
              <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Copy Link */}
            <div style={{ padding: 16, background: '#fafafa', border: '1px solid rgba(0,0,0,0.03)', borderRadius: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Universal Link</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid rgba(0,0,0,0.05)', padding: 8, borderRadius: 16 }}>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 12, paddingRight: 8, fontSize: 12, fontWeight: 700, color: '#a1a1aa' }}>
                  {shareUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  style={{ padding: '10px 20px', borderRadius: 12, fontSize: 10, fontWeight: 900, border: 'none', cursor: 'pointer', background: copied ? '#10b981' : '#09090b', color: 'white', transition: 'all 0.2s', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Copied!
                    </>
                  ) : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 16 }}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: social.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShareSheet(props: ShareSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(<ShareSheetContent {...props} />, document.body);
}
