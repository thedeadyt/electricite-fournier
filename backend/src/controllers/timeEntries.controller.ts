import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function listTimeEntries(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const { month, year, employeeId, chantierId } = req.query

    const where: Record<string, unknown> = role === 'EMPLOYEE' ? { userId } : {}

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1)
      const end = new Date(Number(year), Number(month), 1)
      where.date = { gte: start, lt: end }
    }
    if (employeeId) where.userId = parseInt(employeeId as string)
    if (chantierId) where.chantierId = parseInt(chantierId as string)

    const entries = await prisma.timeEntry.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true } }, chantier: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })
    res.json(entries)
  } catch (err) { next(err) }
}

export async function createTimeEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.user!
    const { chantierId, date, startTime, endTime } = req.body

    if (!chantierId || !date || !startTime || !endTime)
      return next(new AppError(400, 'chantierId, date, startTime, endTime required'))

    if (parseTime(endTime) <= parseTime(startTime))
      return next(new AppError(400, 'endTime must be after startTime'))

    const entry = await prisma.timeEntry.create({
      data: { userId, chantierId, date: new Date(date), startTime, endTime },
    })
    res.status(201).json(entry)
  } catch (err) { next(err) }
}

export async function updateTimeEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const id = parseInt(req.params.id as string)

    const entry = await prisma.timeEntry.findUnique({ where: { id } })
    if (!entry) return next(new AppError(404, 'Not found'))
    if (role !== 'ADMIN' && entry.userId !== userId) return next(new AppError(403, 'Forbidden'))

    const { chantierId, date, startTime, endTime } = req.body

    if (startTime && endTime) {
      if (parseTime(endTime) <= parseTime(startTime))
        return next(new AppError(400, 'endTime must be after startTime'))
    }

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...(chantierId && { chantierId }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
    })
    res.json(updated)
  } catch (err) { next(err) }
}

export async function deleteTimeEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, role } = req.user!
    const id = parseInt(req.params.id as string)

    const entry = await prisma.timeEntry.findUnique({ where: { id } })
    if (!entry) return next(new AppError(404, 'Not found'))
    if (role !== 'ADMIN' && entry.userId !== userId) return next(new AppError(403, 'Forbidden'))

    await prisma.timeEntry.delete({ where: { id } })
    res.status(204).send()
  } catch (err) { next(err) }
}
