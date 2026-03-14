import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const socialRouter = Router()

// ── User search ───────────────────────────────────────────────────────────────

// GET /api/social/search?q=  — search users by name
socialRouter.get('/search', requireAuth, async (req: AuthRequest, res) => {
  const q = (req.query.q as string)?.trim() ?? ''
  const myId = req.userId!

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: myId },
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: { id: true, name: true, avatar: true, isPrivate: true, _count: { select: { trips: true } } },
      take: 20,
    })

    // Attach follow status for each result
    const followRows = await prisma.follow.findMany({
      where: { followerId: myId, followingId: { in: users.map((u) => u.id) } },
      select: { followingId: true, status: true },
    })
    const statusMap: Record<string, string> = {}
    for (const f of followRows) statusMap[f.followingId] = f.status

    return res.json({
      users: users.map((u) => ({ ...u, followStatus: statusMap[u.id] ?? null })),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Public user profile ───────────────────────────────────────────────────────

// GET /api/social/users/:userId  — public profile + their public trips (respects privacy)
socialRouter.get('/users/:userId', requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.params
  const myId = req.userId!
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, avatar: true, isPrivate: true,
        _count: { select: { trips: true } },
      },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Determine follow status
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: myId, followingId: userId } },
      select: { id: true, status: true },
    })
    const followStatus = follow?.status ?? null
    const isAccepted = followStatus === 'ACCEPTED'
    const canSeeTrips = !user.isPrivate || isAccepted

    let trips: object[] = []
    if (canSeeTrips) {
      trips = await prisma.trip.findMany({
        where: { userId, status: 'COMPLETED', isPublic: true },
        include: {
          vibes: true,
          _count: { select: { upvotes: true } },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }

    // Follower/following counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId, status: 'ACCEPTED' } }),
      prisma.follow.count({ where: { followerId: userId, status: 'ACCEPTED' } }),
    ])

    return res.json({ user, followStatus, canSeeTrips, trips, followerCount, followingCount })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Follow actions ────────────────────────────────────────────────────────────

// POST /api/social/follow/:userId  — send follow request (auto-accept if public)
socialRouter.post('/follow/:userId', requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.params
  const myId = req.userId!
  if (userId === myId) return res.status(400).json({ error: 'Cannot follow yourself' })

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isPrivate: true },
    })
    if (!target) return res.status(404).json({ error: 'User not found' })

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: myId, followingId: userId } },
    })
    if (existing) return res.status(409).json({ error: 'Follow already exists', status: existing.status })

    const status = target.isPrivate ? 'PENDING' : 'ACCEPTED'
    const follow = await prisma.follow.create({
      data: { followerId: myId, followingId: userId, status },
    })
    return res.status(201).json({ follow })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/social/follow/:userId  — unfollow or cancel pending request
socialRouter.delete('/follow/:userId', requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.params
  const myId = req.userId!
  try {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: myId, followingId: userId } },
    })
    return res.status(204).send()
  } catch {
    return res.status(404).json({ error: 'Follow not found' })
  }
})

// ── Incoming follow requests (for private accounts) ───────────────────────────

// GET /api/social/requests  — my pending incoming follow requests
socialRouter.get('/requests', requireAuth, async (req: AuthRequest, res) => {
  const myId = req.userId!
  try {
    const requests = await prisma.follow.findMany({
      where: { followingId: myId, status: 'PENDING' },
      include: { follower: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ requests })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/social/requests/:requestId/accept
socialRouter.patch('/requests/:requestId/accept', requireAuth, async (req: AuthRequest, res) => {
  const { requestId } = req.params
  const myId = req.userId!
  try {
    const follow = await prisma.follow.findFirst({
      where: { id: requestId, followingId: myId, status: 'PENDING' },
    })
    if (!follow) return res.status(404).json({ error: 'Request not found' })

    const updated = await prisma.follow.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    })
    return res.json({ follow: updated })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/social/requests/:requestId/reject  — dismiss/decline request
socialRouter.patch('/requests/:requestId/reject', requireAuth, async (req: AuthRequest, res) => {
  const { requestId } = req.params
  const myId = req.userId!
  try {
    const follow = await prisma.follow.findFirst({
      where: { id: requestId, followingId: myId, status: 'PENDING' },
    })
    if (!follow) return res.status(404).json({ error: 'Request not found' })

    await prisma.follow.delete({ where: { id: requestId } })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Followers / Following lists ───────────────────────────────────────────────

// GET /api/social/followers  — people who follow me (accepted)
socialRouter.get('/followers', requireAuth, async (req: AuthRequest, res) => {
  const myId = req.userId!
  try {
    const rows = await prisma.follow.findMany({
      where: { followingId: myId, status: 'ACCEPTED' },
      include: { follower: { select: { id: true, name: true, avatar: true, isPrivate: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ followers: rows.map((r) => ({ ...r.follower, followedAt: r.createdAt })) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/social/following  — people I follow (accepted)
socialRouter.get('/following', requireAuth, async (req: AuthRequest, res) => {
  const myId = req.userId!
  try {
    const rows = await prisma.follow.findMany({
      where: { followerId: myId, status: 'ACCEPTED' },
      include: { following: { select: { id: true, name: true, avatar: true, isPrivate: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return res.json({ following: rows.map((r) => r.following) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
