# Deploy EarnGames ke Vercel

Panduan ini memakai Vercel untuk Next.js dan Neon PostgreSQL untuk data akun, progres, serta poin.

## 1. Rotasi secret yang terekspos

Secret database dan `SESSION_SECRET` pernah dibagikan melalui chat. Rotasi password Neon dan buat `SESSION_SECRET` baru sebelum deployment. Jangan masukkan nilainya ke Git, log, screenshot, atau chat.

Buat `SESSION_SECRET` acak minimal 32 karakter, misalnya dengan:

```sh
openssl rand -hex 32
```

## 2. Siapkan koneksi Neon lokal

Di `.env` lokal (file ini di-ignore Git), atur:

```dotenv
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
SESSION_SECRET="secret-baru-minimal-32-karakter"
```

Gunakan pooled URL untuk runtime dan direct URL tanpa `-pooler` untuk Prisma Migrate. Jangan tempelkan URL yang berisi password ke percakapan.

## 3. Buat schema dan pindahkan data SQLite

Database target harus baru/kosong. Perintah migration hanya membuat tabel dan indeks; perintah transfer menyalin akun, game, level, progres, dan ledger, tetapi tidak menyalin sesi login. Semua pengguna perlu login ulang setelah pindah.

Dari root project, jalankan berurutan:

```sh
bun run db:migrate:deploy
bun run prisma/migrate-sqlite-to-postgres.ts
bun run prisma/migrate-sqlite-to-postgres.ts --apply
```

Perintah kedua adalah dry-run dan tidak menulis data. Periksa jumlah record-nya terhadap database SQLite lokal. Perintah ketiga menulis data hanya jika tabel target masih kosong; jika target berisi data, script berhenti. Jangan jalankan `prisma/seed.ts` setelah transfer, karena seed menambahkan data demo.

Jika migration gagal atau Neon bukan database kosong, berhenti dan periksa target terlebih dahulu. Jangan gunakan `db push --accept-data-loss` pada production.

## 4. Deploy ke Vercel

1. Import repository GitHub `zaindodi9-debug/earn` ke Vercel.
2. Pilih framework Next.js dan root directory project. Biarkan build command memakai script `build` dari `package.json`; script tersebut menjalankan `prisma generate && next build`.
3. Tambahkan environment variables untuk **Production**, **Preview**, dan **Development** sesuai kebutuhan: `DATABASE_URL`, `DIRECT_URL`, dan `SESSION_SECRET`. Gunakan database terpisah untuk Preview agar preview deployment tidak mengubah data production.
4. Deploy. Untuk perubahan schema berikutnya, jalankan `bun run db:migrate:deploy` secara terkontrol sebelum deploy kode yang membutuhkan schema tersebut.
5. Tambahkan domain production di Vercel. Metadata situs saat ini mengarah ke `https://earngames.web.id`; perbarui `src/app/layout.tsx` jika domain production berbeda.

## 5. Pemeriksaan setelah deploy

- Cek landing page, daftar game, dan gambar statis.
- Login admin dan pemain; pastikan sesi tetap aktif setelah refresh.
- Mainkan satu game dan pastikan progres serta ledger poin tersimpan di Neon.
- Cek Vercel Runtime Logs dan Neon query/connection status.
- Jangan tampilkan isi environment variables saat meminta bantuan.

## Status koneksi OAuth

Google OAuth belum disiapkan. Setelah domain production aktif, daftarkan origin dan callback Google yang benar, lalu pasang Client ID/Secret sebagai environment variables. Callback dan integrasi OAuth pada aplikasi harus sudah dibuat sebelum tombol Google diaktifkan.
