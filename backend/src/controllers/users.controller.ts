import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, firstName: true, lastName: true, isActive: true, isFirstLogin: true, createdAt: true },
      orderBy: { lastName: 'asc' },
    })
    res.json(users)
  } catch (err) { next(err) }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName } = req.body
    if (!firstName || !lastName) return next(new AppError(400, 'firstName and lastName required'))

    const user = await prisma.user.create({
      data: { firstName, lastName, pin: '', role: 'EMPLOYEE', isFirstLogin: true },
      select: { id: true, firstName: true, lastName: true, isActive: true, isFirstLogin: true },
    })
    res.status(201).json(user)
  } catch (err) { next(err) }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string)
    const { isActive, firstName, lastName } = req.body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return next(new AppError(404, 'User not found'))

    const user = await prisma.user.update({
      where: { id },
      data: { ...(isActive !== undefined && { isActive }), ...(firstName && { firstName }), ...(lastName && { lastName }) },
      select: { id: true, firstName: true, lastName: true, isActive: true, isFirstLogin: true },
    })
    res.json(user)
  } catch (err) { next(err) }
}
