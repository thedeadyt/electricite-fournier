import 'dotenv/config'
import { PrismaClient, Role } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('1234', 10)
  await prisma.user.upsert({
    where: { id: 1 },
    update: { pin: hash, isFirstLogin: false },
    create: {
      firstName: 'Admin',
      lastName: 'Fournier',
      role: Role.ADMIN,
      pin: hash,
      isFirstLogin: false,
    },
  })
  console.log('Seed done — admin: Admin.Fournier / pin: 1234')
}

main().finally(() => prisma.$disconnect())
