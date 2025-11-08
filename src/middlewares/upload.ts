import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { RequestWithUser } from '../types/request'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/avatars'
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath)
    },
    filename: (req: RequestWithUser, file, cb) => {
        const userId = (req.user as any)?.id
        const ext = path.extname(file.originalname)
        cb(null, `user_${userId}${ext}`)
    },
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    }
    cb(new Error('Только изображения (jpeg, jpg, png, webp)'))
}

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
})
