'use client'

import { useState } from 'react'
import { BookOpen, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const SNIPPET = `function kirimSkorKeEarnGames(score, timeSec) {
  score = Math.max(0, Math.floor(Number(score) || 0));
  timeSec = Number.isFinite(Number(timeSec)) ? Number(timeSec) : null;
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'EARNGAMES_GAME_RESULT',
      game: 'slug-game-kamu',
      score: score,
      timeSec: timeSec
    }, '*');
  }
}`

export function AdminDevDocs() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function copySnippet() {
    navigator.clipboard.writeText(SNIPPET).then(() => {
      setCopied(true)
      toast.success('Kode snippet disalin ke clipboard.')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BookOpen className="size-4" />
          Dokumentasi Integrasi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Panduan Integrasi Game</DialogTitle>
          <DialogDescription>
            Cara menghubungkan game HTML5 kamu ke platform EarnGames (earngames.web.id) agar skor
            otomatis tercatat dan poin masuk ke akun pemain.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Prinsip</h3>
              <p>
                Game dimuat di dalam <code className="bg-muted px-1 rounded">iframe</code>. Saat game
                over, game mengirim pesan skor ke halaman induk via{' '}
                <code className="bg-muted px-1 rounded">window.parent.postMessage</code>. Platform
                menangkap pesan itu, memverifikasi origin, lalu mencatat skor ke database.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Kode yang ditambahkan di game</h3>
              <p className="mb-2">Panggil fungsi ini saat permainan berakhir (game over / menang / kalah):</p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs overflow-x-auto">
                  <code>{SNIPPET}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 gap-1"
                  onClick={copySnippet}
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </Button>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Format pesan</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="bg-muted px-1 rounded">type</code> (wajib): harus persis <code className="bg-muted px-1 rounded">"EARNGAMES_GAME_RESULT"</code></li>
                <li><code className="bg-muted px-1 rounded">score</code> (wajib): skor akhir, angka bulat ≥ 0</li>
                <li><code className="bg-muted px-1 rounded">timeSec</code> (opsional): durasi main dalam detik</li>
                <li><code className="bg-muted px-1 rounded">game</code> (opsional): slug game untuk debugging</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Keamanan</h3>
              <p>
                Platform hanya menerima pesan dari origin yang diizinkan:{' '}
                <code className="bg-muted px-1 rounded">https://earngames.web.id</code>,{' '}
                <code className="bg-muted px-1 rounded">http://localhost:3000</code> (dev), dan
                same-origin. Pesan dari origin lain ditolak diam-diam. Gunakan{' '}
                <code className="bg-muted px-1 rounded">'*'</code> sebagai targetOrigin di game kamu.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Alur skor</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Pemain memilih level di UI EarnGames, lalu game dimuat di iframe.</li>
                <li>Saat game over, game memanggil <code className="bg-muted px-1 rounded">kirimSkorKeEarnGames(score)</code>.</li>
                <li>Platform membandingkan skor dengan <code className="bg-muted px-1 rounded">targetScore</code> level.</li>
                <li>Jika lulus dan belum pernah selesai → pemain dapat <code className="bg-muted px-1 rounded">rewardPoints</code> (sekali per level).</li>
                <li>Hasil tampil langsung di modal game player.</li>
              </ol>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-1">Checklist game siap</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>HTML5 mandiri, bisa jalan di iframe</li>
                <li>Memanggil <code className="bg-muted px-1 rounded">postMessage</code> saat game over</li>
                <li>Tidak pakai <code className="bg-muted px-1 rounded">alert()/confirm()/prompt()</code></li>
                <li>Responsif (mobile & desktop)</li>
                <li>Tidak mengakses cookie/localStorage induk</li>
              </ul>
            </section>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              Dokumen lengkap: <code className="bg-muted px-1 rounded">docs/GAME-INTEGRATION.md</code>.
              Bantuan: halo@earngames.web.id
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
