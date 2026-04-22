'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import ArticleSheet from './ArticleSheet';
import RegencyDrawer from './RegencyDrawer';
import SavedPage from './SavedPage';
import SearchOverlay from './SearchOverlay';
import ShareSheet from './ShareSheet';
import ToastContainer, { showToast } from './Toast';

type Post = Prisma.PostGetPayload<{ include: { images: true, hashtags: true, regency: true } }>;

interface BaliArchiveProps {
  initialData: Post[];
  allRegencies: any[];
}

// --- Icons ---
const HeartIcon = ({ filled, color, size = 20 }: { filled: boolean; color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} style={{ color }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth="2" />
  </svg>
);

const SaveIcon = ({ saved, size = 20 }: { saved: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? '#f59e0b' : 'none'} stroke={saved ? '#f59e0b' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const GridIcon = ({ size = 20, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

// --- Action Buttons ---
const ActionButton = ({ onClick, label, icon }: { onClick: (e: any) => void; label: string | number; icon: React.ReactNode }) => (
  <Link
    href="#"
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }}
    className="flex flex-col items-center gap-1.5 cursor-pointer appearance-none border-none bg-transparent outline-none p-0 active:scale-90 transition-transform pointer-events-auto [touch-action:manipulation]"
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">{icon}</div>
    <span className="text-xs font-semibold text-white drop-shadow-md">{label}</span>
  </Link>
);

const DesktopActionButton = ({ onClick, label, icon }: { onClick: (e: any) => void; label: string | number; icon: React.ReactNode }) => (
  <Link
    href="#"
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }}
    className="flex flex-col items-center gap-2 cursor-pointer appearance-none border-none bg-transparent outline-none p-0 active:scale-90 transition-transform pointer-events-auto group [touch-action:manipulation]"
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    <div className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 flex items-center justify-center transition-all duration-300 shadow-2xl">{icon}</div>
    <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors drop-shadow-md">{label}</span>
  </Link>
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
  onFilter,
  isActive,
  isMuted,
  toggleMute,
  audioUnlocked,
}: {
  item: Post;
  isSaved: boolean;
  isLiked: boolean;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onRead: (item: Post) => void;
  onShare: (item: Post) => void;
  onFilter: (type: 'regency' | 'tag', value: string) => void;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  audioUnlocked: boolean;
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const lastTap = useRef<number>(0);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const toggleVideo = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    triggerControls();
  };

  const handleMuteToggle = (e?: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    toggleMute();
    triggerControls();
  };

  const triggerControls = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 2500);
  };

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video, idx) => {
      if (!video) return;
      
      const isCurrentSlide = idx === activeSlide;
      const shouldPlay = isActive && isCurrentSlide;
      
      // We try to honor the global isMuted state, but browser might force mute on first play
      video.muted = isMuted || !isActive || !isCurrentSlide;

      if (shouldPlay) {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay with sound might be blocked. 
              // Fallback: Mute the video and try playing again to ensure NO BLACK SCREEN.
              video.muted = true;
              video.play().catch(e => console.error("Video play failed even when muted:", e));
            });
          }
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [isActive, isMuted, activeSlide, audioUnlocked]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const idx = Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth);
      setActiveSlide(idx);
    }
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[role="button"]') || target.closest('button') || target.closest('a') || target.closest('.no-tap')) return;

    // Fast response - prevent parent reels from taking control
    e.stopPropagation();

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    // Get touch/click Y position relative to SCREEN
    let clientY = 0;
    if ('clientY' in e) {
      clientY = e.clientY;
    } else if ((e as any).touches?.[0]) {
      clientY = (e as any).touches[0].clientY;
    } else if ((e as any).changedTouches?.[0]) {
      clientY = (e as any).changedTouches[0].clientY;
    }

    // fallback to center if we somehow lose coordinates
    const isInteractingArea = !clientY || (clientY > 80 && clientY < window.innerHeight * 0.75);

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      onRead(item);
      lastTap.current = 0; 
    } else {
      const currentMedia = item.images[activeSlide] as any;
      if (currentMedia?.type === 'VIDEO' && isInteractingArea) {
        toggleVideo(activeSlide);
      }
      lastTap.current = now;
    }
  };

  return (
    <div
      className="relative w-full flex justify-center bg-black snap-start shrink-0"
      style={{ height: '100dvh' }}
      data-id={item.id}
    >
      <div className="relative w-full max-w-2xl h-full overflow-hidden bg-zinc-950">
        <div
          className="carousel h-full w-full overflow-x-scroll snap-x snap-mandatory no-scrollbar flex touch-pan-x touch-pan-y pointer-events-auto relative z-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y'
          }}
          ref={carouselRef}
          onScroll={handleScroll}
        >
          {item.images.map((media: any, idx: number) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center bg-black relative group pointer-events-auto z-10"
                onClick={handleTap}
                onTouchEnd={(e) => {
                  // If it's a quick tap (not a scroll), handle it
                  const now = Date.now();
                  if (now - lastTap.current < 300) {
                    // This will be handled by onClick mainly, but for Safari we can use touchEnd
                    // Actually, if we use both we might get double taps.
                    // I'll stick to onClick + touch-action for Safari.
                  }
                }}
              >
                {media.type === 'VIDEO' ? (
                  <video
                    key={media.url}
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    src={media.url}
                    poster={item.images.find(img => img.type === 'IMAGE')?.url}
                    className="w-full h-full object-contain pointer-events-none"
                    playsInline
                    webkit-playsinline="true"
                    autoPlay
                    loop
                    controls={false}
                    disableRemotePlayback
                    onContextMenu={(e) => e.preventDefault()}
                    muted={isMuted || !isActive || idx !== activeSlide}
                    preload="auto"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
        </div>


        {/* Safari-Optimized Interactive Zone: Top 70% is completely clear for taps and swipes */}
        
        {/* Right Sidebar - Side Buttons */}
        <div className="absolute right-6 bottom-[calc(80px+env(safe-area-inset-bottom))] z-50 lg:hidden pointer-events-none no-tap text-white">
          <div className="flex flex-col gap-4 pointer-events-auto items-center">
            <ActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : 'white'} />} />
            <ActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} />} />
            {item.images[activeSlide]?.type === 'VIDEO' && (
              <ActionButton 
                onClick={handleMuteToggle} 
                label={isMuted ? "Off" : "On"} 
                icon={isMuted ? (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
                ) : (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
              />
            )}
            <ActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon />} />
            <ActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon />} />
          </div>
        </div>

        {/* Bottom Bar - Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(24px+env(safe-area-inset-bottom))] z-40 pointer-events-none overflow-hidden text-white">
          <div className="flex flex-col justify-end w-full max-w-2xl mx-auto">
            {item.images.length > 1 && (
              <div className="flex justify-center mb-6 no-tap">
                <div className="flex flex-row gap-1.25">
                  {item.images.map((_: any, i: number) => (
                    <div key={i} className={`dot ${i === activeSlide ? 'active' : ''}`} />
                  ))}
                </div>
              </div>
            )}
            
            <div className="pointer-events-auto [touch-action:manipulation] flex items-end gap-10">
              <div className="flex-1 min-w-0 pb-1">
                {item.isAd && (
                  <div className="inline-block mb-1.5 bg-amber-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 no-tap">
                    Sponsored {item.advertiserName && <span className="text-white/80 lowercase tracking-normal">by</span>} {item.advertiserName}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mb-2 no-tap flex-wrap">
                  {item.hashtags?.map((hash: any, i: number) => (
                    <React.Fragment key={hash.id || i}>
                      {i > 0 && <span className="w-0.5 h-0.5 bg-white/30 rounded-full" />}
                      <button
                        onClick={() => onFilter('tag', hash.name)}
                        className="text-[11px] font-bold text-white/90 hover:text-white hover:underline transition-all outline-none"
                      >
                        #{hash.name}
                      </button>
                    </React.Fragment>
                  ))}
                  <span className="w-0.5 h-0.5 bg-white/30 rounded-full mx-0.5" />
                  <button
                    onClick={() => item.regency?.name && onFilter('regency', item.regency.name)}
                    className="text-[11px] font-bold text-white/60 hover:text-white hover:underline transition-all outline-none"
                  >
                    {item.regency?.name}
                  </button>
                </div>
                <h1 className="text-xl lg:text-2xl font-bold leading-tight line-clamp-2 break-words no-tap">{item.title}</h1>
                <p className="text-sm text-white/80 mt-1.5 line-clamp-2 break-words no-tap">{item.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Playback Indicator (Feedback Only) - pointer-events-none ensures no touch conflict */}
        {item.images[activeSlide]?.type === 'VIDEO' && (
          <div className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-300 pointer-events-none ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="w-20 h-20 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
              {isPlaying ? (
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24" className="ml-1.5"><path d="M8 5v14l11-7z"/></svg>
              )}
            </div>
          </div>
        )}

        {/* Removed problematic middle HUD - relying on screen tap for play/pause and side-bar for mute */}
      </div>

      <div className="hidden lg:flex flex-col gap-5 absolute left-[calc(50%+350px)] top-[65%] -translate-y-1/2 z-50 no-tap">
        <DesktopActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : 'white'} size={24} />} />
        <DesktopActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} size={24} />} />
        {item.images[activeSlide]?.type === 'VIDEO' && (
          <DesktopActionButton 
            onClick={() => handleMuteToggle({ stopPropagation: () => {} } as any)} 
            label={isMuted ? "Muted" : "Sound"} 
            icon={isMuted ? (
              <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          />
        )}
        <DesktopActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon size={24} />} />
        <DesktopActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon size={24} />} />
      </div>
    </div>
  );
};

// --- Main Component ---
export default function BaliArchive({ initialData, allRegencies }: BaliArchiveProps) {
  const [posts, setPosts] = useState(initialData);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [adRefreshKey, setAdRefreshKey] = useState(0);
  const refreshAds = () => setAdRefreshKey(prev => prev + 1);

  // Reverting to State-based UI instead of URL-based
  const [uiState, setUiState] = useState<{
    menu: null | 'search' | 'saved' | 'drawer' | 'explore';
    post: string | null;
    share: string | null;
    regency: string | null;
    q: string;
    mute: boolean;
  }>({
    menu: null,
    post: null,
    share: null,
    regency: null,
    q: '',
    mute: false
  });

  const isSearchOpen = uiState.menu === 'search';
  const isSavedOpen = uiState.menu === 'saved';
  const isDrawerOpen = uiState.menu === 'drawer';
  const isExploreOpen = uiState.menu === 'explore';
  const isShareOpen = !!uiState.share;
  const isSheetOpen = !!uiState.post;
  const activeKabupaten = uiState.regency;
  const searchQuery = uiState.q;

  const handleOpenSearch = () => { refreshAds(); setUiState(prev => ({ ...prev, menu: 'search' })); };
  const handleOpenSaved = () => { refreshAds(); setUiState(prev => ({ ...prev, menu: 'saved' })); };
  const handleOpenExplore = () => { refreshAds(); setUiState(prev => ({ ...prev, menu: 'explore' })); };
  const handleOpenDrawer = () => { refreshAds(); setUiState(prev => ({ ...prev, menu: 'drawer' })); };

  const setSearchQuery = (q: string) => {
    setUiState(prev => ({ ...prev, q }));
  };

  const setActiveKabupaten = (regency: string | null) => {
    setUiState(prev => ({ ...prev, regency }));
  };

  const isGlobalMuted = uiState.mute;
  const setIsGlobalMuted = (muted: boolean) => {
    setUiState(prev => ({ ...prev, mute: muted }));
  };
  const toggleGlobalMute = () => {
    setUiState(prev => ({ ...prev, mute: !prev.mute }));
  };

  const activePost = useMemo(() => {
    if (!uiState.post) return null;
    return posts.find(p => p.slug === uiState.post);
  }, [uiState.post, posts]);

  const isNotFoundOpen = !!uiState.post && !activePost;

  const sharePost = useMemo(() => {
    if (!uiState.share) return null;
    return posts.find(p => p.slug === uiState.share);
  }, [uiState.share, posts]);

  const mainRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeCardId, setActiveCardId] = useState<number | null>(initialData[0]?.id || null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [posts]);

  const handleFilter = (type: 'regency' | 'tag', value: string) => {
    setUiState(prev => ({
      ...prev,
      menu: 'search',
      q: type === 'tag' ? `#${value}` : value
    }));
  };

  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [readPosts, setReadPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const liked = localStorage.getItem('likedPosts');
    const saved = localStorage.getItem('savedPosts');
    const read = localStorage.getItem('readPosts');
    const mute = localStorage.getItem('isMuted');

    queueMicrotask(() => {
      if (liked) setLikedPosts(new Set(JSON.parse(liked)));
      if (saved) setSavedPosts(new Set(JSON.parse(saved)));
      if (read) setReadPosts(new Set(JSON.parse(read)));
      
      // If no preference is stored, we default to sound ON (mute=false)
      if (mute !== null) {
        setUiState(prev => ({ ...prev, mute: mute === 'true' }));
      } else {
        setUiState(prev => ({ ...prev, mute: false }));
      }
    });
  }, []);

  // Save mute preference
  useEffect(() => {
    localStorage.setItem('isMuted', uiState.mute.toString());
  }, [uiState.mute]);

  // Handle post parameter from URL
  useEffect(() => {
    const postSlug = searchParams.get('post');
    if (postSlug) {
      setUiState(prev => ({ ...prev, post: postSlug }));
      
      // Scroll to post after a slight delay to ensure DOM is ready
      setTimeout(() => {
        const post = posts.find(p => p.slug === postSlug);
        if (post) {
          const postElement = document.querySelector(`[data-id='${post.id}']`);
          if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 100);
    }
  }, [searchParams, posts]);

  const handleLike = async (id: number) => {
    const newLiked = new Set(likedPosts);
    const isLiking = !newLiked.has(id);

    // 1. Optimistic UI update
    if (isLiking) {
      newLiked.add(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p));
      showToast('You liked this destination', 'like');
    } else {
      newLiked.delete(id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) - 1) } : p));
      showToast('Like removed', 'unlike');
    }

    setLikedPosts(newLiked);
    localStorage.setItem('likedPosts', JSON.stringify(Array.from(newLiked)));

    // 2. Background sync
    try {
      const res = await fetch(`/api/posts/${id}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isLiking ? 'like' : 'unlike' }), // assuming unlike is handled
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.likes } : p));
      }
    } catch (error) {
      console.error('Failed to sync like:', error);
    }
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
          showToast('Saved to your archive', 'save');
        }
      } catch (error) {
        console.error('Failed to save:', error);
      }
    } else {
      newSaved.delete(id);
      showToast('Removed from archive', 'unsave');
    }

    setSavedPosts(newSaved);
    localStorage.setItem('savedPosts', JSON.stringify(Array.from(newSaved)));
  };

  const handleRead = (post: Post) => {
    refreshAds();
    setUiState(prev => ({ ...prev, post: post.slug || '' }));
    
    const newRead = new Set(readPosts);
    if (!newRead.has(post.id)) {
      newRead.add(post.id);
      setReadPosts(newRead);
      localStorage.setItem('readPosts', JSON.stringify(Array.from(newRead)));
    }
  };

  const handleCloseSheet = () => {
    setUiState(prev => ({ ...prev, post: null }));
  };

  const handleCloseSearch = () => setUiState(prev => ({ ...prev, menu: null, q: '' }));
  const handleCloseSaved = () => setUiState(prev => ({ ...prev, menu: null }));
  const handleCloseDrawer = () => setUiState(prev => ({ ...prev, menu: null }));
  const handleCloseExplore = () => setUiState(prev => ({ ...prev, menu: null }));

  const handleOpenShare = (post: any) => setUiState(prev => ({ ...prev, share: post.slug || '' }));
  const handleCloseShare = () => setUiState(prev => ({ ...prev, share: null }));

  const handleSelectPost = (post: any) => {
    refreshAds();
    // If the post is not currently in the filtered list, we need to clear the filter first
    if (activeKabupaten && post.regency?.name !== activeKabupaten) {
      setActiveKabupaten(null);
    }

    setUiState(prev => ({ ...prev, post: post.slug || '', menu: null }));

    // Smooth scroll in the background
    setTimeout(() => {
      const postElement = document.querySelector(`[data-id='${post.id}']`);
      if (postElement && mainRef.current) {
        postElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // --- Audio Unlocking ---
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    const unlock = () => {
      console.log("Audio Unlocked");
      setAudioUnlocked(true);
      // Force a re-render/re-sync of current active video audio
      setActiveCardId(prev => (prev ? prev : prev));
    };
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('mousedown', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('mousedown', unlock);
    };
  }, []);

  const handleSelectKabupaten = (kab: string | null) => {
    const newKab = kab === 'All' ? null : kab;
    setActiveKabupaten(newKab);
    handleCloseDrawer();
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // --- Optimized Advertising Algorithm ---
  const interweaveAds = useCallback((regularPosts: Post[], adPosts: Post[], context: string) => {
    if (adPosts.length === 0) return regularPosts;
    
    // Create a unique shuffle for THIS context
    const shuffledAds = [...adPosts].sort(() => Math.random() - 0.5);
    
    const result: Post[] = [];
    let adPointer = 0;
    const interval = 4;
    let postCount = 0;

    regularPosts.forEach((post, i) => {
      result.push(post);
      postCount++;
      
      if (postCount >= interval) {
        const ad = shuffledAds[adPointer % shuffledAds.length];
        result.push({ ...ad, _displayId: `${ad.id}-${context}-${i}` } as any);
        adPointer++;
        postCount = 0;
      }
    });

    return result;
  }, []);

  const filteredPosts = useMemo(() => {
    const regular = posts.filter(p => !p.isAd);
    const ads = posts.filter(p => p.isAd);
    
    const base = !activeKabupaten 
      ? regular 
      : regular.filter(p => p.regency?.name === activeKabupaten);

    return interweaveAds(base, ads, 'feed');
  }, [posts, activeKabupaten, interweaveAds, adRefreshKey]);

  // --- Scroll Tracking with Observer ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
            const id = Number(entry.target.getAttribute('data-id'));
            if (id && activeCardId !== id) {
              setActiveCardId(id);
            }
          }
        });
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-5% 0px -5% 0px'
      } 
    );

    const cards = document.querySelectorAll('[data-id]');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredPosts, activeCardId]);

  const savedPostsData = useMemo(() => {
    const regular = posts.filter(p => savedPosts.has(p.id) && !p.isAd);
    const ads = posts.filter(p => p.isAd);
    return interweaveAds(regular, ads, 'saved');
  }, [posts, savedPosts, interweaveAds, adRefreshKey]);



  const regencyList = useMemo(() => {
    const list = (allRegencies || []).map(r => ({
      name: r.name,
      count: r._count?.posts || 0
    }));
    return [{ name: 'All', count: posts.length }, ...list];
  }, [allRegencies, posts.length]);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const adsOnly = useMemo(() => posts.filter(p => p.isAd), [posts]);

  return (
    <>
      <main
        ref={mainRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
        style={{ height: '100dvh' }}
        onScroll={(e) => {
          const main = e.currentTarget;
          const idx = Math.round(main.scrollTop / main.clientHeight);
          const visiblePosts = filteredPosts.slice(0, visibleCount);
          const activePost = visiblePosts[idx];
          if (activePost && activePost.id !== activeCardId) {
            setActiveCardId(activePost.id);
          }
        }}
      >
        {displayedPosts.map(item => (
          <div key={item.id} data-card data-id={item.id} className="snap-start shrink-0">
            <Card
              item={item}
              isSaved={savedPosts.has(item.id)}
              isLiked={likedPosts.has(item.id)}
              onLike={handleLike}
              onSave={handleSave}
              onRead={handleRead}
              onShare={handleOpenShare}
              onFilter={handleFilter}
              isActive={activeCardId === item.id}
              isMuted={isGlobalMuted}
              toggleMute={toggleGlobalMute}
              audioUnlocked={audioUnlocked}
            />
          </div>
        ))}
        {/* Infinite Scroll Loader Trigger */}
        {visibleCount < filteredPosts.length && (
          <div ref={loaderRef} className="h-[20vh] w-full flex items-center justify-center snap-start bg-black">
             <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-amber-500 animate-spin" />
          </div>
        )}
      </main>

      {/* --- Header & Overlays --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-4 px-4 lg:px-8 pt-[max(16px,env(safe-area-inset-top))] pb-10 bg-linear-to-b from-black/60 to-transparent">
        <Link
          href="/about"
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 shrink-0 shadow-xl [touch-action:manipulation] cursor-pointer"
        >
          <span className="font-black text-[13px] tracking-tight text-white">Bali Archive</span>
          <ChevronDownIcon size={14} />
        </Link>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); handleOpenExplore(); }}
            className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-xl [touch-action:manipulation] cursor-pointer"
          >
            <GridIcon size={19} color="white" />
          </Link>
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); handleOpenSearch(); }}
            className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-xl [touch-action:manipulation] cursor-pointer"
          >
            <SearchIcon size={19} color="white" />
          </Link>
          <Link
            href="#"
            onClick={(e) => { e.preventDefault(); handleOpenSaved(); }}
            className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-xl [touch-action:manipulation] cursor-pointer"
          >
            <SaveIcon saved={savedPosts.size > 0} size={20} />
          </Link>
        </div>
      </header>

      {isSheetOpen && activePost && (
        <ArticleSheet 
          isOpen={isSheetOpen} 
          onClose={handleCloseSheet} 
          post={activePost} 
          onFilter={handleFilter} 
          ads={adsOnly} 
          onSelectAd={(post) => handleSelectPost(post)}
        />
      )}
      {isDrawerOpen && (
        <RegencyDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} regencies={regencyList} setActiveKab={handleSelectKabupaten} activeKab={activeKabupaten} ads={adsOnly} onSelectAd={(post) => { handleSelectPost(post); handleCloseDrawer(); }} />
      )}
      {isExploreOpen && (
        <RegencyDrawer isOpen={isExploreOpen} onClose={handleCloseExplore} regencies={regencyList} setActiveKab={handleSelectKabupaten} activeKab={activeKabupaten} ads={adsOnly} onSelectAd={(post) => { handleSelectPost(post); handleCloseExplore(); }} />
      )}
      {isSavedOpen && (
        <SavedPage isOpen={isSavedOpen} onClose={handleCloseSaved} savedPosts={savedPostsData} onOpenPost={(post) => { handleSelectPost(post); handleCloseSaved(); }} ads={adsOnly} />
      )}
      {isSearchOpen && (
        <SearchOverlay isOpen={isSearchOpen} onClose={handleCloseSearch} allPosts={posts} onSelectPost={handleSelectPost} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}
      {isShareOpen && sharePost && (
        <ShareSheet isOpen={isShareOpen} onClose={handleCloseShare} post={sharePost} />
      )}

      {/* --- Archive Entry Missing Fallback --- */}
      {isNotFoundOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center border border-white/20 select-none animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-black text-zinc-900 leading-tight mb-3">Archive Entry Missing</h2>
            <p className="text-[13px] text-zinc-500 font-medium leading-relaxed mb-8">
              This destination might have been moved, updated, or temporarily removed from our public archive.
            </p>
            <button
              onClick={handleCloseSheet}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-xs font-black hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-black/10"
            >
              Explore Other Destinations
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
}
