import Anthropic from '@anthropic-ai/sdk'
import { searchPlace } from './placesService'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Public: generate traveler insights for a destination ──────────────────────
export async function generateInsights(destination: string): Promise<string[]> {
  // 1. Fetch one hotel, one restaurant, one activity in parallel
  const [hotel, restaurant, activity] = await Promise.all([
    searchPlace(`best hotel ${destination}`,      destination, 'hotel'),
    searchPlace(`best restaurant ${destination}`, destination, 'restaurant'),
    searchPlace(`top activity ${destination}`,    destination, 'activity'),
  ])

  // 2. Collect all reviews into one flat array
  const allReviews = [
    ...(hotel?.reviews      ?? []),
    ...(restaurant?.reviews ?? []),
    ...(activity?.reviews   ?? []),
  ]

  if (allReviews.length === 0) return []

  // 3. Build review text for prompt
  const reviewText = allReviews
    .map((r) => `- [${r.rating}/5] ${r.text.replace(/\n/g, ' ').slice(0, 300)}`)
    .join('\n')

  // 4. Call Anthropic
  const prompt = `You are a travel intelligence assistant. Based on these real traveler reviews from ${destination}, generate 3 to 5 concise actionable insights for someone planning a trip there. Focus on: what travelers loved most, what surprised them, any practical tips mentioned, and anything to watch out for. Return a JSON array of insight strings only, no other text.

REVIEWS:
${reviewText}`

  const message = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(json) as string[]
  } catch {
    console.error('[intelligenceService] Failed to parse response:', raw)
    return []
  }
}
