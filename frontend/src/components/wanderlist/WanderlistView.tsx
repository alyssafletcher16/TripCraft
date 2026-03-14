'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type WanderLink = {
  id: string
  url: string
  title: string
  platform: string
  savedAt: string
}

type Trip = {
  id: string
  title: string
  destination: string
  status: string
  coverEmoji?: string
}

const PLATFORM_COLORS: Record<string, string> = {
  TikTok: '#010101',
  Instagram: '#E1306C',
  YouTube: '#FF0000',
  Reddit: '#FF4500',
  X: '#000000',
  Link: '#5B7A8E',
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('tiktok')) return 'TikTok'
  if (u.includes('instagram')) return 'Instagram'
  if (u.includes('youtube') || u.includes('youtu.be')) return 'YouTube'
  if (u.includes('reddit')) return 'Reddit'
  if (u.includes('twitter') || u.includes('x.com')) return 'X'
  return 'Link'
}

const STORAGE_KEY = 'tripcraft_wanderlist'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function WanderlistView() {
  const { data: session } = useSession()
  const [links, setLinks] = useState<WanderLink[]>([])
  const [linkInput, setLinkInput] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [addingLink, setAddingLink] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripPickerLinkId, setTripPickerLinkId] = useState<string | null>(null)
  const [addedToTrip, setAddedToTrip] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setLinks(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (!session?.accessToken) return
    fetch(`${API_URL}/api/trips`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const active = (Array.isArray(data) ? data : []).filter(
          (t: Trip) => t.status === 'PLANNING' || t.status === 'ACTIVE'
        )
        setTrips(active)
      })
      .catch(() => {})
  }, [session?.accessToken])

  function saveLink() {
    if (!linkInput.trim()) return
    const link: WanderLink = {
      id: Date.now().toString(),
      url: linkInput.trim(),
      title: linkTitle.trim() || linkInput.trim(),
      platform: detectPlatform(linkInput.trim()),
      savedAt: new Date().toISOString(),
    }
    const updated = [link, ...links]
    setLinks(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setLinkInput('')
    setLinkTitle('')
    setAddingLink(false)
  }

  function removeLink(id: string) {
    const updated = links.filter((l) => l.id !== id)
    setLinks(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setAddedToTrip((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function addToTrip(tripId: string) {
    const link = links.find((l) => l.id === tripPickerLinkId)
    if (!link) return
    const key = `tripcraft_links_${tripId}`
    const stored = localStorage.getItem(key)
    const existing: WanderLink[] = stored ? JSON.parse(stored) : []
    if (!existing.find((l) => l.url === link.url)) {
      localStorage.setItem(key, JSON.stringify([link, ...existing]))
    }
    setAddedToTrip((prev) => ({ ...prev, [link.id]: tripId }))
    setTripPickerLinkId(null)
  }

  const pickerLink = tripPickerLinkId ? links.find((l) => l.id === tripPickerLinkId) : null

  return (
    <div className="p-4 sm:p-8 md:p-12 bg-surface min-h-full">
      <div className="max-w-2xl">
        {/* Header */}
        <p className="eyebrow mb-2">Inspiration</p>
        <h1 className="page-title mb-2">Wanderlist</h1>
        <p className="text-sm text-slate mb-8">
          Save links from anywhere — TikTok, Instagram, YouTube, or the web. Add them to a trip when you're ready.
        </p>

        {/* Links card */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          {/* Header row */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-mist">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Saved Links</span>
              {links.length > 0 && (
                <span className="bg-ocean/10 text-ocean text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {links.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setAddingLink((p) => !p)}
              className="text-xs text-terra font-medium hover:underline"
            >
              + Add link
            </button>
          </div>

          {/* Add link form */}
          {addingLink && (
            <div className="px-5 py-4 border-b border-mist flex flex-col gap-2 bg-foam">
              <input
                autoFocus
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveLink()}
                placeholder="Paste a TikTok, Instagram, YouTube, or web link…"
                className="w-full text-sm px-3 py-2 rounded-xl border border-mist bg-white outline-none focus:border-terra transition-colors"
              />
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveLink()}
                placeholder="Title / description (optional)"
                className="w-full text-sm px-3 py-2 rounded-xl border border-mist bg-white outline-none focus:border-terra transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveLink}
                  disabled={!linkInput.trim()}
                  className="px-4 py-1.5 rounded-full bg-terra text-white text-xs font-semibold disabled:opacity-40"
                >
                  Save link
                </button>
                <button
                  onClick={() => {
                    setAddingLink(false)
                    setLinkInput('')
                    setLinkTitle('')
                  }}
                  className="px-4 py-1.5 rounded-full border border-mist text-xs text-slate"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {links.length === 0 && !addingLink && (
            <div className="px-5 py-12 text-center">
              <p className="text-3xl mb-3">🔖</p>
              <p className="text-sm text-slate mb-1">No links saved yet</p>
              <p className="text-xs text-slate">
                Save TikToks, Instagram reels, YouTube guides, and web articles here.
              </p>
            </div>
          )}

          {/* Link rows */}
          {links.length > 0 && (
            <div className="divide-y divide-mist">
              {links.map((link) => {
                const color = PLATFORM_COLORS[link.platform] ?? '#5B7A8E'
                const addedTripId = addedToTrip[link.id]
                const addedTripName = addedTripId ? trips.find((t) => t.id === addedTripId)?.title : null
                return (
                  <div key={link.id} className="flex items-center gap-3 px-5 py-3.5 group">
                    {/* Platform badge */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: color }}
                    >
                      {link.platform.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-ink hover:text-terra hover:underline truncate block"
                      >
                        {link.title}
                      </a>
                      <div className="text-[11px] text-slate truncate">
                        {link.platform} · {new Date(link.savedAt).toLocaleDateString()}
                      </div>
                      {addedTripName && (
                        <div className="text-[11px] text-green-600 mt-0.5">
                          Added to {addedTripName} ✓
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate hover:text-terra transition-colors px-1"
                      >
                        Open ↗
                      </a>
                      <button
                        onClick={() => setTripPickerLinkId(link.id)}
                        className="text-xs px-2.5 py-1 rounded-full bg-ocean/10 text-ocean font-medium hover:bg-ocean hover:text-white transition-colors whitespace-nowrap"
                      >
                        Add to trip
                      </button>
                      <button
                        onClick={() => removeLink(link.id)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 sm:p-1 text-slate hover:text-red-500 transition-all"
                        aria-label="Remove link"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trip picker modal */}
      {tripPickerLinkId && pickerLink && (
        <div
          className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setTripPickerLinkId(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6">
            <div className="font-serif text-lg font-bold text-ink mb-1">Add to which trip?</div>
            <div className="text-xs text-slate mb-1 truncate font-medium">{pickerLink.title}</div>
            <div className="text-xs text-slate mb-4">
              This link will appear in the Research tab of the trip you choose.
            </div>

            {trips.length === 0 ? (
              <p className="text-sm text-slate text-center py-4">No active trips found.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => addToTrip(trip.id)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-mist hover:border-terra hover:bg-foam text-left transition-all"
                  >
                    {trip.coverEmoji && <span className="text-xl flex-shrink-0">{trip.coverEmoji}</span>}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink truncate">{trip.title}</div>
                      {trip.destination && (
                        <div className="text-xs text-slate truncate">{trip.destination}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setTripPickerLinkId(null)}
              className="mt-4 w-full py-2 rounded-xl border border-mist text-sm text-slate hover:bg-foam transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
