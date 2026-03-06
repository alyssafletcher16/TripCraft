import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { SignJWT } from 'jose'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const res = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          })
          if (!res.ok) return null
          return res.json()
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Credentials sign-in — user object already has backend id
      if (user?.id) {
        token.id  = user.id
        token.sub = user.id
      }

      // Google sign-in — upsert user in backend on first sign-in
      if (account?.provider === 'google' && profile) {
        try {
          const res = await fetch(`${API_URL}/api/users/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type':    'application/json',
              'x-internal-secret': process.env.NEXTAUTH_SECRET ?? '',
            },
            body: JSON.stringify({
              email:  profile.email,
              name:   profile.name,
              avatar: (profile as Record<string, string>).picture ?? null,
            }),
          })
          if (res.ok) {
            const backendUser = await res.json()
            token.id  = backendUser.id
            token.sub = backendUser.id
          }
        } catch {
          // non-fatal — user will be missing accessToken until next sign-in
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      // Mint HS256 JWT the Express backend can verify with jsonwebtoken
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? '')
      session.accessToken = await new SignJWT({ sub: String(token.sub ?? token.id) })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
