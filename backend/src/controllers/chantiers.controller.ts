import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export async function listChantiers(_req: Request, res: Response, next: NextFunction) {
  try {
    const chantiers = await prisma.chantier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    res.json(chantiers)
  } catch (err) { next(err) }
}

export async function createChantier(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, address } = req.body
    if (!name) return next(new AppError(400, 'name required'))
    const chantier = await prisma.chantier.create({ data: { name, address } })
    res.status(201).json(chantier)
  } catch (err) { next(err) }
}

export async function updateChantier(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string)
    const { name, address, isActive } = req.body

    const existing = await prisma.chantier.findUnique({ where: { id } })
    if (!existing) return next(new AppError(404, 'Chantier not found'))

    const chantier = await prisma.chantier.update({
      where: { id },
      data: { ...(name && { name }), ...(address !== undefined && { address }), ...(isActive !== undefined && { isActive }) },
    })
    res.json(chantier)
  } catch (err) { next(err) }
}
