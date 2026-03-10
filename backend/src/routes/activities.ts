import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── In-memory cache ───────────────────────────────────────────────────────────
const LIST_CACHE  = new Map<string, { data: unknown; fetchedAt: number }>()
const TOURS_CACHE = new Map<string, { data: unknown; fetchedAt: number }>()
const TTL = 24 * 60 * 60 * 1000 // 24 hours

// ── GET /api/activities?destination=Sydney ────────────────────────────────────
// Returns lightweight activity list (no tour detail) — fast to generate
router.get('/', async (req, res) => {
  const destination = (req.query.destination as string | undefined)?.trim()
  if (!destination) return res.status(400).json({ error: 'destination required' })

  const key = `list:${destination.toLowerCase()}`
  const cached = LIST_CACHE.get(key)
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return res.json({ destination, activities: cached.data, cached: true })
  }

  try {
    const prompt = `You are a world travel expert. List the 7 most iconic activities/experiences for: "${destination}"

For obscure destinations, only include what genuinely exists there. Do not invent things.

Return ONLY a JSON array — no other text. Each item:
{"name":"string","icon":"single emoji","category":"Nature|Adventure|Cultural|Scenic|Food & Drink","minPrice":number,"maxPrice":number,"currency":"3-letter code","topRating":4.6,"totalReviews":number,"companies":8}

Always set companies to 8. Keep it concise — just these 8 fields per activity. No tours array.`

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    const activities = JSON.parse(match ? match[0] : raw)

    LIST_CACHE.set(key, { data: activities, fetchedAt: Date.now() })
    res.json({ destination, activities, cached: false })
  } catch (err) {
    console.error('[activities/list]', err)
    res.status(500).json({ error: 'Failed to generate activities', detail: String(err) })
  }
})

// ── POST /api/activities/tours ────────────────────────────────────────────────
// Returns full tour detail for one activity — called when user clicks Compare
router.post('/tours', async (req, res) => {
  const { destination, activityName } = req.body as { destination?: string; activityName?: string }
  if (!destination || !activityName) return res.status(400).json({ error: 'destination and activityName required' })

  const key = `tours:${destination.toLowerCase()}:${activityName.toLowerCase()}`
  const cached = TOURS_CACHE.get(key)
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return res.json({ tours: cached.data, cached: true })
  }

  try {
    const prompt = `You are a world travel expert. Generate 8 diverse tour options for this activity in ${destination}:
Activity: "${activityName}"

List whichever booking platforms genuinely offer this — could be GetYourGuide, Viator, Klook, local operators, or others. Do NOT follow a fixed company quota. Use whatever mix reflects what is actually available. Vary price tiers naturally across the 8 options.

Return ONLY a valid JSON array of exactly 8 tours — no other text. Do NOT include a bookingUrl field — URLs will be constructed by the app:
[{"id":1,"bookingCompany":"GetYourGuide","provider":"operator name","price":number,"currency":"local 3-letter code","rating":4.7,"reviewCount":number,"duration":"string","badge":"Best Seller"|"Top Rated"|"Premium"|"Hidden gem"|"Budget pick"|null,"groupSize":"Max N","pickup":true,"pickupDetails":"detailed pickup/meeting info with times","cancel":"Free cancel up to 24h before","tags":["tag1","tag2","tag3"],"snippet":"\\"one vivid review quote\\"","itinerary":["time — step description (6 steps total)"],"reviews":[{"author":"Name I.","rating":5,"text":"2-3 sentences of genuine specific traveller review.","date":"Month YYYY"},{"author":"Name I.","rating":4,"text":"2-3 sentences.","date":"Month YYYY"},{"author":"Name I.","rating":5,"text":"2-3 sentences.","date":"Month YYYY"}]}]`

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    const tours = JSON.parse(match ? match[0] : raw)

    TOURS_CACHE.set(key, { data: tours, fetchedAt: Date.now() })
    res.json({ tours, cached: false })
  } catch (err) {
    console.error('[activities/tours]', err)
    res.status(500).json({ error: 'Failed to generate tours', detail: String(err) })
  }
})

export { router as activitiesRouter }
