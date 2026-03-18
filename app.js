/* ═══════════════════════════════════════════════════
   BALIARCHIVE — app.js
   All app logic. DATA is injected from data.json via
   window.BA_DATA (set by inline <script> in index.html)
   or fetched from an API endpoint — swap fetchData()
   to point at your backend when ready.
═══════════════════════════════════════════════════ */

/* ── Config ─────────────────────────────────────── */
const CONFIG = {
  DATA_URL: './data.json',   // ← swap to your API URL later
  LS_PREFIX: 'ba_',
};

/* ── LocalStorage helper ────────────────────────── */
const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(CONFIG.LS_PREFIX + k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v)  => { try { localStorage.setItem(CONFIG.LS_PREFIX + k, JSON.stringify(v)); } catch {} },
};

/* ── App state ──────────────────────────────────── */
let DATA         = [];
let filteredData = [];
let activeKab    = LS.get('kab', 'All');
let activeCategory = LS.get('cat', 'All');
const savedIds   = new Set(LS.get('saved', []));
const likedIds   = new Set(LS.get('liked', []));

/* ── Persist helpers ────────────────────────────── */
const persist = {
  saved:    () => LS.set('saved', [...savedIds]),
  liked:    () => LS.set('liked', [...likedIds]),
  kab:      () => LS.set('kab', activeKab),
  category: () => LS.set('cat', activeCategory),
};

/* ═══════════════════════════════════════════════════
   DATA LAYER — swap fetchData() for API later
═══════════════════════════════════════════════════ */
async function fetchData() {
  /* To use a real API later, replace this with:
     const res = await fetch('https://api.baliarchive.com/posts');
     return res.json();
  */
  const res = await fetch(CONFIG.DATA_URL);
  return res.json();
}

async function init() {
  try {
    DATA = await fetchData();
    filteredData = [...DATA];
    buildFeed(filteredData);
    buildCategoryTabs();
    restoreUIState();
    initScrollGuide();
    initSearch();
    initKabDrawer();
    initSheet();
    initSavedPage();
    initDelegates();
    initDragDismiss();
    positionSidebars();
    window.addEventListener('resize', positionSidebars);
  } catch (err) {
    console.error('BaliArchive: failed to load data', err);
    document.getElementById('feed').innerHTML =
      `<div class="flex items-center justify-center h-screen text-white/40 text-sm px-8 text-center">
         Could not load content. Please check your connection.
       </div>`;
  }
}

/* ═══════════════════════════════════════════════════
   FEED BUILDER
═══════════════════════════════════════════════════ */
const feed = document.getElementById('feed');

function buildFeed(items) {
  feed.innerHTML = '';
  if (!items.length) {
    feed.innerHTML = `<div class="flex flex-col items-center justify-center h-screen gap-3 text-white/40">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p class="text-sm">No results found.</p>
    </div>`;
    return;
  }

  items.forEach(item => {
    const multi   = item.images.length > 1;
    const isSaved = savedIds.has(item.id);
    const isLiked = likedIds.has(item.id);

    const slides = item.images.map(src =>
      `<div class="carousel-slide"><img src="${src}" alt="${item.title}" loading="lazy"></div>`
    ).join('');

    const dots = multi
      ? `<div class="dots">${item.images.map((_,i) =>
          `<div class="dot${i===0?' active':''}"></div>`).join('')}</div>`
      : '';

    // Info pills
    const pills = [
      item.bestTime  ? `<div class="info-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${item.bestTime}</div>` : '',
      item.cost      ? `<div class="info-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>${item.cost}</div>` : '',
    ].join('');

    // Category badge color
    const catColor = { Nature:'bg-emerald-600', Culture:'bg-amber-600', Adventure:'bg-orange-600', Wellness:'bg-teal-600' }[item.category] || 'bg-zinc-600';

    // SVG icons helpers
    const sFill   = isSaved ? '#f59e0b' : 'none';
    const sStroke = isSaved ? '#f59e0b' : 'currentColor';
    const lColor  = isLiked ? '#ef4444' : 'currentColor';
    const sCls    = `save-btn${isSaved ? ' saved' : ''}`;
    const lCls    = `like-btn${isLiked ? ' liked' : ''}`;

    const heartSvg = (sz) => `<svg class="like-icon" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="${lColor}" style="color:${lColor}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    const bookSvg  = (sz) => `<svg class="save-icon" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="${sFill}" stroke="${sStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`;
    const readSvg  = (sz, op) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:rgba(255,255,255,${op})"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`;
    const shareSvg = (sz, op) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:rgba(255,255,255,${op})"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`;

    const mBtn = (cls, id, svg, label) =>
      `<div class="${cls} action-btn flex flex-col items-center gap-1 cursor-pointer select-none" data-id="${id}">
        <div class="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">${svg}</div>
        <span class="text-[10px] font-bold text-white/70">${label}</span>
      </div>`;

    const dBtn = (cls, id, svg, label) =>
      `<div class="${cls} action-btn flex flex-col items-center gap-1.5 cursor-pointer select-none" data-id="${id}">
        <button class="w-14 h-14 rounded-full border border-white/15 bg-white/[.08] hover:bg-white/15 backdrop-blur-md flex items-center justify-center transition">${svg}</button>
        <span class="text-[9px] font-bold text-white/40 uppercase tracking-tight">${label}</span>
      </div>`;

    const card = document.createElement('div');
    card.className = 'card relative w-full h-screen flex justify-center bg-black';
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-col relative w-full max-w-2xl h-full overflow-hidden bg-zinc-950">

        <!-- Carousel -->
        <div class="carousel">${slides}</div>
        ${dots}

        <!-- Gradients -->
        <div class="grad-dark absolute inset-0 pointer-events-none"></div>
        <div class="grad-white absolute bottom-0 left-0 w-full h-64 pointer-events-none"></div>

        <!-- Bottom info -->
        <div class="absolute bottom-0 left-0 w-full px-5 pb-6 z-10 pointer-events-none">
          <span class="${catColor} text-[9px] font-extrabold tracking-widest uppercase text-white px-2 py-0.5 rounded-full mb-2 inline-block">${item.category}</span>
          <p class="text-[10px] font-semibold text-white/50 mb-0.5">${item.kabupaten}, ${item.province}</p>
          <h2 class="font-cormorant text-[clamp(22px,5.5vw,30px)] font-bold leading-tight text-black mb-2">${item.title}</h2>
          <p class="text-xs text-black/50 line-clamp-1 mb-3">${item.tagline} <span class="text-amber-600 font-semibold">Read more…</span></p>
          <!-- Info pills -->
          <div class="flex gap-2 flex-wrap">${pills}</div>
        </div>

        <!-- Mobile actions -->
        <div class="lg:hidden absolute right-4 bottom-44 flex flex-col gap-4 z-20">
          ${mBtn(lCls,        item.id, heartSvg(20), item.likes)}
          ${mBtn(sCls,        item.id, bookSvg(20),  'Save')}
          ${mBtn('open-sheet',item.id, readSvg(20,'1'), 'Read')}
          ${mBtn('share-btn', item.id, shareSvg(20,'1'), 'Share')}
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="desktop-sidebar hidden lg:flex flex-col justify-end pb-28 gap-5 absolute bottom-0 h-full pointer-events-none" style="padding-left:16px">
        <div class="pointer-events-auto flex flex-col gap-5">
          ${dBtn(lCls,        item.id, heartSvg(21), item.likes)}
          ${dBtn(sCls,        item.id, bookSvg(21),  'Save')}
          ${dBtn('open-sheet',item.id, readSvg(21,'.7'), 'Read')}
          ${dBtn('share-btn', item.id, shareSvg(21,'.7'), 'Share')}
        </div>
      </div>`;

    feed.appendChild(card);

    // Carousel dot sync
    if (multi) {
      const carousel = card.querySelector('.carousel');
      const dotEls   = card.querySelectorAll('.dot');
      carousel.addEventListener('scroll', () => {
        const idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
        dotEls.forEach((d,i) => d.classList.toggle('active', i === idx));
      }, { passive: true });
    }
  });

  positionSidebars();
  syncKabUI();
}

/* ═══════════════════════════════════════════════════
   CATEGORY TABS (horizontal scroll strip)
═══════════════════════════════════════════════════ */
function buildCategoryTabs() {
  const categories = ['All', ...new Set(DATA.map(d => d.category))];
  const strip = document.getElementById('cat-strip');
  strip.innerHTML = categories.map(c => `
    <button class="cat-tab flex-shrink-0 text-[11px] font-bold px-4 py-1.5 rounded-full border transition whitespace-nowrap
      ${c === activeCategory
        ? 'bg-white text-black border-white'
        : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'}"
      data-cat="${c}">${c}</button>`).join('');

  strip.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      persist.category();
      strip.querySelectorAll('.cat-tab').forEach(b => {
        const active = b.dataset.cat === activeCategory;
        b.className = `cat-tab flex-shrink-0 text-[11px] font-bold px-4 py-1.5 rounded-full border transition whitespace-nowrap ${
          active ? 'bg-white text-black border-white' : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'}`;
      });
      applyFilters();
    });
  });
}

/* ═══════════════════════════════════════════════════
   FILTER — combines kab + category + search
═══════════════════════════════════════════════════ */
function applyFilters(q = '') {
  const query = q.trim().toLowerCase();
  filteredData = DATA.filter(d => {
    const matchKab  = activeKab === 'All' || d.kabupaten === activeKab;
    const matchCat  = activeCategory === 'All' || d.category === activeCategory;
    const matchText = !query || [d.title, d.kabupaten, d.tagline, d.category]
      .some(f => f.toLowerCase().includes(query));
    return matchKab && matchCat && matchText;
  });
  buildFeed(filteredData);
}

/* ═══════════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════════ */
function positionSidebars() {
  document.querySelectorAll('.card').forEach(card => {
    const col = card.querySelector('.card-col');
    const sb  = card.querySelector('.desktop-sidebar');
    if (col && sb) sb.style.left = col.getBoundingClientRect().right + 'px';
  });
}

function syncKabUI() {
  const label = document.getElementById('active-kab-label');
  if (label) label.textContent = activeKab === 'All' ? 'All' : activeKab;
  document.querySelectorAll('.kab-card').forEach(b =>
    b.classList.toggle('active-kab', b.dataset.kab === activeKab));
}

function restoreUIState() {
  syncKabUI();
  // Restore active category tab highlight
  document.querySelectorAll('.cat-tab').forEach(b => {
    const active = b.dataset.cat === activeCategory;
    b.className = `cat-tab flex-shrink-0 text-[11px] font-bold px-4 py-1.5 rounded-full border transition whitespace-nowrap ${
      active ? 'bg-white text-black border-white' : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'}`;
  });
}

/* ═══════════════════════════════════════════════════
   SCROLL GUIDE
═══════════════════════════════════════════════════ */
function initScrollGuide() {
  const guide = document.getElementById('scroll-guide');
  let done = LS.get('guided', false);
  if (done) guide.classList.add('hidden');
  feed.addEventListener('scroll', () => {
    if (!done && feed.scrollTop > 30) {
      done = true;
      guide.classList.add('hidden');
      LS.set('guided', true);
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════ */
function initSearch() {
  const overlay  = document.getElementById('search-overlay');
  const input    = document.getElementById('search-input-full');
  const sugg     = document.getElementById('search-suggestions');
  const popular  = document.getElementById('popular-section');

  function open() {
    overlay.classList.add('open');
    feed.classList.add('blurred');
    renderSuggestions('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      input.focus();
      input.click();
    }));
  }

  function close() {
    input.value = '';
    overlay.classList.remove('open');
    feed.classList.remove('blurred');
    applyFilters();
  }

  document.getElementById('search-toggle').addEventListener('click', open);
  document.getElementById('search-close').addEventListener('click', close);
  overlay.addEventListener('click', e => {
    if (!document.getElementById('search-panel').contains(e.target)) close();
  });
  input.addEventListener('input', () => {
    renderSuggestions(input.value);
    applyFilters(input.value);
  });

  function renderSuggestions(q) {
    const t = q.trim().toLowerCase();
    if (!t) { sugg.innerHTML = ''; popular.classList.remove('hidden'); return; }
    popular.classList.add('hidden');
    const matches = DATA.filter(d =>
      [d.title, d.kabupaten, d.tagline].some(f => f.toLowerCase().includes(t))
    );
    if (!matches.length) {
      sugg.innerHTML = `<p class="text-xs text-zinc-400 py-2">No results for "<strong>${q}</strong>"</p>`;
      return;
    }
    sugg.innerHTML = `
      <p class="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 mb-2">Results</p>
      ${matches.map(d => `
        <div class="suggestion-item flex items-center gap-3 py-2.5 cursor-pointer group" data-id="${d.id}">
          <img src="${d.images[0]}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-zinc-900 truncate group-hover:text-amber-700 transition-colors">${d.title}</p>
            <p class="text-[10px] text-zinc-400">${d.kabupaten} · ${d.category}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>`).join('')}`;
  }

  sugg.addEventListener('click', e => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;
    close();
    setTimeout(() => openSheet(parseInt(item.dataset.id)), 200);
  });

  document.querySelectorAll('.popular-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      input.value = tag.textContent;
      renderSuggestions(tag.textContent);
      applyFilters(tag.textContent);
    });
  });
}

/* ═══════════════════════════════════════════════════
   KABUPATEN DRAWER
═══════════════════════════════════════════════════ */
function initKabDrawer() {
  const drawer  = document.getElementById('kab-drawer');
  const overlay = document.getElementById('overlay');

  document.getElementById('open-kab-btn').addEventListener('click', () => {
    overlay.classList.add('visible');
    drawer.classList.add('open');
  });

  document.getElementById('close-kab-btn').addEventListener('click', closeKab);

  document.querySelectorAll('.kab-card').forEach(btn => {
    btn.addEventListener('click', () => {
      activeKab = btn.dataset.kab;
      persist.kab();
      closeKab();
      applyFilters();
    });
  });

  overlay.addEventListener('click', () => {
    closeKab();
    closeSheet();
    closeSaved();
  });
}

function closeKab() {
  document.getElementById('kab-drawer').classList.remove('open');
  const sheet = document.getElementById('sheet');
  const saved = document.getElementById('saved-page');
  if (!sheet.classList.contains('open') && !saved.classList.contains('open'))
    document.getElementById('overlay').classList.remove('visible');
}

/* ═══════════════════════════════════════════════════
   ARTICLE SHEET
═══════════════════════════════════════════════════ */
function initSheet() {
  document.getElementById('close-btn').addEventListener('click', e => {
    e.stopPropagation();
    closeSheet();
  });
}

function openSheet(id) {
  const item = DATA.find(d => d.id === id);
  if (!item) return;

  document.getElementById('sheet-title').textContent   = item.title;
  document.getElementById('sheet-tagline').textContent = item.tagline;
  document.getElementById('sheet-content').innerHTML   = item.body;

  // Populate practical info block
  document.getElementById('info-best-time').textContent = item.bestTime  || '—';
  document.getElementById('info-how-to-get').textContent= item.howToGet  || '—';
  document.getElementById('info-cost').textContent      = item.cost      || '—';

  document.getElementById('sheet-body').scrollTop = 0;
  document.getElementById('overlay').classList.add('visible');
  document.getElementById('sheet').classList.add('open');
  feed.style.overflow = 'hidden';
}

function closeSheet() {
  const sheet = document.getElementById('sheet');
  const saved = document.getElementById('saved-page');
  const kab   = document.getElementById('kab-drawer');
  sheet.classList.remove('open');
  if (!saved.classList.contains('open') && !kab.classList.contains('open')) {
    document.getElementById('overlay').classList.remove('visible');
    feed.style.overflow = '';
  }
}

/* ═══════════════════════════════════════════════════
   SAVED PAGE
═══════════════════════════════════════════════════ */
function initSavedPage() {
  document.getElementById('close-saved-btn').addEventListener('click', e => {
    e.stopPropagation();
    closeSaved();
  });
  document.getElementById('open-saved-btn').addEventListener('click', openSaved);
}

function openSaved() {
  renderSavedGrid();
  document.getElementById('saved-page').classList.add('open');
  feed.style.overflow = 'hidden';
}

function closeSaved() {
  document.getElementById('saved-page').classList.remove('open');
  const sheet = document.getElementById('sheet');
  const kab   = document.getElementById('kab-drawer');
  if (!sheet.classList.contains('open') && !kab.classList.contains('open')) {
    document.getElementById('overlay').classList.remove('visible');
    feed.style.overflow = '';
  }
}

function renderSavedGrid() {
  const grid  = document.getElementById('saved-grid');
  const empty = document.getElementById('saved-empty');
  grid.innerHTML = '';
  const items = DATA.filter(d => savedIds.has(d.id));
  document.getElementById('saved-count').textContent =
    items.length + ' post' + (items.length !== 1 ? 's' : '');
  if (!items.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'relative cursor-pointer group overflow-hidden rounded-[8px]';
    wrap.innerHTML = `
      <img src="${item.images[0]}" class="saved-thumb transition-transform duration-300 lg:group-hover:scale-105" loading="lazy">
      <div class="absolute inset-0 bg-black/0 group-active:bg-black/20 lg:group-hover:bg-black/10 transition-colors rounded-[8px]"></div>
      <div class="absolute bottom-0 left-0 right-0 p-2 rounded-b-[8px]"
           style="background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 100%)">
        <p class="text-[9px] font-semibold text-white/60 truncate">${item.kabupaten}</p>
        <p class="text-[11px] font-bold text-white truncate font-cormorant">${item.title}</p>
      </div>`;
    wrap.addEventListener('click', () => {
      closeSaved();
      setTimeout(() => openSheet(item.id), 380);
    });
    grid.appendChild(wrap);
  });
}

/* ═══════════════════════════════════════════════════
   CLICK DELEGATES
═══════════════════════════════════════════════════ */
function initDelegates() {
  document.addEventListener('click', e => {

    // Read
    const r = e.target.closest('.open-sheet');
    if (r) { openSheet(parseInt(r.dataset.id)); return; }

    // Like
    const l = e.target.closest('.like-btn');
    if (l) {
      const id = parseInt(l.dataset.id);
      const now = !likedIds.has(id);
      now ? likedIds.add(id) : likedIds.delete(id);
      persist.liked();
      document.querySelectorAll(`.like-btn[data-id="${id}"]`).forEach(b => {
        b.classList.toggle('liked', now);
        const svg = b.querySelector('.like-icon');
        if (svg) { svg.style.color = now ? '#ef4444' : ''; svg.setAttribute('fill', now ? '#ef4444' : 'currentColor'); }
      });
      return;
    }

    // Save
    const s = e.target.closest('.save-btn');
    if (s) {
      const id = parseInt(s.dataset.id);
      const now = !savedIds.has(id);
      now ? savedIds.add(id) : savedIds.delete(id);
      persist.saved();
      document.querySelectorAll(`.save-btn[data-id="${id}"]`).forEach(b => {
        b.classList.toggle('saved', now);
        const svg = b.querySelector('.save-icon');
        if (svg) { svg.setAttribute('fill', now ? '#f59e0b' : 'none'); svg.setAttribute('stroke', now ? '#f59e0b' : 'currentColor'); }
      });
      return;
    }

    // Share
    const sh = e.target.closest('.share-btn');
    if (sh) {
      const id   = parseInt(sh.dataset.id);
      const item = DATA.find(d => d.id === id);
      if (!item) return;
      if (navigator.share) {
        navigator.share({ title: item.title, text: item.tagline, url: window.location.href });
      } else {
        navigator.clipboard?.writeText(window.location.href);
        showToast('Link copied!');
      }
      return;
    }
  });
}

/* ═══════════════════════════════════════════════════
   DOUBLE-TAP / DOUBLE-CLICK
═══════════════════════════════════════════════════ */
let lastTap = 0, lastTapId = null;

feed.addEventListener('touchend', e => {
  if (e.target.closest('.action-btn') || e.target.closest('button')) return;
  const card = e.target.closest('.card');
  if (!card) return;
  const id = parseInt(card.dataset.id), now = Date.now();
  if (now - lastTap < 350 && lastTapId === id) {
    const t = e.changedTouches[0], col = card.querySelector('.card-col');
    const r = col.getBoundingClientRect();
    spawnRipple(col, t.clientX - r.left, t.clientY - r.top);
    setTimeout(() => openSheet(id), 150);
    lastTap = 0; lastTapId = null;
  } else { lastTap = now; lastTapId = id; }
}, { passive: true });

feed.addEventListener('dblclick', e => {
  if (e.target.closest('.action-btn') || e.target.closest('button')) return;
  const card = e.target.closest('.card');
  if (!card) return;
  const col = card.querySelector('.card-col'), r = col.getBoundingClientRect();
  spawnRipple(col, e.clientX - r.left, e.clientY - r.top);
  setTimeout(() => openSheet(parseInt(card.dataset.id)), 150);
});

function spawnRipple(parent, x, y) {
  const d = document.createElement('div');
  d.className = 'ripple-dot';
  d.style.left = x + 'px'; d.style.top = y + 'px';
  parent.appendChild(d);
  setTimeout(() => d.remove(), 600);
}

/* ═══════════════════════════════════════════════════
   DRAG-TO-DISMISS — article sheet
═══════════════════════════════════════════════════ */
function initDragDismiss() {
  const sheet     = document.getElementById('sheet');
  const sheetBody = document.getElementById('sheet-body');
  let startY = 0, dragging = false, fromTop = false;

  sheet.addEventListener('touchstart', e => {
    startY   = e.touches[0].clientY;
    dragging = true;
    fromTop  = (e.touches[0].clientY - sheet.getBoundingClientRect().top) < 64;
  }, { passive: true });

  sheet.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY;
    if (!(fromTop || (sheetBody.scrollTop <= 0 && dy > 0))) return;
    if (dy > 0) { sheet.style.transition = 'none'; sheet.style.transform = `translateY(${dy}px)`; }
  }, { passive: true });

  sheet.addEventListener('touchend', e => {
    if (!dragging) return;
    dragging = false;
    const dy = e.changedTouches[0].clientY - startY;
    sheet.style.transition = '';
    sheet.style.transform  = '';
    if ((fromTop || sheetBody.scrollTop <= 0) && dy > 120) closeSheet();
  });
}

/* ═══════════════════════════════════════════════════
   TOAST NOTIFICATION
═══════════════════════════════════════════════════ */
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl transition-opacity duration-300';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2000);
}

/* ── Kick off ── */
document.addEventListener('DOMContentLoaded', init);