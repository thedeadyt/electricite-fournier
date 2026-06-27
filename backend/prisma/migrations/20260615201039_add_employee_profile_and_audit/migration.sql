-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "hireDate" DATE,
    "activity" TEXT,
    "category" TEXT,
    "hourlyRate" DECIMAL(8,2),
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "nirEncrypted" TEXT,
    "dateOfBirthEncrypted" TEXT,
    "placeOfBirthEncrypted" TEXT,
    "nationalityEncrypted" TEXT,
    "residencePermitTypeEncrypted" TEXT,
    "residencePermitExpiryEncrypted" TEXT,
    "lastMedicalVisitEncrypted" TEXT,
    "consentGivenAt" TIMESTAMP(3),
    "informedAt" TIMESTAMP(3),
    "dataRetentionUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" INTEGER,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
