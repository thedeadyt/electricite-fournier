import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { listChantiers, createChantier, updateChantier } from '../controllers/chantiers.controller'

const router = Router()

router.get('/', requireAuth, listChantiers)
router.post('/', requireAuth, requireRole('ADMIN'), createChantier)
router.put('/:id', requireAuth, requireRole('ADMIN'), updateChantier)

export default router
