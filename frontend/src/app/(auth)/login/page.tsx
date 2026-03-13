import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in — TripCraft' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-deep flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-white mb-2">
            trip<span className="text-terra italic">craft</span>
          </h1>
          <p className="text-white/40 text-sm">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
