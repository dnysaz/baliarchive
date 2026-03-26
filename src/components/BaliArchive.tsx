'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ArticleSheet from './ArticleSheet';
import KabupatenDrawer from './KabupatenDrawer';
import SavedPage from './SavedPage';
import SearchOverlay from './SearchOverlay';

// --- Types ---
interface Image {
  id: number;
  url: string;
}

interface Post {
  id: number;
  kabupaten: string;
  province: string;
  category: string;
  title: string;
  tagline: string;
  likes: string;
  bestTime: string;
  howToGet: string;
  cost: string;
  body: string;
  venue?: string | null;
  images: Image[];
}

interface BaliArchiveProps {
  initialData: Post[];
}

// --- Icons ---
const HeartIcon = ({ filled, color, size = 20 }: { filled: boolean, color: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} style={{ color }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={color} strokeWidth="2" />
  </svg>
);

const SaveIcon = ({ saved, size = 20 }: { saved: boolean, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? '#f59e0b' : 'none'} stroke={saved ? '#f59e0b' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const ReadIcon = ({ size = 20, opacity = 1 }: { size?: number, opacity?: number | string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `rgba(255,255,255,${opacity})` }}>
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);

const ShareIcon = ({ size = 20, opacity = 1 }: { size?: number, opacity?: number | string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `rgba(255,255,255,${opacity})` }}>
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const SearchIcon = ({ size = 14, color = "white" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);

const ChevronDownIcon = ({ size = 12, color = "white" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
);

const ClockIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);

const DollarIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
);

const ActionButton = ({ onClick, label, icon }: { onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} 
    className="flex flex-col items-center gap-1 cursor-pointer pointer-events-auto appearance-none border-none bg-transparent outline-none p-0 active:scale-95 transition-transform select-none z-[100]"
  >
    <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center pointer-events-none">{icon}</div>
    <span className="text-[10px] font-bold text-white/70 pointer-events-none">{label}</span>
  </button>
);

const DesktopActionButton = ({ onClick, label, icon }: { onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} 
    className="flex flex-col items-center gap-1.5 cursor-pointer pointer-events-auto appearance-none border-none bg-transparent outline-none p-0 active:scale-95 transition-transform select-none z-[100]"
  >
    <div className="w-14 h-14 rounded-full border border-white/15 bg-white/8 hover:bg-white/15 backdrop-blur-md flex items-center justify-center pointer-events-none transition">{icon}</div>
    <span className="text-[9px] font-bold text-white/40 uppercase tracking-tight pointer-events-none">{label}</span>
  </button>
);

const Card = ({ item, isSaved, isLiked, onLike, onSave, onRead, onShare }: { 
  item: Post, 
  isSaved: boolean, 
  isLiked: boolean,
  onLike: (id: number) => void,
  onSave: (id: number) => void,
  onRead: (item: Post) => void,
  onShare: (item: Post) => void
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

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onRead(item);
    }
    lastTap.current = now;
  };

  const catColor = ({ Nature: 'bg-emerald-600', Culture: 'bg-amber-600', Adventure: 'bg-orange-600', Wellness: 'bg-teal-600' } as Record<string, string>)[item.category] || 'bg-zinc-600';

  return (
    <div 
      className="relative w-full flex justify-center bg-black snap-start shrink-0 overflow-hidden" 
      style={{ height: '100dvh' }}
      data-id={item.id}
      onClick={handleDoubleTap}
    >
      <div className="relative w-full max-w-2xl h-full overflow-hidden bg-zinc-950">
        {/* Carousel */}
        <div className="carousel h-full w-full overflow-x-scroll snap-x snap-mandatory no-scrollbar flex" ref={carouselRef} onScroll={handleScroll}>
          {item.images.map((img, i) => (
            <div key={i} className="carousel-slide w-full h-full shrink-0 snap-start relative">
              <img src={img.url} alt={item.title} className="w-full h-full object-cover select-none pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Dots */}
        {item.images.length > 1 && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 flex gap-1.5 items-center z-[60] pointer-events-none">
            {item.images.map((_, i) => (
              <div key={i} className={`dot ${i === activeSlide ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {/* Gradients */}
        <div className="grad-dark absolute inset-0 pointer-events-none z-10" />
        <div className="grad-white absolute bottom-0 left-0 w-full h-64 pointer-events-none z-20" />

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 w-full px-5 pb-6 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <span className={`${catColor} text-[9px] font-extrabold tracking-widest uppercase text-white px-2 py-0.5 rounded-full mb-2 inline-block`}>
              {item.category}
            </span>
            <p className="text-[10px] font-semibold text-white/50 mb-0.5">{item.kabupaten}, {item.province}</p>
            <h2 className="font-cormorant text-[clamp(22px,5.5vw,30px)] font-bold leading-tight text-white mb-2">{item.title}</h2>
            
            {item.venue && (
              <div className="flex items-center gap-1.5 mb-2 text-amber-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.venue}</span>
              </div>
            )}

            <div className="text-xs text-black/50 line-clamp-1 mb-3">
              {item.tagline}{' '}
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRead(item); }}
                className="text-amber-600 font-semibold cursor-pointer appearance-none border-none bg-transparent outline-none p-0 inline select-none pointer-events-auto"
              >
                Read more…
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {item.bestTime && <div className="info-pill"><ClockIcon />{item.bestTime}</div>}
              {item.cost && <div className="info-pill"><DollarIcon />{item.cost}</div>}
            </div>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden absolute right-4 bottom-44 flex flex-col gap-4 z-[100] pointer-events-auto">
          <ActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : '#fff'} size={20} />} />
          <ActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} size={20} />} />
          <ActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon size={20} />} />
          <ActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon size={20} />} />
        </div>
      </div>

      {/* Desktop sidebar (Right) */}
      <div className="hidden lg:flex flex-col justify-end pb-28 gap-5 absolute bottom-0 h-full left-[calc(50%+352px)] z-[100] pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-5">
          <DesktopActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : '#fff'} size={21} />} />
          <DesktopActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} size={21} />} />
          <DesktopActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon size={21} opacity={0.7} />} />
          <DesktopActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon size={21} opacity={0.7} />} />
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function BaliArchive({ initialData }: BaliArchiveProps) {
  const [activeKab, setActiveKab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKabDrawerOpen, setIsKabDrawerOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSavedPageOpen, setIsSavedPageOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ba_saved');
    const liked = localStorage.getItem('ba_liked');
    const kab = localStorage.getItem('ba_kab');
    const cat = localStorage.getItem('ba_cat');
    if (saved) setSavedIds(new Set(JSON.parse(saved)));
    if (liked) setLikedIds(new Set(JSON.parse(liked)));
    if (kab) setActiveKab(JSON.parse(kab));
    if (cat) setActiveCategory(JSON.parse(cat));
  }, []);

  useEffect(() => { localStorage.setItem('ba_saved', JSON.stringify([...savedIds])); }, [savedIds]);
  useEffect(() => { localStorage.setItem('ba_liked', JSON.stringify([...likedIds])); }, [likedIds]);
  useEffect(() => { localStorage.setItem('ba_kab', JSON.stringify(activeKab)); }, [activeKab]);
  useEffect(() => { localStorage.setItem('ba_cat', JSON.stringify(activeCategory)); }, [activeCategory]);

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const matchesKab = activeKab === 'All' || item.kabupaten === activeKab;
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.venue && item.venue.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesKab && matchesCat && matchesSearch;
    });
  }, [initialData, activeKab, activeCategory, searchQuery]);

  const handleLike = (id: number) => {
    setLikedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const handleSave = (id: number) => {
    setSavedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const handleRead = (post: Post) => { setSelectedPost(post); setIsSheetOpen(true); };
  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.tagline, url: window.location.href });
    } else {
      alert('Sharing is not supported in this browser.');
    }
  };

  const categories = ['All', 'Nature', 'Culture', 'Adventure', 'Wellness'];
  const kabupatens = [
    { name: 'All', count: initialData.length },
    { name: 'Gianyar', count: initialData.filter(i => i.kabupaten === 'Gianyar').length },
    { name: 'Badung', count: initialData.filter(i => i.kabupaten === 'Badung').length },
    { name: 'Bangli', count: initialData.filter(i => i.kabupaten === 'Bangli').length },
    { name: 'Buleleng', count: initialData.filter(i => i.kabupaten === 'Buleleng').length },
    { name: 'Jembrana', count: initialData.filter(i => i.kabupaten === 'Jembrana').length },
    { name: 'Karangasem', count: initialData.filter(i => i.kabupaten === 'Karangasem').length },
    { name: 'Klungkung', count: initialData.filter(i => i.kabupaten === 'Klungkung').length },
    { name: 'Tabanan', count: initialData.filter(i => i.kabupaten === 'Tabanan').length },
    { name: 'Denpasar', count: initialData.filter(i => i.kabupaten === 'Denpasar').length },
  ];

  const savedPosts = useMemo(() => initialData.filter(item => savedIds.has(item.id)), [initialData, savedIds]);
  const anyOverlayOpen = isKabDrawerOpen || isSheetOpen || isSavedPageOpen || isSearchOpen;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black selection:bg-amber-500/30 font-sans">
      {/* FEED */}
      <div 
        id="feed" 
        className={`relative w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar z-0 ${anyOverlayOpen ? 'blur-2xl brightness-50 pointer-events-none' : 'pointer-events-auto'}`}
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
        onScroll={() => setIsScrolled(true)}
      >
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <Card 
              key={item.id} 
              item={item} 
              isSaved={savedIds.has(item.id)}
              isLiked={likedIds.has(item.id)}
              onLike={handleLike}
              onSave={handleSave}
              onRead={handleRead}
              onShare={handleShare}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
            <SearchIcon size={40} color="currentColor" />
            <p className="text-sm">No results found.</p>
          </div>
        )}
      </div>

      {/* OVERLAYS BACKGROUND */}
      { anyOverlayOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
          onClick={() => { setIsKabDrawerOpen(false); setIsSheetOpen(false); setIsSearchOpen(false); setIsSavedPageOpen(false); }}
        />
      )}

      {/* TOP NAV */}
      <div className={`fixed top-0 left-0 right-0 z-[150] flex flex-col gap-2 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] transition-all duration-500 ${anyOverlayOpen ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
        <div className="absolute inset-x-0 top-0 h-[120px] pointer-events-none -z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.7) 0%, rgba(0,0,0,.3) 60%, transparent 100%)' }} />
        
        <div className="flex items-center justify-between gap-2 pointer-events-none">
          <button 
            className="flex items-center gap-2 h-10 px-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex-1 min-w-0 lg:flex-none lg:w-64 appearance-none outline-none text-left pointer-events-auto cursor-pointer"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSearchOpen(true); }}
          >
            <SearchIcon />
            <span className="text-[11px] font-semibold text-white/80 truncate pointer-events-none">Search destinations…</span>
          </button>
          <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
            <button 
              className="w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center appearance-none outline-none cursor-pointer"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSavedPageOpen(true); }}
            >
              <SaveIcon saved={false} size={18} />
            </button>
            <button 
              className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-md appearance-none outline-none cursor-pointer"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsKabDrawerOpen(true); }}
            >
              <span className="text-[11px] font-bold text-white tracking-wide pointer-events-none">{activeKab}</span>
              <ChevronDownIcon />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar pointer-events-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveCategory(cat); }}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border appearance-none outline-none shrink-0 cursor-pointer ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-black/40 text-white/70 border-white/15 backdrop-blur-md'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Kabupaten Sidebar (Left) */}
      <div className={`hidden xl:flex flex-col gap-6 absolute top-0 bottom-0 left-[calc(50%-600px)] w-60 py-20 z-[100] pointer-events-none transition-all duration-500 ${anyOverlayOpen ? 'opacity-0 -translate-x-10' : 'opacity-100 translate-x-0'}`}>
        <div className="pointer-events-auto">
          <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-500 mb-6 px-4">Regencies</p>
          <div className="flex flex-col gap-1">
            {kabupatens.map(kab => (
              <button 
                key={kab.name}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveKab(kab.name); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group appearance-none border-none outline-none cursor-pointer ${activeKab === kab.name ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <span className={`text-xs font-bold tracking-tight ${activeKab === kab.name ? 'translate-x-1' : 'group-hover:translate-x-1 transition-transform'}`}>{kab.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${activeKab === kab.name ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/20'}`}>{kab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        allPosts={initialData}
        onSelectPost={(post) => { setSelectedPost(post); setIsSheetOpen(true); }}
      />

      <KabupatenDrawer 
        isOpen={isKabDrawerOpen} 
        onClose={() => setIsKabDrawerOpen(false)} 
        activeKab={activeKab} 
        setActiveKab={setActiveKab} 
        kabupatens={kabupatens} 
      />

      <ArticleSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        post={selectedPost} 
      />

      <SavedPage 
        isOpen={isSavedPageOpen} 
        onClose={() => setIsSavedPageOpen(false)} 
        savedPosts={savedPosts} 
        onOpenPost={(post) => { setSelectedPost(post); setIsSheetOpen(true); }} 
      />
    </div>
  );
}
