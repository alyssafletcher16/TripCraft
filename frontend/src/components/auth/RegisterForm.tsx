'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const name = data.get('name') as string
    const email = data.get('email') as string
    const password = data.get('password') as string

    try {
      await api.users.register({ name, email, password })
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Account created — please sign in.')
        router.push('/login')
      } else {
        router.push('/trips')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-white/10 rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.05)' }}>
      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/trips' })}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-white/20 text-white/80 text-sm font-medium transition-all hover:bg-white/[0.07] hover:border-white/35 hover:text-white mb-5"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs font-mono">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="reg-name"
            className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5"
          >
            Name
          </label>
          <input
            id="reg-name"
            type="text"
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-xl px-4 py-3 text-sm border border-white/15 focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/40"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="reg-email"
            className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5"
          >
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-xl px-4 py-3 text-sm border border-white/15 focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/40"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="reg-password"
            className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl px-4 py-3 text-sm border border-white/15 focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/40"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            placeholder="Min. 8 characters"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-terra text-white py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-terra-lt disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </div>

    </form>

      <p className="text-white/35 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-terra-lt hover:text-terra transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
