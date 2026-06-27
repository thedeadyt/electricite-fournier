import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { listUsers, createUser, updateUser } from '../controllers/users.controller'

const router = Router()
router.use(requireAuth, requireRole('ADMIN'))

router.get('/', listUsers)
router.post('/', createUser)
router.put('/:id', updateUser)

export default router
