// Affiliate partner IDs — set real values via environment variables (never commit .env.local)
export const AFFILIATES = {
  VIATOR_ID:        process.env.NEXT_PUBLIC_VIATOR_AFFILIATE_ID       ?? 'VIATOR_ID_HERE',
  GYG_ID:           process.env.NEXT_PUBLIC_GETYOURGUIDE_AFFILIATE_ID ?? 'GYG_ID_HERE',
  AWIN_ID:          process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID         ?? 'AWIN_ID_HERE',
  BOOKING_AWIN_MID: process.env.NEXT_PUBLIC_BOOKING_COM_AWIN_MID      ?? 'BOOKING_MID_HERE',
} as const
