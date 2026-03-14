'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface TripCard {
  id: string
  title: string
  destination: string
  vibes: { vibe: string }[]
  _count: { upvotes: number }
  startDate?: string
  endDate?: string
}

interface ProfileData {
  user: {
    id: string
    name: string | null
    avatar: string | null
    isPrivate: boolean
    _count: { trips: number }
  }
  followStatus: 'PENDING' | 'ACCEPTED' | null
  canSeeTrips: boolean
  trips: TripCard[]
  followerCount: number
  followingCount: number
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function TravelerProfileView({ userId }: { userId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!session?.accessToken) return
    setLoading(true)
    api.social.getProfile(userId, session.accessToken)
      .then((d) => setData(d as ProfileData))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [userId, session])

  async function handleFollow() {
    if (!session?.accessToken || !data) return
    setActionLoading(true)
    try {
      await api.social.follow(userId, session.accessToken)
      setData((prev) =>
        prev
          ? {
              ...prev,
              followStatus: prev.user.isPrivate ? 'PENDING' : 'ACCEPTED',
              canSeeTrips: !prev.user.isPrivate,
              followerCount: prev.user.isPrivate ? prev.followerCount : prev.followerCount + 1,
            }
          : prev
      )
    } catch {
      // already following — reload
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUnfollow() {
    if (!session?.accessToken || !data) return
    setActionLoading(true)
    try {
      await api.social.unfollow(userId, session.accessToken)
      setData((prev) =>
        prev
          ? {
              ...prev,
              followStatus: null,
              canSeeTrips: !prev.user.isPrivate,
              followerCount: prev.followStatus === 'ACCEPTED' ? prev.followerCount - 1 : prev.followerCount,
            }
          : prev
      )
    } catch {
      // not following
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 md:p-12">
        <div className="h-32 bg-white rounded-2xl border-[1.5px] border-mist animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border-[1.5px] border-mist animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 md:p-12 text-center py-24">
        <div className="text-3xl mb-3">🔍</div>
        <div className="font-serif text-lg font-bold text-ink mb-1">Traveler not found</div>
        <button onClick={() => router.back()} className="text-sm text-ocean hover:underline mt-2">
          Go back
        </button>
      </div>
    )
  }

  const { user, followStatus, canSeeTrips, trips, followerCount, followingCount } = data

  return (
    <div>
      {/* ── Profile header ── */}
      <div className="relative overflow-hidden" style={{ background: '#071825', minHeight: 180 }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(7,24,37,0.95) 0%, rgba(7,24,37,0.7) 100%)',
          }}
        />
        <div className="relative z-10 px-6 sm:px-10 md:px-12 py-10 sm:py-12">
          <button
            onClick={() => router.back()}
            className="text-[11px] font-mono tracking-widest text-slate/60 hover:text-slate mb-6 flex items-center gap-1.5"
          >
            ← BACK
          </button>

          <div className="flex items-start gap-5 sm:gap-7">
            {/* Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-terra/20 border-2 border-terra/30 flex items-center justify-center text-2xl font-serif font-bold text-terra flex-shrink-0 w-20 h-20">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name ?? ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {user.name ?? 'Unnamed Traveler'}
                </h1>
                {user.isPrivate && (
                  <span className="text-[10px] font-mono tracking-wider text-gold/70 bg-gold/10 border border-gold/20 rounded px-2 py-0.5">
                    PRIVATE
                  </span>
                )}
              </div>

              {/* Counts */}
              <div className="flex gap-6 mt-3">
                {[
                  { n: followerCount, l: 'Followers' },
                  { n: followingCount, l: 'Following' },
                  { n: user._count.trips, l: 'Trips' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-serif text-xl font-bold text-gold">{s.n}</div>
                    <div className="text-[11px] text-slate mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow action */}
            <div className="flex-shrink-0">
              {followStatus === 'ACCEPTED' ? (
                <button
                  onClick={handleUnfollow}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-full border-[1.5px] border-white/20 text-white/70 text-sm hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50"
                >
                  Following
                </button>
              ) : followStatus === 'PENDING' ? (
                <button
                  onClick={handleUnfollow}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-full border-[1.5px] border-gold/40 text-gold text-sm hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50"
                >
                  Requested
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-full bg-terra text-white text-sm hover:bg-terra/80 transition-colors disabled:opacity-50"
                >
                  Follow
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trips section ── */}
      <div className="p-6 sm:p-10 md:p-12">
        {!canSeeTrips ? (
          /* Private locked state */
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <div className="font-serif text-xl font-bold text-ink mb-2">This account is private</div>
            <p className="text-sm text-slate max-w-xs mx-auto">
              {followStatus === 'PENDING'
                ? 'Your follow request is pending. Once accepted, you'll be able to see their itineraries.'
                : 'Follow this traveler to see their itineraries.'}
            </p>
            {followStatus === null && (
              <button
                onClick={handleFollow}
                disabled={actionLoading}
                className="mt-6 px-6 py-2.5 rounded-full bg-ocean text-white text-sm hover:bg-ocean/80 transition-colors disabled:opacity-50"
              >
                Send Follow Request
              </button>
            )}
          </div>
        ) : trips.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-3xl mb-3">🗺️</div>
            <div className="font-serif text-base font-bold text-ink mb-1">No public trips yet</div>
            <p className="text-[13px] text-slate">This traveler hasn't shared any itineraries.</p>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-lg font-bold text-ink mb-5">
              Shared Itineraries
              <span className="ml-2 text-sm text-slate font-sans font-normal">({trips.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => router.push(`/discover/${trip.id}`)}
                  className="bg-white rounded-2xl border-[1.5px] border-mist p-5 cursor-pointer hover:border-ocean/30 hover:shadow-sm transition-all"
                >
                  <h3 className="font-serif font-bold text-ink text-base mb-1 truncate">{trip.title}</h3>
                  <p className="text-[12px] text-slate mb-3 truncate">{trip.destination}</p>

                  {trip.vibes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trip.vibes.slice(0, 3).map((v) => (
                        <span
                          key={v.vibe}
                          className="text-[10px] font-mono tracking-wider text-terra/70 bg-terra/8 border border-terra/15 rounded px-1.5 py-0.5"
                        >
                          {v.vibe.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate">
                    <span>{trip._count.upvotes} upvote{trip._count.upvotes !== 1 ? 's' : ''}</span>
                    {trip.startDate && (
                      <span>{new Date(trip.startDate).getFullYear()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
