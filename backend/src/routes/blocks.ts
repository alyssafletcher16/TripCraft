import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const blocksRouter = Router({ mergeParams: true })

// GET /api/days/:dayId/blocks
blocksRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { dayId } = req.params
  try {
    const blocks = await prisma.block.findMany({
      where: { dayId },
      orderBy: { sortOrder: 'asc' },
    })
    return res.json(blocks)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/days/:dayId/blocks
blocksRouter.post(
  '/',
  requireAuth,
  [
    body('type').isIn(['TRANSPORT', 'STAY', 'ACTIVITY', 'FOOD', 'NOTE']),
    body('title').trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { dayId } = req.params
    const { type, title, detail, price, priceValue, status, confCode, cancelPolicy, cancelSafe, emoji, bgColor, sortOrder } =
      req.body
    try {
      const block = await prisma.block.create({
        data: {
          dayId,
          type,
          title,
          detail,
          price,
          priceValue,
          status: status ?? 'PENDING',
          confCode,
          cancelPolicy,
          cancelSafe: cancelSafe ?? false,
          emoji,
          bgColor,
          sortOrder: sortOrder ?? 0,
        },
      })
      return res.status(201).json(block)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// PATCH /api/days/:dayId/blocks/:blockId
blocksRouter.patch('/:blockId', requireAuth, async (req: AuthRequest, res) => {
  const { blockId } = req.params
  const { title, detail, price, priceValue, status, confCode, cancelPolicy, cancelSafe, emoji, bgColor, sortOrder } =
    req.body
  try {
    const block = await prisma.block.update({
      where: { id: blockId },
      data: { title, detail, price, priceValue, status, confCode, cancelPolicy, cancelSafe, emoji, bgColor, sortOrder },
    })
    return res.json(block)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/days/:dayId/blocks/:blockId
blocksRouter.delete('/:blockId', requireAuth, async (req: AuthRequest, res) => {
  const { blockId } = req.params
  try {
    await prisma.block.delete({ where: { id: blockId } })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/days/:dayId/blocks/reorder  — bulk update sort order
blocksRouter.patch('/reorder', requireAuth, async (req: AuthRequest, res) => {
  const { items } = req.body as { items: { id: string; sortOrder: number }[] }
  try {
    await Promise.all(
      items.map(({ id, sortOrder }) =>
        prisma.block.update({ where: { id }, data: { sortOrder } })
      )
    )
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
