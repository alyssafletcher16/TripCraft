import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── POST /api/compare/urls ─────────────────────────────────────────────────
// Accepts { urls: string[] }, fetches each page, extracts tour data via Claude
router.post('/urls', async (req, res) => {
  const { urls } = req.body as { urls: string[] }

  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 5) {
    return res.status(400).json({ error: 'Provide 1–5 URLs' })
  }

  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        // Fetch page HTML with browser-like headers
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10_000)

        let html = ''
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          })
          html = await response.text()
        } catch {
          html = ''
        } finally {
          clearTimeout(timeout)
        }

        // Truncate to ~12k chars to fit in context
        const snippet = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .slice(0, 12_000)

        const prompt = `You are a travel booking data extractor. Extract tour details from the following page content scraped from: ${url}

If you cannot extract reliable data from the content below, infer reasonable details based on the URL itself (e.g. destination, activity type, operator name visible in the URL path).

Page content:
${snippet || '(page content unavailable — use URL to infer details)'}

Return ONLY a valid JSON object with these exact fields:
{
  "activityName": "string — name of the activity/tour",
  "bookingCompany": "string — platform name (GetYourGuide, Viator, etc.)",
  "provider": "string — the tour operator/guide company name",
  "price": "string — price with currency (e.g. '$89 AUD')",
  "priceValue": number or null,
  "currency": "string — e.g. AUD, USD",
  "duration": "string — e.g. '10–11 hours'",
  "groupSize": "string — e.g. 'Max 14'",
  "pickupIncluded": boolean,
  "pickupDetails": "string — pickup time and location details",
  "cancellation": "string — cancellation policy",
  "itinerary": ["array of itinerary step strings"],
  "tags": ["array of highlight tags"],
  "rating": number or null,
  "reviewCount": number or null,
  "reviews": [
    { "author": "string", "rating": number, "text": "string", "date": "string" }
  ],
  "bookingUrl": "${url}"
}`

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        })

        const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
        // Extract JSON object — find outermost { ... }
        const match = raw.match(/\{[\s\S]*\}/)
        const jsonStr = match ? match[0] : raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

        return { url, data: JSON.parse(jsonStr), error: null }
      } catch (err) {
        return { url, data: null, error: String(err) }
      }
    })
  )

  res.json({ results })
})

export { router as compareRouter }
