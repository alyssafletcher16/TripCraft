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
    const prompt = `You are a world travel expert. List 8 iconic activities/experiences for: "${destination}"

Return ONLY a valid JSON array — no markdown, no extra text. Each item:
{"name":"string","icon":"single emoji","category":"Nature|Adventure|Cultural|Scenic|Food & Drink|Water|Nightlife|Sports","minPrice":number,"maxPrice":number,"currency":"USD","topRating":number,"totalReviews":number,"companies":number}

Keep names short (max 4 words). All numbers must be integers except topRating (one decimal).`

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
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
