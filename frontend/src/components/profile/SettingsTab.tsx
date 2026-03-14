'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'

interface FollowRequest {
  id: string
  createdAt: string
  follower: {
    id: string
    name: string | null
    avatar: string | null
  }
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function SettingsTab() {
  const { data: session } = useSession()
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Load current privacy setting
  useEffect(() => {
    if (!session?.accessToken) return
    api.users.me(session.accessToken)
      .then((user: any) => setIsPrivate(user.isPrivate ?? false))
      .catch(() => {})
  }, [session])

  // Load follow requests
  useEffect(() => {
    if (!session?.accessToken) return
    api.social.getRequests(session.accessToken)
      .then((data: any) => setRequests(data.requests ?? []))
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

  async function handleAccept(requestId: string) {
    if (!session?.accessToken) return
    setActionLoading(requestId)
    try {
      await api.social.acceptRequest(requestId, session.accessToken)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(requestId: string) {
    if (!session?.accessToken) return
    setActionLoading(requestId)
    try {
      await api.social.rejectRequest(requestId, session.accessToken)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
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

      {/* ── Follow Requests ── */}
      <section>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-serif text-lg font-bold text-ink">Follow Requests</h2>
          {requests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-terra text-white text-[11px] font-bold flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </div>
        <p className="text-[13px] text-slate mb-5">
          People who want to follow your private account.
        </p>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border-[1.5px] border-mist p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-[13px] text-slate">No pending follow requests.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border-[1.5px] border-mist px-5 py-4 flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-terra/10 border border-terra/20 flex items-center justify-center text-sm font-serif font-bold text-terra flex-shrink-0">
                  {req.follower.avatar ? (
                    <img src={req.follower.avatar} alt={req.follower.name ?? ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(req.follower.name)
                  )}
                </div>

                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink text-sm truncate">
                    {req.follower.name ?? 'Unnamed Traveler'}
                  </div>
                  <div className="text-[11px] text-slate mt-0.5">
                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Accept / Decline */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-1.5 rounded-full bg-ocean text-white text-xs hover:bg-ocean/80 transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-1.5 rounded-full border-[1.5px] border-mist text-slate text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
