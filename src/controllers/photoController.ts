import { Request, Response, NextFunction } from 'express'
import { PhotoModel } from '../models/photoModel'
import { AppError } from '../utils/AppError'
import { RequestWithUser } from '../types/request'

export class PhotoController {
    static async uploadAvatar(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.file) throw new AppError('Файл не загружен', 400)

            const userId = (req.user as any)?.id
            const filename = req.file.filename
            const avatarUrl = `${process.env.SERVER_URL}/api/avatar/url/${filename}`

            await PhotoModel.saveAvatar(userId, filename)

            return res.json({
                success: true,
                message: 'Аватарка загружена',
                avatarUrl,
            })
        } catch (error) {
            next(error)
        }
    }

    static async getAvatarUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.userId)
            const filename = await PhotoModel.getAvatarFilename(userId)
            if (!filename) return res.json({ avatarUrl: null })

            const avatarUrl = `${process.env.SERVER_URL}/api/avatar/url/${filename}`
            return res.json({ avatarUrl })
        } catch (error) {
            next(error)
        }
    }
}
