'use client'

import { useBookingLinks } from '@/hooks/useBookingLinks'
import type { Block } from '@/types'

interface BookingCTAProps {
  block: Block
  destination: string
  tripId?: string
}

export function BookingCTA({ block, destination, tripId }: BookingCTAProps) {
  const { gygUrl, viatorUrl, bookingUrl, trackClick } = useBookingLinks({ block, destination, tripId })

  const showActivity = block.type === 'ACTIVITY' && (gygUrl || viatorUrl)
  const showHotel    = block.type === 'STAY'     && bookingUrl

  if (!showActivity && !showHotel) return null

  return (
    <div className="flex flex-col gap-1.5 pt-2 mt-2 border-t border-mist/60">
      {/* "Prices from" badge when numeric price is available */}
      {block.priceValue != null && block.price && (
        <span className="text-[10px] font-mono text-slate">Prices from {block.price}</span>
      )}

      <div className="flex gap-2">
        {showActivity && (
          <>
            {gygUrl && (
              <a
                href={gygUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('getyourguide', gygUrl)}
                className="flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold text-center text-white transition-colors"
                style={{ background: '#FF5533' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e64d2e')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#FF5533')}
              >
                GetYourGuide ↗
              </a>
            )}
            {viatorUrl && (
              <a
                href={viatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('viator', viatorUrl)}
                className="flex-1 py-2 px-3 bg-ocean hover:bg-tide rounded-lg text-[11px] font-semibold text-center text-white transition-colors"
              >
                Viator ↗
              </a>
            )}
          </>
        )}

        {showHotel && (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('booking', bookingUrl)}
            className="flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold text-center text-white transition-colors"
            style={{ background: '#003580' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#002868')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#003580')}
          >
            Booking.com ↗
          </a>
        )}
      </div>
    </div>
  )
}
