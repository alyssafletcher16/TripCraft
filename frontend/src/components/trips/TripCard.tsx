'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { useCityPhoto } from '@/hooks/useCityPhoto'
import type { TripStatus } from '@/types'

interface TripCardProps {
  id: string
  title: string
  destination: string
  status: TripStatus
  coverEmoji?: string | null
  startDate?: string | null
  endDate?: string | null
  travelers?: number
  upvotes?: number
  isPublic?: boolean
  rank?: number | null
  onTogglePublic?: (id: string, newVal: boolean) => void
  onStatusChange?: (id: string, status: TripStatus) => void
  onRank?: (id: string, rank: number | null) => void
}

const statusVariant: Record<TripStatus, 'gold' | 'green' | 'slate' | 'ocean'> = {
  ACTIVE:    'gold',
  COMPLETED: 'green',
  PLANNING:  'ocean',
  DRAFT:     'slate',
}

const STATUS_LABELS: Record<TripStatus, string> = {
  PLANNING:  'Planning',
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
  DRAFT:     'Draft',
}

export function TripCard({ id, title, destination, status, startDate, endDate, travelers, isPublic, rank, onTogglePublic, onStatusChange, onRank }: TripCardProps) {
  const photoUrl = useCityPhoto(destination)

  return (
    <Link href={`/trips/${id}`} className="block">
      <div className="bg-white rounded-2xl border-[1.5px] border-mist overflow-hidden hover:border-terra/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
        {/* Cover photo */}
        <div className="relative h-36 bg-foam overflow-hidden">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={destination}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge variant={statusVariant[status]}>{status.toLowerCase()}</Badge>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-serif text-xl font-bold text-ink mb-0.5">{title}</h3>
          <p className="text-slate text-sm mb-3">{destination}</p>

          <div className="flex items-center gap-4 text-[11px] text-slate font-mono uppercase tracking-wide">
            {startDate && (
              <span>
                {startDate}{endDate ? ` → ${endDate}` : ''}
              </span>
            )}
            {travelers && travelers > 1 && <span>{travelers} travelers</span>}
          </div>

          {(onRank !== undefined || onStatusChange !== undefined || onTogglePublic !== undefined) && (
            <div className="mt-4 pt-3.5 border-t border-mist space-y-3">
              {onRank !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate font-mono uppercase tracking-wide">My rating</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => { e.preventDefault(); onRank(id, rank === star ? null : star) }}
                        className="text-base leading-none transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <span style={{ color: rank != null && star <= rank ? '#C4603A' : '#D6E4EE' }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {onStatusChange !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate font-mono uppercase tracking-wide">Status</span>
                  <select
                    value={status}
                    onClick={(e) => e.preventDefault()}
                    onChange={(e) => { e.preventDefault(); onStatusChange(id, e.target.value as TripStatus) }}
                    className="text-[11px] font-mono border border-mist rounded-full px-2.5 py-1 bg-white text-ink focus:outline-none focus:border-ocean cursor-pointer"
                  >
                    {(['PLANNING', 'ACTIVE', 'COMPLETED', 'DRAFT'] as TripStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              )}
              {onTogglePublic !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate font-mono uppercase tracking-wide">Share to community</span>
                  <button
                    onClick={(e) => { e.preventDefault(); onTogglePublic(id, !isPublic) }}
                    className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                    style={{ background: isPublic ? '#C4603A' : '#D6E4EE' }}
                    aria-pressed={isPublic}
                  >
                    <span
                      className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                      style={{ transform: isPublic ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
