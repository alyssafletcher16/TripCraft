import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
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

export function TripCard({ id, title, destination, status, coverEmoji, startDate, endDate, travelers }: TripCardProps) {
  return (
    <Link href={`/trips/${id}`} className="block">
      <div className="bg-white rounded-2xl border-[1.5px] border-mist p-6 hover:border-terra/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl">{coverEmoji ?? '✈'}</div>
          <Badge variant={statusVariant[status]}>{status.toLowerCase()}</Badge>
        </div>

        <h3 className="font-serif text-xl font-bold text-ink mb-0.5">{title}</h3>
        <p className="text-slate text-sm mb-4">{destination}</p>

        <div className="flex items-center gap-4 text-[11px] text-slate font-mono uppercase tracking-wide">
          {startDate && (
            <span>
              {startDate}{endDate ? ` → ${endDate}` : ''}
            </span>
          )}
          {travelers && travelers > 1 && <span>{travelers} travelers</span>}
        </div>
      </div>
    </Link>
  )
}
