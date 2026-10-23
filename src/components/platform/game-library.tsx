'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Brain,
  ChevronRight,
  Gamepad2,
  Layers,
  Lock,
  MapPin,
  PlayCircle,
  Puzzle,
  Sparkles,
  Trophy,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getGames } from '@/lib/api-client'
import type { Game, SafeUser, SubmitProgressResult } from '@/components/platform/types'
import { GamePlayer } from '@/components/platform/game-player'

const CATEGORY_LABEL: Record<string, string> = {
  arcade: 'Arcade',
  puzzle: 'Puzzle',
  card: 'Kartu',
  sports: 'Olahraga',
  strategy: 'Strategi',
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  arcade: <Gamepad2 className="size-10" />,
  puzzle: <Puzzle className="size-10" />,
  card: <Layers className="size-10" />,
  sports: <Trophy className="size-10" />,
  strategy: <Brain className="size-10" />,
}

// Dark-friendly gradient fallback for thumbnails
const CATEGORY_GRADIENT: Record<string, string> = {
  arcade: 'from-orange-600 via-rose-700 to-purple-800',
  puzzle: 'from-fuchsia-600 via-purple-700 to-indigo-800',
  card: 'from-cyan-600 via-blue-700 to-indigo-800',
  sports: 'from-emerald-600 via-teal-700 to-cyan-800',
  strategy: 'from-amber-600 via-orange-700 to-rose-800',
}

// Category chips (filter) — order matters
const FILTER_CHIPS: { key: string; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'populer', label: 'Populer' },
  { key: 'arcade', label: 'Arcade' },
  { key: 'puzzle', label: 'Puzzle' },
  { key: 'card', label: 'Kartu' },
  { key: 'sports', label: 'Olahraga' },
  { key: 'strategy', label: 'Strategi' },
]

type Props = {
  user: SafeUser | null
  onOpenAuth: () => void
  onPlayed?: (result: SubmitProgressResult) => void
}

export function GameLibrary({ user, onOpenAuth, onPlayed }: Props) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [playerGame, setPlayerGame] = useState<Game | null>(null)
  const [filter, setFilter] = useState<string>('all')

  async function loadGames() {
    setLoading(true)
    try {
      const { games } = await getGames()
      setGames(games)
    } catch {
      toast.error('Gagal memuat daftar game. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  function handlePlay(game: Game) {
    if (!user) {
      toast.info('Masuk dulu untuk mulai bermain.')
      onOpenAuth()
      return
    }
    setPlayerGame(game)
  }

  const filteredGames = useMemo(() => {
    if (filter === 'all') return games
    if (filter === 'populer') {
      // simple heuristic: games with embedUrl come first (already playable)
      return [...games].sort(
        (a, b) => Number(!!b.embedUrl) - Number(!!a.embedUrl)
      )
    }
    return games.filter((g) => g.category === filter)
  }, [games, filter])

  return (
    <section id="games" className="py-10 md:py-16 scroll-mt-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-5 md:mb-8">
          <Badge
            variant="outline"
            className="bg-yellow-400/10 text-yellow-300 border-yellow-400/30 mb-2"
          >
            <Sparkles className="size-3" /> Pustaka Game
          </Badge>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
            Pilih Game, Selesaikan Level, Kumpulkan Poin
          </h2>
          <p className="text-xs sm:text-base text-gray-400 hidden sm:block max-w-2xl mx-auto">
            Semua game di EarnGames adalah game internal yang dibuat dan dikelola oleh
            tim kami. Setiap level punya target skor dan hadiah poin yang jelas.
          </p>
        </div>

        {/* Category filter chips — horizontal scrollable */}
        <div className="mb-5 md:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 overflow-x-auto eg-no-scrollbar pb-1">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="eg-chip"
                data-active={filter === chip.key ? 'true' : 'false'}
                aria-pressed={filter === chip.key}
                onClick={() => setFilter(chip.key)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-44 sm:h-96 lg:h-[420px] rounded-xl sm:rounded-2xl bg-[#151b28] border border-white/5"
              />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Tidak ada game untuk kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-5">
            {filteredGames.map((g) => (
              <GameCard key={g.id} game={g} onPlay={() => handlePlay(g)} />
            ))}
          </div>
        )}
      </div>

      <GamePlayer
        open={!!playerGame}
        game={playerGame}
        levels={playerGame?.levels || []}
        onClose={() => setPlayerGame(null)}
        onPlayed={(r) => onPlayed?.(r)}
      />
    </section>
  )
}

function GameCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const activeLevels = (game.levels || []).filter((l) => l.status === 'ACTIVE')
  const totalReward = activeLevels.reduce((sum, l) => sum + l.rewardPoints, 0)
  const hasEmbed = !!game.embedUrl
  const gradient = CATEGORY_GRADIENT[game.category] || CATEGORY_GRADIENT.arcade
  const icon = CATEGORY_ICON[game.category] || <Gamepad2 className="size-10" />
  const catLabel = CATEGORY_LABEL[game.category] || game.category

  return (
    <Card className="eg-card-hover group p-0 overflow-hidden bg-[#151b28] border border-white/8 rounded-xl sm:rounded-2xl">
      {/* Image area — dominant top 60% */}
      <div className="relative h-24 sm:h-56 lg:h-64 overflow-hidden">
        {game.thumbnailUrl ? (
          <img
            src={game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
              const fallback = t.nextElementSibling as HTMLElement | null
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        {!game.thumbnailUrl ? (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center text-white/90`}
          >
            {icon}
          </div>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center text-white/90`}
            style={{ display: 'none' }}
          >
            {icon}
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex gap-1 sm:gap-2 z-10">
          <Badge className="bg-black/55 text-white border border-white/10 hover:bg-black/55 shadow-sm text-[9px] sm:text-xs px-1 sm:px-2.5 py-0 sm:py-0.5">
            {catLabel}
          </Badge>
          {!hasEmbed ? (
            <Badge className="bg-orange-500/95 text-white border border-orange-400/50 shadow-sm text-[9px] sm:text-xs px-1 sm:px-2.5 py-0 sm:py-0.5">
              <span className="hidden sm:inline">Segera Hadir</span>
              <span className="sm:hidden">Segera</span>
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/95 text-white border border-emerald-400/50 shadow-sm text-[9px] sm:text-xs px-1 sm:px-2.5 py-0 sm:py-0.5">
              <span className="hidden sm:inline">Bisa Dimainkan</span>
              <span className="sm:hidden">Siap</span>
            </Badge>
          )}
        </div>

        {/* Bottom gradient overlay + title on image */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-2 pt-10 sm:p-4 sm:pt-14">
          <h3 className="text-sm sm:text-lg font-bold text-white leading-tight drop-shadow-lg line-clamp-1 sm:line-clamp-2">
            {game.title}
          </h3>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-300 mt-0.5">
            <MapPin className="size-3" />
            {catLabel}
          </div>
        </div>

        {/* gold chevron right (decorative) */}
        <ChevronRight className="absolute top-3 right-3 hidden size-5 text-yellow-400/80 drop-shadow sm:block" />
      </div>

      {/* Body — compact on mobile */}
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
        <p className="hidden sm:block text-xs text-gray-400 line-clamp-2 min-h-[2.5rem]">
          {game.description || 'Game internal EarnGames. Mainkan dan kumpulkan poin.'}
        </p>

        {/* Stats row — gold for points */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3.5" />
            {activeLevels.length} Level
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
            <Trophy className="size-3.5" />
            +{totalReward} Poin Maks
          </span>
        </div>
        {/* compact stats on mobile */}
        <div className="sm:hidden flex items-center gap-2 text-[11px] text-gray-300">
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3" />
            {activeLevels.length} Level
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-300 font-bold">
            <Trophy className="size-3" />
            +{totalReward} Poin
          </span>
        </div>

        <Button
          onClick={onPlay}
          className="w-full eg-gradient-bg text-black hover:opacity-90 h-8 sm:h-11 p-0 text-[11px] sm:text-sm font-extrabold rounded-lg sm:rounded-xl"
        >
          {hasEmbed ? (
            <>
              <PlayCircle className="size-3.5 sm:size-5" />
              <span className="hidden sm:inline">Main Sekarang</span>
              <span className="sm:hidden">Main</span>
            </>
          ) : (
            <>
              <PlayCircle className="size-3.5 sm:size-5" />
              <span className="hidden sm:inline">Main (Demo)</span>
              <span className="sm:hidden">Demo</span>
            </>
          )}
        </Button>
        {activeLevels.length === 0 && (
          <p className="text-[10px] sm:text-xs text-orange-400 flex items-center justify-center gap-1">
            <Lock className="size-3" /> Level sedang disiapkan
          </p>
        )}
      </div>
    </Card>
  )
}
