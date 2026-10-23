'use client'

import {
  Award,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  Gift,
  HelpCircle,
  ListOrdered,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GameLibrary } from '@/components/platform/game-library'
import type { SafeUser, SubmitProgressResult } from '@/components/platform/types'

type Props = {
  user: SafeUser | null
  onOpenAuth: () => void
  onPlayed?: (result: SubmitProgressResult) => void
}

const STATS = [
  { value: 'HTML5', label: 'Game Interaktif', icon: <Users className="size-5" /> },
  { value: 'Bertingkat', label: 'Tantangan Game', icon: <ListOrdered className="size-5" /> },
  { value: '100 Poin', label: 'Bonus Pendaftaran', icon: <Gift className="size-5" /> },
]

const STEPS = [
  {
    n: 1,
    title: 'Daftar Akun',
    desc: 'Buat akun EarnGames gratis dan langsung dapat bonus 100 poin untuk memulai.',
    icon: <Users className="size-6" />,
  },
  {
    n: 2,
    title: 'Pilih Game & Level',
    desc: 'Jelajahi pustaka game internal kami dan pilih level yang sesuai dengan kemampuanmu.',
    icon: <Gamepad2 className="size-6" />,
  },
  {
    n: 3,
    title: 'Mainkan Game',
    desc: 'Permainan dapat dimainkan. Hadiah poin dari hasil game sementara dinonaktifkan sampai verifikasi server tersedia.',
    icon: <Trophy className="size-6" />,
  },
]

const FEATURES = [
  {
    title: 'Game Internal',
    desc: 'Semua game dibuat dan dikelola langsung oleh tim EarnGames — bukan daftar game pihak ketiga.',
    icon: <Gamepad2 className="size-6" />,
  },
  {
    title: 'Sistem Poin',
    desc: 'Bonus pendaftaran 100 poin tersedia. Hadiah poin dari hasil game sementara dinonaktifkan sampai verifikasi server tersedia.',
    icon: <Target className="size-6" />,
  },
  {
    title: 'Level Bertingkat',
    desc: 'Setiap game punya beberapa level dengan tingkat kesulitan Mudah, Sedang, Sulit, dan Ahli.',
    icon: <ListOrdered className="size-6" />,
  },
  {
    title: 'Papan Peringkat',
    desc: 'Lihat poin dan progres akunmu melalui dashboard. Papan peringkat publik belum tersedia.',
    icon: <Trophy className="size-6" />,
  },
]

const TIPS = [
  {
    title: 'Mulai dari Level Mudah',
    desc: 'Mulai dari level EASY untuk mengenal kontrol dan membangun keterampilan bermain.',
  },
  {
    title: 'Latihan Rutin',
    desc: 'Mainkan game yang sama beberapa kali untuk meningkatkan skor tertinggimu.',
  },
  {
    title: 'Pahami Target Skor',
    desc: 'Gunakan target skor sebagai ukuran progres. Hadiah poin permainan belum diaktifkan.',
  },
  {
    title: 'Kelola Waktu',
    desc: 'Tiap level punya batas waktu. Bermain cepat dan akurat lebih baik daripada asal selesai.',
  },
  {
    title: 'Coba Semua Kategori',
    desc: 'Arcade, puzzle, kartu, olahraga, dan strategi punya tantangan berbeda. Eksplorasi semua!',
  },
]

const FAQS = [
  {
    q: 'Apakah EarnGames gratis?',
    a: 'Ya. Mendaftar dan bermain sepenuhnya gratis. Kamu bahkan mendapat bonus 100 poin saat pertama kali mendaftar.',
  },
  {
    q: 'Bagaimana cara mendapatkan poin?',
    a: 'Saat ini hadiah poin dari permainan dinonaktifkan sampai hasil dapat diverifikasi oleh server. Bonus pendaftaran 100 poin tetap tersedia.',
  },
  {
    q: 'Apakah poin bisa ditukar dengan hadiah?',
    a: 'Saat ini poin belum dapat ditukar dengan hadiah. Fitur penukaran belum tersedia.'
  },
  {
    q: 'Apakah ada batas usia?',
    a: 'EarnGames ditujukan untuk pengguna berusia 13 tahun ke atas. Pengguna di bawah umur disarankan didampingi orang tua.',
  },
  {
    q: 'Apakah poin bisa di-hook/dicurangi?',
    a: 'Skor yang dikirim dari browser belum digunakan untuk mengubah poin. Hadiah permainan baru diaktifkan setelah verifikasi server tersedia.',
  },
]

export function UserView({ user, onOpenAuth, onPlayed }: Props) {
  return (
    <main className="flex-1">
      {/* ===== Hero ===== */}
      <section
        id="beranda"
        className="relative isolate flex min-h-[min(740px,100svh)] items-center overflow-hidden bg-[#07111b] pt-24 pb-12 sm:pt-28 sm:pb-16 md:min-h-[640px] md:pt-24 md:pb-20 scroll-mt-14"
      >
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <img
            src="/images/hero-character.webp"
            alt=""
            className="h-full w-full object-cover object-[58%_36%] opacity-45 md:object-[58%_34%] md:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06111c]/95 via-[#06111c]/75 to-[#06111c]/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06111c]/35 via-transparent to-[#0B0F19]/95" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl text-white relative z-10">
              <Badge className="bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 mb-4">
                <Sparkles className="size-3" /> Platform Game Internal
              </Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] mb-5">
                Mainkan Game, Dapatkan{' '}
                <span className="eg-gold-text">Bonus Poin Awal</span>
              </h1>
              <p className="text-sm md:text-base text-gray-300 mb-7 max-w-lg">
                EarnGames adalah platform game internal. Pilih dan mainkan game yang tersedia.
                Bonus pendaftaran 100 poin tersedia; hadiah poin dari permainan sementara
                dinonaktifkan sampai hasil dapat diverifikasi oleh server.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#games"
                  className="eg-gradient-bg text-black px-6 py-3.5 rounded-xl font-extrabold text-sm md:text-base hover:opacity-90 transition-all eg-pulse-glow text-center inline-flex items-center justify-center gap-1.5"
                >
                  Mulai Main Sekarang
                  <ChevronRight className="size-5" />
                </a>
                <a
                  href="#how"
                  className="border border-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm md:text-base hover:bg-white/5 transition-all text-center"
                >
                  Cara Main
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-xl rounded-xl border border-white/10 bg-[#06111c]/45 px-3 py-4 backdrop-blur-sm">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="flex items-center justify-center text-yellow-400 mb-1">
                      {s.icon}
                    </div>
                    <div className="text-lg md:text-2xl font-extrabold text-white">
                      {s.value}
                    </div>
                    <div className="text-gray-300 text-[11px] md:text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* ===== Game Library ===== */}
      <GameLibrary user={user} onOpenAuth={onOpenAuth} onPlayed={onPlayed} />

      {/* ===== How it works ===== */}
      <section id="how" className="py-14 md:py-20 scroll-mt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 mb-3">
              Cara Main
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              Tiga Langkah untuk Memulai Bermain
            </h2>
            <p className="text-gray-400">
              Daftar gratis dan jelajahi game yang tersedia. Hadiah poin permainan akan diaktifkan setelah verifikasi server selesai.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <Card
                key={s.n}
                className="eg-card-hover p-6 text-center bg-[#151b28] border-white/8"
              >
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 eg-gradient-bg rounded-full flex items-center justify-center text-black shadow-lg">
                    {s.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#0B0F19] border border-yellow-400/40 text-yellow-400 font-extrabold text-sm flex items-center justify-center">
                    {s.n}
                  </span>
                </div>
                <div className="text-yellow-400 font-bold text-sm mb-1">Langkah {s.n}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="py-14 md:py-20 bg-[#0e1320]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 mb-3">
              <ShieldCheck className="size-3" /> Keunggulan
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              Kenapa Main di EarnGames?
            </h2>
            <p className="text-gray-400">
              Pengalaman bermain yang adil, transparan, dan menyenangkan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <Card key={f.title} className="eg-card-hover p-6 bg-[#151b28] border-white/8">
                <div className="w-12 h-12 eg-feature-icon rounded-xl flex items-center justify-center mb-4 text-black shadow-lg">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tips ===== */}
      <section id="tips" className="py-14 md:py-20 scroll-mt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <img
                src="/images/tips-gaming.png"
                alt="Tips bermain game di EarnGames"
                className="rounded-2xl shadow-xl w-full h-auto border border-white/10"
              />
            </div>
            <div>
              <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 mb-3">
                <Award className="size-3" /> Tips Bermain
              </Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-6">
                Tips Memulai Bermain
              </h2>
              <div className="space-y-4">
                {TIPS.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 eg-gradient-bg rounded-full flex items-center justify-center flex-shrink-0 text-black text-sm font-extrabold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{t.title}</h4>
                      <p className="text-sm text-gray-400">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-14 md:py-20 bg-[#0e1320] scroll-mt-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge variant="outline" className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 mb-3">
              <HelpCircle className="size-3" /> FAQ
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              Pertanyaan Umum
            </h2>
            <p className="text-gray-400">
              Hal-hal yang sering ditanyakan tentang EarnGames.
            </p>
          </div>

          <Card className="p-2 bg-[#151b28] border-white/8">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/8">
                  <AccordionTrigger className="px-4 hover:no-underline hover:text-yellow-300 text-white">
                    <span className="text-left font-medium">{f.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-gray-400">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>

      {/* ===== CTA (dark blue gradient, gold button) ===== */}
      <section className="eg-hero-gradient py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <Star className="size-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Siap Mulai Bermain?</h2>
          <p className="text-base text-gray-300 mb-7 max-w-2xl mx-auto">
            Daftar sekarang dan dapatkan bonus 100 poin pertama. Jelajahi game internal kami.
            Hadiah poin permainan sementara dinonaktifkan hingga verifikasi server tersedia.
          </p>
          {!user ? (
            <Button
              onClick={onOpenAuth}
              size="lg"
              className="eg-gradient-bg text-black hover:opacity-90 px-7 py-3.5 text-base rounded-xl font-extrabold"
            >
              Daftar Sekarang
            </Button>
          ) : (
            <a
              href="#games"
              className="inline-flex items-center gap-1.5 eg-gradient-bg text-black px-7 py-3.5 rounded-xl font-extrabold text-base hover:opacity-90 transition-all"
            >
              Mulai Bermain
              <ChevronRight className="size-5" />
            </a>
          )}
        </div>
      </section>

      {/* accessibility-only chevron */}
      <div className="sr-only">
        <ChevronDown /> Gulir ke bawah untuk informasi lebih lanjut.
      </div>
    </main>
  )
}
