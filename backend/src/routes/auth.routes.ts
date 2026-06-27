import { Router } from 'express'
import { login, firstLogin, refresh, logout } from '../controllers/auth.controller'

const router = Router()

router.post('/login', login)
router.post('/first-login', firstLogin)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router
