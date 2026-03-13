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
export function Sidebar({ activeTab: _ }: { activeTab?: string } = {}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { isOpen, close, refreshKey } = useSidebar()
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

  const sidebarTrips = trips.filter((t) => t.status === 'PLANNING' || t.status === 'ACTIVE')
  const hasMore = trips.filter((t) => t.status !== 'PLANNING' && t.status !== 'ACTIVE').length > 0

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

      {/* ── Active Itineraries ──────────────────────────────────── */}
      <div className={SB_SECTION}>My Itineraries</div>

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

      {hasMore && (
        <Link
          href="/profile"
          onClick={close}
          className="flex items-center gap-[11px] px-3 py-[8px] rounded-[10px] text-white/30 text-[12px] hover:text-white/60 transition-colors"
        >
          <span className={`${SB_ICON} text-[12px] opacity-40`}>→</span>
          See all
        </Link>
      )}

      {/* ── Account ─────────────────────────────────────────────── */}
      <div className={SB_SECTION}>Account</div>

      <Link
        href="/profile"
        onClick={close}
        className={`${SB_ITEM} ${pathname.startsWith('/profile') ? SB_ACTIVE : ''}`}
      >
        <span className={SB_ICON}>◈</span>
        My Profile
      </Link>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar — always visible at md+ */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

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
