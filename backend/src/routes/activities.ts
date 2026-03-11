import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VIATOR_API_KEY = process.env.VIATOR_API_KEY ?? ''
const VIATOR_BASE    = 'https://api.viator.com/partner'

// ── In-memory cache ───────────────────────────────────────────────────────────
const LIST_CACHE  = new Map<string, { data: unknown; fetchedAt: number }>()
const TOURS_CACHE = new Map<string, { data: unknown; fetchedAt: number }>()
const TTL = 24 * 60 * 60 * 1000 // 24 hours

function viatorHeaders(): Record<string, string> {
  return {
    'exp-api-key':     VIATOR_API_KEY,
    'Accept-Language': 'en-US',
    'Accept':          'application/json;version=2.0',
    'Content-Type':    'application/json',
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
  if (flags.includes('PRIVATE_TOUR'))       return 'Premium'
  if (flags.includes('NEW_ON_VIATOR'))      return 'New'
  return null
}

// ── GET /api/activities?destination=Sydney ────────────────────────────────────
// Claude generates curated category tiles — fast and destination-aware
router.get('/', async (req, res) => {
  const destination = (req.query.destination as string | undefined)?.trim()
  if (!destination) return res.status(400).json({ error: 'destination required' })

  const key = `list:${destination.toLowerCase()}`
  const cached = LIST_CACHE.get(key)
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return res.json({ destination, activities: cached.data, cached: true })
  }

  try {
    const prompt = `You are a world travel expert. List the 12 most iconic activities/experiences for: "${destination}"

For obscure destinations, only include what genuinely exists there. Do not invent things.

Return ONLY a JSON array — no other text. Each item must have exactly these fields:
{"name":"string","icon":"single emoji","category":"Nature|Adventure|Cultural|Scenic|Food & Drink|Water|Nightlife|Sports","minPrice":number,"maxPrice":number,"currency":"USD","topRating":number,"totalReviews":number,"companies":number}

minPrice/maxPrice = typical USD price range per person (integers).
topRating = typical top rating out of 5 (e.g. 4.7).
totalReviews = estimated total reviews across platforms (integer).
companies = estimated number of tour operators (integer).`

    const msg = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw        = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
    const stripped   = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const match      = stripped.match(/\[[\s\S]*\]/)
    const activities = JSON.parse(match ? match[0] : stripped)

    LIST_CACHE.set(key, { data: activities, fetchedAt: Date.now() })
    res.json({ destination, activities, cached: false })
  } catch (err) {
    console.error('[activities/list]', err)
    res.status(500).json({ error: 'Failed to generate activities', detail: String(err) })
  }
})

// ── POST /api/activities/tours ────────────────────────────────────────────────
// Fetches real live tours from Viator — called when user clicks Compare
router.post('/tours', async (req, res) => {
  const { destination, activityName } = req.body as { destination?: string; activityName?: string }
  if (!destination || !activityName) return res.status(400).json({ error: 'destination and activityName required' })

  const key = `tours:${destination.toLowerCase()}:${activityName.toLowerCase()}`
  const cached = TOURS_CACHE.get(key)
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return res.json({ tours: cached.data, cached: true })
  }

  try {
    const searchTerm = `${activityName} ${destination}`

    const viatorRes = await fetch(`${VIATOR_BASE}/search/freetext`, {
      method:  'POST',
      headers: viatorHeaders(),
      body:    JSON.stringify({
        searchTerm,
        currency:    'USD',
        searchTypes: [{ searchType: 'PRODUCTS', pagination: { start: 1, count: 20 } }],
      }),
    })

    if (!viatorRes.ok) {
      const errText = await viatorRes.text()
      console.error('[activities/tours] Viator error:', viatorRes.status, errText)
      return res.status(502).json({ error: 'Viator API error', detail: errText })
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

    const data = await viatorRes.json() as {
      products?: { totalCount: number; results: ViatorProduct[] }
    }

    const results = data.products?.results ?? []

    const tours = results.map((p, i) => {
      const flags      = p.flags ?? []
      const coverImage = p.images?.[0]?.variants?.find(v => v.width >= 480)?.url ?? null
      const cancel     = flags.includes('FREE_CANCELLATION') ? 'Free cancellation' : 'Non-refundable'
      const snippet    = p.description ? `"${p.description.slice(0, 200).trimEnd()}…"` : ''

      return {
        id:             i + 1,
        bookingCompany: 'Viator',
        provider:       p.title,
        price:          p.pricing?.summary?.fromPrice ?? 0,
        currency:       p.pricing?.currency ?? 'USD',
        rating:         Math.round((p.reviews?.combinedAverageRating ?? 0) * 10) / 10,
        reviewCount:    p.reviews?.totalReviews ?? 0,
        duration:       formatDuration(p.duration),
        badge:          getBadge(flags),
        groupSize:      'Varies',
        pickup:         false,
        pickupDetails:  '',
        cancel,
        tags:           [],
        snippet,
        itinerary:      [],
        reviews:        [],
        bookingUrl:     p.productUrl ?? null,
        image:          coverImage,
      }
    })

    TOURS_CACHE.set(key, { data: tours, fetchedAt: Date.now() })
    res.json({ tours, totalCount: data.products?.totalCount ?? tours.length, cached: false })
  } catch (err) {
    console.error('[activities/tours]', err)
    res.status(500).json({ error: 'Failed to fetch tours', detail: String(err) })
  }
})

export { router as activitiesRouter }
