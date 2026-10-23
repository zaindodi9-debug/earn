'use client'

import { Mail, MapPin, Phone } from 'lucide-react'

const QUICK_LINKS = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#games', label: 'Game' },
  { href: '#how', label: 'Cara Main' },
  { href: '#faq', label: 'FAQ' },
]

const CATEGORIES = [
  { href: '#games', label: 'Arcade' },
  { href: '#games', label: 'Puzzle' },
  { href: '#games', label: 'Kartu' },
  { href: '#games', label: 'Olahraga' },
  { href: '#games', label: 'Strategi' },
]

export function Footer() {
  return (
    <footer className="mt-auto bg-[#0B0F19] text-gray-400 border-t border-white/5 pb-24 sm:pb-20">
      {/* pb-24 / pb-20 clears the fixed bottom nav */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 eg-gradient-bg rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white">
                <span aria-hidden="true">🎮 </span>EarnGames
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Platform game internal dengan sistem poin yang jujur dan transparan.
              Mainkan game, selesaikan level, dan kumpulkan poin.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.href + l.label}>
                  <a
                    href={l.href}
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kategori Game</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-yellow-400" />
                <span>halo@earngames.web.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-yellow-400" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-yellow-400 mt-0.5" />
                <span>earngames.web.id · Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EarnGames. Semua hak dilindungi. Platform game
          internal dengan sistem poin yang jujur.
        </div>
      </div>
    </footer>
  )
}
