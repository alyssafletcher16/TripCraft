import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const tripsRouter = Router()

// GET /api/trips  — current user's trips
tripsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      include: { vibes: true, _count: { select: { days: true, upvotes: true } } },
      orderBy: { updatedAt: 'desc' },
    })
    return res.json(trips)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/trips
tripsRouter.post(
  '/',
  requireAuth,
  [
    body('title').trim().notEmpty(),
    body('destination').trim().notEmpty(),
    body('travelers').optional().isInt({ min: 1 }),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { title, destination, country, startDate, endDate, travelers, budget, vibes, coverEmoji } =
      req.body
    try {
      const trip = await prisma.trip.create({
        data: {
          userId: req.userId!,
          title,
          destination,
          country,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          travelers: travelers ?? 1,
          budget,
          coverEmoji,
          vibes: {
            create: (vibes as string[] ?? []).map((vibe) => ({ vibe })),
          },
        },
        include: { vibes: true },
      })
      return res.status(201).json(trip)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/trips/:id
tripsRouter.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        vibes: true,
        days: {
          include: { blocks: { orderBy: { sortOrder: 'asc' } }, photos: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { dayNum: 'asc' },
        },
        reflection: true,
        insights: true,
        checklist: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { upvotes: true } },
      },
    })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    return res.json(trip)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/trips/:id
tripsRouter.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { title, destination, country, startDate, endDate, travelers, budget, status, isPublic, coverEmoji, vibes } =
    req.body
  try {
    const trip = await prisma.trip.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title,
        destination,
        country,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        travelers,
        budget,
        status,
        isPublic,
        coverEmoji,
      },
    })
    if (trip.count === 0) return res.status(404).json({ error: 'Trip not found' })

    if (vibes) {
      await prisma.tripVibe.deleteMany({ where: { tripId: req.params.id } })
      await prisma.tripVibe.createMany({
        data: (vibes as string[]).map((vibe) => ({ tripId: req.params.id, vibe })),
      })
    }

    const updated = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { vibes: true },
    })
    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/trips/:id
tripsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await prisma.trip.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    })
    if (result.count === 0) return res.status(404).json({ error: 'Trip not found' })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
