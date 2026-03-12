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
}

const statusVariant: Record<TripStatus, 'gold' | 'green' | 'slate' | 'ocean'> = {
  ACTIVE:    'gold',
  COMPLETED: 'green',
  PLANNING:  'ocean',
  DRAFT:     'slate',
}

export function TripCard({ id, title, destination, status, startDate, endDate, travelers }: TripCardProps) {
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
        </div>
      </div>
    </Link>
  )
}
