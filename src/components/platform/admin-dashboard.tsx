'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Award,
  Ban,
  Gamepad2,
  Gift,
  Loader2,
  ListOrdered,
  RefreshCw,
  Trophy,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getStats } from '@/lib/api-client'
import type { StatsResult } from '@/components/platform/types'

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

export function AdminDashboard() {
  const [stats, setStats] = useState<StatsResult | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const s = await getStats()
      setStats(s)
    } catch {
      toast.error('Gagal memuat statistik dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const statCards = stats
    ? [
        { label: 'Total Pemain', value: stats.totalUsers, icon: <Users className="size-5" />, color: 'from-green-500 to-emerald-600' },
        { label: 'Game Aktif', value: stats.activeGames, icon: <Gamepad2 className="size-5" />, color: 'from-emerald-500 to-teal-600' },
        { label: 'Total Level', value: stats.totalLevels, icon: <ListOrdered className="size-5" />, color: 'from-teal-500 to-green-600' },
        { label: 'Total Permainan', value: stats.totalPlays, icon: <Trophy className="size-5" />, color: 'from-green-600 to-lime-600' },
        { label: 'Poin Dibagikan', value: stats.totalPointsAwarded, icon: <Gift className="size-5" />, color: 'from-emerald-600 to-green-700' },
        { label: 'Akun Ditangguhkan', value: stats.suspendedUsers, icon: <Ban className="size-5" />, color: 'from-red-500 to-rose-600' },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
          <p className="text-sm text-gray-600">Ringkasan aktivitas platform EarnGames.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Muat Ulang
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : statCards.map((c) => (
              <Card key={c.label} className="border-gray-200 overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${c.color}`} />
                <CardContent className="pt-4">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-2`}>
                    {c.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{c.value}</div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent users + top players */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="size-4 text-green-600" /> Pemain Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : stats && stats.recentUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Poin</TableHead>
                    <TableHead>Bergabung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name || '(tanpa nama)'}
                        {u.status === 'SUSPENDED' && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">Ditangguhkan</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">{u.email}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">{u.points}</TableCell>
                      <TableCell className="text-xs text-gray-500">{formatDate(u.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">Belum ada pemain terdaftar.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="size-4 text-green-600" /> Papan Peringkat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : stats && stats.topPlayers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead className="text-right">Poin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topPlayers.map((u, i) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            i === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : i === 1
                              ? 'bg-gray-200 text-gray-700'
                              : i === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {i + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{u.name || '(tanpa nama)'}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-700">
                        🎯 {u.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">Belum ada pemain.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Memuat statistik...
        </div>
      )}
    </div>
  )
}
