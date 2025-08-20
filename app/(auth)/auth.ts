import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { createGuestUser, getUser, createGoogleUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD, guestRegex } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {},
      async authorize({ email, password, remember }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        if (remember) {
          const cookieStore = await cookies();
          cookieStore.set('remember-login', 'true', {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }

        return { ...user, type: 'regular' };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
       
        if (account?.provider === 'google') {
          const existingUsers = await getUser(user.email!);
          
          if (existingUsers.length > 0) {
            const [existingUser] = existingUsers;
            
           
           
            if (existingUser.password !== null) {
              return false;
            }
          }
        }
        
        return true; 
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          if (account?.provider === 'google') {
            const existingUsers = await getUser(user.email!);
            
            if (existingUsers.length > 0) {
              const [existingUser] = existingUsers;
              
              token.id = existingUser.id;
              token.type = 'regular';
            } else {
              const newUser = await createGoogleUser({
                email: user.email!,
              });
              token.id = newUser.id;
              token.type = 'regular';
            }
          } else {
            
            token.id = user.id as string;
            token.type = user.type;
          }
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = token.id;
          session.user.type = token.type;
        }

       
        const cookieStore = await cookies();
        const rememberLogin = cookieStore.get('remember-login');
        
        if (!rememberLogin) {
         
          session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000) as any;
        }

        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
});
