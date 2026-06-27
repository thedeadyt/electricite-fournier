import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { listTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '../controllers/timeEntries.controller'

const router = Router()
router.use(requireAuth)

router.get('/', listTimeEntries)
router.post('/', createTimeEntry)
router.put('/:id', updateTimeEntry)
router.delete('/:id', deleteTimeEntry)

export default router
