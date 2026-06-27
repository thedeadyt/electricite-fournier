import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken, Role } from '../lib/jwt'
import { AppError } from '../middleware/errorHandler'

function findUserByIdentifier(identifier: string) {
  const dotIndex = identifier.lastIndexOf('.')
  const firstName = identifier.slice(0, dotIndex)
  const lastName = identifier.slice(dotIndex + 1)
  return prisma.user.findFirst({
    where: { firstName, lastName, isActive: true },
  })
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, pin } = req.body
    const user = await findUserByIdentifier(identifier)
    if (!user) return next(new AppError(401, 'Invalid credentials'))

    if (user.isFirstLogin) {
      return res.status(403).json({ error: 'First login required', firstLogin: true })
    }

    const valid = await bcrypt.compare(pin, user.pin)
    if (!valid) return next(new AppError(401, 'Invalid credentials'))

    const payload = { userId: user.id, role: user.role as Role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    setRefreshCookie(res, refreshToken)

    res.json({ accessToken, role: user.role, firstName: user.firstName })
  } catch (err) {
    next(err)
  }
}

export async function firstLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, pin } = req.body
    const user = await findUserByIdentifier(identifier)
    if (!user) return next(new AppError(404, 'User not found'))
    if (!user.isFirstLogin) return next(new AppError(400, 'Already initialized'))

    const hash = await bcrypt.hash(pin, 10)
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { pin: hash, isFirstLogin: false },
    })

    const payload = { userId: updated.id, role: updated.role as Role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    setRefreshCookie(res, refreshToken)

    res.json({ accessToken, role: updated.role, firstName: updated.firstName })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return next(new AppError(401, 'No refresh token'))
    const payload = verifyRefreshToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { firstName: true, role: true } })
    if (!user) return next(new AppError(401, 'User not found'))
    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role })
    res.json({ accessToken, role: user.role, firstName: user.firstName })
  } catch (err) {
    next(err)
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('refreshToken')
  res.json({ ok: true })
}
