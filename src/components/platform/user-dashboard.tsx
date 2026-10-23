'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Award,
  CheckCircle2,
  Gamepad2,
  Loader2,
  RefreshCw,
  Target,
  Trophy,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProgress } from '@/lib/api-client'
import { GameLibrary } from '@/components/platform/game-library'
import type { SafeUser, SubmitProgressResult, UserProgress } from '@/components/platform/types'

type Props = {
  user: SafeUser
  onOpenAuth: () => void
  onPointsChange: (newPoints: number) => void
}

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Mudah',
  MEDIUM: 'Sedang',
  HARD: 'Sulit',
  EXPERT: 'Ahli',
}

export function UserDashboard({ user, onOpenAuth, onPointsChange }: Props) {
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [localPoints, setLocalPoints] = useState(user.points)

  async function load() {
    setLoading(true)
    try {
      const { progress } = await getProgress()
      setProgress(progress)
    } catch {
      toast.error('Gagal memuat progres kamu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    setLocalPoints(user.points)
  }, [user.points])

  function handlePlayed(result: SubmitProgressResult) {
    // update progress list locally
    setProgress((prev) => {
      const idx = prev.findIndex((p) => p.gameLevelId === result.progress.gameLevelId)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], ...result.progress }
        return next
      }
      return [result.progress, ...prev]
    })
    setLocalPoints(result.points)
    onPointsChange(result.points)
  }

  const completedCount = progress.filter((p) => p.completed).length
  const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0)

  return (
    <main className="flex-1 pt-14 pb-24 sm:pb-20">
      {/* Welcome banner — dark blue gradient with gold accents */}
      <section id="profile" className="eg-hero-gradient text-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-yellow-300 text-sm mb-1 font-semibold">
                Selamat datang kembali
              </p>
              <h1 className="text-2xl md:text-4xl font-extrabold">
                Halo, {user.name || user.email}!
              </h1>
              <p className="text-gray-300 mt-2 text-sm max-w-lg">
                Lanjutkan perjalananmu, selesaikan level yang belum tuntas, dan
                kumpulkan lebih banyak poin.
              </p>
            </div>

            <div className="flex gap-3">
              <div id="wallet" className="eg-glass rounded-xl p-4 min-w-[140px] scroll-mt-20">
                <div className="flex items-center gap-2 text-yellow-300 text-xs mb-1">
                  <Target className="size-3" /> Total Poin
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-yellow-400">
                  🎯 {localPoints}
                </div>
              </div>
              <div className="eg-glass rounded-xl p-4 min-w-[140px]">
                <div className="flex items-center gap-2 text-emerald-300 text-xs mb-1">
                  <CheckCircle2 className="size-3" /> Level Selesai
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">
                  {completedCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress table — dark */}
      <section className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                Progres Permainan Kamu
              </h2>
              <p className="text-xs md:text-sm text-gray-400">
                Total {progress.length} level dicoba, {completedCount} selesai,{' '}
                {totalAttempts} percobaan.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="bg-white/5 border-white/10 text-gray-300 hover:text-yellow-300 hover:bg-white/10"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Muat Ulang</span>
            </Button>
          </div>

          <Card className="bg-[#151b28] border-white/8">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-[#1f2937]" />
                ))}
              </div>
            ) : progress.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Gamepad2 className="size-10 mx-auto mb-3 text-gray-600" />
                <p className="font-medium text-white">Belum ada progres.</p>
                <p className="text-sm">
                  Mulai mainkan game di bawah untuk mengumpulkan poin!
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/10 md:hidden">
                  {progress.map((p) => {
                    const lvl = p.gameLevel
                    return (
                      <div key={p.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {lvl?.game?.title || '—'}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Level {lvl?.levelNumber ?? '?'}{lvl?.name ? ' · ' + lvl.name : ''}
                            </p>
                          </div>
                          {p.completed ? (
                            <Badge className="shrink-0 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="size-3" /> Selesai
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="shrink-0 text-gray-300 border-white/10 bg-white/5">
                              Belum Tuntas
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-gray-400">Skor tertinggi</p>
                            <p className="mt-1 font-bold text-yellow-300">
                              {p.highScore} <span className="text-gray-400 font-normal">/ {lvl?.targetScore ?? '-'}</span>
                            </p>
                          </div>
                          <div className="rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-gray-400">Percobaan</p>
                            <p className="mt-1 font-bold text-white">{p.attempts}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableHead className="text-gray-400">Game</TableHead>
                    <TableHead className="text-gray-400">Level</TableHead>
                    <TableHead className="text-gray-400">Kesulitan</TableHead>
                    <TableHead className="text-gray-400 text-right">
                      Skor Tertinggi
                    </TableHead>
                    <TableHead className="text-gray-400 text-right">
                      Percobaan
                    </TableHead>
                    <TableHead className="text-gray-400 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progress.map((p) => {
                    const lvl = p.gameLevel
                    return (
                      <TableRow
                        key={p.id}
                        className="border-white/8 hover:bg-white/5"
                      >
                        <TableCell className="font-medium text-white">
                          {lvl?.game?.title || '—'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-white">
                            L{lvl?.levelNumber ?? '?'}
                          </span>{' '}
                          <span className="text-xs text-gray-500">{lvl?.name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-white/5 text-gray-300 border-white/10"
                          >
                            {DIFFICULTY_LABEL[lvl?.difficulty || ''] || lvl?.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-yellow-400">
                          {p.highScore} / {lvl?.targetScore ?? '-'}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          {p.attempts}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.completed ? (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="size-3" /> Selesai
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-gray-400 border-white/10 bg-white/5"
                            >
                              Belum Tuntas
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* Game library */}
      <GameLibrary user={user} onOpenAuth={onOpenAuth} onPlayed={handlePlayed} />

      {/* Achievements row — dark */}
      <section className="py-8 md:py-12 bg-[#0e1320]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-[#151b28] border-white/8 flex items-center gap-4 eg-card-hover">
              <div className="w-12 h-12 eg-feature-icon rounded-xl flex items-center justify-center text-black shadow-lg">
                <Trophy className="size-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Skor Terbaik</div>
                <div className="text-xl font-extrabold text-yellow-400">
                  {progress.reduce((m, p) => Math.max(m, p.highScore), 0)}
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-[#151b28] border-white/8 flex items-center gap-4 eg-card-hover">
              <div className="w-12 h-12 eg-feature-icon rounded-xl flex items-center justify-center text-black shadow-lg">
                <Award className="size-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Level Tuntas</div>
                <div className="text-xl font-extrabold text-white">{completedCount}</div>
              </div>
            </Card>
            <Card className="p-5 bg-[#151b28] border-white/8 flex items-center gap-4 eg-card-hover">
              <div className="w-12 h-12 eg-feature-icon rounded-xl flex items-center justify-center text-black shadow-lg">
                <Gamepad2 className="size-6" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Percobaan</div>
                <div className="text-xl font-extrabold text-white">{totalAttempts}</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-0">
          <Loader2 className="size-6" />
        </div>
      )}
    </main>
  )
}
