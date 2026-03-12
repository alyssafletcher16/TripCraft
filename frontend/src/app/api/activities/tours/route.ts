import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VIATOR_API_KEY = process.env.VIATOR_API_KEY ?? ''
const VIATOR_BASE = 'https://api.viator.com/partner'

function cleanProductUrl(url: string): string {
  try {
    const u = new URL(url)
    // Remove all query params — Viator redirects to browse page when pid is present
    return u.origin + u.pathname
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

async function generateGYGTours(activityName: string, destination: string, startId: number) {
  const prompt = `You are a travel booking expert. Generate 6 realistic GetYourGuide tour listings for "${activityName}" in ${destination}.

Return ONLY a valid JSON array — no markdown, no extra text. Each item:
{"provider":"string","price":number,"currency":"USD","rating":number,"reviewCount":number,"duration":"string","badge":"Best Seller"|"Premium"|"Budget pick"|null,"groupSize":"string","pickup":boolean,"pickupDetails":"string","cancel":"Free cancellation"|"Non-refundable","tags":["string"],"snippet":"string","itinerary":["string","string","string"]}

Rules: rating 4.1–4.9 (one decimal), reviewCount 50–8000, price realistic for the activity, duration like "3 hours" or "Full day", groupSize like "Up to 15", snippet is 1 sentence description, itinerary has 3–5 steps. Mix of price points. badge null for most.`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const match = stripped.match(/\[[\s\S]*\]/)
  const items = JSON.parse(match ? match[0] : stripped) as Array<Record<string, unknown>>

  return items.map((t, i) => ({
    id: startId + i,
    bookingCompany: 'GetYourGuide',
    provider: t.provider,
    price: t.price,
    currency: t.currency ?? 'USD',
    rating: t.rating,
    reviewCount: t.reviewCount,
    duration: t.duration,
    badge: t.badge ?? null,
    groupSize: t.groupSize,
    pickup: t.pickup ?? false,
    pickupDetails: t.pickupDetails ?? 'Meeting point provided after booking',
    cancel: t.cancel,
    tags: t.tags ?? [],
    snippet: t.snippet ?? '',
    itinerary: t.itinerary ?? [],
    reviews: [],
    bookingUrl: null,
    image: null,
  }))
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

    // Fetch Viator and GYG in parallel
    const [viatorRes, gygTours] = await Promise.allSettled([
      fetch(`${VIATOR_BASE}/search/freetext`, {
        method: 'POST',
        headers: viatorHeaders(),
        body: JSON.stringify({
          searchTerm,
          currency: 'USD',
          searchTypes: [{ searchType: 'PRODUCTS', pagination: { start: 1, count: 20 } }],
        }),
      }),
      generateGYGTours(activityName, destination, 1000),
    ])

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

    let viatorTours: ReturnType<typeof Object.assign>[] = []
    if (viatorRes.status === 'fulfilled' && viatorRes.value.ok) {
      const data = await viatorRes.value.json() as { products?: { totalCount: number; results: ViatorProduct[] } }
      viatorTours = (data.products?.results ?? []).map((p, i) => {
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
          bookingUrl: p.productUrl ? cleanProductUrl(p.productUrl) : null,
          image: coverImage,
        }
      })
    }

    const gygToursResult = gygTours.status === 'fulfilled' ? gygTours.value : []

    // Interleave: GYG, Viator, GYG, Viator… so both show up
    const tours: unknown[] = []
    const maxLen = Math.max(viatorTours.length, gygToursResult.length)
    for (let i = 0; i < maxLen; i++) {
      if (gygToursResult[i]) tours.push(gygToursResult[i])
      if (viatorTours[i]) tours.push(viatorTours[i])
    }

    CACHE.set(key, { data: tours, fetchedAt: Date.now() })
    return NextResponse.json({ tours, totalCount: tours.length, cached: false })
  } catch (err) {
    console.error('[api/activities/tours]', err)
    return NextResponse.json({ error: 'Failed to fetch tours', detail: String(err) }, { status: 500 })
  }
}
