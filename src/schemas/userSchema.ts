import { z } from 'zod'

export const UserRegisterSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    username: z.string().min(6, { message: 'Username must be at least 6 characters' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

export const UserLoginSchema = z
    .object({
        username: z
            .string()
            .min(6, { message: 'Username must be at least 6 characters' })
            .optional(),
        email: z.string().email({ message: 'Invalid email format' }).optional(),
        password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    })
    .refine((data) => data.username || data.email, {
        message: 'Either username or email is required',
        path: ['username'],
    })

export const UserUpdateSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }).optional(),

    username: z.string().min(6, { message: 'Username must be at least 6 characters' }).optional(),

    name: z
        .string()
        .optional()
        .refine((val) => !val || /^[A-ZА-Я][a-zа-я]+$/.test(val), {
            message: 'Name must start with a capital letter and contain only letters',
        }),

    surname: z
        .string()
        .optional()
        .refine((val) => !val || /^[A-ZА-Я][a-zа-я]+$/.test(val), {
            message: 'Surname must start with a capital letter and contain only letters',
        }),

    birthdate: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: 'Birthdate must be a valid date (YYYY-MM-DD)',
        }),

    gender: z
        .enum(['мужской', 'женский'])
        .optional()
        .refine((val) => !val || ['мужской', 'женский'].includes(val), {
            message: "Gender must be 'мужской' or 'женский'",
        }),

    description: z.string().optional(),

    telegram_link: z
        .string()
        .optional()
        .refine((val) => !val || val.startsWith('@'), {
            message: 'Telegram link must start with @',
        }),
})

export type UserRegister = z.infer<typeof UserRegisterSchema>
export type UserLogin = z.infer<typeof UserLoginSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
