import { Badge } from '@/components/ui/Badge'

interface CommunityCardProps {
  tripId: string
  destination: string
  coverEmoji?: string | null
  vibes: string[]
  travelers: number
  authorName: string | null
  upvotes: number
  onUpvote?: (id: string) => void
}

export function CommunityCard({
  tripId,
  destination,
  coverEmoji,
  vibes,
  travelers,
  authorName,
  upvotes,
  onUpvote,
}: CommunityCardProps) {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-mist p-6 flex flex-col gap-4 hover:border-terra/30 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="text-3xl">{coverEmoji ?? '✈'}</div>
        <button
          onClick={() => onUpvote?.(tripId)}
          className="flex items-center gap-1.5 text-slate text-sm hover:text-terra transition-colors"
        >
          <span>▲</span>
          <span className="font-mono text-xs">{upvotes}</span>
        </button>
      </div>

      <div>
        <h3 className="font-serif text-lg font-bold text-ink mb-1">{destination}</h3>
        <p className="text-slate text-xs">{travelers} traveler{travelers !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {vibes.map((v) => (
          <Badge key={v} variant="ocean">{v}</Badge>
        ))}
      </div>

      <div className="text-xs text-slate border-t border-mist pt-3">
        by {authorName ?? 'Anonymous'}
      </div>
    </div>
  )
}
