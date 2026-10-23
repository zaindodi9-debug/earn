# Panduan Integrasi Game — EarnGames (earngames.web.id)

Dokumen ini menjelaskan pesan hasil game HTML5 ke EarnGames. **Saat ini, pencatatan skor dan hadiah poin dari permainan dinonaktifkan** sampai tersedia verifikasi hasil di server. Jangan menganggap `postMessage` sebagai bukti skor sah.

## Prinsip singkat

Game dimuat di dalam `<iframe>`. Game dapat mengirim pemberitahuan hasil ke halaman induk melalui `window.parent.postMessage`, tetapi pesan ini dikendalikan browser pemain dan dapat dipalsukan. Pesan tersebut **tidak boleh memberi poin atau mengubah progres** tanpa validasi yang dilakukan server.

```
Game (iframe)                         EarnGames (induk)
─────────────                         ──────────────────
pemain game over
skor = 450
parent.postMessage({               →  listener mencocokkan iframe dan game
  type: 'EARNGAMES_GAME_RESULT',      skor ditampilkan sebagai info
  score: 450,                         tidak mengubah poin
  timeSec: 42                         hadiah tetap dinonaktifkan
}, '*')
```

## Kode yang harus ditambahkan di game kamu

Saat permainan berakhir (game over / menang / kalah), panggil fungsi ini:

```javascript
function kirimSkorKeEarnGames(score, timeSec) {
  // Pastikan score adalah angka bulat positif
  score = Math.max(0, Math.floor(Number(score) || 0));
  timeSec = Number.isFinite(Number(timeSec)) ? Number(timeSec) : null;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'EARNGAMES_GAME_RESULT',
      game: 'slug-game-kamu',     // opsional, untuk identifikasi
      score: score,
      timeSec: timeSec            // opsional, durasi main dalam detik
    }, '*');
    console.log('[EarnGames] Skor terkirim:', score);
  }
}
```

### Contoh pemanggilan

```javascript
// Di handler game over kamu
function onGameOver() {
  const finalScore = calculateFinalScore();
  const playTime = (Date.now() - gameStartTime) / 1000;
  kirimSkorKeEarnGames(finalScore, playTime);

  // ... tampilkan layar game over kamu seperti biasa
  showGameOverScreen(finalScore);
}
```

## Format pesan

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `type` | string | ya | Harus persis `"EARNGAMES_GAME_RESULT"` |
| `score` | number | ya | Skor akhir pemain (angka bulat >= 0) |
| `timeSec` | number | tidak | Durasi bermain dalam detik |
| `game` | string | tidak | Slug game (untuk debugging) |

## Keamanan

- Platform **hanya menerima pesan** dari origin yang diizinkan: `https://earngames.web.id`, `http://localhost:3000` (dev), dan same-origin.
- Penerima memeriksa origin dan sumber iframe yang diharapkan. Ini membantu mencegah pesan dari jendela lain, tetapi **bukan anti-cheat** dan tidak membuktikan nilai skor benar.
- `'*'` hanya digunakan pada contoh kompatibilitas; di produksi, utamakan `targetOrigin` yang spesifik jika URL game diketahui.

## Status saat ini

Endpoint `POST /api/progress` mengembalikan HTTP 503 sampai hasil permainan dapat diverifikasi oleh server. Skor yang dikirim dari browser tidak disimpan dan tidak memberikan hadiah poin. Bonus pendaftaran 100 poin tetap ditangani oleh alur pendaftaran.

## Syarat untuk mengaktifkan hadiah game

1. Buat alur sesi permainan yang dikeluarkan dan diverifikasi oleh server.
2. Validasi hasil pada server, termasuk identitas game, level, sesi, batas waktu, dan hasil yang dapat dipercaya.
3. Simpan progres, hadiah, dan ledger poin dalam satu transaksi dengan perlindungan replay.
4. Aktifkan UI pemberian poin setelah pengujian keamanan end-to-end lulus.

## Untuk admin: cara menambahkan game

1. Login sebagai admin -> **Panel Admin** -> tab **Game** -> **Tambah Game**.
2. Isi:
   - **Judul**: nama game
   - **Slug**: identifier unik (otomatis dari judul)
   - **Kategori**: arcade / puzzle / card / sports / strategy
   - **URL Embed Game**: URL ke file HTML game kamu (mis. `/games/nama-game.html` untuk game lokal, atau URL eksternal)
   - **Status**: Aktif
3. Buka tab **Level** -> tambah level dengan:
   - **Target Skor**: skor minimum untuk "selesai"
   - **Hadiah Poin**: poin yang didapat pemain saat pertama kali menyelesaikan level
   - **Batas Waktu** & **Kesulitan**
4. Game langsung muncul di pustaka pemain dan bisa dimainkan.

## Checklist sebelum game siap

- [ ] Game adalah file HTML5 mandiri (self-contained, bisa jalan di iframe)
- [ ] Game memanggil `kirimSkorKeEarnGames(score)` saat game over
- [ ] Tidak ada `alert()`/`confirm()`/`prompt()` (blokir di iframe sandboxed)
- [ ] Responsif (bekerja di mobile & desktop)
- [ ] Tidak mengakses `document.cookie` atau `localStorage` induk (tidak akan bisa)
- [ ] Aset game termuat via HTTPS

## FAQ

**Apakah hadiah langsung tercatat saat game mengirim skor?**
Tidak saat ini. Endpoint skor mengembalikan HTTP 503; pesan `postMessage` hanya pemberitahuan dari browser dan tidak menyimpan progres.

**Bisakah pemain curang dengan mengirim skor palsu via console?**
Pesan `postMessage` dapat dibuat oleh pemain dari devtools, dan pemeriksaan origin tidak mencegah pemalsuan skor dari konteks game itu sendiri. Karena itu, endpoint hadiah tetap dinonaktifkan sampai server memverifikasi hasil permainan.

**Bagaimana kalau game saya pakai Unity WebGL / Godot Web?**
Pakai `jslib` (Unity) atau `JavaScriptBridge` (Godot) untuk memanggil `window.parent.postMessage` dari C#/GDScript. Konsepnya sama persis.

**Game saya butuh tahu identitas pemain?**
Tidak. Session pemain dipegang oleh platform (cookie httpOnly). Game cukup kirim skor, platform mencocokkan dengan pemain yang sedang login.

---

Untuk pertanyaan integrasi lain, hubungi: halo@earngames.web.id
