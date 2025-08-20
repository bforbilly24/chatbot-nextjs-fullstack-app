import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUser } from '@/lib/db/queries';
import { authFormSchema } from '@/lib/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = authFormSchema.parse({
      email: body.email,
      password: body.password,
    });

    const [existingUser] = await getUser(validatedData.email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' }, 
        { status: 400 }
      );
    }

    const user = await createUser(validatedData.email, validatedData.password);
    
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: user.id 
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' }, 
      { status: 500 }
    );
  }
}
