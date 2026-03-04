import { Badge } from '@/components/ui/Badge'
import type { Block as BlockType } from '@/types'

const TYPE_META: Record<string, { emoji: string; bg: string }> = {
  TRANSPORT: { emoji: '✈', bg: '#FCE8E8' },
  STAY:      { emoji: '🏨', bg: '#E3EEF5' },
  ACTIVITY:  { emoji: '🏔', bg: '#EEF0FA' },
  FOOD:      { emoji: '🍽', bg: '#FEF0E6' },
  NOTE:      { emoji: '📝', bg: '#F0F4F8' },
}

export function Block({ block }: { block: BlockType }) {
  const meta = TYPE_META[block.type] ?? TYPE_META.NOTE

  return (
    <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl border-[1.5px] border-mist bg-surface hover:border-terra/30 hover:bg-[#FBF8F6] transition-all duration-150">
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base flex-shrink-0"
        style={{ background: block.bgColor ?? meta.bg }}
      >
        {block.emoji ?? meta.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-ink leading-snug">{block.title}</p>
            {block.detail && <p className="text-xs text-slate mt-0.5 leading-relaxed">{block.detail}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {block.price && <span className="text-xs font-mono text-slate">{block.price}</span>}
            <Badge variant={block.status === 'BOOKED' ? 'green' : block.status === 'CANCELLED' ? 'danger' : 'slate'}>
              {block.status.toLowerCase()}
            </Badge>
          </div>
        </div>

        {(block.confCode || block.cancelPolicy) && (
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-mono text-slate">
            {block.confCode && <span>Conf: {block.confCode}</span>}
            {block.cancelPolicy && (
              <span className={block.cancelSafe ? 'text-success' : 'text-caution'}>
                {block.cancelPolicy}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
