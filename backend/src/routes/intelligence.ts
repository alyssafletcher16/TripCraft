import { Router } from 'express'
import { generateInsights } from '../services/intelligenceService'

export const intelligenceRouter = Router()

// GET /api/intelligence/:destination
intelligenceRouter.get('/:destination', async (req, res) => {
  const destination = decodeURIComponent(req.params.destination)

  if (!destination) {
    return res.status(400).json({ error: 'destination is required' })
  }

  try {
    const insights = await generateInsights(destination)
    return res.json({ destination, insights })
  } catch (err) {
    console.error('[intelligence/:destination]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
