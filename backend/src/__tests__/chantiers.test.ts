import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'
import { signAccessToken } from '../lib/jwt'
import bcrypt from 'bcryptjs'

let adminToken: string
let empToken: string

beforeEach(async () => {
  await prisma.timeEntry.deleteMany()
  await prisma.chantier.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('admin', 10)
  const admin = await prisma.user.create({
    data: { firstName: 'Admin', lastName: 'Test', role: 'ADMIN', pin: hash, isFirstLogin: false },
  })
  adminToken = signAccessToken({ userId: admin.id, role: 'ADMIN' })

  const emp = await prisma.user.create({
    data: { firstName: 'Emp', lastName: 'Test', role: 'EMPLOYEE', pin: 'x', isFirstLogin: false },
  })
  empToken = signAccessToken({ userId: emp.id, role: 'EMPLOYEE' })
})

afterAll(() => prisma.$disconnect())

describe('GET /chantiers', () => {
  it('returns active chantiers for any authenticated user', async () => {
    await prisma.chantier.create({ data: { name: 'Chantier A', isActive: true } })
    await prisma.chantier.create({ data: { name: 'Chantier B', isActive: false } })

    const res = await request(app)
      .get('/chantiers')
      .set('Authorization', `Bearer ${empToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Chantier A')
  })
})

describe('POST /chantiers', () => {
  it('creates a chantier (admin only)', async () => {
    const res = await request(app)
      .post('/chantiers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Nouveau chantier', address: 'Lourdes 65100' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Nouveau chantier')
  })

  it('returns 403 for employee', async () => {
    const res = await request(app)
      .post('/chantiers')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ name: 'Test' })

    expect(res.status).toBe(403)
  })
})

describe('PUT /chantiers/:id', () => {
  it('archives a chantier', async () => {
    const c = await prisma.chantier.create({ data: { name: 'A archiver' } })

    const res = await request(app)
      .put(`/chantiers/${c.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)
  })
})
