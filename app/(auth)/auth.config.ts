import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true;
    },
    async signIn() {
      return true;
    },
  },
} satisfies NextAuthConfig;
