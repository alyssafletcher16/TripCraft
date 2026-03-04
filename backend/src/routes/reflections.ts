import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const reflectionsRouter = Router({ mergeParams: true })

// GET /api/trips/:tripId/reflection
reflectionsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { tripId } = req.params
  try {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const reflection = await prisma.tripReflection.findUnique({ where: { tripId } })
    if (!reflection) return res.status(404).json({ error: 'No reflection yet' })
    return res.json(reflection)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/trips/:tripId/reflection  — create or replace
reflectionsRouter.put('/', requireAuth, async (req: AuthRequest, res) => {
  const { tripId } = req.params
  const { rank, expectation, sentence, changes, bestDecision, regret, rebook, tripTitle } = req.body
  try {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    const reflection = await prisma.tripReflection.upsert({
      where: { tripId },
      update: { rank, expectation, sentence, changes: changes ?? [], bestDecision, regret, rebook, tripTitle },
      create: { tripId, rank, expectation, sentence, changes: changes ?? [], bestDecision, regret, rebook, tripTitle },
    })

    // Mark trip as COMPLETED when reflection is submitted
    await prisma.trip.update({ where: { id: tripId }, data: { status: 'COMPLETED' } })

    return res.json(reflection)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/trips/:tripId/reflection
reflectionsRouter.delete('/', requireAuth, async (req: AuthRequest, res) => {
  const { tripId } = req.params
  try {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    await prisma.tripReflection.delete({ where: { tripId } })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
