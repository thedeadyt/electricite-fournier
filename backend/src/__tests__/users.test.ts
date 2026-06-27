import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'
import { signAccessToken } from '../lib/jwt'
import bcrypt from 'bcryptjs'

let adminToken: string

beforeEach(async () => {
  await prisma.timeEntry.deleteMany()
  await prisma.user.deleteMany()
  const hash = await bcrypt.hash('admin', 10)
  const admin = await prisma.user.create({
    data: { firstName: 'Admin', lastName: 'Test', role: 'ADMIN', pin: hash, isFirstLogin: false },
  })
  adminToken = signAccessToken({ userId: admin.id, role: 'ADMIN' })
})

afterAll(() => prisma.$disconnect())

describe('POST /users', () => {
  it('creates an employee', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Pierre', lastName: 'Durand' })

    expect(res.status).toBe(201)
    expect(res.body.firstName).toBe('Pierre')
    expect(res.body.isFirstLogin).toBe(true)
  })

  it('returns 403 for non-admin', async () => {
    const emp = await prisma.user.create({
      data: { firstName: 'X', lastName: 'Y', pin: 'x', isFirstLogin: false, role: 'EMPLOYEE' },
    })
    const empToken = signAccessToken({ userId: emp.id, role: 'EMPLOYEE' })

    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ firstName: 'Z', lastName: 'W' })

    expect(res.status).toBe(403)
  })
})

describe('GET /users', () => {
  it('returns list of employees', async () => {
    await prisma.user.create({
      data: { firstName: 'Luc', lastName: 'Blanc', pin: 'x', isFirstLogin: true, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PUT /users/:id', () => {
  it('disables an employee', async () => {
    const emp = await prisma.user.create({
      data: { firstName: 'Luc', lastName: 'Blanc', pin: 'x', isFirstLogin: false, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .put(`/users/${emp.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)
  })
})
