'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { getMe, logout } from '@/lib/api-client'
import type { SafeUser, SubmitProgressResult } from '@/components/platform/types'
import { Nav } from '@/components/platform/nav'
import { Footer } from '@/components/platform/footer'
import { AuthModal } from '@/components/platform/auth-modal'
import { UserView } from '@/components/platform/user-view'
import { UserDashboard } from '@/components/platform/user-dashboard'
import { AdminPanel } from '@/components/platform/admin-panel'

export default function Page() {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [view, setView] = useState<'user' | 'admin'>('user')
  const [authOpen, setAuthOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // restore session on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { user } = await getMe()
        if (!mounted) return
        setUser(user)
        if (user?.role === 'ADMIN') {
          // admins land on user view by default; can switch
          setView('user')
        } else {
          setView('user')
        }
      } catch {
        // ignore — stay logged out
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleAuthed = useCallback((u: SafeUser) => {
    setUser(u)
    setAuthOpen(false)
    setView('user')
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch {
      // ignore network errors
    }
    setUser(null)
    setView('user')
    toast.success('Kamu telah keluar.')
  }, [])

  const handlePlayed = useCallback((result: SubmitProgressResult) => {
    setUser((prev) => (prev ? { ...prev, points: result.points } : prev))
  }, [])

  // admin view: hide footer (admin has its own chrome); bottom nav still useful
  const showFooter = view !== 'admin'

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white">
      <Nav
        user={user}
        view={view}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onSwitchView={setView}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center pt-16 pb-24">
          <div className="text-center">
            <div className="w-12 h-12 eg-gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg
                className="w-7 h-7 text-black"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
            </div>
            <p className="text-yellow-300 text-sm font-semibold">Memuat EarnGames...</p>
          </div>
        </div>
      ) : view === 'admin' && user?.role === 'ADMIN' ? (
        <AdminPanel />
      ) : user ? (
        <UserDashboard
          user={user}
          onOpenAuth={() => setAuthOpen(true)}
          onPointsChange={(p) => setUser((prev) => (prev ? { ...prev, points: p } : prev))}
        />
      ) : (
        <UserView user={user} onOpenAuth={() => setAuthOpen(true)} onPlayed={handlePlayed} />
      )}

      {showFooter && <Footer />}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={handleAuthed} />
    </div>
  )
}
