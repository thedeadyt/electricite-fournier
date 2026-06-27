import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { monthlyReport } from '../controllers/reports.controller'

const router = Router()
router.get('/monthly', requireAuth, requireRole('ADMIN'), monthlyReport)

export default router
