'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ListOrdered, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createLevel, deleteLevel, getGames, getLevels, updateLevel } from '@/lib/api-client'
import type { Game, GameLevel } from '@/components/platform/types'
import { ConfirmDialog } from '@/components/platform/confirm-dialog'

const DIFFICULTIES = [
  { value: 'EASY', label: 'Mudah', className: 'bg-green-100 text-green-700 border-0' },
  { value: 'MEDIUM', label: 'Sedang', className: 'bg-yellow-100 text-yellow-700 border-0' },
  { value: 'HARD', label: 'Sulit', className: 'bg-orange-100 text-orange-700 border-0' },
  { value: 'EXPERT', label: 'Ahli', className: 'bg-red-100 text-red-700 border-0' },
]

const LEVEL_STATUSES = [
  { value: 'ACTIVE', label: 'Aktif', className: 'bg-green-100 text-green-700 border-0' },
  { value: 'LOCKED', label: 'Terkunci', className: 'bg-gray-200 text-gray-700 border-0' },
]

const DIFFICULTY_LABEL: Record<string, string> = Object.fromEntries(
  DIFFICULTIES.map((d) => [d.value, d.label])
)
const DIFFICULTY_BADGE: Record<string, string> = Object.fromEntries(
  DIFFICULTIES.map((d) => [d.value, d.className])
)
const LEVEL_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  LEVEL_STATUSES.map((s) => [s.value, s.label])
)
const LEVEL_STATUS_BADGE: Record<string, string> = Object.fromEntries(
  LEVEL_STATUSES.map((s) => [s.value, s.className])
)

export function AdminLevels() {
  const [games, setGames] = useState<Game[]>([])
  const [levels, setLevels] = useState<GameLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [filterGameId, setFilterGameId] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editLevel, setEditLevel] = useState<GameLevel | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [g, l] = await Promise.all([getGames(), getLevels()])
      setGames(g.games)
      setLevels(l.levels)
    } catch {
      toast.error('Gagal memuat data level.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete() {
    if (!deleteId) return
    setActionLoading(true)
    try {
      await deleteLevel(deleteId)
      setLevels((prev) => prev.filter((l) => l.id !== deleteId))
      toast.success('Level dihapus.')
    } catch {
      toast.error('Gagal menghapus level.')
    } finally {
      setActionLoading(false)
      setDeleteId(null)
    }
  }

  const gameMap = useMemo(() => {
    const m: Record<string, Game> = {}
    games.forEach((g) => (m[g.id] = g))
    return m
  }, [games])

  const filtered = useMemo(() => {
    if (filterGameId === 'all') return levels
    return levels.filter((l) => l.gameId === filterGameId)
  }, [levels, filterGameId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Level</h2>
          <p className="text-sm text-gray-600">
            Kelola level per game: nomor, kesulitan, target skor, batas waktu, hadiah poin, dan status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Muat Ulang
          </Button>
          <Button className="eg-gradient-bg text-white" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Tambah Level
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-sm">Filter Game:</Label>
        <Select value={filterGameId} onValueChange={setFilterGameId}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Semua game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Game</SelectItem>
            {games.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-500">{filtered.length} level</span>
      </div>

      <Card className="border-gray-200">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <ListOrdered className="size-10 mx-auto mb-2 text-gray-300" />
            Belum ada level. Tambahkan level pertama.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>#</TableHead>
                <TableHead>Nama Level</TableHead>
                <TableHead>Kesulitan</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Waktu</TableHead>
                <TableHead className="text-right">Hadiah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-gray-900">
                    {l.game?.title || gameMap[l.gameId]?.title || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">L{l.levelNumber}</TableCell>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>
                    <Badge className={DIFFICULTY_BADGE[l.difficulty] || 'bg-gray-100'}>
                      {DIFFICULTY_LABEL[l.difficulty] || l.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{l.targetScore}</TableCell>
                  <TableCell className="text-right">{l.timeLimitSec}s</TableCell>
                  <TableCell className="text-right font-semibold text-green-700">+{l.rewardPoints}</TableCell>
                  <TableCell>
                    <Badge className={LEVEL_STATUS_BADGE[l.status] || 'bg-gray-100'}>
                      {LEVEL_STATUS_LABEL[l.status] || l.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => setEditLevel(l)} title="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(l.id)}
                        title="Hapus"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <LevelFormDialog
        open={createOpen}
        games={games}
        onOpenChange={setCreateOpen}
        onSaved={(l) => {
          setLevels((prev) => [l, ...prev.filter((x) => x.id !== l.id)])
          setCreateOpen(false)
        }}
      />
      <LevelFormDialog
        level={editLevel}
        open={!!editLevel}
        games={games}
        onOpenChange={(v) => !v && setEditLevel(null)}
        onSaved={(l) => {
          setLevels((prev) => prev.map((x) => (x.id === l.id ? l : x)))
          setEditLevel(null)
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Hapus Level?"
        description="Menghapus level juga akan menghapus progres pemain untuk level ini. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        onConfirm={handleDelete}
      />

      {actionLoading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin text-green-600" /> Memproses...
        </div>
      )}
    </div>
  )
}

/* -------------------- Level Form Dialog (Create + Edit) -------------------- */
function LevelFormDialog({
  level,
  games,
  open,
  onOpenChange,
  onSaved,
}: {
  level?: GameLevel | null
  games: Game[]
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: (l: GameLevel) => void
}) {
  const isEdit = !!level
  const [gameId, setGameId] = useState('')
  const [levelNumber, setLevelNumber] = useState('1')
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState('EASY')
  const [targetScore, setTargetScore] = useState('100')
  const [timeLimitSec, setTimeLimitSec] = useState('60')
  const [rewardPoints, setRewardPoints] = useState('10')
  const [status, setStatus] = useState('ACTIVE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setGameId(level?.gameId || games[0]?.id || '')
      setLevelNumber(String(level?.levelNumber ?? 1))
      setName(level?.name || '')
      setDifficulty(level?.difficulty || 'EASY')
      setTargetScore(String(level?.targetScore ?? 100))
      setTimeLimitSec(String(level?.timeLimitSec ?? 60))
      setRewardPoints(String(level?.rewardPoints ?? 10))
      setStatus(level?.status || 'ACTIVE')
      setError('')
    }
  }, [open, level, games])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!gameId) {
      setError('Pilih game terlebih dahulu')
      return
    }
    const num = Number(levelNumber)
    if (!Number.isFinite(num) || num < 1) {
      setError('Nomor level tidak valid')
      return
    }
    setLoading(true)
    try {
      const body: any = {
        gameId,
        levelNumber: num,
        name: name.trim() || undefined,
        difficulty,
        targetScore: Number(targetScore) || 0,
        timeLimitSec: Number(timeLimitSec) || 0,
        rewardPoints: Number(rewardPoints) || 0,
        status,
      }
      const { level: saved } = isEdit
        ? await updateLevel(level!.id, body)
        : await createLevel(body)
      toast.success(isEdit ? 'Level diperbarui.' : 'Level dibuat.')
      // include game relation for display
      const game = games.find((g) => g.id === saved.gameId)
      onSaved({ ...saved, game })
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan level.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Level' : 'Tambah Level Baru'}</DialogTitle>
          <DialogDescription>
            Atur kesulitan, target skor, batas waktu, dan hadiah poin untuk level ini.
          </DialogDescription>
        </DialogHeader>
        {games.length === 0 ? (
          <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md">
            Belum ada game. Tambahkan game terlebih dahulu sebelum membuat level.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Game</Label>
                <Select value={gameId} onValueChange={setGameId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Pilih game" /></SelectTrigger>
                  <SelectContent>
                    {games.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-num">Nomor Level</Label>
                <Input id="l-num" type="number" min={1} value={levelNumber} onChange={(e) => setLevelNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-name">Nama Level (opsional)</Label>
                <Input id="l-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Otomatis jika kosong" />
              </div>
              <div className="space-y-1.5">
                <Label>Kesulitan</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVEL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-target">Target Skor</Label>
                <Input id="l-target" type="number" min={0} value={targetScore} onChange={(e) => setTargetScore(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-time">Batas Waktu (detik)</Label>
                <Input id="l-time" type="number" min={1} value={timeLimitSec} onChange={(e) => setTimeLimitSec(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="l-reward">Hadiah Poin</Label>
                <Input id="l-reward" type="number" min={0} value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} />
                <p className="text-xs text-gray-500">Poin diberikan sekali saat pemain pertama kali mencapai target.</p>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={loading} className="eg-gradient-bg text-white">
                {loading ? <Loader2 className="size-4 animate-spin" /> : isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                {isEdit ? 'Simpan' : 'Buat Level'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
