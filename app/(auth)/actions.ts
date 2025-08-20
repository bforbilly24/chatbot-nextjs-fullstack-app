'use server';

import { ZodError } from 'zod';
import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';
import { authFormSchema, loginFormSchema } from '@/lib/schemas/auth';

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = loginFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember') === 'on',
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      remember: validatedData.remember,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password);
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
