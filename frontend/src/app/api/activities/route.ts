import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// In-memory cache (resets on cold start — acceptable for serverless)
const CACHE = new Map<string, { data: unknown; fetchedAt: number }>()
const TTL = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get('destination')?.trim()
  if (!destination) {
    return NextResponse.json({ error: 'destination required' }, { status: 400 })
  }

  const key = `list:${destination.toLowerCase()}`
  const cached = CACHE.get(key)
  if (cached && Date.now() - cached.fetchedAt < TTL) {
    return NextResponse.json({ destination, activities: cached.data, cached: true })
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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '[]'
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const match = stripped.match(/\[[\s\S]*\]/)
    const activities = JSON.parse(match ? match[0] : stripped)

    CACHE.set(key, { data: activities, fetchedAt: Date.now() })
    return NextResponse.json({ destination, activities, cached: false })
  } catch (err) {
    console.error('[api/activities]', err)
    return NextResponse.json({ error: 'Failed to generate activities', detail: String(err) }, { status: 500 })
  }
}
