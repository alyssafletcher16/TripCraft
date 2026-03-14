'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface SocialUser {
  id: string
  name: string | null
  avatar: string | null
  isPrivate: boolean
  followedAt?: string
}

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

function UserCard({
  user,
  actionLoading,
  badge,
  onCardClick,
  action,
}: {
  user: SocialUser
  actionLoading: boolean
  badge?: React.ReactNode
  onCardClick: () => void
  action: React.ReactNode
}) {
  return (
    <div
      onClick={onCardClick}
      className="flex items-center gap-3 bg-white rounded-2xl border-[1.5px] border-mist px-4 py-3 cursor-pointer hover:border-ocean/30 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-terra/10 border border-terra/20 flex items-center justify-center text-sm font-serif font-bold text-terra flex-shrink-0">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name ?? ''} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(user.name)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-ink text-sm truncate">{user.name ?? 'Unnamed Traveler'}</span>
          {badge}
          {user.isPrivate && (
            <span className="text-[10px] font-mono tracking-wider text-slate bg-surface border border-mist rounded px-1.5 py-0.5 flex-shrink-0">
              PRIVATE
            </span>
          )}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>{action}</div>
    </div>
  )
}

export function TravelersTab() {
  const { data: session } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [followers, setFollowers] = useState<SocialUser[]>([])
  const [following, setFollowing] = useState<SocialUser[]>([])
  const [pendingFollows, setPendingFollows] = useState<Set<string>>(new Set())
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null)
  const [lastViewedFollowers, setLastViewedFollowers] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lastViewedFollowers')
    setLastViewedFollowers(stored)
    // Update timestamp so next visit won't show current followers as new
    localStorage.setItem('lastViewedFollowers', new Date().toISOString())
  }, [])

  useEffect(() => {
    if (!session?.accessToken) return
    Promise.all([
      api.social.followers(session.accessToken) as Promise<{ followers: SocialUser[] }>,
      api.social.following(session.accessToken) as Promise<{ following: SocialUser[] }>,
      api.social.getRequests(session.accessToken) as Promise<{ requests: FollowRequest[] }>,
    ])
      .then(([fersData, fingData, reqData]) => {
        setFollowers(fersData.followers ?? [])
        setFollowing(fingData.following ?? [])
        setRequests(reqData.requests ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  async function handleAcceptRequest(requestId: string) {
    if (!session?.accessToken) return
    setRequestActionLoading(requestId)
    try {
      await api.social.acceptRequest(requestId, session.accessToken)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      // Reload followers to show the newly accepted follower
      const data = await api.social.followers(session.accessToken) as { followers: SocialUser[] }
      setFollowers(data.followers ?? [])
    } catch {}
    finally { setRequestActionLoading(null) }
  }

  async function handleIgnoreRequest(requestId: string) {
    if (!session?.accessToken) return
    setRequestActionLoading(requestId)
    try {
      await api.social.rejectRequest(requestId, session.accessToken)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {}
    finally { setRequestActionLoading(null) }
  }

  const followingIds = new Set(following.map((u) => u.id))

  function filterList(list: SocialUser[]) {
    if (!query.trim()) return list
    const q = query.toLowerCase()
    return list.filter((u) => u.name?.toLowerCase().includes(q))
  }

  async function handleFollow(userId: string, isPrivate: boolean) {
    if (!session?.accessToken) return
    setActionLoading(userId)
    try {
      await api.social.follow(userId, session.accessToken)
      if (isPrivate) {
        setPendingFollows((prev) => new Set([...prev, userId]))
      } else {
        const user = followers.find((u) => u.id === userId)
        if (user) setFollowing((prev) => [...prev, user])
      }
    } catch {}
    finally {
      setActionLoading(null)
    }
  }

  async function handleUnfollow(userId: string) {
    if (!session?.accessToken) return
    setActionLoading(userId)
    try {
      await api.social.unfollow(userId, session.accessToken)
      setFollowing((prev) => prev.filter((u) => u.id !== userId))
      setPendingFollows((prev) => { const s = new Set(prev); s.delete(userId); return s })
    } catch {}
    finally {
      setActionLoading(null)
    }
  }

  function FollowBackButton({ user }: { user: SocialUser }) {
    const loading = actionLoading === user.id
    if (followingIds.has(user.id)) {
      return (
        <button
          onClick={() => handleUnfollow(user.id)}
          disabled={loading}
          className="px-3 py-1.5 rounded-full border-[1.5px] border-mist text-slate text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Following
        </button>
      )
    }
    if (pendingFollows.has(user.id)) {
      return (
        <button
          onClick={() => handleUnfollow(user.id)}
          disabled={loading}
          className="px-3 py-1.5 rounded-full border-[1.5px] border-gold/50 text-gold text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Requested
        </button>
      )
    }
    return (
      <button
        onClick={() => handleFollow(user.id, user.isPrivate)}
        disabled={loading}
        className="px-3 py-1.5 rounded-full border-[1.5px] border-ocean text-ocean text-xs hover:bg-ocean hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        Follow Back
      </button>
    )
  }

  function UnfollowButton({ user }: { user: SocialUser }) {
    const loading = actionLoading === user.id
    return (
      <button
        onClick={() => handleUnfollow(user.id)}
        disabled={loading}
        className="px-3 py-1.5 rounded-full border-[1.5px] border-mist text-slate text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        Following
      </button>
    )
  }

  const filteredFollowers = filterList(followers)
  const filteredFollowing = filterList(following)

  return (
    <div className="px-4 sm:px-8 md:px-12 py-6">
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
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Followers */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="font-serif font-bold text-ink text-base">Followers</h3>
            <span className="text-xs text-slate">{followers.length}</span>
            {requests.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-terra text-white text-[9px] font-bold flex items-center justify-center">!</span>
            )}
          </div>

          {/* Follow Requests section */}
          {!loading && requests.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono tracking-wider text-terra uppercase">Follow Requests</span>
                <span className="w-4 h-4 rounded-full bg-terra text-white text-[9px] font-bold flex items-center justify-center">{requests.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border-[1.5px] border-terra/20 px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-terra/10 border border-terra/20 flex items-center justify-center text-sm font-serif font-bold text-terra flex-shrink-0">
                      {req.follower.avatar ? (
                        <img src={req.follower.avatar} alt={req.follower.name ?? ''} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(req.follower.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink text-sm truncate">{req.follower.name ?? 'Unnamed Traveler'}</div>
                      <div className="text-[11px] text-slate mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={requestActionLoading === req.id}
                        className="px-3 py-1.5 rounded-full bg-ocean text-white text-xs hover:bg-ocean/80 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleIgnoreRequest(req.id)}
                        disabled={requestActionLoading === req.id}
                        className="px-3 py-1.5 rounded-full border-[1.5px] border-mist text-slate text-xs hover:border-terra/40 hover:text-terra transition-colors disabled:opacity-50"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Divider */}
              <div className="flex items-center gap-3 mt-5 mb-3">
                <div className="flex-1 h-px bg-mist" />
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[60px] bg-white rounded-2xl border-[1.5px] border-mist animate-pulse" />
              ))}
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[13px] text-slate">
                {query.trim() ? 'No matches.' : 'No followers yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredFollowers.map((user) => {
                const isNew = !!user.followedAt && !!lastViewedFollowers && new Date(user.followedAt) > new Date(lastViewedFollowers)
                return (
                  <UserCard
                    key={user.id}
                    user={user}
                    actionLoading={actionLoading === user.id}
                    onCardClick={() => router.push(`/discover/traveler/${user.id}`)}
                    badge={isNew ? (
                      <span className="text-[10px] font-mono tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 flex-shrink-0">
                        NEW
                      </span>
                    ) : undefined}
                    action={<FollowBackButton user={user} />}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Following */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="font-serif font-bold text-ink text-base">Following</h3>
            <span className="text-xs text-slate">{following.length}</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[60px] bg-white rounded-2xl border-[1.5px] border-mist animate-pulse" />
              ))}
            </div>
          ) : filteredFollowing.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[13px] text-slate">
                {query.trim() ? 'No matches.' : 'Not following anyone yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredFollowing.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  actionLoading={actionLoading === user.id}
                  onCardClick={() => router.push(`/discover/traveler/${user.id}`)}
                  action={<UnfollowButton user={user} />}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
