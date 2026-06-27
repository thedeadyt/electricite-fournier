// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../lib/jwt'
import { AppError } from './errorHandler'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized'))
  }
  try {
    req.user = verifyAccessToken(auth.slice(7))
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token'))
  }
}

export function requireRole(role: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== role) return next(new AppError(403, 'Forbidden'))
    next()
  }
}
