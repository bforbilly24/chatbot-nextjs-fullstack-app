import { signIn } from '@/app/(auth)/auth';
import { isDevelopmentEnvironment } from '@/lib/constants';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await signIn('guest', { 
      redirect: false,
      redirectTo: redirectUrl
    });
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Guest sign in error:', error);
    return NextResponse.redirect(redirectUrl);
  }
}
