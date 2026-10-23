'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronRight, Loader2, Lock, Mail, User as UserIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ApiError, login, register } from '@/lib/api-client'
import type { SafeUser } from '@/components/platform/types'

type Props = {
  open: boolean
  onClose: () => void
  onAuthed: (user: SafeUser) => void
}

export function AuthModal({ open, onClose, onAuthed }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  // login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  function resetForms() {
    setLoginEmail('')
    setLoginPassword('')
    setRegName('')
    setRegEmail('')
    setRegPassword('')
    setLoginError('')
    setRegError('')
  }

  function handleClose(open: boolean) {
    if (!open) {
      resetForms()
      onClose()
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const { user } = await login(loginEmail, loginPassword)
      toast.success(`Selamat datang, ${user.name || user.email}!`)
      onAuthed(user)
      resetForms()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.'
      setLoginError(msg)
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError('')
    if (regPassword.length < 12) {
      setRegError('Kata sandi minimal 12 karakter')
      return
    }
    setRegLoading(true)
    try {
      const { user } = await register(regName, regEmail, regPassword)
      toast.success('Pendaftaran berhasil! Selamat datang di EarnGames.')
      onAuthed(user)
      resetForms()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal mendaftar. Coba lagi.'
      setRegError(msg)
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#151b28] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-extrabold">
            Masuk ke <span className="eg-gold-text">EarnGames</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Masuk untuk bermain dan melihat progres akun. Akun baru mendapat bonus pendaftaran 100 poin; hadiah dari skor permainan sementara dinonaktifkan.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 bg-[#0e1320] border border-white/8 h-10">
            <TabsTrigger
              value="login"
              className="data-[state=active]:text-yellow-400 data-[state=active]:bg-[#1f2937] data-[state=active]:shadow-none text-gray-400 font-semibold"
            >
              Masuk
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:text-yellow-400 data-[state=active]:bg-[#1f2937] data-[state=active]:shadow-none text-gray-400 font-semibold"
            >
              Daftar
            </TabsTrigger>
          </TabsList>

          {/* ===== Login ===== */}
          <TabsContent value="login" className="mt-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-gray-300 text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    placeholder="kamu@earngames.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 h-[52px] bg-[#1f2937] border border-[#374151] text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-yellow-400/40 focus-visible:border-yellow-400/40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-gray-300 text-xs">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                  <Input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pl-10 h-[52px] bg-[#1f2937] border border-[#374151] text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-yellow-400/40 focus-visible:border-yellow-400/40"
                  />
                </div>
              </div>
              {loginError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-md">
                  {loginError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full eg-gradient-bg text-black hover:opacity-90 h-12 rounded-xl font-extrabold text-base"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Masuk <ChevronRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* ===== Register ===== */}
          <TabsContent value="register" className="mt-5">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-gray-300 text-xs">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                  <Input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Nama kamu"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                    className="pl-10 h-[52px] bg-[#1f2937] border border-[#374151] text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-yellow-400/40 focus-visible:border-yellow-400/40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-gray-300 text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="kamu@earngames.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 h-[52px] bg-[#1f2937] border border-[#374151] text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-yellow-400/40 focus-visible:border-yellow-400/40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-gray-300 text-xs">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Minimal 12 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pl-10 h-[52px] bg-[#1f2937] border border-[#374151] text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-yellow-400/40 focus-visible:border-yellow-400/40"
                  />
                </div>
              </div>
              {regError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-md">
                  {regError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full eg-gradient-bg text-black hover:opacity-90 h-12 rounded-xl font-extrabold text-base"
                disabled={regLoading}
              >
                {regLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Mendaftarkan...
                  </>
                ) : (
                  <>
                    Daftar Sekarang <ChevronRight className="size-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Dengan mendaftar, kamu mendapat bonus 100 poin pertama.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
