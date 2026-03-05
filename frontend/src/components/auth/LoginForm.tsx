'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const email = data.get('email') as string
    const password = data.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/trips')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-white/10 rounded-3xl p-8"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5"
          >
            Email
          </label>
          <input
            id="login-email"
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
            htmlFor="login-password"
            className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl px-4 py-3 text-sm border border-white/15 focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/40"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            placeholder="••••••••"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <p className="text-white/35 text-sm text-center mt-6">
        No account?{' '}
        <Link href="/register" className="text-terra-lt hover:text-terra transition-colors">
          Create one free
        </Link>
      </p>
    </form>
  )
}
