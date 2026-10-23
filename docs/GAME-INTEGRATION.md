# Panduan Integrasi Game — EarnGames (earngames.web.id)

Dokumen ini untuk **developer game** yang ingin menghubungkan game HTML5 mereka ke platform EarnGames. Setelah game terhubung, skor pemain akan **otomatis tercatat** dan poin langsung masuk ke akun mereka.

## Prinsip singkat

Game dimuat di dalam `<iframe>` di halaman EarnGames. Karena iframe terisolasi, game **tidak bisa langsung** mengakses cookie/API platform. Solusinya: game mengirim pesan skor ke halaman induk via `window.parent.postMessage`, dan platform yang akan mencatatnya ke database.

```
Game (iframe)                         EarnGames (induk)
─────────────                         ──────────────────
pemain game over
skor = 450
parent.postMessage({               →  listener menangkap pesan
  type: 'EARNGAMES_GAME_RESULT',      verifikasi origin
  score: 450,                         panggil /api/progress
  timeSec: 42                         poin masuk ke akun pemain
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
- Pesan dari origin lain akan **ditolak** diam-diam.
- Gunakan `'*'` sebagai `targetOrigin` di `postMessage` agar game tetap berjalan di environment mana pun — filtering dilakukan di sisi penerima.

## Yang terjadi setelah skor diterima

1. Platform membandingkan skor dengan `targetScore` level yang sedang dipilih pemain.
2. Jika `score >= targetScore` **dan** pemain belum pernah menyelesaikan level ini -> pemain dapat `rewardPoints` (poin hadiah, diberikan **sekali per level**).
3. Skor tertinggi (`highScore`) dan jumlah percobaan (`attempts`) selalu diperbarui.
4. Pemain melihat hasilnya langsung di modal game player.

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

**Apakah game saya perlu tahu level mana yang dipilih pemain?**
Tidak. Pemain memilih level di UI EarnGames sebelum game dimuat. Saat skor masuk, platform otomatis mencocokkannya dengan level yang sedang aktif.

**Bisakah pemain curang dengan mengirim skor palsu via console?**
Pesan `postMessage` bisa dipalsukan dari devtools, tapi platform memverifikasi origin pengirim. Untuk anti-cheat yang lebih kuat, skor juga divalidasi server-side terhadap `targetScore`. Sistem poin bersifat **jujur dan transparan** — tidak ada manipulasi hasil.

**Bagaimana kalau game saya pakai Unity WebGL / Godot Web?**
Pakai `jslib` (Unity) atau `JavaScriptBridge` (Godot) untuk memanggil `window.parent.postMessage` dari C#/GDScript. Konsepnya sama persis.

**Game saya butuh tahu identitas pemain?**
Tidak. Session pemain dipegang oleh platform (cookie httpOnly). Game cukup kirim skor, platform mencocokkan dengan pemain yang sedang login.

---

Untuk pertanyaan integrasi lain, hubungi: halo@earngames.web.id
