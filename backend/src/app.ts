// src/app.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth.routes'
import usersRoutes from './routes/users.routes'
import profileRoutes from './routes/profile.routes'
import chantiersRoutes from './routes/chantiers.routes'
import timeEntriesRoutes from './routes/timeEntries.routes'
import reportsRoutes from './routes/reports.routes'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/users', profileRoutes)
app.use('/chantiers', chantiersRoutes)
app.use('/time-entries', timeEntriesRoutes)
app.use('/reports', reportsRoutes)

app.use(errorHandler)

export default app
