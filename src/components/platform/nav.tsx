'use client'

import { useEffect, useState } from 'react'
import {
  Gamepad2,
  Home,
  LogOut,
  ShieldCheck,
  Target,
  Trophy,
  User as UserIcon,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/platform/logo'
import type { SafeUser } from '@/components/platform/types'

type BottomTab = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  // anchor to scroll to OR an action key
  anchor?: string
  action?: 'auth' | 'profile' | 'wallet' | 'admin'
}

const BOTTOM_TABS: BottomTab[] = [
  { key: 'home', label: 'Beranda', icon: Home, anchor: '#beranda' },
  { key: 'games', label: 'Game', icon: Gamepad2, anchor: '#games' },
  { key: 'leaderboard', label: 'Cara Main', icon: Trophy, anchor: '#how' },
  { key: 'wallet', label: 'Dompet', icon: Wallet, action: 'wallet' },
  { key: 'profile', label: 'Profil', icon: UserIcon, action: 'profile' },
]

type Props = {
  user: SafeUser | null
  view: 'user' | 'admin'
  onOpenAuth: () => void
  onLogout: () => void
  onSwitchView: (v: 'user' | 'admin') => void
}

export function Nav({ user, view, onOpenAuth, onLogout, onSwitchView }: Props) {
  const [activeTab, setActiveTab] = useState<string>('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const tabForSection: Record<string, string> = {
      beranda: 'home',
      games: 'games',
      how: 'leaderboard',
      tips: 'leaderboard',
      faq: 'leaderboard',
      wallet: 'wallet',
      profile: 'profile',
      progress: 'leaderboard',
    }

    function onScroll() {
      setScrolled(window.scrollY > 8)

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(
          '#beranda, #games, #how, #tips, #faq, #profile, #wallet, #progress'
        )
      )
      const visibleSections = sections.filter(
        (section) => section.getBoundingClientRect().top <= 80
      )
      const currentSection = visibleSections[visibleSections.length - 1]
      const nextTab = currentSection ? tabForSection[currentSection.id] : 'home'
      if (nextTab) setActiveTab((current) => current === nextTab ? current : nextTab)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleTabClick(tab: BottomTab) {
    setActiveTab(tab.key)

    if (tab.anchor) {
      const el = document.querySelector(tab.anchor)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      // If this anchor is not part of the current view, continue to the action fallback.
    }

    if (!user) {
      onOpenAuth()
      return
    }

    if (tab.action === 'admin' && user.role === 'ADMIN') {
      onSwitchView(view === 'admin' ? 'user' : 'admin')
      return
    }

    if (view === 'admin' && (tab.key === 'leaderboard' || tab.action === 'profile' || tab.action === 'wallet')) {
      onSwitchView('user')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (tab.key === 'leaderboard' && user) {
      const progressSection = document.getElementById('progress')
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    const targetId = tab.action === 'wallet' ? 'wallet' : tab.action === 'profile' ? 'profile' : ''
    const target = targetId ? document.getElementById(targetId) : null
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ===== TOP HEADER (minimal) ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0B0F19]/85 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="#beranda" aria-label="EarnGames beranda" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]">
            <Logo />
          </a>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Points badge */}
                <span className="inline-flex items-center gap-1 bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Target className="size-3.5" />
                  {user.points}
                </span>

                {/* Admin toggle (compact pill) */}
                {user.role === 'ADMIN' && (
                  <Button
                    size="sm"
                    onClick={() => onSwitchView(view === 'admin' ? 'user' : 'admin')}
                    className={`h-8 px-3 text-xs font-semibold rounded-full ${
                      view === 'admin'
                        ? 'eg-gradient-bg text-black'
                        : 'bg-white/5 text-yellow-300 border border-yellow-400/30 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className="size-3.5" />
                    {view === 'admin' ? 'Halaman User' : 'Admin'}
                  </Button>
                )}

                {/* Notification bell with red dot */}
                <button
                  type="button"
                  aria-label="Keluar"
                  className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-yellow-300 transition-colors"
                  onClick={() => onLogout()}
                  title="Keluar dari akun"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <Button
                onClick={onOpenAuth}
                size="sm"
                className="eg-gradient-bg text-black hover:opacity-90 rounded-full h-9 px-5 font-bold text-sm"
              >
                Masuk
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ===== BOTTOM NAVIGATION (fixed) ===== */}
      <nav className="eg-bottom-nav" aria-label="Navigasi utama">
        <div className="flex items-stretch max-w-md mx-auto">
          {BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            const label = tab.key === 'leaderboard' && user && view !== 'admin' ? 'Progres' : tab.label
            return (
              <button
                key={tab.key}
                type="button"
                className="eg-bottom-nav-item"
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleTabClick(tab)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="eg-bottom-nav-icon" />
                <span className="leading-tight">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
