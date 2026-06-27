import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'
import { signAccessToken } from '../lib/jwt'

let adminToken: string
let empToken: string
let empId: number
let chantierId: number

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
  empId = emp.id
  empToken = signAccessToken({ userId: emp.id, role: 'EMPLOYEE' })

  const chantier = await prisma.chantier.create({ data: { name: 'Chantier Test' } })
  chantierId = chantier.id
})

afterAll(() => prisma.$disconnect())

describe('POST /time-entries', () => {
  it('creates a time entry for authenticated employee', async () => {
    const res = await request(app)
      .post('/time-entries')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ chantierId, date: '2026-06-05', startTime: '08:00', endTime: '17:00' })

    expect(res.status).toBe(201)
    expect(res.body.startTime).toBe('08:00')
    expect(res.body.userId).toBe(empId)
  })

  it('returns 400 if endTime <= startTime', async () => {
    const res = await request(app)
      .post('/time-entries')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ chantierId, date: '2026-06-05', startTime: '17:00', endTime: '08:00' })

    expect(res.status).toBe(400)
  })
})

describe('GET /time-entries', () => {
  it('returns only own entries for employee', async () => {
    await prisma.timeEntry.create({
      data: { userId: empId, chantierId, date: new Date('2026-06-05'), startTime: '08:00', endTime: '17:00' },
    })

    const res = await request(app)
      .get('/time-entries')
      .set('Authorization', `Bearer ${empToken}`)

    expect(res.status).toBe(200)
    expect(res.body.every((e: any) => e.userId === empId)).toBe(true)
  })

  it('returns all entries for admin', async () => {
    await prisma.timeEntry.create({
      data: { userId: empId, chantierId, date: new Date('2026-06-05'), startTime: '08:00', endTime: '17:00' },
    })

    const res = await request(app)
      .get('/time-entries')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })
})

describe('DELETE /time-entries/:id', () => {
  it('allows admin to delete', async () => {
    const entry = await prisma.timeEntry.create({
      data: { userId: empId, chantierId, date: new Date('2026-06-05'), startTime: '08:00', endTime: '17:00' },
    })

    const res = await request(app)
      .delete(`/time-entries/${entry.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(204)
  })

  it('returns 403 for employee trying to delete another employee entry', async () => {
    const other = await prisma.user.create({
      data: { firstName: 'Other', lastName: 'T', pin: 'x', isFirstLogin: false, role: 'EMPLOYEE' },
    })
    const entry = await prisma.timeEntry.create({
      data: { userId: other.id, chantierId, date: new Date('2026-06-05'), startTime: '08:00', endTime: '17:00' },
    })

    const res = await request(app)
      .delete(`/time-entries/${entry.id}`)
      .set('Authorization', `Bearer ${empToken}`)

    expect(res.status).toBe(403)
  })
})
