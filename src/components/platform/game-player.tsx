'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Award,
  Clock,
  Dices,
  Fullscreen,
  Loader2,
  Minimize,
  Play,
  RotateCcw,
  Target,
  Timer,
  Trophy,
  X,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError, submitProgress } from '@/lib/api-client'
import type { Game, GameLevel, SubmitProgressResult } from '@/components/platform/types'

type Props = {
  open: boolean
  game: Game | null
  levels: GameLevel[]
  initialLevelId?: string
  onClose: () => void
  onPlayed: (result: SubmitProgressResult) => void
}

const POINT_REWARDS_ENABLED = false // Keep disabled until server-authoritative scoring is implemented.

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Mudah',
  MEDIUM: 'Sedang',
  HARD: 'Sulit',
  EXPERT: 'Ahli',
}

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HARD: 'bg-orange-100 text-orange-700 border-orange-200',
  EXPERT: 'bg-red-100 text-red-700 border-red-200',
}

export function GamePlayer({
  open,
  game,
  levels,
  initialLevelId,
  onClose,
  onPlayed,
}: Props) {
  const [levelId, setLevelId] = useState<string>('')
  const [demoScore, setDemoScore] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitProgressResult | null>(null)
  const [rolling, setRolling] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const stageRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isBrowserFs, setIsBrowserFs] = useState(false)

  const activeLevels = useMemo(
    () => (levels || []).filter((l) => l.status === 'ACTIVE'),
    [levels]
  )

  // pick default level when modal opens
  useEffect(() => {
    if (open && activeLevels.length > 0) {
      const initial =
        initialLevelId && activeLevels.find((l) => l.id === initialLevelId)
          ? initialLevelId
          : activeLevels[0].id
      setLevelId(initial)
      setDemoScore(null)
      setResult(null)
      setPlaying(false)
    }
  }, [open, initialLevelId, activeLevels])

  // reset when modal closes
  useEffect(() => {
    if (!open) {
      setPlaying(false)
      setResult(null)
      exitBrowserFs()
    }
  }, [open])

  // reset result when switching level
  useEffect(() => {
    setDemoScore(null)
    setResult(null)
  }, [levelId])

  // keep latest submit in a ref so the message listener always calls the freshest version
  const submitRef = useRef<(score: number, timeSec?: number) => void>(() => {})
  const levelRef = useRef<GameLevel | null>(null)
  const gameRef = useRef<Game | null>(null)
  submitRef.current = submit
  levelRef.current = activeLevels.find((l) => l.id === levelId) || activeLevels[0] || null
  gameRef.current = game

  // Listen for score reports from embedded games (postMessage).
  useEffect(() => {
    if (!open || !game?.embedUrl) return
    let expectedOrigin: string
    try {
      const embed = new URL(game.embedUrl, window.location.origin)
      if (embed.protocol !== 'http:' && embed.protocol !== 'https:') return
      expectedOrigin = embed.origin
    } catch {
      return
    }
    function onMessage(e: MessageEvent) {
      if (e.origin !== expectedOrigin) return
      // Only accept messages from the exact game iframe currently opened by this modal.
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return
      const d = e.data
      if (d?.type === 'EARNGAMES_MINI_GAME_CLOSE') {
        exitPlaying()
        return
      }
      if (!d || d.type !== 'EARNGAMES_GAME_RESULT') return
      if (typeof d.game !== 'string' || d.game !== gameRef.current?.slug) return
      const score = Math.max(0, Math.floor(Number(d.score)))
      if (!Number.isFinite(score)) return
      const timeSec = Number.isFinite(Number(d.timeSec)) ? Number(d.timeSec) : undefined
      if (!POINT_REWARDS_ENABLED) {
        toast.info(`Skor permainan terdeteksi (${score}), tetapi hadiah poin dinonaktifkan sementara sampai verifikasi server tersedia.`)
        return
      }
      toast.success(`Skor diterima: ${score}`)
      submitRef.current(score, timeSec)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [open, game?.embedUrl])

  // track real fullscreen state
  useEffect(() => {
    function onFsChange() {
      setIsBrowserFs(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function enterBrowserFs() {
    const el = stageRef.current
    if (!el) return
    try {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {})
      }
    } catch {}
  }

  function exitBrowserFs() {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    } catch {}
  }

  if (!game) return null

  const level = activeLevels.find((l) => l.id === levelId) || activeLevels[0]
  if (!level) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{game.title}</DialogTitle>
            <DialogDescription>
              Game ini belum memiliki level aktif. Hubungi admin untuk menambahkan level.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} variant="outline">Tutup</Button>
        </DialogContent>
      </Dialog>
    )
  }

  function rollDemo() {
    setRolling(true)
    setResult(null)
    setTimeout(() => {
      setDemoScore(Math.floor(Math.random() * 600) + 50)
      setRolling(false)
    }, 400)
  }

  async function submit(score: number, timeSec?: number) {
    const lv = levelRef.current
    if (!lv) return
    if (!POINT_REWARDS_ENABLED) {
      toast.warning('Hadiah poin sementara dinonaktifkan sampai hasil permainan dapat diverifikasi oleh server.')
      return
    }
    setSubmitting(true)
    try {
      const res = await submitProgress(lv.id, score, timeSec)
      setResult(res)
      onPlayed({
        ...res,
        progress: {
          ...res.progress,
          gameLevel: { ...lv, game: gameRef.current ?? undefined },
        },
      })
      if (res.awarded > 0) {
        toast.success(`Selamat! Kamu mendapat +${res.awarded} poin!`)
      } else if (res.completed) {
        toast.info('Level ini sudah diselesaikan sebelumnya. Skor tetap dicatat.')
      } else {
        toast.warning('Belum mencapai target. Coba lagi ya!')
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal mengirim skor.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  function startPlaying() {
    setResult(null)
    setPlaying(true)
  }

  function exitPlaying() {
    setPlaying(false)
    exitBrowserFs()
  }

  function playAgain() {
    setResult(null)
    setIframeKey((k) => k + 1) // reload iframe
  }

  /* ---------- FULLSCREEN PLAY MODE ---------- */
  if (playing && game.embedUrl) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-none sm:!max-w-none !w-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none !p-0 !border-0 !gap-0 overflow-hidden flex flex-col"
        >
          {/* Top bar — minimal, auto-hide feel via low opacity */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 text-white pointer-events-auto">
              <span className="font-semibold text-sm drop-shadow">{game.title}</span>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                Level {level.levelNumber} · {DIFFICULTY_LABEL[level.difficulty]}
              </Badge>
            </div>
            <div className="flex items-center gap-1 pointer-events-auto">
              {!isBrowserFs ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2 gap-1 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={enterBrowserFs}
                  title="Layar penuh"
                >
                  <Fullscreen className="size-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2 gap-1 bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={exitBrowserFs}
                  title="Keluar dari layar penuh"
                >
                  <Minimize className="size-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 gap-1 bg-red-500/80 hover:bg-red-500 text-white border-0"
                onClick={exitPlaying}
                title="Keluar"
              >
                <X className="size-4" /> Keluar
              </Button>
            </div>
          </div>

          {/* Game iframe — fills entire screen */}
          <div ref={stageRef} className="flex-1 bg-black relative">
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={game.embedUrl}
              title={game.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
              allowFullScreen
            />

            {/* Result overlay — shows on top of game when score received */}
            {result && (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${result.completed ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {result.completed ? (
                        <Trophy className="size-7 text-green-600" />
                      ) : (
                        <Timer className="size-7 text-orange-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {result.completed ? 'Level Selesai!' : 'Belum Tuntas'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{game.title} · Level {level.levelNumber}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Skor Kamu</div>
                      <div className="text-lg font-bold text-gray-900">{result.progress.highScore}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Target</div>
                      <div className="text-lg font-bold text-gray-900">{level.targetScore}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Poin</div>
                      <div className={`text-lg font-bold ${result.awarded > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {result.awarded > 0 ? `+${result.awarded}` : '+0'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-xs text-green-700">Total Poin Kamu</div>
                    <div className="text-2xl font-bold text-green-700">🎯 {result.points}</div>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    {result.awarded > 0
                      ? 'Poin hadiah diberikan sekali saat pertama kali menyelesaikan level ini.'
                      : result.completed
                      ? 'Kamu sudah menyelesaikan level ini sebelumnya — poin hadiah tidak diberikan ulang.'
                      : `Capai target ${level.targetScore} untuk mendapatkan hadiah poin.`}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={playAgain}
                      className="flex-1 eg-gradient-bg text-white"
                    >
                      <RotateCcw className="size-4" /> Main Lagi
                    </Button>
                    <Button
                      onClick={exitPlaying}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="size-4" /> Selesai
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!result && (
              <div className="absolute bottom-3 left-3 right-3 z-20 rounded-lg border border-yellow-300/30 bg-black/70 px-3 py-2 text-center text-xs text-yellow-100">
                Pengiriman skor dan hadiah poin sedang dinonaktifkan sampai verifikasi server tersedia.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  /* ---------- PRE-GAME / DEMO MODE ---------- */
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{game.title}</span>
            {!game.embedUrl && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Mode Demo
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {game.description || 'Mainkan game internal EarnGames dan kumpulkan poin.'}
          </DialogDescription>
        </DialogHeader>

        {/* Level selector */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="level-select">Pilih Level</Label>
            <Select value={levelId} onValueChange={setLevelId}>
              <SelectTrigger id="level-select" className="w-full">
                <SelectValue placeholder="Pilih level" />
              </SelectTrigger>
              <SelectContent>
                {activeLevels.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    Level {l.levelNumber} — {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Level info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoTile
            icon={<Trophy className="size-4" />}
            label="Kesulitan"
            value={DIFFICULTY_LABEL[level.difficulty] || level.difficulty}
            badgeClass={DIFFICULTY_BADGE[level.difficulty]}
          />
          <InfoTile
            icon={<Target className="size-4" />}
            label="Target Skor"
            value={String(level.targetScore)}
          />
          <InfoTile
            icon={<Award className="size-4" />}
            label="Hadiah Poin"
            value={`+${level.rewardPoints}`}
            badgeClass="bg-green-100 text-green-700 border-green-200"
          />
          <InfoTile
            icon={<Clock className="size-4" />}
            label="Batas Waktu"
            value={`${level.timeLimitSec}s`}
          />
        </div>

        {/* Game area */}
        {game.embedUrl ? (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="w-16 h-16 eg-gradient-bg rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                <Play className="size-8" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Siap Bermain?</h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Game akan dibuka dalam mode layar penuh. Permainan dapat dimainkan, tetapi hadiah poin sementara dinonaktifkan sampai hasil dapat diverifikasi oleh server.
              </p>
              <Button
                onClick={startPlaying}
                className="eg-gradient-bg text-white"
                size="lg"
              >
                <Play className="size-5" /> Mainkan Sekarang
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
              <Dices className="size-12 mx-auto text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">Game sedang disiapkan</h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Mode demo hanya untuk mencoba antarmuka. Skor acak tidak disimpan sebagai progres dan tidak menghasilkan hadiah poin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button onClick={rollDemo} disabled={rolling} className="eg-gradient-bg text-white">
                  {rolling ? <Loader2 className="size-4 animate-spin" /> : <Dices className="size-4" />}
                  {demoScore == null ? 'Main Demo' : 'Lempar Lagi'}
                </Button>
                {demoScore != null && (
                  <div className="bg-white px-4 py-2 rounded-full border border-green-200 shadow-sm">
                    <span className="text-xs text-muted-foreground mr-2">Skor Demo:</span>
                    <span className="text-lg font-bold text-green-700">{demoScore}</span>
                  </div>
                )}
              </div>
            </div>

            {demoScore != null && (
              <Button type="button" disabled className="w-full opacity-70">
                Hadiah poin sementara nonaktif
              </Button>
            )}

            {result && (
              <ResultPanel result={result} targetScore={level.targetScore} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---------- sub components ---------- */

function InfoTile({
  icon,
  label,
  value,
  badgeClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  badgeClass?: string
}) {
  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      {badgeClass ? (
        <Badge variant="outline" className={badgeClass}>
          {value}
        </Badge>
      ) : (
        <div className="font-semibold text-gray-900">{value}</div>
      )}
    </div>
  )
}

function ResultPanel({
  result,
  targetScore,
}: {
  result: SubmitProgressResult
  targetScore: number
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Timer className="size-4 text-green-600" />
        Hasil Permainan
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Skor Kamu</div>
          <div className="font-semibold text-gray-900">{result.progress.highScore}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Target</div>
          <div className="font-semibold text-gray-900">{targetScore}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <div className={`font-semibold ${result.completed ? 'text-green-700' : 'text-red-600'}`}>
            {result.completed ? 'Selesai' : 'Belum Tuntas'}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Poin Didapat</div>
          <div className={`font-semibold ${result.awarded > 0 ? 'text-green-700' : 'text-gray-900'}`}>
            +{result.awarded}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total Poin</div>
          <div className="font-semibold text-green-700">{result.points}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Percobaan</div>
          <div className="font-semibold text-gray-900">{result.progress.attempts}</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pt-1">
        {result.awarded > 0
          ? 'Poin hadiah diberikan sekali saat pertama kali menyelesaikan level ini.'
          : result.completed
          ? 'Kamu sudah menyelesaikan level ini sebelumnya — poin hadiah tidak diberikan ulang.'
          : 'Capai target skor untuk mendapatkan hadiah poin.'}
      </p>
    </div>
  )
}
