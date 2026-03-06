'use client'

export interface FriendEntry {
  user: string
  initial: string
  color: string
  action: string
  dest: string
  time: string
  meta: string
  tags: string[]
  photos: string[]
  flag: string
  votes: number
}

interface Props {
  entry: FriendEntry
}

export function FriendCard({ entry }: Props) {
  return (
    <div className="bg-white rounded-[18px] border-[1.5px] border-mist overflow-hidden mb-[18px]">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-[18px] pt-4 pb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
          style={{ background: entry.color }}
        >
          {entry.initial}
        </div>
        <div>
          <div className="text-[14px] font-medium text-ink">{entry.user}</div>
          <div className="text-[12px] text-slate">
            {entry.action}{' '}
            <strong className="text-ink">{entry.dest}</strong>
          </div>
        </div>
        <div className="ml-auto text-[11px] text-slate font-mono">{entry.time}</div>
      </div>

      {/* ── Photo collage ── */}
      <div className="flex gap-0.5 h-[160px] overflow-hidden">
        {/* Main large panel */}
        <div className="flex-[2] bg-foam flex items-center justify-center text-[48px]">
          {entry.flag}
        </div>
        {/* Two stacked small panels */}
        <div className="flex-1 flex flex-col gap-0.5">
          {entry.photos.slice(0, 2).map((p, j) => (
            <div
              key={j}
              className="flex-1 bg-mist flex items-center justify-center text-[22px]"
            >
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-[18px] py-3.5">
        <div className="font-serif text-[18px] font-bold text-ink mb-0.5">{entry.dest}</div>
        <div className="text-[12px] text-slate mb-2">{entry.meta}</div>
        <div className="flex gap-1.5 flex-wrap">
          {entry.tags.map((t) => (
            <span
              key={t}
              className="bg-foam text-slate rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.4px]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center gap-4 px-[18px] py-3 border-t border-mist">
        <button className="flex items-center gap-1.5 text-[12px] text-slate hover:text-terra transition-colors">
          ↑ {entry.votes} upvote
        </button>
        <button className="flex items-center gap-1.5 text-[12px] text-slate hover:text-terra transition-colors">
          💬 Comment
        </button>
        <button className="flex items-center gap-1.5 text-[12px] text-slate hover:text-terra transition-colors">
          ↗ Fork trip
        </button>
        <button className="ml-auto px-[18px] py-1.5 rounded-full bg-ocean text-white text-[12px] hover:bg-tide transition-colors">
          View itinerary →
        </button>
      </div>
    </div>
  )
}
