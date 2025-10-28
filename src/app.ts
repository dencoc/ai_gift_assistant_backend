import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler'
import UserRouter from './routes/userRoutes'
import { initTelegramBot } from './telegram/bot'

import './jobs/userScheduler'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api', UserRouter)

app.get('/server', (req, res) => res.send('Server is running!'))

initTelegramBot()
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
