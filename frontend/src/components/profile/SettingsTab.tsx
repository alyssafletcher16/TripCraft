'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'

export function SettingsTab() {
  const { data: session } = useSession()
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null)
  const [savingPrivacy, setSavingPrivacy] = useState(false)

  // Load current privacy setting
  useEffect(() => {
    if (!session?.accessToken) return
    api.users.me(session.accessToken)
      .then((user: any) => setIsPrivate(user.isPrivate ?? false))
      .catch(() => {})
  }, [session])

  async function togglePrivacy(val: boolean) {
    if (!session?.accessToken) return
    setSavingPrivacy(true)
    try {
      const updated: any = await api.social.updatePrivacy(val, session.accessToken)
      setIsPrivate(updated.isPrivate)
    } catch {
      // rollback
    } finally {
      setSavingPrivacy(false)
    }
  }

  return (
    <div className="px-4 sm:px-8 md:px-12 py-8 max-w-2xl">

      {/* ── Account Privacy ── */}
      <section className="mb-10">
        <h2 className="font-serif text-lg font-bold text-ink mb-1">Account Privacy</h2>
        <p className="text-[13px] text-slate mb-5">
          Control who can see your itineraries on TripCraft.
        </p>

        <div className="bg-white rounded-2xl border-[1.5px] border-mist p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-ink text-sm mb-0.5">Private Account</div>
              <div className="text-[12px] text-slate leading-relaxed">
                When private, only approved followers can see your shared itineraries. New followers
                must send a request that you accept.
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => isPrivate !== null && togglePrivacy(!isPrivate)}
              disabled={savingPrivacy || isPrivate === null}
              className={`relative w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 disabled:opacity-50 ${
                isPrivate ? 'bg-ocean' : 'bg-mist'
              }`}
              aria-label="Toggle private account"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isPrivate ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isPrivate !== null && (
            <div className={`mt-4 text-[11px] font-mono tracking-wider ${isPrivate ? 'text-ocean' : 'text-slate'}`}>
              {isPrivate ? '🔒  YOUR ACCOUNT IS PRIVATE' : '🌍  YOUR ACCOUNT IS PUBLIC'}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
