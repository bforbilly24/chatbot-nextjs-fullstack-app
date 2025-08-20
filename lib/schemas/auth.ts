import { z } from 'zod';

export const authFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const loginFormSchema = authFormSchema.extend({
  remember: z.boolean().optional(),
});

export const registerFormSchema = authFormSchema;

export type AuthFormValues = z.infer<typeof authFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
