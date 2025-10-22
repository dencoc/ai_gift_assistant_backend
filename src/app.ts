import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler'
import UserRouter from './routes/userRoutes'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api', UserRouter)

app.get('/server', (req, res) => res.send('Server is running!'))

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
