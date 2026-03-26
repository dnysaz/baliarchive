'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

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

const PuraIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="13" y="22" width="6" height="6" rx=".5" />
    <path d="M8 22h16M10 18h12M12 14h8M14 10h4M16 6v4" />
  </svg>
);

// --- Components ---

const ActionButton = ({ onClick, label, icon }: { onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }} 
    className="flex flex-col items-center gap-1 cursor-pointer pointer-events-auto appearance-none border-none bg-transparent outline-none p-0 active:scale-95 transition-transform"
  >
    <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center pointer-events-none">{icon}</div>
    <span className="text-[10px] font-bold text-white/70 pointer-events-none">{label}</span>
  </button>
);

const DesktopActionButton = ({ onClick, label, icon }: { onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }} 
    className="flex flex-col items-center gap-1.5 cursor-pointer pointer-events-auto appearance-none border-none bg-transparent outline-none p-0 active:scale-95 transition-transform"
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

  const handleScroll = () => {
    if (carouselRef.current) {
      const idx = Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth);
      setActiveSlide(idx);
    }
  };

  const catColor = ({ Nature: 'bg-emerald-600', Culture: 'bg-amber-600', Adventure: 'bg-orange-600', Wellness: 'bg-teal-600' } as any)[item.category] || 'bg-zinc-600';

  return (
    <div className="relative w-full h-screen flex justify-center bg-black snap-start overflow-hidden shrink-0" data-id={item.id}>
      <div className="relative w-full max-w-2xl h-full overflow-hidden bg-zinc-950">
        {/* Carousel */}
        <div className="carousel" ref={carouselRef} onScroll={handleScroll}>
          {item.images.map((img, i) => (
            <div key={i} className="carousel-slide">
              <img src={img.url} alt={item.title} loading="lazy" />
            </div>
          ))}
        </div>

        {/* Dots */}
        {item.images.length > 1 && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 flex gap-1.5 items-center z-20 pointer-events-none">
            {item.images.map((_, i) => (
              <div key={i} className={`dot ${i === activeSlide ? 'active' : ''}`} />
            ))}
          </div>
        )}

        {/* Gradients */}
        <div className="grad-dark absolute inset-0 pointer-events-none z-10" />
        <div className="grad-white absolute bottom-0 left-0 w-full h-64 pointer-events-none z-20" />

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 w-full px-5 pb-6 z-30 pointer-events-none">
          <div className="pointer-events-auto">
            <span className={`${catColor} text-[9px] font-extrabold tracking-widest uppercase text-white px-2 py-0.5 rounded-full mb-2 inline-block`}>
              {item.category}
            </span>
            <p className="text-[10px] font-semibold text-white/50 mb-0.5">{item.kabupaten}, {item.province}</p>
            <h2 className="font-cormorant text-[clamp(22px,5.5vw,30px)] font-bold leading-tight text-black mb-2">{item.title}</h2>
            <div className="text-xs text-black/50 line-clamp-1 mb-3">
              {item.tagline} <button className="text-amber-600 font-semibold cursor-pointer appearance-none border-none bg-transparent outline-none p-0 inline pointer-events-auto" onClick={(e) => { e.stopPropagation(); onRead(item); }}>Read more…</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {item.bestTime && <div className="info-pill"><ClockIcon />{item.bestTime}</div>}
              {item.cost && <div className="info-pill"><DollarIcon />{item.cost}</div>}
            </div>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden absolute right-4 bottom-44 flex flex-col gap-4 z-40 pointer-events-auto">
          <ActionButton onClick={() => onLike(item.id)} label={item.likes} icon={<HeartIcon filled={isLiked} color={isLiked ? '#ef4444' : '#fff'} size={20} />} />
          <ActionButton onClick={() => onSave(item.id)} label="Save" icon={<SaveIcon saved={isSaved} size={20} />} />
          <ActionButton onClick={() => onRead(item)} label="Read" icon={<ReadIcon size={20} />} />
          <ActionButton onClick={() => onShare(item)} label="Share" icon={<ShareIcon size={20} />} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col justify-end pb-28 gap-5 absolute bottom-0 h-full pointer-events-none left-[calc(50%+352px)] z-40">
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

  // Load state from localStorage
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

  // Persist state
  useEffect(() => {
    localStorage.setItem('ba_saved', JSON.stringify([...savedIds]));
  }, [savedIds]);
  useEffect(() => {
    localStorage.setItem('ba_liked', JSON.stringify([...likedIds]));
  }, [likedIds]);
  useEffect(() => {
    localStorage.setItem('ba_kab', JSON.stringify(activeKab));
  }, [activeKab]);
  useEffect(() => {
    localStorage.setItem('ba_cat', JSON.stringify(activeCategory));
  }, [activeCategory]);

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const matchesKab = activeKab === 'All' || item.kabupaten === activeKab;
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.kabupaten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesKab && matchesCat && matchesSearch;
    });
  }, [initialData, activeKab, activeCategory, searchQuery]);

  const handleLike = (id: number) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = (id: number) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRead = (post: Post) => {
    setSelectedPost(post);
    setIsSheetOpen(true);
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.tagline,
        url: window.location.href
      });
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

  const savedPosts = useMemo(() => {
    return initialData.filter(item => savedIds.has(item.id));
  }, [initialData, savedIds]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black selection:bg-amber-500/30 font-sans">
      {/* FEED */}
      <div 
        id="feed" 
        className={`relative w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth z-10 no-scrollbar ${isKabDrawerOpen || isSheetOpen || isSavedPageOpen ? 'blur-2xl brightness-50 pointer-events-none' : ''}`}
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

      {/* OVERLAY */}
      { (isKabDrawerOpen || isSheetOpen || isSearchOpen || isSavedPageOpen) && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
          onClick={() => { setIsKabDrawerOpen(false); setIsSheetOpen(false); setIsSearchOpen(false); setIsSavedPageOpen(false); }}
        />
      )}

      {/* TOP NAV */}
      <div className={`fixed top-0 left-0 right-0 z-[50] flex flex-col gap-2 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] transition-all duration-500 pointer-events-none ${isSearchOpen || isKabDrawerOpen || isSheetOpen || isSavedPageOpen ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* SCRIM */}
        <div className="absolute inset-x-0 top-0 h-[120px] pointer-events-none -z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.7) 0%, rgba(0,0,0,.3) 60%, transparent 100%)' }} />
        
        <div className="flex items-center justify-between gap-2 pointer-events-none">
          <button 
            className="flex items-center gap-2 h-10 px-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex-1 min-w-0 lg:flex-none lg:w-64 appearance-none outline-none text-left pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setIsSearchOpen(true); }}
          >
            <SearchIcon />
            <span className="text-[11px] font-semibold text-white/80 truncate pointer-events-none">Search destinations…</span>
          </button>
          <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
            <button 
              className="w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center appearance-none outline-none pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setIsSavedPageOpen(true); }}
            >
              <SaveIcon saved={false} size={18} />
            </button>
            <button 
              className="flex items-center gap-1.5 h-10 px-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-md appearance-none outline-none pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setIsKabDrawerOpen(true); }}
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
              onClick={(e) => { e.stopPropagation(); setActiveCategory(cat); }}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border appearance-none outline-none pointer-events-auto ${activeCategory === cat ? 'bg-white text-black border-white' : 'bg-black/40 text-white/70 border-white/15 backdrop-blur-md'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      <div className={`fixed inset-x-0 top-0 z-[200] transition-all duration-500 ease-out ${isSearchOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="mt-[max(12px,env(safe-area-inset-top))] mx-3 lg:mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative border-b border-black/[.07] flex items-center">
            <div className="pl-4 text-gray-400"><SearchIcon size={18} color="currentColor" /></div>
            <input 
              type="text" 
              placeholder="Search destinations, districts…" 
              autoFocus={isSearchOpen}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[16px] text-[#111] py-5 px-3"
            />
            <button 
              className="mr-3 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 appearance-none outline-none pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setIsSearchOpen(false); setSearchQuery(''); }}
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-6">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 mb-4">Most Popular</p>
            <div className="flex flex-wrap gap-2">
              {['Kelingking Cliff', 'Tirta Empul', 'Monkey Forest', 'Tanah Lot', 'Amed', 'Kintamani', 'Nusa Penida', 'Ubud'].map(tag => (
                <button 
                  key={tag} 
                  className="px-4 py-2 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-100 hover:bg-amber-100 appearance-none outline-none pointer-events-auto"
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(tag); }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KABUPATEN DRAWER */}
      <div className={`fixed top-0 right-0 bottom-0 z-[200] w-80 bg-white text-black border-l border-black/[.06] flex flex-col shadow-2xl transition-transform duration-500 ease-out ${isKabDrawerOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[.07] pt-[max(16px,env(safe-area-inset-top))]">
          <div>
            <p className="text-[9px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">BaliArchive</p>
            <h2 className="font-cormorant text-2xl font-bold text-zinc-900 leading-none">8 Regencies</h2>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-gray-400 appearance-none outline-none pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setIsKabDrawerOpen(false); }}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {kabupatens.map(kab => (
            <button 
              key={kab.name}
              className={`flex items-center justify-between px-6 py-4 w-full text-left appearance-none outline-none transition-colors pointer-events-auto ${activeKab === kab.name ? 'bg-amber-50 border-l-4 border-amber-600' : 'hover:bg-zinc-50'}`}
              onClick={(e) => { e.stopPropagation(); setActiveKab(kab.name); setIsKabDrawerOpen(false); }}
            >
              <div className="flex items-center gap-4 pointer-events-none">
                <div className="p-2.5 bg-amber-100/50 rounded-xl"><PuraIcon /></div>
                <div>
                  <p className="text-[15px] font-bold text-zinc-800">{kab.name}</p>
                  <p className="text-[11px] text-zinc-400 font-medium tracking-tight">Explore Destinations</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-lg pointer-events-none">{kab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLE SHEET */}
      <div className={`fixed bottom-0 left-0 right-0 z-[200] bg-white text-black rounded-t-[40px] shadow-[0_-10px_50px_rgba(0,0,0,0.2)] max-h-[94vh] flex flex-col transition-transform duration-600 ease-out ${isSheetOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'}`}>
        <div className="w-14 h-1.5 bg-zinc-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
        <div className="flex items-center justify-between px-8 py-4 border-b border-black/[.05]">
          <span className="text-[10px] font-extrabold tracking-[.25em] uppercase text-amber-600">BaliArchive Guide</span>
          <button 
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-gray-400 appearance-none outline-none pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setIsSheetOpen(false); }}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-24 pt-10 lg:px-16">
          <h1 className="font-cormorant text-[clamp(28px,7vw,42px)] font-bold leading-tight text-zinc-950 mb-4">{selectedPost?.title}</h1>
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[.2em] italic border-l-4 border-amber-500 pl-4 mb-10">{selectedPost?.tagline}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-zinc-50 p-5 rounded-2xl">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">Best Time</p>
              <p className="text-[14px] font-semibold text-zinc-700">{selectedPost?.bestTime}</p>
            </div>
            <div className="bg-zinc-50 p-5 rounded-2xl">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">Estimated Cost</p>
              <p className="text-[14px] font-semibold text-zinc-700">{selectedPost?.cost}</p>
            </div>
            <div className="bg-zinc-50 p-5 rounded-2xl md:col-span-2">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-1">How to Get There</p>
              <p className="text-[14px] font-semibold text-zinc-700 leading-relaxed">{selectedPost?.howToGet}</p>
            </div>
          </div>

          <div className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: selectedPost?.body || '' }} />

          <div className="mt-16 bg-zinc-950 text-white rounded-[32px] p-10">
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-400 mb-3">Premium Hospitality Insight</p>
            <h3 className="font-cormorant text-3xl font-bold mb-4">The Bali Insider's Guide</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-8">Access hidden routes, detailed Pura etiquette, and local language tips curated by Balinese cultural experts.</p>
            <button className="w-full py-5 bg-amber-600 rounded-2xl text-[11px] font-extrabold tracking-[.2em] uppercase hover:bg-amber-700 active:scale-95 transition-all pointer-events-auto">Download Guide — $15</button>
          </div>
        </div>
      </div>

      {/* SAVED PAGE */}
      <div className={`fixed inset-0 z-[200] bg-white text-black flex flex-col transition-transform duration-500 ease-out ${isSavedPageOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
        <div className="shrink-0 flex items-center gap-4 px-6 border-b border-black/[.07] pt-[max(20px,env(safe-area-inset-top))] pb-5">
          <button 
            className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-zinc-500 appearance-none outline-none pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); setIsSavedPageOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-600 mb-0.5">BaliArchive</p>
            <h1 className="font-cormorant text-2xl font-bold leading-tight text-zinc-950">Saved Destinations</h1>
          </div>
          <span className="ml-auto text-xs font-bold text-zinc-300">{savedPosts.length} items</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 lg:p-10 bg-zinc-50">
          <div className="max-w-3xl mx-auto">
            {savedPosts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedPosts.map(post => (
                  <button 
                    key={post.id} 
                    className="relative group overflow-hidden rounded-[24px] aspect-[3/4] appearance-none outline-none text-left pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setIsSheetOpen(true); }}
                  >
                    <img src={post.images[0].url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 flex items-end p-4 pointer-events-none">
                      <div>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1">{post.kabupaten}</p>
                        <p className="text-xs text-white font-bold leading-tight line-clamp-2">{post.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 gap-4 text-zinc-300">
                <SaveIcon saved={false} size={64} />
                <p className="text-base font-medium text-center leading-relaxed">Your list is empty.<br /><span className="text-sm opacity-50">Tap the bookmark to save your next adventure.</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
