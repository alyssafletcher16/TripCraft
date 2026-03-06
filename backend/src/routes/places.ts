import { Router } from 'express'
import { searchPlace, getPlaceById } from '../services/placesService'

export const placesRouter = Router()

// POST /api/places/search  { query, location }
placesRouter.post('/search', async (req, res) => {
  const { query, location, type } = req.body as { query?: string; location?: string; type?: string }

  if (!query || !location) {
    return res.status(400).json({ error: 'query and location are required' })
  }

  try {
    const place = await searchPlace(query, location, type)
    if (!place) return res.status(404).json({ error: 'Place not found' })
    return res.json(place)
  } catch (err) {
    console.error('[places/search]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/places/:placeId  (cache only)
placesRouter.get('/:placeId', async (req, res) => {
  const { placeId } = req.params

  try {
    const place = await getPlaceById(placeId)
    if (!place) return res.status(404).json({ error: 'Place not found in cache' })
    return res.json(place)
  } catch (err) {
    console.error('[places/:placeId]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
