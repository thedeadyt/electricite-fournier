import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'
import { signAccessToken } from '../lib/jwt'

let adminToken: string

beforeEach(async () => {
  await prisma.timeEntry.deleteMany()
  await prisma.chantier.deleteMany()
  await prisma.user.deleteMany()

  const admin = await prisma.user.create({
    data: { firstName: 'Admin', lastName: 'T', role: 'ADMIN', pin: 'x', isFirstLogin: false },
  })
  adminToken = signAccessToken({ userId: admin.id, role: 'ADMIN' })

  const emp = await prisma.user.create({
    data: { firstName: 'Emp', lastName: 'T', role: 'EMPLOYEE', pin: 'x', isFirstLogin: false },
  })
  const chantier = await prisma.chantier.create({ data: { name: 'Chantier A' } })

  await prisma.timeEntry.create({
    data: { userId: emp.id, chantierId: chantier.id, date: new Date('2026-06-05'), startTime: '08:00', endTime: '16:00' },
  })
})

afterAll(() => prisma.$disconnect())

describe('GET /reports/monthly', () => {
  it('returns hours per employee and per chantier', async () => {
    const res = await request(app)
      .get('/reports/monthly?month=6&year=2026')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.byEmployee).toBeDefined()
    expect(res.body.byChantier).toBeDefined()
    expect(res.body.byEmployee[0].totalHours).toBe(8)
    expect(res.body.byChantier[0].totalHours).toBe(8)
  })

  it('returns 400 without month/year params', async () => {
    const res = await request(app)
      .get('/reports/monthly')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(400)
  })

  it('returns 403 for employee', async () => {
    const emp = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } })
    const empToken = signAccessToken({ userId: emp!.id, role: 'EMPLOYEE' })

    const res = await request(app)
      .get('/reports/monthly?month=6&year=2026')
      .set('Authorization', `Bearer ${empToken}`)

    expect(res.status).toBe(403)
  })
})
