import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler'
import UserRouter from './routes/userRoutes'
import ChatRouter from './routes/chatRoutes'
import messageRoutes from './routes/messageRoutes'
import photoRoutes from './routes/photoRoutes'
import { initTelegramBot } from './telegram/bot'
import path from 'path'

import './jobs/userScheduler'

const app = express()
const port = 3000

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
)
app.use(express.json())
app.use(cookieParser())

app.use('/api', UserRouter)
app.use('/api', ChatRouter)
app.use('/api', messageRoutes)
app.use('/api', photoRoutes)
app.use('/api/avatar/url', express.static(path.join(__dirname, '../uploads/avatars')))

app.get('/server', (req, res) => res.send('Server is running!'))

initTelegramBot()
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
