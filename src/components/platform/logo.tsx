'use client'

import { cn } from '@/lib/utils'

/** Reusable EarnGames logo — gold gradient square + cube SVG icon. */
export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="w-9 h-9 eg-gradient-bg rounded-lg flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
      </div>
      {withText && (
        <span className="text-lg font-extrabold text-white tracking-tight">
          <span aria-hidden="true">🎮 </span>EarnGames
        </span>
      )}
    </div>
  )
}
