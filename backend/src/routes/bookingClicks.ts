import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const bookingClicksRouter = Router()

// POST /api/booking-clicks
// Logs an outbound booking click for affiliate reporting (Viator / GYG API upgrade evidence)
bookingClicksRouter.post(
  '/',
  requireAuth,
  [
    body('activityTitle').trim().notEmpty(),
    body('platform').trim().notEmpty(),
    body('url').trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { tripId, blockId, activityTitle, platform, url } = req.body
    try {
      const click = await prisma.bookingClick.create({
        data: {
          userId: req.userId!,
          tripId: tripId ?? null,
          blockId: blockId ?? null,
          activityTitle,
          platform,
          url,
        },
      })
      return res.status(201).json(click)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)
