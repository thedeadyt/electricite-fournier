import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

function timeDiffHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

export async function monthlyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, year } = req.query
    if (!month || !year) return next(new AppError(400, 'month and year query params required'))

    const start = new Date(Number(year), Number(month) - 1, 1)
    const end = new Date(Number(year), Number(month), 1)

    const entries = await prisma.timeEntry.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        chantier: { select: { id: true, name: true } },
      },
    })

    const empMap = new Map<number, { id: number; name: string; totalHours: number }>()
    const chantierMap = new Map<number, { id: number; name: string; totalHours: number }>()

    for (const e of entries) {
      const hours = timeDiffHours(e.startTime, e.endTime)

      const empKey = e.user.id
      if (!empMap.has(empKey)) empMap.set(empKey, { id: empKey, name: `${e.user.firstName} ${e.user.lastName}`, totalHours: 0 })
      empMap.get(empKey)!.totalHours += hours

      const chKey = e.chantier.id
      if (!chantierMap.has(chKey)) chantierMap.set(chKey, { id: chKey, name: e.chantier.name, totalHours: 0 })
      chantierMap.get(chKey)!.totalHours += hours
    }

    res.json({
      month: Number(month),
      year: Number(year),
      byEmployee: [...empMap.values()],
      byChantier: [...chantierMap.values()],
    })
  } catch (err) { next(err) }
}
