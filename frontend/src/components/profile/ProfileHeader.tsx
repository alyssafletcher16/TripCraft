'use client'

import { useSession } from 'next-auth/react'

export function ProfileHeader() {
  const { data: session } = useSession()

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="bg-deep px-12 py-14 relative overflow-hidden">
      {/* Map placeholder background */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-ocean to-deep" />

      <div className="relative z-10 flex items-center gap-7">
        <div className="w-20 h-20 rounded-full bg-terra/20 border-2 border-terra/30 flex items-center justify-center text-2xl font-serif font-bold text-terra-lt">
          {initials}
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">
            {session?.user?.name ?? 'Traveler'}
          </h1>
          <p className="text-slate text-sm">{session?.user?.email}</p>
        </div>
      </div>

      <div className="relative z-10 flex gap-8 mt-10">
        {[
          { n: '0', l: 'Trips completed' },
          { n: '0', l: 'Countries visited' },
          { n: '0', l: 'Days traveled' },
        ].map((s, i) => (
          <div key={i}>
            <div className="font-serif text-2xl font-bold text-gold">{s.n}</div>
            <div className="text-[11px] text-slate mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
