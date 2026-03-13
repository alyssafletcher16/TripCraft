'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSidebar } from './SidebarContext'
import type { Trip } from '@/types'

const SB_ITEM =
  'flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] transition-all duration-150 text-white/50 text-[13px] hover:bg-white/[0.06] hover:text-white/85'
const SB_ACTIVE = 'bg-terra/15 text-terra-lt ring-1 ring-inset ring-terra/20'
const SB_ICON = 'text-[15px] w-5 text-center flex-shrink-0'
const SB_SECTION = 'font-mono text-[9px] text-slate tracking-[2px] uppercase pt-[18px] px-[10px] pb-2'

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
    <aside className="bg-deep px-[18px] py-7 flex flex-col gap-1 border-r border-white/[0.06] h-full">
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
                <span className="block truncate text-[11px] text-white/30">{trip.destination}</span>
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

      {/* ── Sign in — unauthenticated mobile only ────────────────── */}
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
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar — collapsible */}
      {!hideDesktop && (
        <div className={`hidden md:flex relative transition-[width] duration-200 ${desktopCollapsed ? 'w-0' : 'w-[272px]'}`}>
          <div className={`w-[272px] overflow-hidden transition-opacity duration-200 ${desktopCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {sidebarContent}
          </div>
          {/* Collapse/expand arrow — always visible at the right boundary */}
          <button
            type="button"
            onClick={toggleDesktop}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-5 h-9 flex items-center justify-center bg-deep border border-white/10 rounded-full text-white/30 hover:text-white/70 hover:border-white/25 transition-colors text-[11px]"
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
