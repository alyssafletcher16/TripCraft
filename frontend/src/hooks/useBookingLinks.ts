'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { buildBookingUrl } from '@/utils/bookingLinks'
import { trackBookingClick } from '@/utils/bookingTracking'
import type { Block } from '@/types'

interface UseBookingLinksOptions {
  block: Block
  destination: string
  tripId?: string
}

export function useBookingLinks({ block, destination, tripId }: UseBookingLinksOptions) {
  const { data: session } = useSession()

  const links = useMemo(() => {
    const type =
      block.type === 'STAY'      ? 'hotel'    :
      block.type === 'TRANSPORT' ? 'flight'   :
                                   'activity'
    return buildBookingUrl({
      type,
      title: block.title,
      operator: block.detail ?? undefined,
      destination,
      userId: session?.user?.id,
    })
  }, [block.type, block.title, block.detail, destination, session?.user?.id])

  function trackClick(platform: string, url: string) {
    trackBookingClick({
      activityTitle: block.title,
      platform,
      url,
      tripId,
      blockId: block.id,
      token: session?.accessToken,
    })
  }

  return { ...links, trackClick }
}
