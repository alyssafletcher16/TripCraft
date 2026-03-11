import { AFFILIATES } from '@/config/affiliates'

export type BookingLinkParams = {
  type: 'activity' | 'hotel' | 'flight'
  title: string
  operator?: string
  destination: string
  date?: string
  userId?: string
}

export type BookingLinks = {
  gygUrl?: string
  viatorUrl?: string
  bookingUrl?: string
}

export function buildBookingUrl(params: BookingLinkParams): BookingLinks {
  const { type, title, operator, destination, userId } = params

  if (type === 'activity') {
    // Include operator so search lands on (or very near) the specific provider
    const query = [operator, title, destination].filter(Boolean).join(' ')
    const gygUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${AFFILIATES.GYG_ID}&utm_medium=partner&utm_source=tripcraft`
    const viatorUrl = `https://www.viator.com/search/${encodeURIComponent(query)}?pid=${AFFILIATES.VIATOR_ID}&mcid=42383&medium=api&campaign=tripcraft`
    return { gygUrl, viatorUrl }
  }

  if (type === 'hotel') {
    const bookingDotComUrl = `https://www.booking.com/search.html?ss=${encodeURIComponent(destination)}`
    const bookingUrl = `https://www.awin1.com/cread.php?awinmid=${AFFILIATES.BOOKING_AWIN_MID}&awinaffid=${AFFILIATES.AWIN_ID}&clickref=${encodeURIComponent(userId ?? '')}&p=${encodeURIComponent(bookingDotComUrl)}`
    return { bookingUrl }
  }

  return {}
}
