// src/lib/jwt.ts
import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export type Role = 'ADMIN' | 'EMPLOYEE'
export type JwtPayload = { userId: number; role: Role }

function narrowPayload(decoded: string | jwt.JwtPayload): JwtPayload {
  if (typeof decoded === 'string' || typeof decoded.userId !== 'number') {
    throw new Error('Invalid token payload')
  }
  return decoded as JwtPayload
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' })
}

export function verifyAccessToken(token: string): JwtPayload {
  return narrowPayload(jwt.verify(token, ACCESS_SECRET))
}

export function verifyRefreshToken(token: string): JwtPayload {
  return narrowPayload(jwt.verify(token, REFRESH_SECRET))
}
