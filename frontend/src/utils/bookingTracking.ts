import { api } from '@/lib/api'

interface TrackClickParams {
  activityTitle: string
  platform: string
  url: string
  tripId?: string
  blockId?: string
  token?: string
}

/**
 * Fire-and-forget booking click tracker.
 * Every outbound click is logged to the DB — this data is what we show
 * Viator/GYG when applying for API upgrade.
 */
export function trackBookingClick(params: TrackClickParams): void {
  const { token, ...data } = params
  if (!token) return
  api.bookingClicks.track(data, token).catch(() => {
    // Silently swallow — tracking must never block navigation
  })
}
