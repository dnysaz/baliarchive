'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Prisma } from '@prisma/client';
import ArticleSheet from './ArticleSheet';
import KabupatenDrawer from './KabupatenDrawer';
import SavedPage from './SavedPage';
import SearchOverlay from './SearchOverlay';

type Post = Prisma.PostGetPayload<{ include: { images: true } }>;

interface BaliArchiveProps {
  initialData: Post[];
}

// --- Icons ---
const HeartIcon = ({ filled, color, size = 20 }: { filled: boolean; color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} style={{ color }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth="2" />
  </svg>
);

const SaveIcon = ({ saved, size = 20 }: { saved: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? '#f59e0b' : 'none'} stroke={saved ? '#f59e0b' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const ReadIcon = ({ size = 20, opacity = 1 }: { size?: number; opacity?: number | string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `rgba(255,255,255,${opacity})` }}>
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);

const ShareIcon = ({ size = 20, opacity = 1 }: { size?: number; opacity?: number | string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `rgba(255,255,255,${opacity})` }}>
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const SearchIcon = ({ size = 14, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ChevronDownIcon = ({ size = 12, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ClockIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const DollarIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

// --- Action Buttons ---
const ActionButton = ({ onClick, label, icon }: { onClick: () => void; label: string | number; icon: React.ReactNode }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="flex flex-col items-center gap-1.5 cursor-pointer appearance-none border-none bg-transparent outline-none p-0 active:scale-90 transition-transform select-none pointer-events-auto"
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">{icon}</div>
    <span className="text-xs font-semibold text-white drop-shadow-md">{label}</span>
  </button>
);

const DesktopActionButton = ({ onClick, label, icon }: { onClick: () => void; label: string | number; icon: React.ReactNode }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="flex flex-col items-center gap-2 cursor-pointer appearance-none border-none bg-transparent outline-none p-0 active:scale-90 transition-transform select-none pointer-events-auto group"
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    <div className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 flex items-center justify-center transition-all duration-300 shadow-2xl">{icon}</div>
    <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors drop-shadow-md">{label}</span>
  </button>
);

// --- Card Component ---
const Card = ({
  item,
  isSaved,
  isLiked,
  onLike,
  onSave,
  onRead,
  onShare,
}: {
  item: Post;
  isSaved: boolean;
  isLiked: boolean;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onRead: (item: Post) => void;
  onShare: (item: Post) => void;
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<number>(0);

  const handleScroll = () => {
    if (carouselRef.current) {
      const idx = Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth);
      setActiveSlide(idx);
    }
  };

  // Double-tap detection — only on the image/carousel area, skip buttons
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Ensure we don't trigger read more on buttons or interactive elements
    if (target.closest('button') || target.closest('a') || target.closest('.no-tap')) return;
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      onRead(item);
      lastTap.current = 0; // Reset after successful double tap
    } else {
      lastTap.current = now;
    }
  };

  const catColor =
    ({
      Nature: 'bg-emerald-600',
      Culture: 'bg-amber-600',
      Adventure: 'bg-orange-600',
      Wellness: 'bg-teal-600',
    } as Record<string, string>)[item.category] || 'bg-zinc-600';

  return (
    <div
      className="relative w-full flex justify-center bg-black snap-start shrink-0"
      style={{ height: '100dvh' }}
      data-id={item.id}
    >
      {/* Visual container — overflow-hidden stays here for the carousel */}
      <div className="relative w-full max-w-2xl h-full overflow-hidden bg-zinc-950">

        {/* Carousel — double-tap lives here, not on the outer div */}
        <div
          className="carousel h-full w-full overflow-x-scroll snap-x snap-mandatory no-scrollbar flex"
          ref={carouselRef}
          onScroll={handleScroll}
          onClick={handleTap}
        >
          {item.images.map((img, i) => (
            <div key={i} className="carousel-slide w-full h-full shrink-0 snap-start relative">
              <img
                src={img.url}
                alt={item.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Slide dots */}
        {item.images.length > 1 && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 flex gap-1.5 items-center z-60 pointer-events-none">
            {item.images.map((_, i) => (
              <div key={i} className={`dot ${i === activeSlide ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(24px+env(safe-area-inset-bottom))] text-white z-20 pointer-events-none">
          <div className="flex items-end gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white ${catColor}`}>
                  {item.category}
                </span>
                <span className="text-xs font-semibold text-white/70">
                  {item.kabupaten}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight line-clamp-2">{item.title}</h1>
              <p className="text-sm text-white/80 mt-1.5 line-clamp-2">{item.tagline}</p>
            </div>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden flex flex-col gap-4 pointer-events-auto no-tap">
              <ActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : 'white'} />} />
              <ActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} />} />
              <ActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon />} />
              <ActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon />} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Action Buttons (Sidebar) - Outside the max-w-2xl container and overflow-hidden */}
      <div className="hidden lg:flex flex-col gap-5 absolute left-[calc(50%+350px)] top-1/2 -translate-y-1/2 z-50 no-tap">
        <DesktopActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : 'white'} size={24} />} />
        <DesktopActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} size={24} />} />
        <DesktopActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon size={24} />} />
        <DesktopActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon size={24} />} />
      </div>
    </div>
  );
};

// --- Main Component ---
export default function BaliArchive({ initialData }: BaliArchiveProps) {
  const [posts, setPosts] = useState(initialData);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSavedOpen, setSavedOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [readPosts, setReadPosts] = useState<Set<number>>(new Set());
  const [activeKabupaten, setActiveKabupaten] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage
  useEffect(() => {
    const liked = localStorage.getItem('likedPosts');
    const saved = localStorage.getItem('savedPosts');
    const read = localStorage.getItem('readPosts');
    queueMicrotask(() => {
      if (liked) setLikedPosts(new Set(JSON.parse(liked)));
      if (saved) setSavedPosts(new Set(JSON.parse(saved)));
      if (read) setReadPosts(new Set(JSON.parse(read)));
    });
  }, []);

  // --- Handlers ---
  const handleLike = async (id: number) => {
    const newLiked = new Set(likedPosts);
    const isLiking = !newLiked.has(id);
    
    if (isLiking) {
      newLiked.add(id);
      try {
        const res = await fetch(`/api/posts/${id}/action`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'like' }),
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.likes } : p));
        }
      } catch (error) {
        console.error('Failed to like:', error);
      }
    } else {
      newLiked.delete(id);
      // We don't have a decrement action yet, but user asked for +1 on click.
      // Usually like/unlike is handled. For now I'll just follow the "+1" requirement.
    }
    
    setLikedPosts(newLiked);
    localStorage.setItem('likedPosts', JSON.stringify(Array.from(newLiked)));
  };

  const handleSave = async (id: number) => {
    const newSaved = new Set(savedPosts);
    const isSaving = !newSaved.has(id);

    if (isSaving) {
      newSaved.add(id);
      try {
        const res = await fetch(`/api/posts/${id}/action`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save' }),
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(prev => prev.map(p => p.id === id ? { ...p, saves: data.saves } : p));
        }
      } catch (error) {
        console.error('Failed to save:', error);
      }
    } else {
      newSaved.delete(id);
    }

    setSavedPosts(newSaved);
    localStorage.setItem('savedPosts', JSON.stringify(Array.from(newSaved)));
  };

  const handleRead = (post: Post) => {
    setActivePost(post);
    setSheetOpen(true);
    const newRead = new Set(readPosts);
    if (!newRead.has(post.id)) {
      newRead.add(post.id);
      setReadPosts(newRead);
      localStorage.setItem('readPosts', JSON.stringify(Array.from(newRead)));
    }
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.tagline,
        url: window.location.href, // Or a specific URL for the post
      });
    }
  };

  const handleOpenSaved = () => setSavedOpen(true);
  const handleCloseSaved = () => setSavedOpen(false);
  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);
  const handleOpenSearch = () => setSearchOpen(true);
  const handleCloseSearch = () => setSearchOpen(false);

  const handleSelectKabupaten = (kab: string | null) => {
    const newKab = kab === 'All' ? null : kab;
    setActiveKabupaten(newKab);
    setDrawerOpen(false);
    // Scroll to top
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (post: Post) => {
    // If the post is not currently in the filtered list, we need to clear the filter first
    if (activeKabupaten && post.kabupaten !== activeKabupaten) {
      setActiveKabupaten(null);
    }
    
    // Use setTimeout to wait for the DOM to update if we cleared the filter
    setTimeout(() => {
      const postElement = document.querySelector(`[data-id='${post.id}']`);
      if (postElement && mainRef.current) {
        mainRef.current.scrollTo({
          top: postElement.getBoundingClientRect().top + mainRef.current.scrollTop - mainRef.current.getBoundingClientRect().top,
          behavior: 'smooth'
        });
      }
    }, 50);
    
    setSearchOpen(false);
  };

  const filteredPosts = useMemo(() => {
    if (!activeKabupaten) return posts;
    return posts.filter(p => p.kabupaten === activeKabupaten);
  }, [posts, activeKabupaten]);

  const savedPostsData = useMemo(() => {
    return posts.filter(p => savedPosts.has(p.id));
  }, [posts, savedPosts]);

  const [searchQuery, setSearchQuery] = useState('');

  const kabupatenList = useMemo(() => {
    const allKab = posts.map(p => p.kabupaten);
    const uniqueKab = ['All', ...Array.from(new Set(allKab))];
    return uniqueKab.map(name => ({
      name,
      count: name === 'All' ? posts.length : posts.filter(p => p.kabupaten === name).length,
    }));
  }, [posts]);

  return (
    <>
      <main
        ref={mainRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
        style={{ height: '100dvh' }}
      >
        {filteredPosts.map(item => (
          <Card
            key={item.id}
            item={item}
            isSaved={savedPosts.has(item.id)}
            isLiked={likedPosts.has(item.id)}
            onLike={handleLike}
            onSave={handleSave}
            onRead={handleRead}
            onShare={handleShare}
          />
        ))}
      </main>

      {/* --- Header & Overlays --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-4 px-4 lg:px-8 pt-[max(16px,env(safe-area-inset-top))] pb-10 bg-linear-to-b from-black/60 to-transparent pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenDrawer(); }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shrink-0 pointer-events-auto shadow-xl"
        >
          <span className="font-black text-[13px] tracking-tight text-white">{activeKabupaten || 'Bali Archive'}</span>
          <ChevronDownIcon size={14} />
        </button>

        <div className="flex items-center gap-2.5 shrink-0 pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenSearch(); }}
            className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-xl"
          >
            <SearchIcon size={19} color="white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenSaved(); }}
            className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-xl"
          >
            <SaveIcon saved={savedPosts.size > 0} size={20} />
          </button>
        </div>
      </header>

      <ArticleSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} post={activePost} />
      <KabupatenDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} kabupatens={kabupatenList} setActiveKab={handleSelectKabupaten} activeKab={activeKabupaten} />
      <SavedPage isOpen={isSavedOpen} onClose={handleCloseSaved} savedPosts={savedPostsData} onOpenPost={(post) => { handleSelectPost(post); handleCloseSaved(); }} />
      <SearchOverlay isOpen={isSearchOpen} onClose={handleCloseSearch} allPosts={posts} onSelectPost={handleSelectPost} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </>
  );
}
