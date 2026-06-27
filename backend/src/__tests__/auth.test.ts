import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

beforeEach(async () => {
  await prisma.timeEntry.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const hash = await bcrypt.hash('1234', 10)
    await prisma.user.create({
      data: { firstName: 'Jean', lastName: 'Dupont', pin: hash, isFirstLogin: false, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ identifier: 'Jean.Dupont', pin: '1234' })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('returns 401 for wrong pin', async () => {
    const hash = await bcrypt.hash('1234', 10)
    await prisma.user.create({
      data: { firstName: 'Jean', lastName: 'Dupont', pin: hash, isFirstLogin: false, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ identifier: 'Jean.Dupont', pin: '0000' })

    expect(res.status).toBe(401)
  })

  it('returns 403 when isFirstLogin is true', async () => {
    const hash = await bcrypt.hash('1234', 10)
    await prisma.user.create({
      data: { firstName: 'Marie', lastName: 'Martin', pin: hash, isFirstLogin: true, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ identifier: 'Marie.Martin', pin: '1234' })

    expect(res.status).toBe(403)
    expect(res.body.firstLogin).toBe(true)
  })
})

describe('POST /auth/first-login', () => {
  it('sets pin and returns tokens', async () => {
    await prisma.user.create({
      data: { firstName: 'Marie', lastName: 'Martin', pin: '', isFirstLogin: true, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .post('/auth/first-login')
      .send({ identifier: 'Marie.Martin', pin: '5678' })

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeDefined()
  })

  it('returns 404 if user not found', async () => {
    const res = await request(app)
      .post('/auth/first-login')
      .send({ identifier: 'Inconnu.Inconnu', pin: '1234' })

    expect(res.status).toBe(404)
  })

  it('returns 400 if isFirstLogin is false', async () => {
    const hash = await bcrypt.hash('1234', 10)
    await prisma.user.create({
      data: { firstName: 'Jean', lastName: 'Dupont', pin: hash, isFirstLogin: false, role: 'EMPLOYEE' },
    })

    const res = await request(app)
      .post('/auth/first-login')
      .send({ identifier: 'Jean.Dupont', pin: '5678' })

    expect(res.status).toBe(400)
  })
})
