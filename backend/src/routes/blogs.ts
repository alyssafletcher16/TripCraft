import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const blogsRouter = Router()

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ResearchItem {
  title: string
  url: string
  description: string
  source: string
  rating?: string
  price?: string
}

function parseJsonFromText(text: string): ResearchItem[] {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const match = cleaned.match(/\[[\s\S]*\]/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  try { return JSON.parse(cleaned) } catch {}
  return []
}

async function searchCategory(prompt: string): Promise<ResearchItem[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    messages: [{ role: 'user', content: prompt }],
  })

  for (const block of response.content) {
    if (block.type === 'text') {
      const results = parseJsonFromText(block.text)
      if (results.length > 0) return results
    }
  }
  return []
}

// GET /api/blogs/:destination
blogsRouter.get('/:destination', async (req, res) => {
  const destination = decodeURIComponent(req.params.destination)
  if (!destination) return res.status(400).json({ error: 'destination is required' })

  const city = destination.split(',')[0].trim()

  try {
    const [blogs, tours, stays, tips] = await Promise.all([
      searchCategory(`Search for 5 popular travel blog posts about visiting ${city}. Find real articles from travel bloggers with direct URLs. Return ONLY a JSON array:\n[{"title":"...","url":"https://...","description":"one sentence","source":"blog name"}]`),

      searchCategory(`Search for the top 5 highly rated tours and experiences in ${city} on GetYourGuide, Viator, or Airbnb Experiences. Include price and rating where available. Return ONLY a JSON array:\n[{"title":"...","url":"https://...","description":"brief description","source":"platform","rating":"4.8/5","price":"from $XX"}]`),

      searchCategory(`Search for the top 5 highly rated hotels or places to stay in ${city} based on recent reviews. Include price range and rating where available. Return ONLY a JSON array:\n[{"title":"...","url":"https://...","description":"brief description","source":"platform","rating":"4.7/5","price":"from $XXX/night"}]`),

      searchCategory(`Search for the best travel tips and tricks for visiting ${city} — practical advice, local secrets, things to know before you go. Find 5 results from real sources. Return ONLY a JSON array:\n[{"title":"...","url":"https://...","description":"one sentence tip","source":"source name"}]`),
    ])

    return res.json({ destination, blogs, tours, stays, tips })
  } catch (err) {
    console.error('[blogs/:destination]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
