import { z } from 'zod';

export const profileFormSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters.')
        .max(30, 'Name must not be longer than 30 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    bio: z.string().max(160, 'Bio must not be longer than 160 characters.').optional(),
});

export const appearanceFormSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
