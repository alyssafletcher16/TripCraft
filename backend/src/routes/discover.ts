import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const discoverRouter = Router()

// GET /api/discover  — public trips feed
discoverRouter.get('/', async (req, res) => {
  const { vibe, destination, sort = 'popular', limit = '20', offset = '0' } = req.query as Record<string, string>

  // Optionally identify the caller for userUpvoted — no auth required
  let callerId: string | null = null
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { userId: string }
      callerId = decoded.userId
    } catch {}
  }

  try {
    const where = {
      status: 'COMPLETED' as const,
      ...(vibe ? { vibes: { some: { vibe } } } : {}),
      ...(destination ? { destination: { contains: destination, mode: 'insensitive' as const } } : {}),
    }

    const [rawTrips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          vibes: true,
          user: { select: { id: true, name: true, avatar: true } },
          community: { select: { isAnonymous: true } },
          _count: { select: { upvotes: true } },
        },
        orderBy: sort === 'popular' ? { upvotes: { _count: 'desc' } } : { updatedAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.trip.count({ where }),
    ])

    // Fetch which trips this user has already upvoted
    let upvotedTripIds = new Set<string>()
    if (callerId) {
      const existing = await prisma.communityUpvote.findMany({
        where: { userId: callerId, tripId: { in: rawTrips.map((t) => t.id) } },
        select: { tripId: true },
      })
      upvotedTripIds = new Set(existing.map((u) => u.tripId))
    }

    const trips = rawTrips.map(({ community, user, ...trip }) => ({
      ...trip,
      user: community?.isAnonymous ? { name: null, avatar: null } : user,
      userUpvoted: upvotedTripIds.has(trip.id),
    }))

    return res.json({ trips, total, limit: parseInt(limit), offset: parseInt(offset) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/discover/stats  — destination counts for map clusters
discoverRouter.get('/stats', async (_req, res) => {
  try {
    const rows = await prisma.trip.groupBy({
      by: ['destination'],
      where: { status: 'COMPLETED' },
      _count: { destination: true },
    })
    // Return as { destination: count } map
    const counts: Record<string, number> = {}
    for (const row of rows) {
      counts[row.destination] = row._count.destination
    }
    return res.json({ counts })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/discover/:tripId  — single public trip with full itinerary
discoverRouter.get('/:tripId', async (req, res) => {
  const { tripId } = req.params

  // Optionally identify the caller for userUpvoted
  let callerId: string | null = null
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { userId: string }
      callerId = decoded.userId
    } catch {}
  }

  try {
    const [raw, userUpvote] = await Promise.all([
      prisma.trip.findFirst({
        where: { id: tripId, status: 'COMPLETED' },
        include: {
          vibes: true,
          user: { select: { id: true, name: true, avatar: true } },
          community: true,
          days: {
            orderBy: { dayNum: 'asc' },
            include: { blocks: { orderBy: { sortOrder: 'asc' } } },
          },
          _count: { select: { upvotes: true } },
        },
      }) as any,
      callerId
        ? prisma.communityUpvote.findUnique({ where: { userId_tripId: { userId: callerId, tripId } } })
        : Promise.resolve(null),
    ])
    if (!raw) return res.status(404).json({ error: 'Trip not found' })
    const { community, user, ...trip } = raw
    return res.json({
      ...trip,
      user: community?.isAnonymous ? { id: null, name: null, avatar: null } : user,
      userUpvoted: !!userUpvote,
    })
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
