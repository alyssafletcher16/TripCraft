'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCityPhoto } from '@/hooks/useCityPhoto'

const AVATAR_COLORS = ['#4A6FA5', '#3A7D5A', '#8A4F3A', '#6A4F8A', '#4A7A6A', '#3A5A8A']

const VIBE_BG: Record<string, string> = {
  Adventure:  '#FCE8E8',
  Hiking:     '#E8F4EE',
  Cultural:   '#EEF0FA',
  Romantic:   '#FEF0E6',
  Foodie:     '#FFF8EC',
  Relaxation: '#E3EEF5',
  Solo:       '#F0F0FA',
  Nightlife:  '#1A1A2E',
  Budget:     '#EEF4F8',
  Luxury:     '#FAF5E8',
}



export interface DiscoverTrip {
  id: string
  destination: string
  country: string | null
  coverEmoji: string | null
  travelers: number
  budget: number | null
  startDate: string | null
  endDate: string | null
  vibes: { vibe: string }[]
  user: { id: string | null; name: string | null; avatar: string | null }
  _count: { upvotes: number }
}

interface Props {
  card: DiscoverTrip
  index: number
  upvoted: boolean
  onUpvote: (id: string) => void
}

export function CommunityCard({ card, index, upvoted, onUpvote }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const photoUrl = useCityPhoto(card.destination)

  function handleView() {
    const isOwner = session?.user?.id && session.user.id === card.user.id
    router.push(isOwner ? `/trips/${card.id}` : `/discover/${card.id}`)
  }
  const firstVibe = card.vibes[0]?.vibe ?? ''
  const highlight = VIBE_BG[firstVibe] ?? '#EEF4F8'
  const authorInitial = (card.user.name ?? 'A')[0].toUpperCase()
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]

  // Build meta string
  let days = ''
  if (card.startDate && card.endDate) {
    const d = Math.round(
      (new Date(card.endDate).getTime() - new Date(card.startDate).getTime()) / 86_400_000
    ) + 1
    days = `${d} day${d !== 1 ? 's' : ''} · `
  }
  const meta = `${days}${card.travelers} traveler${card.travelers !== 1 ? 's' : ''}${card.budget ? ` · $${card.budget.toLocaleString()}` : ''}`

  const [primaryVibe, ...restVibes] = card.vibes.map((v) => v.vibe)

  return (
    <div className="bg-white rounded-[18px] border-[1.5px] border-mist overflow-hidden cursor-pointer transition-all duration-[0.22s] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(13,43,69,0.12)] hover:border-terra/60">

      {/* ── Image area ── */}
      <div
        className="h-[140px] relative overflow-hidden flex items-center justify-center text-[52px]"
        style={{ background: highlight }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={card.destination} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          card.coverEmoji ?? '✈'
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[40%] to-[rgba(13,43,69,0.75)]" />
        {/* Destination + votes overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <div className="font-serif text-[18px] font-bold text-white leading-tight">
            {card.destination}
            <br />
            <span className="text-[11px] font-normal opacity-80">{card.country}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onUpvote(card.id) }}
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all"
            style={{
              background: upvoted ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.25)',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#E2C06A',
            }}
          >
            ↑ {card._count.upvotes + (upvoted ? 1 : 0)}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
            style={{ background: avatarColor }}
          >
            {authorInitial}
          </div>
          <span className="text-[12px] text-slate">by {card.user.name ?? 'Anonymous'}</span>
        </div>
        <div className="text-[11px] text-slate mb-2">{meta}</div>
        <div className="flex gap-1.5 flex-wrap">
          {primaryVibe && (
            <span className="bg-terra/10 text-terra rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.4px]">
              {primaryVibe}
            </span>
          )}
          {restVibes.map((t) => (
            <span key={t} className="bg-foam text-slate rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.4px]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-2.5 border-t border-mist">
        <button
          onClick={handleView}
          className="w-full py-3 rounded-[10px] border-none bg-ocean text-white text-[12px]"
        >
          View →
        </button>
      </div>
    </div>
  )
}
