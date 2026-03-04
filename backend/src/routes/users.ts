import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const usersRouter = Router()

// POST /api/users/register
usersRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password, name } = req.body
    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return res.status(409).json({ error: 'Email already registered' })

      const hashed = await bcrypt.hash(password, 12)
      const user = await prisma.user.create({
        data: { email, password: hashed, name },
        select: { id: true, email: true, name: true, createdAt: true },
      })
      return res.status(201).json(user)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// POST /api/users/login  (called by NextAuth CredentialsProvider)
usersRouter.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' })

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

      return res.json({ id: user.id, email: user.email, name: user.name })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/users/me
usersRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json(user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/users/me
usersRouter.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  const { name, avatar } = req.body
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, avatar },
      select: { id: true, email: true, name: true, avatar: true },
    })
    return res.json(user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
