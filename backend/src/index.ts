import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { usersRouter } from './routes/users'
import { tripsRouter } from './routes/trips'
import { daysRouter } from './routes/days'
import { blocksRouter } from './routes/blocks'
import { reflectionsRouter } from './routes/reflections'
import { discoverRouter } from './routes/discover'
import { placesRouter } from './routes/places'
import { intelligenceRouter } from './routes/intelligence'
import { compareRouter } from './routes/compare'
import { activitiesRouter } from './routes/activities'
import { bookingClicksRouter } from './routes/bookingClicks'
import { itineraryRouter } from './routes/itinerary'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tripcraft-api' })
})

// Routes
app.use('/api/users', usersRouter)
app.use('/api/trips', tripsRouter)
app.use('/api/trips/:tripId/days', daysRouter)
app.use('/api/days/:dayId/blocks', blocksRouter)
app.use('/api/trips/:tripId/reflection', reflectionsRouter)
app.use('/api/discover', discoverRouter)
app.use('/api/places', placesRouter)
app.use('/api/intelligence', intelligenceRouter)
app.use('/api/compare', compareRouter)
app.use('/api/activities', activitiesRouter)
app.use('/api/booking-clicks', bookingClicksRouter)
app.use('/api/itinerary', itineraryRouter)

app.listen(PORT, () => {
  console.log(`TripCraft API running on http://localhost:${PORT}`)
})

export default app
