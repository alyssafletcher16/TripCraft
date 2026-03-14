import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

export const blogsRouter = Router()

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface BlogPost {
  title: string
  url: string
  description: string
  source: string
}

// GET /api/blogs/:destination
blogsRouter.get('/:destination', async (req, res) => {
  const destination = decodeURIComponent(req.params.destination)

  if (!destination) {
    return res.status(400).json({ error: 'destination is required' })
  }

  const cityName = destination.split(',')[0].trim()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
      messages: [
        {
          role: 'user',
          content: `Search the web for 6 popular travel blog posts about visiting ${cityName}. Find real blog articles from travel bloggers (not booking sites like TripAdvisor or Booking.com). Return ONLY a valid JSON array with no other text:\n[{"title": "...", "url": "https://...", "description": "one sentence summary", "source": "blog name"}]`,
        },
      ],
    })

    let blogPosts: BlogPost[] = []

    for (const block of response.content) {
      if (block.type === 'text') {
        const raw = block.text.trim()
        const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        // Try to extract JSON array from the text
        const match = cleaned.match(/\[[\s\S]*\]/)
        if (match) {
          try {
            blogPosts = JSON.parse(match[0])
            break
          } catch {}
        }
        try {
          blogPosts = JSON.parse(cleaned)
          break
        } catch {}
      }
    }

    return res.json({ destination, blogPosts })
  } catch (err) {
    console.error('[blogs/:destination]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
