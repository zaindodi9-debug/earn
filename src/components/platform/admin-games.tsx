'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Gamepad2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { createGame, deleteGame, getGames, updateGame } from '@/lib/api-client'
import type { Game } from '@/components/platform/types'
import { ConfirmDialog } from '@/components/platform/confirm-dialog'

const CATEGORIES = [
  { value: 'arcade', label: 'Arcade' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'card', label: 'Kartu' },
  { value: 'sports', label: 'Olahraga' },
  { value: 'strategy', label: 'Strategi' },
]

const STATUSES = [
  { value: 'DRAFT', label: 'Draf', className: 'bg-gray-100 text-gray-700 border-0' },
  { value: 'ACTIVE', label: 'Aktif', className: 'bg-green-100 text-green-700 border-0' },
  { value: 'HIDDEN', label: 'Disembunyikan', className: 'bg-yellow-100 text-yellow-700 border-0' },
]

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label])
)

const STATUS_BADGE: Record<string, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.className])
)

export function AdminGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editGame, setEditGame] = useState<Game | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { games } = await getGames()
      setGames(games)
    } catch {
      toast.error('Gagal memuat daftar game.')
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
      await deleteGame(deleteId)
      setGames((prev) => prev.filter((g) => g.id !== deleteId))
      toast.success('Game berhasil dihapus.')
    } catch {
      toast.error('Gagal menghapus game.')
    } finally {
      setActionLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Game</h2>
          <p className="text-sm text-gray-600">
            Kelola game internal: judul, kategori, embed URL, status, dan urutan tampil.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Muat Ulang
          </Button>
          <Button className="eg-gradient-bg text-white" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Tambah Game
          </Button>
        </div>
      </div>

      <Card className="border-gray-200">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Gamepad2 className="size-10 mx-auto mb-2 text-gray-300" />
            Belum ada game. Tambahkan game pertama kamu.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead>Embed</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.title}</TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">{g.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{CATEGORY_LABEL[g.category] || g.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[g.status] || 'bg-gray-100'}>
                      {STATUS_LABEL[g.status] || g.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{g.levels?.length || 0}</TableCell>
                  <TableCell>
                    {g.embedUrl ? (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle2 className="size-3" /> Ada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-700">Belum</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => setEditGame(g)} title="Edit">
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(g.id)}
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

      <GameFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(g) => {
          setGames((prev) => [g, ...prev.filter((x) => x.id !== g.id)])
          setCreateOpen(false)
        }}
      />
      <GameFormDialog
        game={editGame}
        open={!!editGame}
        onOpenChange={(v) => !v && setEditGame(null)}
        onSaved={(g) => {
          setGames((prev) => prev.map((x) => (x.id === g.id ? g : x)))
          setEditGame(null)
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Hapus Game?"
        description="Menghapus game juga akan menghapus semua level, progres pemain, dan riwayat poin terkait. Tindakan ini tidak dapat dibatalkan."
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

/* -------------------- Game Form Dialog (Create + Edit) -------------------- */
function GameFormDialog({
  game,
  open,
  onOpenChange,
  onSaved,
}: {
  game?: Game | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: (g: Game) => void
}) {
  const isEdit = !!game
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('arcade')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [sortOrder, setSortOrder] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(game?.title || '')
      setSlug(game?.slug || '')
      setDescription(game?.description || '')
      setCategory(game?.category || 'arcade')
      setThumbnailUrl(game?.thumbnailUrl || '')
      setEmbedUrl(game?.embedUrl || '')
      setStatus(game?.status || 'DRAFT')
      setSortOrder(String(game?.sortOrder ?? 0))
      setError('')
    }
  }, [open, game])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Judul wajib diisi')
      return
    }
    setLoading(true)
    try {
      const body: any = {
        title,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        category,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        embedUrl: embedUrl.trim() || undefined,
        status,
        sortOrder: Number(sortOrder) || 0,
      }
      const { game: saved } = isEdit
        ? await updateGame(game!.id, body)
        : await createGame(body)
      toast.success(isEdit ? 'Game diperbarui.' : 'Game dibuat.')
      onSaved(saved)
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan game.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Game' : 'Tambah Game Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui informasi game internal.' : 'Lengkapi data untuk membuat game baru.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="g-title">Judul Game</Label>
            <Input id="g-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-slug">Slug (opsional, otomatis dari judul jika kosong)</Label>
            <Input id="g-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ludo-sprint" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-desc">Deskripsi</Label>
            <Textarea id="g-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-thumb">URL Thumbnail (opsional)</Label>
            <Input id="g-thumb" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-embed">URL Embed Game (opsional)</Label>
            <Input id="g-embed" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://game-host/..." />
            <p className="text-xs text-gray-500">Jika kosong, game akan tampil dalam "Mode Demo" di sisi pemain.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-sort">Urutan Tampil</Label>
            <Input id="g-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={loading} className="eg-gradient-bg text-white">
              {loading ? <Loader2 className="size-4 animate-spin" /> : isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {isEdit ? 'Simpan' : 'Buat Game'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
