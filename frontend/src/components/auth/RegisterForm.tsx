'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.users.register({ name, email, password })
      // Auto-login after registration
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
    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-3xl p-8">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-terra"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-terra"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-terra"
            placeholder="Min. 8 characters"
          />
        </div>

        {error && <p className="text-danger text-sm text-center">{error}</p>}

        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
          Create account
        </Button>
      </div>

      <p className="text-white/35 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-terra-lt hover:text-terra transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  )
}
