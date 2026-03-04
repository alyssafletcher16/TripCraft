import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

// mergeParams gives access to :tripId from parent route
export const daysRouter = Router({ mergeParams: true })

// GET /api/trips/:tripId/days
daysRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { tripId } = req.params
  try {
    // Verify ownership
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const days = await prisma.itineraryDay.findMany({
      where: { tripId },
      include: {
        blocks: { orderBy: { sortOrder: 'asc' } },
        photos: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { dayNum: 'asc' },
    })
    return res.json(days)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/trips/:tripId/days
daysRouter.post(
  '/',
  requireAuth,
  [body('name').trim().notEmpty(), body('dayNum').isInt({ min: 1 })],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { tripId } = req.params
    const { dayNum, name, theme, date } = req.body
    try {
      const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
      if (!trip) return res.status(404).json({ error: 'Trip not found' })

      const day = await prisma.itineraryDay.create({
        data: { tripId, dayNum, name, theme, date: date ? new Date(date) : null },
        include: { blocks: true, photos: true },
      })
      return res.status(201).json(day)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// PATCH /api/trips/:tripId/days/:dayId
daysRouter.patch('/:dayId', requireAuth, async (req: AuthRequest, res) => {
  const { tripId, dayId } = req.params
  const { name, theme, date } = req.body
  try {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const day = await prisma.itineraryDay.update({
      where: { id: dayId },
      data: { name, theme, date: date ? new Date(date) : undefined },
      include: { blocks: true, photos: true },
    })
    return res.json(day)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/trips/:tripId/days/:dayId
daysRouter.delete('/:dayId', requireAuth, async (req: AuthRequest, res) => {
  const { tripId, dayId } = req.params
  try {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    await prisma.itineraryDay.delete({ where: { id: dayId } })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
