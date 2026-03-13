'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useSidebar } from './SidebarContext'

export function Navbar() {
  const { data: session } = useSession()
  const { toggle } = useSidebar()

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 md:px-12 h-[62px] bg-deep sticky top-0 z-[300] border-b border-gold/15">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile opens drawer, desktop collapses sidebar */}
        <button
          type="button"
          onClick={session ? toggle : toggle}
          className="md:hidden flex flex-col justify-center gap-[5px] w-11 h-11 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <span className="block w-full h-[1.5px] bg-white/70 rounded-full" />
          <span className="block w-full h-[1.5px] bg-white/70 rounded-full" />
          <span className="block w-5 h-[1.5px] bg-white/70 rounded-full" />
        </button>

        <Link href="/" className="font-serif text-[22px] font-black text-foam tracking-[-0.5px] flex items-center">
          trip<span className="text-terra italic">craft</span>
        </Link>
      </div>

      {/* Right: auth actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {session && (
          <Link
            href="/trips/new"
            className="rounded-full bg-terra hover:bg-terra-lt px-3 sm:px-4 h-9 flex items-center justify-center text-white text-sm font-semibold transition-colors shadow-md"
            title="New Trip"
          >
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ New Trip</span>
          </Link>
        )}
        {!session && (
          <>
            <Link href="/login" className="text-white/50 text-sm hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="bg-terra text-white px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all hover:bg-terra-lt">
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Get started</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
