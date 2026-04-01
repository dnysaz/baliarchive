# 🚀 BaliArchive Production Deployment Guide

Panduan ini berisi langkah-langkah untuk mendeploy BaliArchive ke server VPS Bapak (Ubuntu/Debian) agar website berjalan lancar dan aman.

---

## 1. Persiapan Awal (VPS)
Pastikan VPS Bapak sudah terinstall:
- **Node.js** (Versi 18 ke atas)
- **NPM** atau **PNPM**
- **PM2** (Untuk menjaga website tetap hidup di background)
  `npm install -g pm2`

## 2. Mengunggah Kode
Bapak bisa menggunakan **Git Clone** dari repo Bapak:
```bash
git clone https://github.com/dnysaz/baliarchive.git
cd baliarchive
npm install
```

## 3. Konfigurasi Environment (`.env`)
Buat file `.env` di root folder dan isi sebagai berikut:
```env
# Database (SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth (Penting untuk login)
NEXTAUTH_URL="https://baliarchive.com" # Ganti dengan domain asli Bapak
NEXTAUTH_SECRET="buat_string_acak_panjang_di_sini"

# Admin Initial (Opsional)
ADMIN_EMAIL="danayasa2@gmail.com"
ADMIN_PASSWORD="Lemarikaca01#"
```

## 4. Inisialisasi Database
Jalankan perintah ini untuk menciptakan tabel-tabel di database VPS:
```bash
npx prisma migrate deploy
```

---

## 5. Menjalankan Setup Script 🛠️
Ini adalah langkah **paling krusial** (yang Bapak tanyakan). Script ini melakukan:
1.  **SiteSettings (ID: 1):** Menciptakan record pengaturan awal agar halaman About, Terms, dan Contact tidak kosong/error.
2.  **Admin Account:** Menciptakan user admin utama agar Bapak bisa langsung login.
3.  **SEO Defaults:** Menyiapkan metadata judul dan deskripsi awal untuk Google.

**Perintahnya:**
```bash
npx ts-node scripts/setup-production.ts
```

---

## 6. Build & Start (Production)
Agar website berjalan cepat dan optimal, Bapak harus melakukan build:
```bash
# Kompilasi project
npm run build

# Menjalankan dengan PM2 agar tidak mati saat terminal ditutup
pm2 start npm --name "baliarchive" -- start
```

## 7. Monitoring & Update
Jika Bapak ingin melihat log atau mengupdate kode di masa depan:
- **Lihat Log:** `pm2 logs baliarchive`
- **Restart:** `pm2 restart baliarchive`
- **Update Kode:**
  `git pull`
  `npm install`
  `npm run build`
  `pm2 restart baliarchive`

---

**Selamat Meluncurkan BaliArchive, Pak! 🏝️🚀🏁**
Jika ada kendala saat deploy, hubungi saya kembali.
