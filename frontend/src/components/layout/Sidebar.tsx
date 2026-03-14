'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useSidebar } from './SidebarContext'
import type { Trip } from '@/types'

const SB_ITEM =
  'flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] transition-all duration-150 text-white/70 text-[15px] hover:bg-white/10 hover:text-white'
const SB_ACTIVE = 'bg-white/15 text-white ring-1 ring-inset ring-white/25'
const SB_ICON = 'text-[17px] w-5 text-center flex-shrink-0'
const SB_SECTION = 'font-mono text-[11px] text-white/40 tracking-[2px] uppercase pt-[18px] px-[10px] pb-2'

// ── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({ activeTab: _, hideDesktop }: { activeTab?: string; hideDesktop?: boolean } = {}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { isOpen, close, desktopCollapsed, toggleDesktop, refreshKey } = useSidebar()
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    if (!session?.accessToken) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/trips`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [session?.accessToken, refreshKey])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    close()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarTrips = trips
    .filter((t) => t.status === 'PLANNING' || t.status === 'ACTIVE')
    .sort((a, b) => {
      if (!a.startDate && !b.startDate) return 0
      if (!a.startDate) return 1
      if (!b.startDate) return -1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

  const sidebarContent = (
    <aside className="bg-terra px-[18px] py-7 flex flex-col gap-1 border-r border-white/[0.12] h-full overflow-y-auto">
      {/* Close button — mobile only */}
      <button
        type="button"
        onClick={close}
        className="md:hidden self-end mb-2 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
        aria-label="Close menu"
      >
        ✕
      </button>

      {/* ── Discover ────────────────────────────────────────────── */}
      <Link
        href="/discover"
        onClick={close}
        className={`${SB_ITEM} ${pathname.startsWith('/discover') ? SB_ACTIVE : ''}`}
      >
        <span className={SB_ICON}>◎</span>
        Discover
      </Link>

      {/* ── My Profile ──────────────────────────────────────────── */}
      <Link
        href="/profile"
        onClick={close}
        className={`${SB_ITEM} ${pathname.startsWith('/profile') ? SB_ACTIVE : ''}`}
      >
        <span className={SB_ICON}>◈</span>
        My Profile
      </Link>

      {/* ── Active Itineraries ──────────────────────────────────── */}
      <div className={SB_SECTION}>Active Itineraries</div>

      {sidebarTrips.map((trip) => {
        const active = pathname === `/trips/${trip.id}`
        return (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            onClick={close}
            className={`${SB_ITEM} ${active ? SB_ACTIVE : ''}`}
          >
            {trip.coverEmoji && (
              <span className={SB_ICON}>{trip.coverEmoji}</span>
            )}
            <span className="flex-1 min-w-0">
              <span className="block truncate">{trip.title}</span>
              {trip.destination && (
                <span className="block truncate text-[13px] text-white/50">{trip.destination}</span>
              )}
            </span>
          </Link>
        )
      })}

      {trips.length === 0 && status !== 'loading' && session && (
        <Link href="/trips/new" onClick={close} className={SB_ITEM}>
          <span className={`${SB_ICON} opacity-40`}>+</span>
          <span className="opacity-40">Start a trip</span>
        </Link>
      )}

      {/* ── Sign in — unauthenticated ────────────────────────────── */}
      {!session && status !== 'loading' && (
        <>
          <div className={SB_SECTION}>Account</div>
          <Link href="/login" onClick={close} className={SB_ITEM}>
            <span className={SB_ICON}>→</span>
            Sign in
          </Link>
          <Link href="/register" onClick={close} className={`${SB_ITEM} !text-terra-lt`}>
            <span className={SB_ICON}>+</span>
            Get started
          </Link>
        </>
      )}

      {/* ── Sign out — authenticated ─────────────────────────────── */}
      {session && (
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`${SB_ITEM} w-full text-left`}
          >
            <span className={SB_ICON}>←</span>
            Sign out
          </button>
        </div>
      )}
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar — collapsible */}
      {!hideDesktop && (
        <div className={`hidden md:flex relative transition-[width] duration-200 bg-terra sticky top-[62px] h-[calc(100vh-62px)] z-10 ${desktopCollapsed ? 'w-5' : 'w-[272px]'}`}>
          <div className={`w-[272px] overflow-hidden transition-opacity duration-200 ${desktopCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {sidebarContent}
          </div>
          {/* Collapse/expand arrow — pinned near top at boundary */}
          <button
            type="button"
            onClick={toggleDesktop}
            className="absolute right-0 top-8 translate-x-1/2 z-20 w-9 h-9 flex items-center justify-center bg-terra-lt border border-white/30 rounded-full text-white hover:bg-white hover:text-terra transition-all duration-150 text-xl shadow-md"
            aria-label="Toggle sidebar"
          >
            {desktopCollapsed ? '›' : '‹'}
          </button>
        </div>
      )}

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[400] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          {/* Drawer panel */}
          <div className="relative z-10 w-[272px] max-w-[85vw] overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
