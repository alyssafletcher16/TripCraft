'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface TravelerUser {
  id: string
  name: string | null
  avatar: string | null
  isPrivate: boolean
  _count: { trips: number }
  followStatus: 'PENDING' | 'ACCEPTED' | null
}

function FollowButton({
  status,
  loading,
  onFollow,
  onUnfollow,
}: {
  status: 'PENDING' | 'ACCEPTED' | null
  loading: boolean
  onFollow: () => void
  onUnfollow: () => void
}) {
  if (status === 'ACCEPTED') {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onUnfollow() }}
        disabled={loading}
        className="px-4 py-1.5 rounded-full border-[1.5px] border-mist text-slate text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50"
      >
        Following
      </button>
    )
  }
  if (status === 'PENDING') {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onUnfollow() }}
        disabled={loading}
        className="px-4 py-1.5 rounded-full border-[1.5px] border-gold/50 text-gold text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50"
      >
        Requested
      </button>
    )
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onFollow() }}
      disabled={loading}
      className="px-4 py-1.5 rounded-full border-[1.5px] border-ocean text-ocean text-xs hover:bg-ocean hover:text-white transition-colors disabled:opacity-50"
    >
      Follow
    </button>
  )
}

export function TravelersList() {
  const { data: session } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TravelerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(
    async (q: string) => {
      if (!session?.accessToken) return
      setLoading(true)
      try {
        const data = await api.social.search(q, session.accessToken) as { users: TravelerUser[] }
        setResults(data.users ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  async function handleFollow(userId: string) {
    if (!session?.accessToken) return
    setActionLoading(userId)
    try {
      const res = await api.social.follow(userId, session.accessToken) as { follow: { status: 'PENDING' | 'ACCEPTED' } }
      const newStatus = res.follow.status
      setResults((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, followStatus: newStatus } : u
        )
      )
    } catch {
      // already followed — ignore
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUnfollow(userId: string) {
    if (!session?.accessToken) return
    setActionLoading(userId)
    try {
      await api.social.unfollow(userId, session.accessToken)
      setResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, followStatus: null } : u))
      )
    } catch {
      // not following — ignore
    } finally {
      setActionLoading(null)
    }
  }

  function getInitials(name: string | null) {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search travelers by name..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border-[1.5px] border-mist bg-white text-sm text-ink placeholder-slate focus:outline-none focus:border-ocean transition-colors"
        />
        {loading && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="w-4 h-4 border-2 border-ocean/30 border-t-ocean rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[68px] bg-white rounded-2xl border-[1.5px] border-mist animate-pulse" />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && results.length === 0 && (
        <div className="py-16 text-center">
          <div className="font-serif text-base font-bold text-ink mb-1">No travelers found</div>
          <p className="text-[13px] text-slate">{query.trim() ? 'Try a different name.' : 'No other accounts exist yet.'}</p>
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/discover/traveler/${user.id}`)}
              className="flex items-center gap-4 bg-white rounded-2xl border-[1.5px] border-mist px-5 py-4 cursor-pointer hover:border-ocean/30 hover:shadow-sm transition-all"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-terra/10 border border-terra/20 flex items-center justify-center text-sm font-serif font-bold text-terra flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name ?? ''} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink text-sm truncate">
                    {user.name ?? 'Unnamed Traveler'}
                  </span>
                  {user.isPrivate && (
                    <span className="text-[10px] font-mono tracking-wider text-slate bg-surface border border-mist rounded px-1.5 py-0.5 flex-shrink-0">
                      PRIVATE
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-slate mt-0.5">
                  {user._count.trips} trip{user._count.trips !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Follow button */}
              <FollowButton
                status={user.followStatus}
                loading={actionLoading === user.id}
                onFollow={() => handleFollow(user.id)}
                onUnfollow={() => handleUnfollow(user.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
