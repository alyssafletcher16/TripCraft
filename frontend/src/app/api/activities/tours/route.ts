import { NextRequest, NextResponse } from 'next/server'

const VIATOR_API_KEY = process.env.VIATOR_API_KEY ?? ''
const VIATOR_BASE = 'https://api.viator.com/partner'
const VIATOR_AFFILIATE_ID = process.env.NEXT_PUBLIC_VIATOR_AFFILIATE_ID ?? ''

function withAffiliateParams(url: string): string {
  try {
    const u = new URL(url)
    // Strip Viator's internal params that cause redirect to destination browse page
    u.searchParams.delete('mcid')
    u.searchParams.delete('medium')
    u.searchParams.delete('api_version')
    // Keep only our affiliate ID for commission tracking
    u.searchParams.set('pid', VIATOR_AFFILIATE_ID)
    return u.toString()
  } catch {
    return url
  }
}

const CACHE = new Map<string, { data: unknown; fetchedAt: number }>()
const TTL = 24 * 60 * 60 * 1000

function viatorHeaders(): Record<string, string> {
  return {
    'exp-api-key': VIATOR_API_KEY,
    'Accept-Language': 'en-US',
    Accept: 'application/json;version=2.0',
    'Content-Type': 'application/json',
  }
}

function formatDuration(dur?: { fixedDurationInMinutes?: number; variableDurationFromMinutes?: number }): string {
  const mins = dur?.fixedDurationInMinutes ?? dur?.variableDurationFromMinutes
  if (!mins) return 'Varies'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h} hour${h > 1 ? 's' : ''}`
}

function getBadge(flags: string[] = []): string | null {
  if (flags.includes('LIKELY_TO_SELL_OUT')) return 'Best Seller'
  if (flags.includes('PRIVATE_TOUR')) return 'Premium'
  if (flags.includes('NEW_ON_VIATOR')) return 'New'
  return null
}

export async function POST(req: NextRequest) {
  const { destination, activityName } = await req.json() as { destination?: string; activityName?: string }
  if (!destination || !activityName) {
    return NextResponse.json({ error: 'destination and activityName required' }, { status: 400 })
  }

  const key = `tours:${destination.toLowerCase()}:${activityName.toLowerCase()}`
  const cached = CACHE.get(key)
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return NextResponse.json({ tours: cached.data, cached: true })
  }

  try {
    const searchTerm = `${activityName} ${destination}`
    const viatorRes = await fetch(`${VIATOR_BASE}/search/freetext`, {
      method: 'POST',
      headers: viatorHeaders(),
      body: JSON.stringify({
        searchTerm,
        currency: 'USD',
        searchTypes: [{ searchType: 'PRODUCTS', pagination: { start: 1, count: 20 } }],
      }),
    })

    if (!viatorRes.ok) {
      const errText = await viatorRes.text()
      return NextResponse.json({ error: 'Viator API error', detail: errText }, { status: 502 })
    }

    type ViatorProduct = {
      productCode: string
      title: string
      description?: string
      pricing?: { summary?: { fromPrice?: number }; currency?: string }
      reviews?: { combinedAverageRating?: number; totalReviews?: number }
      duration?: { fixedDurationInMinutes?: number; variableDurationFromMinutes?: number }
      flags?: string[]
      productUrl?: string
      images?: Array<{ variants?: Array<{ width: number; url: string }> }>
    }

    const data = await viatorRes.json() as { products?: { totalCount: number; results: ViatorProduct[] } }
    const results = data.products?.results ?? []

    const tours = results.map((p, i) => {
      const flags = p.flags ?? []
      const coverImage = p.images?.[0]?.variants?.find(v => v.width >= 480)?.url ?? null
      const cancel = flags.includes('FREE_CANCELLATION') ? 'Free cancellation' : 'Non-refundable'
      const snippet = p.description ? `"${p.description.slice(0, 200).trimEnd()}…"` : ''

      return {
        id: i + 1,
        bookingCompany: 'Viator',
        provider: p.title,
        price: p.pricing?.summary?.fromPrice ?? 0,
        currency: p.pricing?.currency ?? 'USD',
        rating: Math.round((p.reviews?.combinedAverageRating ?? 0) * 10) / 10,
        reviewCount: p.reviews?.totalReviews ?? 0,
        duration: formatDuration(p.duration),
        badge: getBadge(flags),
        groupSize: 'Varies',
        pickup: false,
        pickupDetails: '',
        cancel,
        tags: [],
        snippet,
        itinerary: [],
        reviews: [],
        bookingUrl: p.productUrl ? withAffiliateParams(p.productUrl) : null,
        image: coverImage,
      }
    })

    CACHE.set(key, { data: tours, fetchedAt: Date.now() })
    return NextResponse.json({ tours, totalCount: data.products?.totalCount ?? tours.length, cached: false })
  } catch (err) {
    console.error('[api/activities/tours]', err)
    return NextResponse.json({ error: 'Failed to fetch tours', detail: String(err) }, { status: 500 })
  }
}
