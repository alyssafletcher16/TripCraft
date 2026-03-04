import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  try {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error('NEXTAUTH_SECRET not set')

    // NextAuth JWT stores user id in `sub`
    const payload = jwt.verify(token, secret) as jwt.JwtPayload
    req.userId = payload.sub ?? (payload.id as string)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
