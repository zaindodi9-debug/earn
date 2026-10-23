'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users as UsersIcon,
} from 'lucide-react'

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
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '@/lib/api-client'
import type { SafeUser, UserWithRelations } from '@/components/platform/types'
import { ConfirmDialog } from '@/components/platform/confirm-dialog'

function formatDate(s?: string) {
  if (!s) return '-'
  try {
    return new Date(s).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return s
  }
}

const REASON_LABEL: Record<string, string> = {
  SIGNUP_BONUS: 'Bonus Daftar',
  GAME_REWARD: 'Hadiah Game',
  ADMIN_ADJUST: 'Penyesuaian Admin',
}

export function AdminUsers() {
  const [users, setUsers] = useState<SafeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<SafeUser | null>(null)
  const [detailUser, setDetailUser] = useState<UserWithRelations | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { users } = await getUsers()
      setUsers(users)
    } catch {
      toast.error('Gagal memuat daftar pengguna.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function openDetail(u: SafeUser) {
    setEditUser(null)
    setDetailLoading(true)
    try {
      const { user } = await getUser(u.id)
      setDetailUser(user)
    } catch {
      toast.error('Gagal memuat detail pengguna.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleToggleStatus(u: SafeUser) {
    setActionLoading(true)
    try {
      const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      const { user } = await updateUser(u.id, { status: next })
      setUsers((prev) => prev.map((x) => (x.id === user.id ? user : x)))
      toast.success(`Pengguna ${next === 'SUSPENDED' ? 'ditangguhkan' : 'diaktifkan'}.`)
    } catch (e) {
      toast.error('Gagal mengubah status pengguna.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setActionLoading(true)
    try {
      await deleteUser(deleteId)
      setUsers((prev) => prev.filter((x) => x.id !== deleteId))
      toast.success('Pengguna dihapus.')
    } catch (e) {
      toast.error('Gagal menghapus pengguna.')
    } finally {
      setActionLoading(false)
      setDeleteId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
    )
  }, [users, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-600">
            Kelola akun pemain & admin, ubah peran, status, dan poin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>
          <Button className="eg-gradient-bg text-white" onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-4" /> Tambah Pengguna
          </Button>
        </div>
      </div>

      <Input
        placeholder="Cari nama atau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card className="border-gray-200">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                    <UsersIcon className="size-8 mx-auto mb-2 text-gray-300" />
                    Tidak ada pengguna ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || '(tanpa nama)'}</TableCell>
                    <TableCell className="text-xs text-gray-600">{u.email}</TableCell>
                    <TableCell>
                      {u.role === 'ADMIN' ? (
                        <Badge className="bg-green-100 text-green-700 border-0">Admin</Badge>
                      ) : (
                        <Badge variant="outline">Pemain</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.status === 'ACTIVE' ? (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          <CheckCircle2 className="size-3" /> Aktif
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Ditangguhkan</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700">{u.points}</TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(u.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => openDetail(u)} title="Detail">
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditUser(u)}
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading}
                          title={u.status === 'ACTIVE' ? 'Tangguhkan' : 'Aktifkan'}
                        >
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {u.status === 'ACTIVE' ? 'Tangguhkan' : 'Aktifkan'}
                          </Badge>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(u.id)}
                          title="Hapus"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create dialog */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(u) => {
          setUsers((prev) => [u, ...prev])
          setCreateOpen(false)
        }}
      />

      {/* Edit dialog */}
      <EditUserDialog
        user={editUser}
        onOpenChange={(v) => !v && setEditUser(null)}
        onSaved={(u) => {
          setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)))
          setEditUser(null)
        }}
      />

      {/* Detail dialog */}
      <Dialog open={!!detailUser || detailLoading} onOpenChange={(v) => !v && setDetailUser(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengguna</DialogTitle>
            <DialogDescription>
              {detailUser ? `${detailUser.email}` : 'Memuat...'}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-2 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : detailUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Nama" value={detailUser.name || '-'} />
                <Stat label="Poin" value={String(detailUser.points)} highlight />
                <Stat label="Peran" value={detailUser.role === 'ADMIN' ? 'Admin' : 'Pemain'} />
                <Stat label="Status" value={detailUser.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'} />
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 text-gray-900">Progres Level</h4>
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {detailUser.progress && detailUser.progress.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Level</TableHead>
                          <TableHead className="text-right">Skor</TableHead>
                          <TableHead className="text-right">Percobaan</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailUser.progress.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs">
                              {p.gameLevel?.game?.title} — L{p.gameLevel?.levelNumber}
                            </TableCell>
                            <TableCell className="text-right">{p.highScore}</TableCell>
                            <TableCell className="text-right">{p.attempts}</TableCell>
                            <TableCell>
                              {p.completed ? (
                                <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Selesai</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">Belum</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 p-3 text-center">Belum ada progres.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 text-gray-900">Riwayat Poin (50 terakhir)</h4>
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {detailUser.pointsLedger && detailUser.pointsLedger.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Alasan</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailUser.pointsLedger.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="text-xs text-gray-500">{formatDate(l.createdAt)}</TableCell>
                            <TableCell className="text-xs">
                              {REASON_LABEL[l.reason] || l.reason}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${l.amount >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                              {l.amount >= 0 ? `+${l.amount}` : l.amount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-500 p-3 text-center">Belum ada riwayat poin.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Hapus Pengguna?"
        description="Tindakan ini tidak dapat dibatalkan. Semua progres dan riwayat poin pengguna akan dihapus."
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border rounded-md p-2 bg-muted/30">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}

/* -------------------- Create User Dialog -------------------- */
function CreateUserDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (u: SafeUser) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER')
  const [points, setPoints] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setName('')
    setEmail('')
    setPassword('')
    setRole('USER')
    setPoints('0')
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 12) {
      setError('Kata sandi minimal 12 karakter')
      return
    }
    setLoading(true)
    try {
      const { user } = await createUser({
        name,
        email,
        password,
        role,
        points: Number(points) || 0,
      })
      toast.success('Pengguna berhasil dibuat.')
      onCreated(user)
      reset()
    } catch (e: any) {
      setError(e.message || 'Gagal membuat pengguna.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>Buat akun baru sebagai admin atau pemain.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cu-name">Nama</Label>
            <Input id="cu-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cu-email">Email</Label>
            <Input id="cu-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@earngames.id" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cu-password">Kata Sandi</Label>
            <Input id="cu-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 12 karakter" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Peran</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'USER' | 'ADMIN')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Pemain</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-points">Poin Awal</Label>
              <Input id="cu-points" type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={loading} className="eg-gradient-bg text-white">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Buat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------- Edit User Dialog -------------------- */
function EditUserDialog({
  user,
  onOpenChange,
  onSaved,
}: {
  user: SafeUser | null
  onOpenChange: (v: boolean) => void
  onSaved: (u: SafeUser) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER')
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE')
  const [password, setPassword] = useState('')
  const [pointsDelta, setPointsDelta] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email)
      setRole(user.role === 'ADMIN' ? 'ADMIN' : 'USER')
      setStatus(user.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE')
      setPassword('')
      setPointsDelta('0')
      setError('')
    }
  }, [user])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)
    try {
      const body: any = { name, email, role, status }
      if (password) {
        if (password.length < 12) {
          setError('Kata sandi minimal 12 karakter')
          setLoading(false)
          return
        }
        body.password = password
      }
      const delta = Number(pointsDelta)
      if (Number.isFinite(delta) && delta !== 0) body.pointsDelta = delta
      const { user: updated } = await updateUser(user.id, body)
      toast.success('Pengguna berhasil diperbarui.')
      onSaved(updated)
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui pengguna.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Peran</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'USER' | 'ADMIN')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Pemain</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'ACTIVE' | 'SUSPENDED')}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reset Kata Sandi (kosongkan jika tidak diubah)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>Penyesuaian Poin (+/-)</Label>
            <Input type="number" value={pointsDelta} onChange={(e) => setPointsDelta(e.target.value)} placeholder="0" />
            <p className="text-xs text-gray-500">Poin saat ini: {user?.points ?? 0}</p>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={loading} className="eg-gradient-bg text-white">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
