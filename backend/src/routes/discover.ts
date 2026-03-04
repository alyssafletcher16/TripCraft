import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const discoverRouter = Router()

// GET /api/discover  — public trips feed
discoverRouter.get('/', async (req, res) => {
  const { vibe, sort = 'popular', limit = '20', offset = '0' } = req.query as Record<string, string>
  try {
    const where = {
      isPublic: true,
      status: 'COMPLETED' as const,
      ...(vibe ? { vibes: { some: { vibe } } } : {}),
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          vibes: true,
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { upvotes: true } },
        },
        orderBy: sort === 'popular' ? { upvotes: { _count: 'desc' } } : { updatedAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.trip.count({ where }),
    ])

    return res.json({ trips, total, limit: parseInt(limit), offset: parseInt(offset) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/discover/:tripId/upvote  — toggle upvote
discoverRouter.post('/:tripId/upvote', requireAuth, async (req: AuthRequest, res) => {
  const { tripId } = req.params
  const userId = req.userId!
  try {
    const existing = await prisma.communityUpvote.findUnique({
      where: { userId_tripId: { userId, tripId } },
    })

    if (existing) {
      await prisma.communityUpvote.delete({ where: { userId_tripId: { userId, tripId } } })
      return res.json({ upvoted: false })
    } else {
      await prisma.communityUpvote.create({ data: { userId, tripId } })
      return res.json({ upvoted: true })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
