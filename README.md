# BaliArchive — Bali, As The Locals Know It

BaliArchive adalah panduan wisata interaktif modern untuk menjelajahi keindahan Bali dengan gaya *vertical feed* yang imersif. Proyek ini telah dimigrasi ke **Next.js** untuk performa yang lebih baik dan kesiapan produksi.

## Fitur Utama

- **Vertical Feed Navigation:** Jelajahi destinasi Bali dengan gaya scroll vertikal ala media sosial.
- **SQLite Database:** Data disimpan secara lokal menggunakan SQLite dan dikelola dengan **Prisma ORM**.
- **Regency Filters:** Filter destinasi berdasarkan 8 Kabupaten & 1 Kota di Bali.
- **Category Tabs:** Saring konten berdasarkan Nature, Culture, Adventure, dan Wellness.
- **Save & Like:** Fitur untuk menyukai dan menyimpan destinasi favorit (disimpan di `localStorage`).
- **Responsive Design:** Tampilan modern yang dioptimalkan untuk perangkat mobile dan desktop menggunakan **Tailwind CSS**.

## Teknologi

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Database:** [SQLite](https://www.sqlite.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Fonts:** DM Sans & Cormorant Garamond (via `next/font`)

## Cara Menjalankan

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Setup Database & Seeding
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Struktur Proyek

- `src/app`: Routing dan layout aplikasi.
- `src/components`: Komponen React (Feed, Card, Nav, dll).
- `src/lib`: Konfigurasi library (Prisma Client).
- `prisma`: Schema database dan skrip seeding.
- `public`: Aset statis (gambar, icon).
