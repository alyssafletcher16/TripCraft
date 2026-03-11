'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const NAV_LINKS = [
  { href: '/trips',    label: 'My Trips' },
  { href: '/discover', label: 'Discover' },
  { href: '/profile',  label: 'Profile'  },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="flex items-center justify-between px-12 h-[62px] bg-deep sticky top-0 z-[300] border-b border-gold/15">
      <Link href="/" className="font-serif text-[22px] font-black text-foam tracking-[-0.5px] flex items-center">
        trip<span className="text-terra italic">craft</span>
      </Link>

      <div className="flex gap-1">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname.startsWith(href) ? 'nav-link-active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {session && (
          <Link
            href="/trips/new"
            className="rounded-full bg-terra hover:bg-terra-lt px-4 h-9 flex items-center justify-center text-white text-sm font-semibold transition-colors shadow-md"
            title="New Trip"
          >
            + New Trip
          </Link>
        )}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-white/50 text-sm hover:text-white transition-colors"
          >
            Sign out
          </button>
        ) : (
          <>
            <Link href="/login" className="text-white/50 text-sm hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="bg-terra text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:bg-terra-lt">
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
