'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { Trip } from '@/types'

// ── CSS class equivalents ────────────────────────────────────────────────────
// .sidebar       → bg-deep px-[18px] py-7 flex flex-col gap-1 border-r border-white/[0.06]
// .sb-section    → font-mono text-[9px] text-slate tracking-[2px] uppercase pt-[18px] px-[10px] pb-2
// .sb-item       → flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] duration-150 text-white/50 text-[13px]
// .sb-item:hover → hover:bg-white/[0.06] hover:text-white/85
// .sb-item.active→ bg-terra/15 text-terra-lt ring-1 ring-inset ring-terra/20
// .sb-icon       → text-[15px] w-5 text-center flex-shrink-0

const SB_ITEM =
  'flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] transition-all duration-150 text-white/50 text-[13px] hover:bg-white/[0.06] hover:text-white/85'
const SB_ACTIVE = 'bg-terra/15 text-terra-lt ring-1 ring-inset ring-terra/20'
const SB_ICON = 'text-[15px] w-5 text-center flex-shrink-0'
const SB_SECTION = 'font-mono text-[9px] text-slate tracking-[2px] uppercase pt-[18px] px-[10px] pb-2'

// ── Past trips collapsible ───────────────────────────────────────────────────
function PastTripsToggle({ trips }: { trips: Trip[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (trips.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${SB_ITEM} justify-between w-full`}
      >
        <div className="flex items-center gap-[11px]">
          <span className={`${SB_ICON} opacity-50`}>🗂</span>
          <span>Past trips</span>
          <span className="text-[9px] bg-white/10 rounded-full px-[7px] py-px text-white/50">
            {trips.length}
          </span>
        </div>
        <span
          className="text-[11px] text-white/30 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="ml-3 border-l border-white/[0.08] pl-2 flex flex-col gap-0.5 mb-1">
          {trips.map((trip) => {
            const active = pathname === `/trips/${trip.id}`
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className={`flex items-center gap-[11px] px-[10px] py-2 rounded-[10px] transition-all duration-150 text-white/50 text-[12px] hover:bg-white/[0.06] hover:text-white/85 ${active ? SB_ACTIVE : ''}`}
              >
                <span className="text-[14px] w-5 text-center flex-shrink-0">
                  {trip.coverEmoji || '◻'}
                </span>
                <span className="flex-1 truncate">{trip.title}</span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({ activeTab: _ }: { activeTab?: string } = {}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    if (!session?.accessToken) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/trips`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [session?.accessToken])

  const activeTrips    = trips.filter((t) => t.status === 'ACTIVE' || t.status === 'PLANNING')
  const draftTrips     = trips.filter((t) => t.status === 'DRAFT')
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED')
  const hasTrips       = trips.length > 0

  return (
    // .sidebar
    <aside className="bg-deep px-[18px] py-7 flex flex-col gap-1 border-r border-white/[0.06]">

      {/* ── Discover ────────────────────────────────────────────── */}
      <Link
        href="/discover"
        className={`${SB_ITEM} ${pathname.startsWith('/discover') ? SB_ACTIVE : ''}`}
      >
        <span className={SB_ICON}>◎</span>
        Discover
      </Link>

      {/* ── My Itineraries ──────────────────────────────────────── */}
      {/* .sb-section */}
      <div className={SB_SECTION}>My Itineraries</div>

      {/* Active / Planning trips */}
      {activeTrips.map((trip) => {
        const active = pathname === `/trips/${trip.id}`
        return (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className={`${SB_ITEM} ${active ? SB_ACTIVE : ''}`}
          >
            <span className={SB_ICON}>{trip.coverEmoji || '◻'}</span>
            <span className="flex-1 truncate">{trip.title}</span>
            {/* gold "active" label — matches prototype style exactly */}
            <span className="ml-auto text-[10px] text-gold flex-shrink-0">
              {trip.status === 'ACTIVE' ? 'active' : 'planning'}
            </span>
          </Link>
        )
      })}

      {/* Draft trips */}
      {draftTrips.map((trip) => {
        const active = pathname === `/trips/${trip.id}`
        return (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className={`${SB_ITEM} ${active ? SB_ACTIVE : ''}`}
          >
            <span className={SB_ICON}>{trip.coverEmoji || '◻'}</span>
            <span className="flex-1 truncate">{trip.title}</span>
            <span className="text-[10px] opacity-40 flex-shrink-0">draft</span>
          </Link>
        )
      })}

      {/* Empty state — show New Trip prompt */}
      {!hasTrips && status !== 'loading' && session && (
        <Link href="/trips/new" className={SB_ITEM}>
          <span className={`${SB_ICON} opacity-40`}>+</span>
          <span className="opacity-40">Start a trip</span>
        </Link>
      )}

      {/* Past trips — collapsible */}
      <PastTripsToggle trips={completedTrips} />

      {/* ── Account ─────────────────────────────────────────────── */}
      <div className={SB_SECTION}>Account</div>

      <Link
        href="/profile"
        className={`${SB_ITEM} ${pathname.startsWith('/profile') ? SB_ACTIVE : ''}`}
      >
        <span className={SB_ICON}>◈</span>
        My Profile
      </Link>
    </aside>
  )
}
