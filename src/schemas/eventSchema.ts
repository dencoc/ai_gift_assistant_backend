import { z } from 'zod'

export const EventCreateSchema = z.object({
    title: z
        .string()
        .min(1, { message: 'Title is required' })
        .max(100, { message: 'Title must be no longer than 100 characters' }),
    description: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Date must be a valid date in ISO format (YYYY-MM-DD)',
    }),
    importance_id: z.number().int().positive().optional(),
    recipient_id: z.number().int().positive().optional(),
    completed: z.boolean().default(false).optional(),
})

export const EventUpdateSchema = z.object({
    title: z
        .string()
        .min(1, { message: 'Title is required' })
        .max(100, { message: 'Title must be no longer than 100 characters' })
        .optional(),
    description: z.string().optional(),
    date: z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: 'Date must be a valid date in ISO format (YYYY-MM-DD)',
        })
        .optional(),
    importance_id: z.number().int().positive().optional().nullable(),
    recipient_id: z.number().int().positive().optional().nullable(),
    completed: z.boolean().optional(),
})

export type EventCreate = z.infer<typeof EventCreateSchema>
export type EventUpdate = z.infer<typeof EventUpdateSchema>
