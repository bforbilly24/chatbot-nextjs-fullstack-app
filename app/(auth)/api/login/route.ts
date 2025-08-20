import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/app/(auth)/auth';
import { authFormSchema } from '@/lib/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = authFormSchema.parse({
      email: body.email,
      password: body.password,
    });

    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful' 
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' }, 
      { status: 500 }
    );
  }
}
