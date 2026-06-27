import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { getProfile, upsertProfile } from '../controllers/profile.controller'

const router = Router({ mergeParams: true })
router.use(requireAuth, requireRole('ADMIN'))

router.get('/:id/profile', getProfile)
router.put('/:id/profile', upsertProfile)

export default router
