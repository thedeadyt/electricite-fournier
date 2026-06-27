import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { encryptOrNull, decryptOrNull } from '../lib/encryption'

async function writeAudit(adminId: number, action: string, targetId: number, ip?: string | string[]) {
  const resolvedIp = Array.isArray(ip) ? ip[0] : ip
  await prisma.auditLog.create({ data: { userId: adminId, action, targetId, ip: resolvedIp } })
}

function serializeProfile(profile: Awaited<ReturnType<typeof prisma.employeeProfile.findUnique>>) {
  if (!profile) return null
  return {
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    hireDate: profile.hireDate,
    activity: profile.activity,
    category: profile.category,
    hourlyRate: profile.hourlyRate,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone,
    // Déchiffrement des données sensibles
    nir: decryptOrNull(profile.nirEncrypted),
    dateOfBirth: decryptOrNull(profile.dateOfBirthEncrypted),
    placeOfBirth: decryptOrNull(profile.placeOfBirthEncrypted),
    nationality: decryptOrNull(profile.nationalityEncrypted),
    residencePermitType: decryptOrNull(profile.residencePermitTypeEncrypted),
    residencePermitExpiry: decryptOrNull(profile.residencePermitExpiryEncrypted),
    lastMedicalVisit: decryptOrNull(profile.lastMedicalVisitEncrypted),
    // RGPD
    consentGivenAt: profile.consentGivenAt,
    informedAt: profile.informedAt,
    dataRetentionUntil: profile.dataRetentionUntil,
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = parseInt(req.params.id as string)
    const profile = await prisma.employeeProfile.findUnique({ where: { userId: targetId } })
    await writeAudit(req.user!.userId, 'READ_PROFILE', targetId, req.ip)
    res.json(serializeProfile(profile))
  } catch (err) { next(err) }
}

export async function upsertProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const targetId = parseInt(req.params.id as string)

    const existing = await prisma.user.findUnique({ where: { id: targetId } })
    if (!existing) return next(new AppError(404, 'User not found'))

    const {
      email, phone, address, hireDate, activity, category, hourlyRate,
      emergencyContactName, emergencyContactPhone,
      nir, dateOfBirth, placeOfBirth, nationality,
      residencePermitType, residencePermitExpiry, lastMedicalVisit,
      consentGiven, informedAt,
    } = req.body

    // Calcul de la date de rétention : 5 ans après la date d'embauche (ou maintenant)
    const retentionBase = hireDate ? new Date(hireDate) : new Date()
    const dataRetentionUntil = new Date(retentionBase)
    dataRetentionUntil.setFullYear(dataRetentionUntil.getFullYear() + 5)

    const data = {
      email: email || null,
      phone: phone || null,
      address: address || null,
      hireDate: hireDate ? new Date(hireDate) : null,
      activity: activity || null,
      category: category || null,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      nirEncrypted: encryptOrNull(nir),
      dateOfBirthEncrypted: encryptOrNull(dateOfBirth),
      placeOfBirthEncrypted: encryptOrNull(placeOfBirth),
      nationalityEncrypted: encryptOrNull(nationality),
      residencePermitTypeEncrypted: encryptOrNull(residencePermitType),
      residencePermitExpiryEncrypted: encryptOrNull(residencePermitExpiry),
      lastMedicalVisitEncrypted: encryptOrNull(lastMedicalVisit),
      consentGivenAt: consentGiven ? new Date() : null,
      informedAt: informedAt ? new Date(informedAt) : null,
      dataRetentionUntil,
    }

    const profile = await prisma.employeeProfile.upsert({
      where: { userId: targetId },
      create: { userId: targetId, ...data },
      update: data,
    })

    await writeAudit(req.user!.userId, 'WRITE_PROFILE', targetId, req.ip)
    res.json(serializeProfile(profile))
  } catch (err) { next(err) }
}
